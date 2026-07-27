#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_data.py — 米其林数据管线

输入：
  ../snapshots/snap_current.csv   当前完整快照（含 Selected，约 1.9 万家）
  ../snapshots/snap_2022..2025.csv 逐年历史快照（用于还原星级变化）

输出（写入 public/data/）：
  meta.json                        国家 → 城市 → 计数（供选择页使用）
  restaurants/<countrySlug>__<citySlug>.json   每个城市的餐厅明细（按需懒加载）
  countries_zh.json 由脚本内置映射直接写入 meta.json

数据来源：ngshiheng/michelin-my-maps（MICHELIN Guide 抓取，CC-BY-NC）
"""
import csv, json, os, re, sys, unicodedata
from collections import defaultdict
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from city_zh import CITY_ZH, CHINA_COUNTRIES
from restaurant_zh import RESTAURANT_ZH, base_name

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SNAP = os.path.join(os.path.dirname(ROOT), "snapshots")
OUT  = os.path.join(ROOT, "public", "data")

# 历史快照年份（current 视为 2026 观测点）
HISTORY_YEARS = [2022, 2023, 2024, 2025]

# —— 国家/地区中文名映射（覆盖数据集出现的全部地区）——
COUNTRY_ZH = {
    "France": "法国", "Italy": "意大利", "USA": "美国", "Spain": "西班牙",
    "Germany": "德国", "United Kingdom": "英国", "Japan": "日本",
    "Chinese Mainland": "中国大陆", "Belgium": "比利时", "Switzerland": "瑞士",
    "Netherlands": "荷兰", "Thailand": "泰国", "Taiwan": "中国台湾",
    "Austria": "奥地利", "Singapore": "新加坡", "Canada": "加拿大",
    "South Korea": "韩国", "Mexico": "墨西哥", "Hong Kong SAR China": "中国香港",
    "Portugal": "葡萄牙", "Poland": "波兰", "Vietnam": "越南", "Türkiye": "土耳其",
    "Malaysia": "马来西亚", "Brazil": "巴西", "Dubai": "迪拜", "Denmark": "丹麦",
    "Croatia": "克罗地亚", "Ireland": "爱尔兰", "New Zealand": "新西兰",
    "The Philippines": "菲律宾", "Sweden": "瑞典", "Czechia": "捷克",
    "Hungary": "匈牙利", "Slovenia": "斯洛文尼亚", "Argentina": "阿根廷",
    "Macau": "中国澳门", "Abu Dhabi": "阿布扎比", "Saudi Arabia": "沙特阿拉伯",
    "Norway": "挪威", "Malta": "马耳他", "Luxembourg": "卢森堡",
    "Lithuania": "立陶宛", "Estonia": "爱沙尼亚", "Qatar": "卡塔尔",
    "Greece": "希腊", "Finland": "芬兰", "Latvia": "拉脱维亚", "Serbia": "塞尔维亚",
    "Principality of Monaco": "摩纳哥", "Iceland": "冰岛", "Andorra": "安道尔",
    "Liechtenstein": "列支敦士登",
}
# 脏数据国家代码 → 忽略
BAD_COUNTRIES = {"THA", "ARE", ""}


def slugify(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s or "x"


def norm_key(s: str) -> str:
    """用于跨年份匹配的宽松键：去重音、去标点、小写。"""
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "", s.lower())


def canon_award(raw: str):
    """把各年份不同写法归一化成: 3/2/1(星) | 'bib' | 'selected' | None"""
    if not raw:
        return None
    s = raw.split(",")[0].strip().lower()  # 去掉 ',Green Star' 后缀
    if "bib" in s:
        return "bib"
    if "selected" in s:
        return "selected"
    if "three" in s or "3" in s:
        return 3
    if "two" in s or "2" in s:
        return 2
    if "one" in s or "1" in s:
        return 1
    return None


AWARD_RANK = {"selected": 0, "bib": 1, 1: 2, 2: 3, 3: 4}
AWARD_LABEL = {3: "3 Stars", 2: "2 Stars", 1: "1 Star", "bib": "Bib Gourmand", "selected": "Selected"}
AWARD_LABEL_ZH = {3: "三星", 2: "二星", 1: "一星", "bib": "必比登", "selected": "入选"}


def stars_of(award):
    return award if isinstance(award, int) else 0


def award_col(fieldnames):
    if "Award" in fieldnames:
        return "Award"
    if "Classification" in fieldnames:
        return "Classification"
    return None


def load_snapshot(path):
    """返回 {(nameKey, cityKey): canonAward, ...} 以及 name-only 回退索引。"""
    by_full, by_name = {}, {}
    with open(path, encoding="utf-8") as f:
        rd = csv.DictReader(f)
        acol = award_col(rd.fieldnames)
        has_loc = "Location" in rd.fieldnames
        for r in rd:
            aw = canon_award(r.get(acol, ""))
            if aw is None:
                continue
            nk = norm_key(r.get("Name", ""))
            if not nk:
                continue
            if has_loc:
                city = r["Location"].split(",")[0].strip()
                by_full[(nk, norm_key(city))] = aw
            # name-only 回退：若同名冲突则保留“较高”星级
            if nk not in by_name or AWARD_RANK.get(aw, 0) > AWARD_RANK.get(by_name[nk], 0):
                by_name[nk] = aw
    return by_full, by_name


def build_history(name, city, cur_award, snaps):
    """
    根据逐年快照，还原该餐厅的星级/奖项变化时间线。
    返回 (timeline, changes)
      timeline: [{year, award, label}]  各年已知奖项
      changes:  [{year, from, to, fromLabel, toLabel, direction}]  变化事件
    direction: 'up' 升级 | 'down' 降级 | 'new' 首次入选/新增 | 'reclass' 同级重分类
    """
    nk, ck = norm_key(name), norm_key(city)
    points = []  # (year, award)
    for y in HISTORY_YEARS:
        full, byname = snaps[y]
        aw = full.get((nk, ck))
        if aw is None:
            aw = byname.get(nk)  # 回退（尤其 2022 无城市）
        if aw is not None:
            points.append((y, aw))
    points.append((2026, cur_award))  # 当前观测点

    timeline = [{"year": y, "award": AWARD_LABEL[a], "stars": stars_of(a),
                 "label": AWARD_LABEL_ZH[a]} for y, a in points]

    changes = []
    prev = None
    for i, (y, a) in enumerate(points):
        if prev is None:
            if i > 0:  # 该年首次在榜出现（且不是最早观测年）
                changes.append({"year": y, "from": None, "to": AWARD_LABEL[a],
                                "toLabel": AWARD_LABEL_ZH[a], "direction": "new"})
        else:
            pa = prev
            if a != pa:
                dr = "up" if AWARD_RANK[a] > AWARD_RANK[pa] else "down"
                changes.append({"year": y, "from": AWARD_LABEL[pa], "to": AWARD_LABEL[a],
                                "fromLabel": AWARD_LABEL_ZH[pa], "toLabel": AWARD_LABEL_ZH[a],
                                "direction": dr})
        prev = a
    return timeline, changes


def main():
    cur_path = os.path.join(SNAP, "snap_current.csv")
    if not os.path.exists(cur_path):
        sys.exit("找不到 snap_current.csv，请先下载快照。")

    # 载入历史快照
    snaps = {}
    for y in HISTORY_YEARS:
        p = os.path.join(SNAP, f"snap_{y}.csv")
        if os.path.exists(p):
            snaps[y] = load_snapshot(p)
            print(f"  载入历史快照 {y}: {len(snaps[y][0])} 条(含城市) / {len(snaps[y][1])} 条(名称索引)")
        else:
            snaps[y] = ({}, {})
            print(f"  ⚠ 缺少 {y} 快照，跳过")

    # 处理当前主数据
    os.makedirs(os.path.join(OUT, "restaurants"), exist_ok=True)
    # country -> city -> [restaurant dict]
    tree = defaultdict(lambda: defaultdict(list))
    seen_ids = set()
    total = 0
    changed_count = 0

    with open(cur_path, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            loc = r.get("Location", "")
            parts = [p.strip() for p in loc.split(",") if p.strip()]
            if not parts:
                continue
            country = parts[-1]
            city = parts[0]
            if country in BAD_COUNTRIES:
                continue
            cur_award = canon_award(r.get("Award", ""))
            if cur_award is None:
                continue
            name = r.get("Name", "").strip()
            if not name:
                continue

            timeline, changes = build_history(name, city, cur_award, snaps)
            if changes:
                changed_count += 1

            rid = f"{slugify(name)}__{slugify(city)}__{slugify(country)}"
            base = rid; n = 2
            while rid in seen_ids:
                rid = f"{base}-{n}"; n += 1
            seen_ids.add(rid)

            green = str(r.get("GreenStar", "0")).strip() in ("1", "true", "True") \
                or "green" in r.get("Award", "").lower()

            def _f(v):
                try:
                    return round(float(v), 5)
                except (TypeError, ValueError):
                    return None

            name_zh = ""
            if country in CHINA_COUNTRIES:
                name_zh = RESTAURANT_ZH.get(base_name(name), "")

            rec = {
                "id": rid,
                "name": name,
                "nameZh": name_zh,
                "city": city,
                "cityZh": CITY_ZH.get(city, ""),
                "country": country,
                "award": AWARD_LABEL[cur_award],
                "stars": stars_of(cur_award),
                "greenStar": green,
                "cuisine": r.get("Cuisine", "").strip(),
                "price": r.get("Price", "").strip(),
                "address": r.get("Address", "").strip(),
                "url": r.get("Url", "").strip(),
                "lat": _f(r.get("Latitude")),
                "lng": _f(r.get("Longitude")),
                "history": changes,   # 星级变化事件（可能为空）
                "timeline": timeline, # 各年已知奖项
            }
            tree[country][city].append(rec)
            total += 1

    # 写每城市 JSON + 汇总 meta
    countries_meta = []
    for country, cities in tree.items():
        c_slug = slugify(country)
        city_list = []
        c_rest = c_stars = 0
        c_by_award = defaultdict(int)
        for city, recs in cities.items():
            recs.sort(key=lambda x: (-x["stars"], x["name"]))
            city_slug = slugify(city)
            fname = f"{c_slug}__{city_slug}.json"
            with open(os.path.join(OUT, "restaurants", fname), "w", encoding="utf-8") as fo:
                json.dump(recs, fo, ensure_ascii=False)
            stars = sum(x["stars"] for x in recs)
            by_award = defaultdict(int)
            for x in recs:
                by_award[x["award"]] += 1
            starred = sum(1 for x in recs if x["stars"] > 0)
            city_list.append({
                "slug": city_slug, "name": city, "nameZh": CITY_ZH.get(city, ""),
                "restaurantCount": len(recs), "starredCount": starred,
                "starTotal": stars, "byAward": by_award, "file": fname,
            })
            c_rest += len(recs); c_stars += stars
            for k, v in by_award.items():
                c_by_award[k] += v
        city_list.sort(key=lambda x: (-x["starTotal"], -x["restaurantCount"], x["name"]))
        c_starred = sum(ci["starredCount"] for ci in city_list)
        countries_meta.append({
            "slug": c_slug, "name": country,
            "nameZh": COUNTRY_ZH.get(country, country),
            "isChina": country in CHINA_COUNTRIES,
            "restaurantCount": c_rest, "starredCount": c_starred, "starTotal": c_stars,
            "cityCount": len(city_list), "byAward": c_by_award,
            "cities": city_list,
        })

    countries_meta.sort(key=lambda x: (-x["starTotal"], -x["restaurantCount"]))
    meta = {
        "generatedAt": __import__("datetime").date.today().isoformat(),
        "source": "ngshiheng/michelin-my-maps (MICHELIN Guide)",
        "historyYears": HISTORY_YEARS + [2026],
        "totals": {
            "restaurants": total,
            "stars": sum(c["starTotal"] for c in countries_meta),
            "countries": len(countries_meta),
            "withChanges": changed_count,
        },
        "countries": countries_meta,
    }
    with open(os.path.join(OUT, "meta.json"), "w", encoding="utf-8") as fo:
        json.dump(meta, fo, ensure_ascii=False)

    print(f"\n✅ 完成：{total} 家餐厅 / {meta['totals']['stars']} 星 / "
          f"{len(countries_meta)} 个国家地区 / {changed_count} 家有星级变化记录")
    print(f"   输出目录：{OUT}")


if __name__ == "__main__":
    main()

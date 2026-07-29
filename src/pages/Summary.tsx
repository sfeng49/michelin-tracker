import { useEffect, useMemo, useState } from 'react'
import type { Meta, Restaurant } from '../types'
import { useStore, go, resetAll } from '../store/store'
import { loadCity, AWARD_ORDER, AWARD_ZH, cityLabel, restName } from '../data'
import { AwardBadge, ChangeBadge } from '../components/Award'
import { MichelinStar } from '../components/MichelinStar'
import FootprintMap from '../components/FootprintMap'
import { downloadShareImage, type ShareData } from '../shareImage'
import { shareToSocial } from '../share'
import { computeLevel, computeBadges } from '../stats'

export default function Summary({ meta }: { meta: Meta }) {
  const selectedCities = useStore((s) => s.cities)
  const visited = useStore((s) => s.visited)
  const wishlist = useStore((s) => s.wishlist)
  const includeAll = useStore((s) => s.includeAll)
  const [all, setAll] = useState<Restaurant[] | null>(null)
  const [shareMsg, setShareMsg] = useState('')

  const isChinaOf = useMemo(() => {
    const map: Record<string, boolean> = {}
    for (const c of meta.countries) map[c.name] = c.isChina
    return map
  }, [meta])

  // 全球各奖项总数（用于「收集度」）
  const globalByAward = useMemo(() => {
    const g: Record<string, number> = {}
    for (const c of meta.countries)
      for (const [k, v] of Object.entries(c.byAward)) g[k] = (g[k] ?? 0) + v
    return g
  }, [meta])

  useEffect(() => {
    const files = new Set<string>()
    for (const key of selectedCities) {
      const [cSlug, citySlug] = key.split('/')
      const country = meta.countries.find((c) => c.slug === cSlug)
      const city = country?.cities.find((ct) => ct.slug === citySlug)
      if (city) files.add(city.file)
    }
    Promise.all([...files].map((f) => loadCity(f))).then((lists) => setAll(lists.flat()))
  }, [selectedCities, meta])

  const stats = useMemo(() => {
    if (!all) return null
    const mine = all.filter((r) => visited[r.id] && (includeAll || r.stars > 0))
    const byAward: Record<string, number> = {}
    const byCountry: Record<string, { zh: string; count: number; stars: number }> = {}
    const byCuisine: Record<string, number> = {}
    const byPrice: Record<string, number> = {}
    const byCity: Record<string, number> = {}
    let stars = 0
    let green = 0
    const changed: Restaurant[] = []
    for (const r of mine) {
      byAward[r.award] = (byAward[r.award] ?? 0) + 1
      stars += r.stars
      if (r.greenStar) green++
      const cz = meta.countries.find((c) => c.name === r.country)
      const zh = cz?.nameZh ?? r.country
      const b = (byCountry[r.country] ??= { zh, count: 0, stars: 0 })
      b.count += 1
      b.stars += r.stars
      if (r.cuisine) byCuisine[r.cuisine] = (byCuisine[r.cuisine] ?? 0) + 1
      if (r.price) byPrice[r.price] = (byPrice[r.price] ?? 0) + 1
      const cl = cityLabel({ name: r.city, nameZh: r.cityZh, isChina: !!cz?.isChina })
      byCity[cl] = (byCity[cl] ?? 0) + 1
      if (r.history.length > 0) changed.push(r)
    }
    const countries = Object.values(byCountry).sort((a, b) => b.stars - a.stars || b.count - a.count)
    changed.sort((a, b) => b.stars - a.stars)
    const cuisineTop = Object.entries(byCuisine).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const cityTop = Object.entries(byCity).sort((a, b) => b[1] - a[1])
    const maxCityCount = cityTop[0]?.[1] ?? 0
    const wish = all.filter((r) => wishlist[r.id])
    return {
      mine, byAward, stars, green, countries, changed,
      cuisineTop, byPrice, cityTop, maxCityCount, wish,
    }
  }, [all, visited, wishlist, includeAll, meta])

  if (!all || !stats) return <div className="loading">统计中…</div>

  const total = stats.mine.length
  const s3 = stats.byAward['3 Stars'] ?? 0
  const s2 = stats.byAward['2 Stars'] ?? 0
  const s1 = stats.byAward['1 Star'] ?? 0
  const bib = stats.byAward['Bib Gourmand'] ?? 0
  const starred = s3 + s2 + s1

  const level = computeLevel(stats.stars)
  const badges = computeBadges({
    total, s3, countries: stats.countries.length, green: stats.green,
    maxCityCount: stats.maxCityCount, changed: stats.changed.length,
  })

  const globalStarred =
    (globalByAward['3 Stars'] ?? 0) + (globalByAward['2 Stars'] ?? 0) + (globalByAward['1 Star'] ?? 0)
  const collectionPct = globalStarred ? Math.round((starred / globalStarred) * 1000) / 10 : 0
  const tierPct = (n: number, label: string) => {
    const g = globalByAward[label] ?? 0
    return { n, g, pct: g ? Math.round((n / g) * 1000) / 10 : 0 }
  }
  const collection = [
    { label: '三星', stars: 3, ...tierPct(s3, '3 Stars') },
    { label: '二星', stars: 2, ...tierPct(s2, '2 Stars') },
    { label: '一星', stars: 1, ...tierPct(s1, '1 Star') },
  ]

  const shareData: ShareData = {
    total, stars: stats.stars, s3, s2, s1, bib,
    selected: stats.byAward['Selected'] ?? 0,
    countries: stats.countries, changed: stats.changed.length, includeAll,
    levelTitle: level.title, collectionPct,
  }

  async function share(platform: 'xhs' | 'moments') {
    setShareMsg('生成图片中…')
    const res = await shareToSocial(shareData, platform)
    setShareMsg(
      res === 'shared'
        ? '已唤起系统分享，选择小红书 / 微信即可'
        : res === 'fallback'
          ? '图片已保存、文案已复制 —— 打开 App 新建帖子，粘贴即可发布'
          : '分享失败，请用下方「导出图片」手动保存',
    )
  }

  return (
    <div className="page summary">
      <div className="result-card">
        <div className="rc-star"><MichelinStar size={44} color="var(--gold)" /></div>
        <h2>你的米其林足迹</h2>

        {/* 等级 */}
        <div className="level">
          <span className="level-title">🏅 {level.title}</span>
          {level.next != null ? (
            <>
              <div className="level-bar"><i style={{ width: `${level.progress * 100}%` }} /></div>
              <span className="level-hint">
                距「{level.nextTitle}」还差 {level.next - stats.stars} 颗星
              </span>
            </>
          ) : (
            <span className="level-hint">已达最高等级 🎉</span>
          )}
        </div>

        <div className="bignums">
          <div className="bignum"><b>{total}</b><span>家餐厅打卡</span></div>
          <div className="bignum accent"><b>{stats.stars}</b><span>颗米其林星星</span></div>
          <div className="bignum"><b>{stats.countries.length}</b><span>个国家 / 地区</span></div>
        </div>

        <div className="award-breakdown">
          {AWARD_ORDER.map((a) => {
            const n = stats.byAward[a] ?? 0
            if (!n) return null
            return (
              <div key={a} className="ab-row">
                <span className="ab-label">
                  <AwardBadge award={a} stars={a === '3 Stars' ? 3 : a === '2 Stars' ? 2 : a === '1 Star' ? 1 : 0} />{' '}
                  {AWARD_ZH[a]}
                </span>
                <span className="ab-n">× {n}</span>
              </div>
            )
          })}
        </div>
        <p className="rc-line">
          其中 <b>{starred}</b> 家星级餐厅，合计 <b>{stats.stars}</b> 颗星。
        </p>
      </div>

      {/* 徽章 */}
      <section className="block">
        <h3>成就徽章 <span className="muted">（已解锁 {badges.filter((b) => b.got).length}/{badges.length}）</span></h3>
        <div className="badges">
          {badges.map((b) => (
            <div key={b.label} className={`badge ${b.got ? 'got' : ''}`}>
              <span className="badge-ic">{b.icon}</span>
              <span className="badge-lb">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 收集度 */}
      <section className="block">
        <h3>星级收集度 <span className="muted">（占全球在榜星级餐厅的比例）</span></h3>
        <p className="collect-total">
          已集齐全球 <b>{collectionPct}%</b> 的星级餐厅（{starred} / {globalStarred}）
        </p>
        <div className="collect">
          {collection.map((c) => (
            <div key={c.label} className="collect-row">
              <span className="collect-lb"><MichelinStar size={12} /> {c.label}</span>
              <span className="ct-bar"><i style={{ width: `${Math.min(100, c.pct)}%` }} /></span>
              <span className="collect-n">{c.n} / {c.g} · {c.pct}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* 口味画像 */}
      {(stats.cuisineTop.length > 0 || stats.cityTop.length > 0) && (
        <section className="block">
          <h3>你的口味画像</h3>
          <div className="profile">
            {stats.cityTop[0] && (
              <div className="pf-item"><b>{stats.cityTop[0][0]}</b><span>最常打卡的城市（{stats.cityTop[0][1]} 家）</span></div>
            )}
            {stats.cuisineTop[0] && (
              <div className="pf-item"><b>{stats.cuisineTop[0][0]}</b><span>最爱菜系（{stats.cuisineTop[0][1]} 家）</span></div>
            )}
            {stats.green > 0 && (
              <div className="pf-item"><b>🌿 {stats.green}</b><span>绿星（可持续）餐厅</span></div>
            )}
          </div>
          {stats.cuisineTop.length > 1 && (
            <div className="taglist">
              {stats.cuisineTop.map(([c, n]) => (
                <span key={c} className="tag">{c} <i>{n}</i></span>
              ))}
            </div>
          )}
        </section>
      )}

      {stats.mine.some((r) => r.lat != null) && (
        <section className="block">
          <h3>足迹地图 <span className="muted">（点标记查看餐厅）</span></h3>
          <FootprintMap restaurants={stats.mine} isChinaOf={isChinaOf} />
        </section>
      )}

      {stats.countries.length > 0 && (
        <section className="block">
          <h3>各国家 / 地区分布</h3>
          <div className="ctable">
            {stats.countries.map((c) => (
              <div key={c.zh} className="ctrow">
                <span className="ct-name">{c.zh}</span>
                <span className="ct-bar"><i style={{ width: `${(c.count / total) * 100}%` }} /></span>
                <span className="ct-n">{c.count} 家 · <MichelinStar size={11} /> {c.stars}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="block">
        <h3>历年星级变化 <span className="muted">（你打卡餐厅中有升 / 降星记录的）</span></h3>
        {stats.changed.length === 0 ? (
          <p className="muted">你打卡的餐厅中，2022–2026 年间星级没有变化记录。</p>
        ) : (
          <ul className="changelist">
            {stats.changed.map((r) => (
              <li key={r.id}>
                <div className="cl-top">
                  <span className="rname">{restName(r)}</span>
                  <AwardBadge award={r.award} stars={r.stars} />
                  <span className="muted">
                    {cityLabel({ name: r.city, nameZh: r.cityZh, isChina: !!isChinaOf[r.country] })}
                  </span>
                </div>
                <div className="rhistory">
                  {r.history.map((h, i) => (
                    <ChangeBadge key={i} direction={h.direction} year={h.year} toLabel={h.toLabel} fromLabel={h.fromLabel} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 想去清单 */}
      {stats.wish.length > 0 && (
        <section className="block">
          <h3>想去清单 <span className="muted">（{stats.wish.length} 家）</span></h3>
          <ul className="wishlist">
            {stats.wish.map((r) => (
              <li key={r.id}>
                <span className="rname">{restName(r)}</span>
                <AwardBadge award={r.award} stars={r.stars} />
                <span className="muted">{cityLabel({ name: r.city, nameZh: r.cityZh, isChina: !!isChinaOf[r.country] })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 分享 */}
      <section className="block share">
        <h3>晒出你的成绩单</h3>
        <div className="share-actions">
          <button className="btn btn-primary" onClick={() => share('xhs')}>📕 分享到小红书</button>
          <button className="btn btn-primary btn-wx" onClick={() => share('moments')}>💬 分享到朋友圈</button>
          <button className="btn" onClick={() => downloadShareImage(shareData)}>📷 保存图片</button>
        </div>
        {shareMsg && <p className="share-msg">{shareMsg}</p>}
        <p className="muted share-tip">
          手机上会唤起系统分享面板，选微信 / 小红书即可；电脑上会保存图片并复制文案，去 App 新建帖子粘贴发布。
        </p>
      </section>

      <div className="footbar">
        <button className="btn" onClick={() => go('restaurants')}>返回修改</button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            if (confirm('确定清空所有选择并重新开始？')) {
              resetAll()
              go('home')
            }
          }}
        >
          清空重来
        </button>
      </div>
    </div>
  )
}

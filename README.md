# 米其林打卡 · 星星统计

一个帮你统计「去过多少家米其林餐厅、累计多少颗星」的网页工具。三步走：**选国家 → 选城市 → 选餐厅 → 出结果**，并标注每家餐厅历年的升星 / 降星记录。

功能：
- **默认只统计星级餐厅**（1/2/3 星），可一键切换为「含必比登 · 入选」
- **足迹地图**：结果页用 Leaflet + OpenStreetMap 标出你打卡餐厅的位置
- **中文城市名**：非中国地区显示「中文 本地名」（如「巴黎 Paris」），中国大陆 / 港澳台显示单一中文名；未收录中文名的小城镇回退显示当地名
- **导出打卡图片**：一键生成可分享的成绩卡 PNG
- 每家餐厅标注 2022–2026 的升星 / 降星 / 首次入选记录

## 技术栈

- Vite + React + TypeScript（纯前端，无后端）
- 选择结果保存在浏览器 `localStorage`，不上传
- 数据在构建阶段由 Python 脚本从公开数据集生成为静态 JSON，运行时按城市懒加载

## 目录结构

```
michelin-tracker/
├─ scripts/build_data.py   # 数据管线：CSV 快照 → public/data/*.json
├─ public/data/
│  ├─ meta.json            # 国家 → 城市 → 计数（一次性加载）
│  └─ restaurants/*.json   # 每个城市的餐厅明细（按需加载）
├─ src/
│  ├─ pages/               # Home / Countries / Cities / Restaurants / Summary
│  ├─ components/Award.tsx # 星级、奖项、星级变化徽标
│  ├─ store/store.ts       # 极简全局状态 + 本地持久化
│  ├─ data.ts  types.ts    # 数据加载与类型
└─ ...
```

## 快速开始

```bash
cd michelin-tracker
npm install
npm run data     # 生成数据（需要 ../snapshots/*.csv，见下）
npm run dev      # 本地开发
npm run build    # 生产构建到 dist/
```

## 数据来源与历史还原

- 主数据：[`ngshiheng/michelin-my-maps`](https://github.com/ngshiheng/michelin-my-maps)，抓取自 MICHELIN Guide 官网。
- **当前星级**：来自最新快照（约 1.9 万家餐厅、55 个国家 / 地区）。
- **历年星级变化**：官方数据集本身没有逐年历史列。本项目通过下载该仓库 **2022 / 2023 / 2024 / 2025** 四个年度的 Git 快照，与当前（2026）快照按「餐厅名 + 城市」匹配比对，**还原**出每家餐厅的升星 / 降星 / 首次入选记录。
- 因此历史仅覆盖 2022 年至今，更早的星级变化不在数据内；跨年匹配以名称为主，个别改名 / 分店可能存在误差，**仅供参考**。

## 更新数据

运行 `scripts/` 同级的 `../snapshots/` 需包含：
`snap_current.csv`（当前完整快照）与 `snap_2022.csv … snap_2025.csv`（历史快照）。
更新时重新下载这些快照后执行 `npm run data` 即可。

---

数据版权归 MICHELIN 及原数据集作者所有，本工具仅用于个人统计与展示。

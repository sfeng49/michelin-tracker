import { useEffect, useMemo, useState } from 'react'
import type { Meta, Restaurant } from '../types'
import { useStore, go, resetAll } from '../store/store'
import { loadCity, AWARD_ORDER, AWARD_ZH, cityLabel, restName } from '../data'
import { Stars, AwardBadge, ChangeBadge } from '../components/Award'
import FootprintMap from '../components/FootprintMap'
import { downloadShareImage } from '../shareImage'

export default function Summary({ meta }: { meta: Meta }) {
  const selectedCities = useStore((s) => s.cities)
  const visited = useStore((s) => s.visited)
  const includeAll = useStore((s) => s.includeAll)
  const [all, setAll] = useState<Restaurant[] | null>(null)

  const isChinaOf = useMemo(() => {
    const map: Record<string, boolean> = {}
    for (const c of meta.countries) map[c.name] = c.isChina
    return map
  }, [meta])

  useEffect(() => {
    const files = new Set<string>()
    for (const key of selectedCities) {
      const [cSlug, citySlug] = key.split('/')
      const country = meta.countries.find((c) => c.slug === cSlug)
      const city = country?.cities.find((ct) => ct.slug === citySlug)
      if (city) files.add(city.file)
    }
    Promise.all([...files].map((f) => loadCity(f))).then((lists) =>
      setAll(lists.flat()),
    )
  }, [selectedCities, meta])

  const stats = useMemo(() => {
    if (!all) return null
    const mine = all.filter((r) => visited[r.id] && (includeAll || r.stars > 0))
    const byAward: Record<string, number> = {}
    const byCountry: Record<string, { zh: string; count: number; stars: number }> = {}
    let stars = 0
    const changed: Restaurant[] = []
    for (const r of mine) {
      byAward[r.award] = (byAward[r.award] ?? 0) + 1
      stars += r.stars
      const cz = meta.countries.find((c) => c.name === r.country)
      const zh = cz?.nameZh ?? r.country
      const b = (byCountry[r.country] ??= { zh, count: 0, stars: 0 })
      b.count += 1
      b.stars += r.stars
      if (r.history.length > 0) changed.push(r)
    }
    const countries = Object.values(byCountry).sort((a, b) => b.stars - a.stars || b.count - a.count)
    changed.sort((a, b) => b.stars - a.stars)
    return { mine, byAward, stars, countries, changed, cityCount: selectedCities.length }
  }, [all, visited, includeAll, meta, selectedCities])

  if (!all || !stats) return <div className="loading">统计中…</div>

  const total = stats.mine.length
  const s3 = stats.byAward['3 Stars'] ?? 0
  const s2 = stats.byAward['2 Stars'] ?? 0
  const s1 = stats.byAward['1 Star'] ?? 0
  const bib = stats.byAward['Bib Gourmand'] ?? 0
  const starred = s3 + s2 + s1

  const shareText =
    `我的米其林打卡：${total} 家餐厅、累计 ${stats.stars} 颗星 ` +
    `（三星 ${s3}／二星 ${s2}／一星 ${s1}／必比登 ${bib}），` +
    `跨 ${stats.countries.length} 个国家地区。`

  return (
    <div className="page summary">
      <div className="result-card">
        <div className="rc-star">★</div>
        <h2>你的米其林足迹</h2>
        <div className="bignums">
          <div className="bignum">
            <b>{total}</b>
            <span>家餐厅打卡</span>
          </div>
          <div className="bignum accent">
            <b>{stats.stars}</b>
            <span>颗米其林星星</span>
          </div>
          <div className="bignum">
            <b>{stats.countries.length}</b>
            <span>个国家 / 地区</span>
          </div>
        </div>

        <div className="award-breakdown">
          {AWARD_ORDER.map((a) => {
            const n = stats.byAward[a] ?? 0
            if (!n) return null
            return (
              <div key={a} className="ab-row">
                <span className="ab-label"><AwardBadge award={a} stars={a === '3 Stars' ? 3 : a === '2 Stars' ? 2 : a === '1 Star' ? 1 : 0} /> {AWARD_ZH[a]}</span>
                <span className="ab-n">× {n}</span>
              </div>
            )
          })}
        </div>
        <p className="rc-line">
          其中 <b>{starred}</b> 家星级餐厅，合计 <Stars n={0} /> <b>{stats.stars}</b> 星。
        </p>
      </div>

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
                <span className="ct-bar">
                  <i style={{ width: `${(c.count / total) * 100}%` }} />
                </span>
                <span className="ct-n">{c.count} 家 · ★{c.stars}</span>
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

      <section className="block share">
        <textarea readOnly className="sharebox" value={shareText} rows={3} />
        <div className="share-actions">
          <button
            className="btn btn-primary"
            onClick={() =>
              downloadShareImage({
                total,
                stars: stats.stars,
                s3,
                s2,
                s1,
                bib,
                selected: stats.byAward['Selected'] ?? 0,
                countries: stats.countries,
                changed: stats.changed.length,
                includeAll,
              })
            }
          >
            📷 导出打卡图片
          </button>
          <button className="btn" onClick={() => navigator.clipboard?.writeText(shareText)}>
            复制分享文案
          </button>
        </div>
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

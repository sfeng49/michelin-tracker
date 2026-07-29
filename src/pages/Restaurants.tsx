import { useEffect, useMemo, useState } from 'react'
import type { Meta, Restaurant } from '../types'
import { useStore, toggleVisited, toggleWishlist, setVisitedBulk, go } from '../store/store'
import { loadCity, AWARD_ORDER, AWARD_ZH, cityLabel, restName } from '../data'
import { AwardBadge, ChangeBadge } from '../components/Award'
import ScopeToggle from '../components/ScopeToggle'

interface CityGroup {
  key: string
  cityLabel: string
  restaurants: Restaurant[]
}

export default function Restaurants({ meta }: { meta: Meta }) {
  const selectedCities = useStore((s) => s.cities)
  const visited = useStore((s) => s.visited)
  const wishlist = useStore((s) => s.wishlist)
  const includeAll = useStore((s) => s.includeAll)
  const [groups, setGroups] = useState<CityGroup[] | null>(null)
  const [q, setQ] = useState('')
  const [awardFilter, setAwardFilter] = useState<Set<string>>(new Set())
  const [onlyChanged, setOnlyChanged] = useState(false)

  useEffect(() => {
    let cancelled = false
    setGroups(null)
    const tasks = selectedCities.map(async (key) => {
      const [cSlug, citySlug] = key.split('/')
      const country = meta.countries.find((c) => c.slug === cSlug)
      const city = country?.cities.find((ct) => ct.slug === citySlug)
      if (!country || !city) return null
      const restaurants = await loadCity(city.file)
      return {
        key,
        cityLabel: cityLabel({ name: city.name, nameZh: city.nameZh, isChina: country.isChina }),
        restaurants,
      } as CityGroup
    })
    Promise.all(tasks).then((res) => {
      if (!cancelled) setGroups(res.filter(Boolean) as CityGroup[])
    })
    return () => {
      cancelled = true
    }
  }, [selectedCities, meta])

  // 切换口径时清空奖项筛选，避免残留不可见的筛选项
  useEffect(() => {
    setAwardFilter(new Set())
  }, [includeAll])

  const awardChips = includeAll ? AWARD_ORDER : ['3 Stars', '2 Stars', '1 Star']

  const kw = q.trim().toLowerCase()
  const filterRest = (r: Restaurant) => {
    if (!includeAll && r.stars === 0) return false
    if (awardFilter.size && !awardFilter.has(r.award)) return false
    if (onlyChanged && r.history.length === 0) return false
    if (
      kw &&
      !r.name.toLowerCase().includes(kw) &&
      !r.cuisine.toLowerCase().includes(kw) &&
      !(r.nameZh || '').includes(kw)
    )
      return false
    return true
  }

  const allVisibleIds = useMemo(() => {
    if (!groups) return []
    const ids: string[] = []
    for (const g of groups) for (const r of g.restaurants) if (filterRest(r)) ids.push(r.id)
    return ids
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, kw, awardFilter, onlyChanged])

  const visitedInView = allVisibleIds.filter((id) => visited[id]).length

  function toggleAward(a: string) {
    setAwardFilter((prev) => {
      const next = new Set(prev)
      if (next.has(a)) next.delete(a)
      else next.add(a)
      return next
    })
  }

  if (!groups) return <div className="loading">餐厅数据加载中…</div>

  return (
    <div className="page">
      <div className="page-head">
        <h2>第 3 步 · 勾选你吃过的餐厅</h2>
        <p className="muted">
          共 {groups.length} 座城市。勾选你实际打过卡的餐厅，右上角实时累计。
        </p>
      </div>

      <ScopeToggle />

      <div className="toolbar toolbar-wrap sticky">
        <input
          className="search"
          placeholder="搜索餐厅 / 菜系…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="filters">
          {awardChips.map((a) => (
            <button
              key={a}
              className={`fchip ${awardFilter.has(a) ? 'on' : ''}`}
              onClick={() => toggleAward(a)}
            >
              {AWARD_ZH[a]}
            </button>
          ))}
          <button
            className={`fchip ${onlyChanged ? 'on' : ''}`}
            onClick={() => setOnlyChanged((v) => !v)}
          >
            仅看有星级变化
          </button>
        </div>
        <span className="count-pill strong">本页已打卡 {visitedInView}</span>
      </div>

      {groups.map((g) => {
        const rs = g.restaurants.filter(filterRest)
        if (rs.length === 0) return null
        const ids = rs.map((r) => r.id)
        const allOn = ids.every((id) => visited[id])
        return (
          <section key={g.key} className="rgroup">
            <div className="rgroup-head">
              <h3>{g.cityLabel}</h3>
              <button className="linkbtn" onClick={() => setVisitedBulk(ids, !allOn)}>
                {allOn ? '取消全选' : '全选本城'}
              </button>
            </div>
            <ul className="rlist">
              {rs.map((r) => {
                const on = !!visited[r.id]
                return (
                  <li key={r.id} className={`ritem ${on ? 'on' : ''}`} onClick={() => toggleVisited(r.id)}>
                    <span className="rcheck">{on ? '✓' : ''}</span>
                    <div className="rbody">
                      <div className="rtop">
                        <span className="rname">{restName(r)}</span>
                        <AwardBadge award={r.award} stars={r.stars} />
                        {r.greenStar && <span className="chip chip-green" title="绿星（可持续）">🌿</span>}
                      </div>
                      <div className="rsub">
                        {r.cuisine && <span>{r.cuisine}</span>}
                        {r.price && <span className="rprice">{r.price}</span>}
                      </div>
                      {r.history.length > 0 && (
                        <div className="rhistory">
                          {r.history.map((h, i) => (
                            <ChangeBadge
                              key={i}
                              direction={h.direction}
                              year={h.year}
                              toLabel={h.toLabel}
                              fromLabel={h.fromLabel}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      className={`wish-btn ${wishlist[r.id] ? 'on' : ''}`}
                      title="想去"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleWishlist(r.id)
                      }}
                    >
                      {wishlist[r.id] ? '♥' : '♡'}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      <div className="footbar">
        <button className="btn" onClick={() => go('cities')}>上一步</button>
        <button className="btn btn-primary" onClick={() => go('summary')}>
          查看统计结果
        </button>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import type { Meta } from '../types'
import { useStore, toggleCity, cityKey, go } from '../store/store'
import { cityLabel } from '../data'
import CitySelectMap from '../components/CitySelectMap'

export default function Cities({ meta }: { meta: Meta }) {
  const countries = useStore((s) => s.countries)
  const selectedCities = useStore((s) => s.cities)
  const includeAll = useStore((s) => s.includeAll)
  const [q, setQ] = useState('')

  const chosen = useMemo(
    () => meta.countries.filter((c) => countries.includes(c.slug)),
    [meta, countries],
  )

  const [active, setActive] = useState(chosen[0]?.slug ?? '')
  useEffect(() => {
    if (!chosen.find((c) => c.slug === active)) setActive(chosen[0]?.slug ?? '')
  }, [chosen, active])

  const country = chosen.find((c) => c.slug === active) ?? chosen[0]
  const kw = q.trim().toLowerCase()

  const cities = useMemo(() => {
    if (!country) return []
    return country.cities.filter((ct) => {
      if (!includeAll && ct.starredCount === 0) return false
      if (!kw) return true
      return ct.name.toLowerCase().includes(kw) || (ct.nameZh || '').includes(kw)
    })
  }, [country, includeAll, kw])

  const selectedSlugs = useMemo(() => {
    const s = new Set<string>()
    if (!country) return s
    const prefix = country.slug + '/'
    for (const k of selectedCities) if (k.startsWith(prefix)) s.add(k.slice(prefix.length))
    return s
  }, [selectedCities, country])

  if (!country) return null

  const selectedHere = selectedSlugs.size

  return (
    <div className="page">
      <div className="page-head">
        <h2>第 2 步 · 选择你到访过的城市</h2>
        <p className="muted">在地图上点标记即可勾选城市，或用下方标签精确查找。</p>
      </div>

      {/* 国家标签页 */}
      <div className="ctabs">
        {chosen.map((c) => {
          const cnt = selectedCities.filter((k) => k.startsWith(c.slug + '/')).length
          return (
            <button
              key={c.slug}
              className={`ctab ${c.slug === active ? 'on' : ''}`}
              onClick={() => setActive(c.slug)}
            >
              {c.nameZh}
              {cnt > 0 && <span className="ctab-n">{cnt}</span>}
            </button>
          )
        })}
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder={`在 ${country.nameZh} 搜索城市…`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="count-pill">{country.nameZh} 已选 {selectedHere} 城</span>
      </div>

      <CitySelectMap
        key={country.slug}
        cities={cities}
        isChina={country.isChina}
        includeAll={includeAll}
        selected={selectedSlugs}
        onToggle={(slug) => toggleCity(cityKey(country.slug, slug))}
      />

      <div className="chips chips-below">
        {cities.map((ct) => {
          const key = cityKey(country.slug, ct.slug)
          const on = selectedCities.includes(key)
          const n = includeAll ? ct.restaurantCount : ct.starredCount
          return (
            <button
              key={key}
              className={`citychip ${on ? 'sel' : ''}`}
              onClick={() => toggleCity(key)}
              title={`${ct.restaurantCount} 家 · ${ct.starTotal} 星`}
            >
              {on ? '✓ ' : ''}
              {cityLabel({ name: ct.name, nameZh: ct.nameZh, isChina: country.isChina })}
              <span className="citychip-n">{n}</span>
            </button>
          )
        })}
      </div>

      <div className="footbar">
        <button className="btn" onClick={() => go('countries')}>上一步</button>
        <button
          className="btn btn-primary"
          disabled={selectedCities.length === 0}
          onClick={() => go('restaurants')}
        >
          下一步：选餐厅（{selectedCities.length} 城）
        </button>
      </div>
    </div>
  )
}

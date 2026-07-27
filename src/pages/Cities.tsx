import { useMemo, useState } from 'react'
import type { Meta } from '../types'
import { useStore, toggleCity, cityKey, go } from '../store/store'
import { cityLabel } from '../data'

export default function Cities({ meta }: { meta: Meta }) {
  const countries = useStore((s) => s.countries)
  const selectedCities = useStore((s) => s.cities)
  const includeAll = useStore((s) => s.includeAll)
  const [q, setQ] = useState('')

  const chosen = useMemo(
    () => meta.countries.filter((c) => countries.includes(c.slug)),
    [meta, countries],
  )

  const kw = q.trim().toLowerCase()

  return (
    <div className="page">
      <div className="page-head">
        <h2>第 2 步 · 选择你到访过的城市</h2>
        <p className="muted">在你选的 {chosen.length} 个国家里，勾选去过的城市。</p>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="搜索城市…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="count-pill">已选 {selectedCities.length} 城</span>
      </div>

      {chosen.map((c) => {
        const cities = c.cities.filter((ct) => {
          if (!includeAll && ct.starredCount === 0) return false
          if (!kw) return true
          return ct.name.toLowerCase().includes(kw) || (ct.nameZh || '').includes(kw)
        })
        if (cities.length === 0) return null
        return (
          <section key={c.slug} className="country-block">
            <h3 className="cb-title">
              {c.nameZh} <span className="cb-en">{c.name}</span>
              <span className="cb-count">{cities.length} 城</span>
            </h3>
            <div className="chips">
              {cities.map((ct) => {
                const key = cityKey(c.slug, ct.slug)
                const on = selectedCities.includes(key)
                const n = includeAll ? ct.restaurantCount : ct.starredCount
                return (
                  <button
                    key={key}
                    className={`citychip ${on ? 'sel' : ''}`}
                    onClick={() => toggleCity(key)}
                    title={`${ct.restaurantCount} 家 · ${ct.starTotal} 星`}
                  >
                    {on ? '✓ ' : ''}{cityLabel({ name: ct.name, nameZh: ct.nameZh, isChina: c.isChina })}
                    <span className="citychip-n">{n}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}

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

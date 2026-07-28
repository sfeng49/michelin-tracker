import { useMemo, useState } from 'react'
import type { Meta } from '../types'
import { useStore, toggleCountry, go } from '../store/store'
import ScopeToggle from '../components/ScopeToggle'
import { MichelinStar } from '../components/MichelinStar'

export default function Countries({ meta }: { meta: Meta }) {
  const selected = useStore((s) => s.countries)
  const includeAll = useStore((s) => s.includeAll)
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return meta.countries.filter(
      (c) =>
        (includeAll || c.starredCount > 0) &&
        (!kw || c.nameZh.includes(kw) || c.name.toLowerCase().includes(kw)),
    )
  }, [meta, q, includeAll])

  return (
    <div className="page">
      <div className="page-head">
        <h2>第 1 步 · 选择你去过的国家 / 地区</h2>
        <p className="muted">共 {list.length} 个有米其林榜单的国家 / 地区。勾选你到访过的。</p>
      </div>

      <ScopeToggle />

      <div className="toolbar">
        <input
          className="search"
          placeholder="搜索国家…（如 法国 / Japan）"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="count-pill">已选 {selected.length}</span>
      </div>

      <div className="grid">
        {list.map((c) => {
          const on = selected.includes(c.slug)
          return (
            <button
              key={c.slug}
              className={`card country-card ${on ? 'sel' : ''}`}
              onClick={() => toggleCountry(c.slug)}
            >
              <div className="cc-check">{on ? '✓' : ''}</div>
              <div className="cc-name">
                <b>{c.nameZh}</b>
                <span className="cc-en">{c.name}</span>
              </div>
              <div className="cc-meta">
                <span>{includeAll ? c.restaurantCount : c.starredCount} 家</span>
                <span className="cc-stars"><MichelinStar size={11} /> {c.starTotal}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="footbar">
        <button className="btn" onClick={() => go('home')}>返回</button>
        <button
          className="btn btn-primary"
          disabled={selected.length === 0}
          onClick={() => go('cities')}
        >
          下一步：选城市（{selected.length}）
        </button>
      </div>
    </div>
  )
}

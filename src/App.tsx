import { useEffect, useState } from 'react'
import { useStore, go } from './store/store'
import { loadMeta } from './data'
import type { Meta } from './types'
import Home from './pages/Home'
import Countries from './pages/Countries'
import Cities from './pages/Cities'
import Restaurants from './pages/Restaurants'
import Summary from './pages/Summary'

const STEPS: { key: string; label: string }[] = [
  { key: 'countries', label: '选国家' },
  { key: 'cities', label: '选城市' },
  { key: 'restaurants', label: '选餐厅' },
  { key: 'summary', label: '看结果' },
]

function Progress({ step }: { step: string }) {
  const idx = STEPS.findIndex((s) => s.key === step)
  if (idx < 0) return null
  return (
    <nav className="progress" aria-label="步骤">
      {STEPS.map((s, i) => (
        <div key={s.key} className={`pstep ${i <= idx ? 'done' : ''} ${i === idx ? 'cur' : ''}`}>
          <span className="pdot">{i < idx ? '✓' : i + 1}</span>
          <span className="plabel">{s.label}</span>
        </div>
      ))}
    </nav>
  )
}

export default function App() {
  const step = useStore((s) => s.step)
  const [meta, setMeta] = useState<Meta | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    loadMeta().then(setMeta).catch((e) => setErr(String(e)))
  }, [])

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => go('home')} aria-label="MICHELIN GUIDE 打卡统计">
          <span className="wordmark"><b>MICHELIN</b>&nbsp;GUIDE</span>
          <span className="brand-tag">打卡统计 · 非官方</span>
        </button>
        {step !== 'home' && <Progress step={step} />}
      </header>

      <main className="main">
        {err && <div className="error">数据加载失败：{err}<br />请先运行 <code>npm run data</code> 生成数据。</div>}
        {!err && !meta && <div className="loading">数据加载中…</div>}
        {meta && (
          <>
            {step === 'home' && <Home meta={meta} />}
            {step === 'countries' && <Countries meta={meta} />}
            {step === 'cities' && <Cities meta={meta} />}
            {step === 'restaurants' && <Restaurants meta={meta} />}
            {step === 'summary' && <Summary meta={meta} />}
          </>
        )}
      </main>

      <footer className="foot">
        数据来源：MICHELIN Guide（ngshiheng/michelin-my-maps）· 星级历史基于 2022–2026 快照还原，仅供参考
      </footer>
    </div>
  )
}

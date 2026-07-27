import { useStore, setIncludeAll } from '../store/store'

// 全局统计口径：默认只统计星级餐厅，可切换为含必比登 / 入选
export default function ScopeToggle() {
  const includeAll = useStore((s) => s.includeAll)
  return (
    <div className="scope">
      <span className="scope-label">统计口径</span>
      <div className="segmented">
        <button className={!includeAll ? 'on' : ''} onClick={() => setIncludeAll(false)}>
          只看星级餐厅
        </button>
        <button className={includeAll ? 'on' : ''} onClick={() => setIncludeAll(true)}>
          含必比登 · 入选
        </button>
      </div>
    </div>
  )
}

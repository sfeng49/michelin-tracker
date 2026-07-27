import type { Meta } from '../types'
import { useStore, go } from '../store/store'

export default function Home({ meta }: { meta: Meta }) {
  const visitedCount = useStore((s) => Object.keys(s.visited).length)
  const t = meta.totals
  return (
    <div className="home">
      <div className="hero">
        <div className="hero-star">★</div>
        <h1>你吃过多少家米其林？</h1>
        <p className="hero-sub">
          三步统计你打卡过的米其林餐厅数量与累计星星数，并标出每家餐厅历年的升星 / 降星记录。
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => go('countries')}>
          {visitedCount > 0 ? `继续统计（已打卡 ${visitedCount} 家）` : '开始统计'}
        </button>
        <p className="hero-note">数据存在你的浏览器本地，不会上传。</p>
      </div>

      <div className="home-stats">
        <div className="hstat"><b>{t.countries}</b><span>个国家/地区</span></div>
        <div className="hstat"><b>{t.restaurants.toLocaleString()}</b><span>家米其林餐厅</span></div>
        <div className="hstat"><b>{t.stars.toLocaleString()}</b><span>颗星星在榜</span></div>
      </div>

      <ol className="steps-intro">
        <li><b>选国家</b> — 勾选你去过、且有米其林榜单的国家或地区。</li>
        <li><b>选城市</b> — 在这些国家里，勾选你到访过的城市。</li>
        <li><b>选餐厅</b> — 在每个城市里勾选你实际吃过的餐厅。</li>
        <li><b>看结果</b> — 得到打卡总数、累计星数，以及餐厅的历年星级变化。</li>
      </ol>
    </div>
  )
}

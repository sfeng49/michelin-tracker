// 奖项徽标：星级用米其林花瓣星标，必比登/入选用文字 chip
import { AWARD_ZH } from '../data'
import { MichelinStars } from './MichelinStar'

export function Stars({ n, size = 15 }: { n: number; size?: number }) {
  return <MichelinStars n={n} size={size} />
}

export function AwardBadge({ award, stars }: { award: string; stars: number }) {
  if (stars > 0) return <Stars n={stars} />
  const cls = award === 'Bib Gourmand' ? 'chip chip-bib' : 'chip chip-selected'
  return <span className={cls}>{AWARD_ZH[award] ?? award}</span>
}

// 星级变化事件徽标
export function ChangeBadge({
  direction,
  year,
  toLabel,
  fromLabel,
}: {
  direction: 'up' | 'down' | 'new'
  year: number
  toLabel: string
  fromLabel?: string
}) {
  if (direction === 'new') {
    return (
      <span className="change change-new">
        {year} 首次入选 · {toLabel}
      </span>
    )
  }
  const arrow = direction === 'up' ? '↑' : '↓'
  return (
    <span className={`change change-${direction}`}>
      {year} {fromLabel}
      {' '}
      {arrow}
      {' '}
      {toLabel}
    </span>
  )
}

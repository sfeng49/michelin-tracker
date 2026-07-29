// 成就等级 + 徽章：借鉴收集类 App 的 gamification，纯前端根据打卡数据推导

export const LEVELS = [
  { min: 0, title: '美食新星' },
  { min: 1, title: '摘星学徒' },
  { min: 10, title: '星级食客' },
  { min: 25, title: '摘星达人' },
  { min: 50, title: '摘星大师' },
  { min: 100, title: '星途传奇' },
  { min: 200, title: '米其林猎人' },
]

export interface LevelInfo {
  title: string
  index: number
  cur: number // 当前等级起点星数
  next: number | null // 下一级所需星数（null=满级）
  nextTitle: string | null
  progress: number // 0~1 到下一级的进度
}

export function computeLevel(stars: number): LevelInfo {
  let index = 0
  for (let i = 0; i < LEVELS.length; i++) if (stars >= LEVELS[i].min) index = i
  const cur = LEVELS[index].min
  const nextLv = LEVELS[index + 1]
  const next = nextLv ? nextLv.min : null
  const progress = next ? Math.min(1, (stars - cur) / (next - cur)) : 1
  return {
    title: LEVELS[index].title,
    index,
    cur,
    next,
    nextTitle: nextLv ? nextLv.title : null,
    progress,
  }
}

export interface BadgeInput {
  total: number
  s3: number
  countries: number
  green: number
  maxCityCount: number
  changed: number
}

export interface Badge {
  icon: string
  label: string
  got: boolean
}

export function computeBadges(b: BadgeInput): Badge[] {
  return [
    { icon: '🌟', label: '首摘三星', got: b.s3 >= 1 },
    { icon: '👑', label: '三星收藏家', got: b.s3 >= 3 },
    { icon: '🌍', label: '环球食客', got: b.countries >= 5 },
    { icon: '🌿', label: '绿星拥护者', got: b.green >= 1 },
    { icon: '🍽️', label: '资深老饕', got: b.total >= 50 },
    { icon: '📍', label: '深耕一城', got: b.maxCityCount >= 10 },
    { icon: '📈', label: '见证升降星', got: b.changed >= 1 },
  ]
}

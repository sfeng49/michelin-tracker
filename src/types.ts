// 数据类型定义（与 scripts/build_data.py 输出保持一致）

export type AwardLabel = '3 Stars' | '2 Stars' | '1 Star' | 'Bib Gourmand' | 'Selected'

export interface StarChange {
  year: number
  from: AwardLabel | null
  to: AwardLabel
  fromLabel?: string
  toLabel: string
  direction: 'up' | 'down' | 'new'
}

export interface TimelinePoint {
  year: number
  award: AwardLabel
  stars: number
  label: string
}

export interface Restaurant {
  id: string
  name: string
  nameZh: string
  city: string
  cityZh: string
  country: string
  award: AwardLabel
  stars: number
  greenStar: boolean
  cuisine: string
  price: string
  address: string
  url: string
  lat: number | null
  lng: number | null
  history: StarChange[]
  timeline: TimelinePoint[]
}

export interface CityMeta {
  slug: string
  name: string
  nameZh: string
  restaurantCount: number
  starredCount: number
  starTotal: number
  byAward: Record<string, number>
  file: string
  lat: number | null
  lng: number | null
}

export interface CountryMeta {
  slug: string
  name: string
  nameZh: string
  isChina: boolean
  restaurantCount: number
  starredCount: number
  starTotal: number
  cityCount: number
  byAward: Record<string, number>
  cities: CityMeta[]
}

export interface Meta {
  generatedAt: string
  source: string
  historyYears: number[]
  totals: {
    restaurants: number
    starred: number
    stars: number
    countries: number
    withChanges: number
  }
  countries: CountryMeta[]
}

// 数据加载：meta 一次性载入；每城市餐厅明细按需懒加载并缓存
import type { Meta, Restaurant } from './types'

// base './' 下资源相对入口 index.html
const BASE = import.meta.env.BASE_URL

let metaPromise: Promise<Meta> | null = null
export function loadMeta(): Promise<Meta> {
  if (!metaPromise) {
    metaPromise = fetch(`${BASE}data/meta.json`).then((r) => {
      if (!r.ok) throw new Error('meta.json 加载失败')
      return r.json()
    })
  }
  return metaPromise
}

const cityCache = new Map<string, Promise<Restaurant[]>>()
export function loadCity(file: string): Promise<Restaurant[]> {
  if (!cityCache.has(file)) {
    cityCache.set(
      file,
      fetch(`${BASE}data/restaurants/${file}`).then((r) => {
        if (!r.ok) throw new Error(`${file} 加载失败`)
        return r.json()
      }),
    )
  }
  return cityCache.get(file)!
}

export const AWARD_ZH: Record<string, string> = {
  '3 Stars': '三星',
  '2 Stars': '二星',
  '1 Star': '一星',
  'Bib Gourmand': '必比登',
  Selected: '入选',
}

export const AWARD_ORDER = ['3 Stars', '2 Stars', '1 Star', 'Bib Gourmand', 'Selected']

// 餐厅显示名：中国相关地区有中文名则用中文名，否则用原名
export function restName(r: { name: string; nameZh?: string }): string {
  return (r.nameZh || '').trim() || r.name
}

// 城市显示名：
// - 中国相关地区 → 仅中文（单一名称）
// - 其他 → 有中文则「中文 本地名」，否则本地名
export function cityLabel(opts: { name: string; nameZh?: string; isChina: boolean }): string {
  const zh = (opts.nameZh || '').trim()
  if (opts.isChina) return zh || opts.name
  if (zh && zh !== opts.name) return `${zh} ${opts.name}`
  return opts.name
}

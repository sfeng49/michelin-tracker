// 极简全局状态：用户的选择 + 步骤，持久化到 localStorage
import { useSyncExternalStore } from 'react'

export type Step = 'home' | 'countries' | 'cities' | 'restaurants' | 'summary'

export interface AppState {
  step: Step
  countries: string[]          // 选中的国家 slug
  cities: string[]             // 选中的城市 key（countrySlug/citySlug）
  visited: Record<string, true> // 打卡的餐厅 id
  wishlist: Record<string, true> // 想去的餐厅 id
  includeAll: boolean          // false=默认只统计星级餐厅；true=含必比登/入选
}

const KEY = 'michelin-tracker-v1'

const initial: AppState = {
  step: 'home',
  countries: [],
  cities: [],
  visited: {},
  wishlist: {},
  includeAll: false,
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...initial, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return initial
}

let state: AppState = load()
const listeners = new Set<() => void>()

function emit() {
  // step 不持久化（每次进来从首页开始），其余持久化
  const { step: _step, ...persist } = state
  try {
    localStorage.setItem(KEY, JSON.stringify(persist))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  const p = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...p }
  emit()
}

export function getState() {
  return state
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => selector(state),
  )
}

// —— 便捷操作 ——
export const cityKey = (countrySlug: string, citySlug: string) => `${countrySlug}/${citySlug}`

export function toggleCountry(slug: string) {
  setState((s) => {
    const has = s.countries.includes(slug)
    const countries = has ? s.countries.filter((c) => c !== slug) : [...s.countries, slug]
    // 取消国家时，连带清掉其城市与打卡（避免残留统计）
    let cities = s.cities
    if (has) cities = s.cities.filter((k) => !k.startsWith(slug + '/'))
    return { countries, cities }
  })
}

export function toggleCity(key: string) {
  setState((s) => {
    const has = s.cities.includes(key)
    return { cities: has ? s.cities.filter((c) => c !== key) : [...s.cities, key] }
  })
}

export function toggleVisited(id: string) {
  setState((s) => {
    const visited = { ...s.visited }
    if (visited[id]) delete visited[id]
    else visited[id] = true
    return { visited }
  })
}

export function toggleWishlist(id: string) {
  setState((s) => {
    const wishlist = { ...s.wishlist }
    if (wishlist[id]) delete wishlist[id]
    else wishlist[id] = true
    return { wishlist }
  })
}

export function setVisitedBulk(ids: string[], value: boolean) {
  setState((s) => {
    const visited = { ...s.visited }
    for (const id of ids) {
      if (value) visited[id] = true
      else delete visited[id]
    }
    return { visited }
  })
}

export function setIncludeAll(v: boolean) {
  setState({ includeAll: v })
}

export function resetAll() {
  state = { ...initial }
  emit()
}

export function go(step: Step) {
  setState({ step })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

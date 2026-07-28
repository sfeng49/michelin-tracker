import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Restaurant } from '../types'
import { cityLabel, restName } from '../data'

const STAR_COLOR: Record<number, string> = {
  3: '#c8102e',
  2: '#e8622a',
  1: '#f4b400',
  0: '#9a8f80',
}

interface CityCluster {
  key: string
  label: string
  lat: number
  lng: number
  count: number
  stars: number
  maxStar: number
  items: Restaurant[]
}

function clusterByCity(restaurants: Restaurant[], isChinaOf: Record<string, boolean>): CityCluster[] {
  const map = new Map<string, CityCluster>()
  for (const r of restaurants) {
    if (r.lat == null || r.lng == null) continue
    const key = `${r.country}|${r.city}`
    let c = map.get(key)
    if (!c) {
      c = {
        key,
        label: cityLabel({ name: r.city, nameZh: r.cityZh, isChina: !!isChinaOf[r.country] }),
        lat: 0,
        lng: 0,
        count: 0,
        stars: 0,
        maxStar: 0,
        items: [],
      }
      map.set(key, c)
    }
    c.lat += r.lat
    c.lng += r.lng
    c.count += 1
    c.stars += r.stars
    c.maxStar = Math.max(c.maxStar, r.stars)
    c.items.push(r)
  }
  const out = [...map.values()]
  for (const c of out) {
    c.lat /= c.count
    c.lng /= c.count
    c.items.sort((a, b) => b.stars - a.stars)
  }
  return out
}

// 足迹地图：按城市聚合，每座城市一个标记（大小随打卡数量），点开看该城餐厅
export default function FootprintMap({
  restaurants,
  isChinaOf,
}: {
  restaurants: Restaurant[]
  isChinaOf: Record<string, boolean>
}) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!el.current || map.current || (el.current as unknown as { _leaflet_id?: number })._leaflet_id)
      return
    map.current = L.map(el.current, { scrollWheelZoom: false, attributionControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(map.current)
    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    const m = map.current
    if (!m) return
    const layer = L.layerGroup().addTo(m)
    const clusters = clusterByCity(restaurants, isChinaOf)
    const pts: [number, number][] = []

    for (const c of clusters) {
      pts.push([c.lat, c.lng])
      const size = Math.min(52, 26 + Math.round(Math.sqrt(c.count) * 6))
      const color = STAR_COLOR[c.maxStar] ?? STAR_COLOR[0]
      const icon = L.divIcon({
        className: 'city-pin-wrap',
        html: `<div class="city-pin" style="width:${size}px;height:${size}px;background:${color}">${c.count}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })
      const list = c.items
        .slice(0, 12)
        .map(
          (r) =>
            `<div class="pop-row"><span>${
              r.stars > 0 ? '★'.repeat(r.stars) : '·'
            }</span> ${restName(r)}</div>`,
        )
        .join('')
      const more = c.items.length > 12 ? `<div class="pop-more">…等 ${c.items.length} 家</div>` : ''
      L.marker([c.lat, c.lng], { icon })
        .bindPopup(
          `<div class="pop-city">${c.label}</div>` +
            `<div class="pop-sub">${c.count} 家 · ${c.stars} 星</div>${list}${more}`,
          { maxHeight: 240 },
        )
        .bindTooltip(`${c.label}（${c.count}）`, { direction: 'top' })
        .addTo(layer)
    }

    if (pts.length) {
      m.fitBounds(L.latLngBounds(pts).pad(0.3), { maxZoom: 6 })
    } else {
      m.setView([30, 10], 2)
    }
    return () => {
      layer.remove()
    }
  }, [restaurants, isChinaOf])

  return <div ref={el} className="footmap" />
}

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { CityMeta } from '../types'
import { cityLabel } from '../data'

interface Props {
  cities: CityMeta[]
  isChina: boolean
  includeAll: boolean
  selected: Set<string> // 城市 slug 集合
  onToggle: (slug: string) => void
}

// 交互式城市选择地图：点标记即勾选 / 取消该城市
export default function CitySelectMap({ cities, isChina, includeAll, selected, onToggle }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const selectedRef = useRef(selected)
  const onToggleRef = useRef(onToggle)
  selectedRef.current = selected
  onToggleRef.current = onToggle

  function renderMarkers(fit: boolean) {
    const m = map.current
    const lg = layer.current
    if (!m || !lg) return
    lg.clearLayers()
    const pts: [number, number][] = []
    for (const c of cities) {
      if (c.lat == null || c.lng == null) continue
      pts.push([c.lat, c.lng])
      const on = selectedRef.current.has(c.slug)
      const n = includeAll ? c.restaurantCount : c.starredCount
      const label = cityLabel({ name: c.name, nameZh: c.nameZh, isChina })
      const icon = L.divIcon({
        className: 'city-select-wrap',
        html: `<div class="city-select-pin ${on ? 'on' : ''}">${
          on ? '✓ ' : ''
        }${label}<i>${n}</i></div>`,
      })
      const marker = L.marker([c.lat, c.lng], { icon, riseOnHover: true })
      marker.on('click', () => onToggleRef.current(c.slug))
      marker.addTo(lg)
    }
    if (fit) {
      if (pts.length) m.fitBounds(L.latLngBounds(pts).pad(0.15), { maxZoom: 9 })
      else m.setView([30, 10], 2)
    }
  }

  useEffect(() => {
    if (!el.current || map.current || (el.current as unknown as { _leaflet_id?: number })._leaflet_id)
      return
    map.current = L.map(el.current, { scrollWheelZoom: false })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    renderMarkers(true)
    return () => {
      map.current?.remove()
      map.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 城市集合 / 口径变化：重建并重新取景
  useEffect(() => {
    renderMarkers(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities, includeAll, isChina])

  // 选中态变化：重建但保持当前视野
  useEffect(() => {
    renderMarkers(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  return <div ref={el} className="cityselectmap" />
}

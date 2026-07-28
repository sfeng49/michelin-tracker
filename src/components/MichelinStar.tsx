// 米其林花瓣星标（macaron / rosette）—— 6 片水滴形花瓣 + 中心圆，参照官方形状重绘。
// 提供三种用法：React 组件、SVG 字符串（Leaflet 弹窗）、canvas 绘制（分享图）。

const PETALS = 6
const CORE_R = 15
// 一片指向正上方的花瓣（viewBox 100×100，中心 50,50）：底部收窄、顶端宽圆
const PETAL_D = 'M50 48 C27 46 25 17 50 13 C75 17 73 46 50 48 Z'
// 同一花瓣相对中心(0,0)的贝塞尔控制点，供 canvas 使用
const PETAL_PTS = {
  start: [0, -2] as const,
  c1: [-23, -4] as const,
  c2: [-25, -33] as const,
  tip: [0, -37] as const,
  c3: [25, -33] as const,
  c4: [23, -4] as const,
}

function rotations() {
  return Array.from({ length: PETALS }, (_, i) => (360 / PETALS) * i)
}

export function MichelinStar({
  size = 16,
  color,
  className,
}: {
  size?: number
  color?: string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      style={{ display: 'block', fill: color ?? 'currentColor' }}
    >
      {rotations().map((deg) => (
        <path key={deg} d={PETAL_D} transform={`rotate(${deg} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r={CORE_R} />
    </svg>
  )
}

export function MichelinStars({ n, size = 16, color }: { n: number; size?: number; color?: string }) {
  if (n <= 0) return null
  return (
    <span className="stars" aria-label={`${n} 星`} style={{ display: 'inline-flex', gap: 1 }}>
      {Array.from({ length: n }).map((_, i) => (
        <MichelinStar key={i} size={size} color={color} />
      ))}
    </span>
  )
}

// SVG 字符串（用于 Leaflet 弹窗等 innerHTML 场景）
export function michelinStarSVG(size = 12, color = '#c8102e'): string {
  const petals = rotations()
    .map((deg) => `<path d="${PETAL_D}" transform="rotate(${deg} 50 50)"/>`)
    .join('')
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="${color}" style="display:inline-block;vertical-align:-2px">${petals}<circle cx="50" cy="50" r="${CORE_R}"/></svg>`
}

// canvas 绘制（分享图）。cx,cy 为中心，r 为半径（=尺寸的一半）
export function drawMichelinStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
) {
  const s = r / 50
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(s, s)
  ctx.fillStyle = color
  const p = PETAL_PTS
  for (const deg of rotations()) {
    ctx.save()
    ctx.rotate((deg * Math.PI) / 180)
    ctx.beginPath()
    ctx.moveTo(p.start[0], p.start[1])
    ctx.bezierCurveTo(p.c1[0], p.c1[1], p.c2[0], p.c2[1], p.tip[0], p.tip[1])
    ctx.bezierCurveTo(p.c3[0], p.c3[1], p.c4[0], p.c4[1], p.start[0], p.start[1])
    ctx.fill()
    ctx.restore()
  }
  ctx.beginPath()
  ctx.arc(0, 0, CORE_R, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

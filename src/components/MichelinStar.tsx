// 米其林花瓣星标（macaron）—— 由 6 片花瓣 + 中心圆组成的玫瑰花形，近似官方标志。
// 提供三种用法：React 组件、SVG 字符串（Leaflet 弹窗）、canvas 绘制（分享图）。

// 花瓣圆心（viewBox 100×100，中心 50,50）
const PETALS: [number, number][] = [
  [50, 26],
  [70.78, 38],
  [70.78, 62],
  [50, 74],
  [29.22, 62],
  [29.22, 38],
]
const PETAL_R = 17
const CORE_R = 20

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
      {PETALS.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={PETAL_R} />
      ))}
      <circle cx="50" cy="50" r={CORE_R} />
    </svg>
  )
}

// 一排 n 颗星
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
  const circles =
    PETALS.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="${PETAL_R}"/>`).join('') +
    `<circle cx="50" cy="50" r="${CORE_R}"/>`
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="${color}" style="display:inline-block;vertical-align:-2px">${circles}</svg>`
}

// canvas 绘制（用于导出分享图）。cx,cy 为中心，r 为半径（=尺寸的一半）
export function drawMichelinStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
) {
  const s = r / 50
  ctx.fillStyle = color
  const draw = (px: number, py: number, pr: number) => {
    ctx.beginPath()
    ctx.arc(cx + (px - 50) * s, cy + (py - 50) * s, pr * s, 0, Math.PI * 2)
    ctx.fill()
  }
  for (const [px, py] of PETALS) draw(px, py, PETAL_R)
  draw(50, 50, CORE_R)
}

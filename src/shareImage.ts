// 生成可分享的打卡图片（Canvas 绘制 → 下载 PNG）
import { drawMichelinStar } from './components/MichelinStar'

export interface ShareData {
  total: number
  stars: number
  s3: number
  s2: number
  s1: number
  bib: number
  selected: number
  countries: { zh: string; count: number; stars: number }[]
  changed: number
  includeAll: boolean
}

const W = 1080
const H = 1440

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function renderShareCard(canvas: HTMLCanvasElement, d: ShareData) {
  const ctx = canvas.getContext('2d')!
  canvas.width = W
  canvas.height = H
  const CN = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif'

  // 背景渐变（米其林红）
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#c8102e')
  g.addColorStop(1, '#8f0a20')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // 顶部米其林花瓣星标
  ctx.textAlign = 'center'
  drawMichelinStar(ctx, W / 2, 150, 62, '#f0c04a')

  ctx.fillStyle = '#fff'
  ctx.font = `bold 66px ${CN}`
  ctx.fillText('我的米其林足迹', W / 2, 290)

  ctx.font = `34px ${CN}`
  ctx.fillStyle = 'rgba(255,255,255,.8)'
  ctx.fillText(d.includeAll ? '含必比登 · 入选' : '只统计星级餐厅', W / 2, 345)

  // 两个大数字卡片
  const cardY = 400
  const cw = 430
  const gap = 40
  const x1 = (W - cw * 2 - gap) / 2
  ;[
    { x: x1, big: String(d.total), label: '家餐厅打卡', color: '#fff' },
    { x: x1 + cw + gap, big: String(d.stars), label: '颗米其林星星', color: '#f4b400' },
  ].forEach((c) => {
    ctx.fillStyle = 'rgba(255,255,255,.12)'
    roundRect(ctx, c.x, cardY, cw, 230, 28)
    ctx.fill()
    ctx.fillStyle = c.color
    ctx.font = `bold 130px ${CN}`
    ctx.fillText(c.big, c.x + cw / 2, cardY + 145)
    ctx.fillStyle = 'rgba(255,255,255,.9)'
    ctx.font = `36px ${CN}`
    ctx.fillText(c.label, c.x + cw / 2, cardY + 195)
  })

  // 星级明细
  let y = cardY + 320
  const rows: { stars: number; label: string; n: number }[] = [
    { stars: 3, label: '三星', n: d.s3 },
    { stars: 2, label: '二星', n: d.s2 },
    { stars: 1, label: '一星', n: d.s1 },
  ]
  if (d.includeAll) {
    rows.push({ stars: 0, label: '必比登', n: d.bib })
    rows.push({ stars: 0, label: '入选', n: d.selected })
  }
  const rx = 200
  const rw = W - rx * 2
  rows.forEach(({ stars, label, n }) => {
    ctx.fillStyle = 'rgba(255,255,255,.1)'
    roundRect(ctx, rx, y, rw, 66, 14)
    ctx.fill()
    // 花瓣星标
    let sx = rx + 34
    for (let i = 0; i < stars; i++) {
      drawMichelinStar(ctx, sx, y + 33, 15, '#f0c04a')
      sx += 36
    }
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'left'
    ctx.font = `40px ${CN}`
    ctx.fillText(label, stars > 0 ? sx + 6 : rx + 30, y + 47)
    ctx.textAlign = 'right'
    ctx.fillText(`× ${n}`, rx + rw - 30, y + 47)
    y += 80
  })

  // 国家分布（前 4）
  y += 20
  ctx.fillStyle = 'rgba(255,255,255,.85)'
  ctx.font = `bold 40px ${CN}`
  ctx.fillText(`足迹遍及 ${d.countries.length} 个国家 / 地区`, rx, y)
  y += 30
  d.countries.slice(0, 4).forEach((c) => {
    y += 62
    ctx.fillStyle = '#fff'
    ctx.font = `36px ${CN}`
    ctx.fillText(c.zh, rx, y)
    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(255,255,255,.75)'
    ctx.fillText(`${c.count} 家 · ${c.stars} 星`, rx + rw, y)
    ctx.textAlign = 'left'
  })

  // 底部
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,.6)'
  ctx.font = `30px ${CN}`
  ctx.fillText('米其林打卡 · 星星统计', W / 2, H - 60)
}

export function downloadShareImage(d: ShareData) {
  const canvas = document.createElement('canvas')
  renderShareCard(canvas, d)
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `米其林足迹-${d.total}家-${d.stars}星.png`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}

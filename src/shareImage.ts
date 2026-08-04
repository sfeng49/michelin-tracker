// 生成可分享的打卡图片（Canvas 绘制 → 下载 PNG）。自上而下布局，动态高度，避免错位。
import { drawMichelinStar } from './components/MichelinStar'
import { AUTHOR, SITE_URL } from './author'

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
  levelTitle?: string
  collectionPct?: number
  badges?: { icon: string; label: string }[] // 已解锁徽章
}

const W = 1080
const PAD = 70
const CN = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif'
const RED = '#c8102e'
const GOLD = '#f0c04a'

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// 计算徽章分行（每行最多 3 枚）
function badgeRows(d: ShareData) {
  const n = d.badges?.length ?? 0
  return n ? Math.ceil(n / 3) : 0
}

// 星级明细行数（三星/二星/一星 恒显示；含必比登时追加）
function awardRowList(d: ShareData): { stars: number; label: string; n: number }[] {
  const rows = [
    { stars: 3, label: '三星', n: d.s3 },
    { stars: 2, label: '二星', n: d.s2 },
    { stars: 1, label: '一星', n: d.s1 },
  ]
  if (d.includeAll) {
    rows.push({ stars: 0, label: '必比登', n: d.bib })
    rows.push({ stars: 0, label: '入选', n: d.selected })
  }
  return rows
}

function computeHeight(d: ShareData): number {
  let y = 70 // 顶部留白
  y += 130 // 星标
  y += 90 // 标题
  y += 58 // 等级
  y += 34 // 间距
  y += 220 // 两个大数字卡
  y += 46 // 间距
  y += awardRowList(d).length * 78 // 星级明细
  if (d.collectionPct != null) y += 96 // 收集度
  const br = badgeRows(d)
  if (br) y += 54 + br * 96 // 徽章标题 + 行
  const cN = Math.min(5, d.countries.length)
  if (cN) y += 66 + cN * 58 // 国家标题 + 行
  y += 130 // 底部
  return y
}

export function renderShareCard(canvas: HTMLCanvasElement, d: ShareData) {
  const H = computeHeight(d)
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // 背景
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, RED)
  g.addColorStop(1, '#8f0a20')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  const cx = W / 2
  let y = 70

  // 星标
  drawMichelinStar(ctx, cx, y + 55, 55, GOLD)
  y += 130

  // 标题
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#fff'
  ctx.font = `bold 66px ${CN}`
  ctx.fillText('我的米其林足迹', cx, y + 40)
  y += 90

  // 等级
  if (d.levelTitle) {
    ctx.fillStyle = GOLD
    ctx.font = `36px ${CN}`
    ctx.fillText(`Lv. ${d.levelTitle}`, cx, y + 20)
  }
  y += 58 + 34

  // 两个大数字卡
  const gap = 36
  const cw = (W - PAD * 2 - gap) / 2
  const cards = [
    { x: PAD, big: String(d.total), label: '家餐厅打卡', color: '#fff' },
    { x: PAD + cw + gap, big: String(d.stars), label: '颗米其林星星', color: GOLD },
  ]
  for (const c of cards) {
    ctx.fillStyle = 'rgba(255,255,255,.12)'
    roundRect(ctx, c.x, y, cw, 220, 26)
    ctx.fill()
    ctx.textAlign = 'center'
    ctx.fillStyle = c.color
    ctx.font = `bold 120px ${CN}`
    ctx.fillText(c.big, c.x + cw / 2, y + 130)
    ctx.fillStyle = 'rgba(255,255,255,.9)'
    ctx.font = `34px ${CN}`
    ctx.fillText(c.label, c.x + cw / 2, y + 185)
  }
  y += 220 + 46

  // 星级明细
  const rx = PAD
  const rw = W - PAD * 2
  for (const { stars, label, n } of awardRowList(d)) {
    ctx.fillStyle = 'rgba(255,255,255,.1)'
    roundRect(ctx, rx, y, rw, 64, 14)
    ctx.fill()
    let sx = rx + 34
    for (let i = 0; i < stars; i++) {
      drawMichelinStar(ctx, sx, y + 32, 14, GOLD)
      sx += 34
    }
    ctx.textAlign = 'left'
    ctx.fillStyle = '#fff'
    ctx.font = `38px ${CN}`
    ctx.fillText(label, stars > 0 ? sx + 8 : rx + 30, y + 44)
    ctx.textAlign = 'right'
    ctx.fillText(`× ${n}`, rx + rw - 30, y + 44)
    y += 78
  }

  // 收集度
  if (d.collectionPct != null) {
    y += 20
    ctx.textAlign = 'center'
    ctx.fillStyle = GOLD
    ctx.font = `bold 40px ${CN}`
    ctx.fillText(`已集齐全球 ${d.collectionPct}% 的星级餐厅`, cx, y + 28)
    y += 76
  }

  // 徽章
  const br = badgeRows(d)
  if (br && d.badges) {
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,.85)'
    ctx.font = `bold 36px ${CN}`
    ctx.fillText('已解锁成就', rx, y + 28)
    y += 54
    const perRow = 3
    const bw = (rw - gap * (perRow - 1)) / perRow
    d.badges.forEach((b, i) => {
      const col = i % perRow
      const row = Math.floor(i / perRow)
      const bx = rx + col * (bw + gap)
      const by = y + row * 96
      ctx.fillStyle = 'rgba(255,255,255,.14)'
      roundRect(ctx, bx, by, bw, 80, 16)
      ctx.fill()
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.font = `40px ${CN}`
      ctx.fillStyle = '#fff'
      ctx.fillText(b.icon, bx + 22, by + 42)
      ctx.font = `28px ${CN}`
      ctx.fillText(b.label, bx + 74, by + 42)
      ctx.textBaseline = 'alphabetic'
    })
    y += br * 96
  }

  // 国家分布（前 5）
  const cN = Math.min(5, d.countries.length)
  if (cN) {
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,.85)'
    ctx.font = `bold 36px ${CN}`
    ctx.fillText(`足迹遍及 ${d.countries.length} 个国家 / 地区`, rx, y + 28)
    y += 66
    for (const c of d.countries.slice(0, cN)) {
      ctx.textAlign = 'left'
      ctx.fillStyle = '#fff'
      ctx.font = `34px ${CN}`
      ctx.fillText(c.zh, rx, y + 26)
      ctx.textAlign = 'right'
      ctx.fillStyle = 'rgba(255,255,255,.78)'
      ctx.fillText(`${c.count} 家 · ${c.stars} 星`, rx + rw, y + 26)
      y += 58
    }
  }

  // 底部：作者署名 + 域名（成绩卡被转发时带上作者，形成涨粉闭环）
  ctx.textAlign = 'center'
  ctx.fillStyle = GOLD
  ctx.font = `32px ${CN}`
  ctx.fillText(`小红书 @${AUTHOR.handle}`, cx, H - 82)
  ctx.fillStyle = 'rgba(255,255,255,.6)'
  ctx.font = `28px ${CN}`
  ctx.fillText(`${SITE_URL} · 非官方`, cx, H - 46)
}

export function shareCardBlob(d: ShareData): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  renderShareCard(canvas, d)
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}

export function shareFileName(d: ShareData) {
  return `米其林足迹-${d.total}家-${d.stars}星.png`
}

export async function downloadShareImage(d: ShareData) {
  const blob = await shareCardBlob(d)
  if (!blob) return
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = shareFileName(d)
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// 分享到小红书 / 朋友圈：
// 纯前端网页无法直接发帖到微信/小红书。可行做法 =
//   1) 生成成绩卡图片；2) 移动端调用系统分享面板（navigator.share，可选微信/小红书）；
//   3) 桌面端或不支持时，下载图片 + 复制文案，引导用户去 App 发布。
import { shareCardBlob, downloadShareImage, shareFileName, type ShareData } from './shareImage'

export type Platform = 'xhs' | 'moments'

export function buildCaption(d: ShareData, platform: Platform): string {
  const { total, stars, s3, s2, s1 } = d
  const tiers = `⭐三星${s3}｜二星${s2}｜一星${s1}`
  if (platform === 'moments') {
    return `我的米其林足迹｜打卡 ${total} 家星级餐厅，累计 ${stars} 颗星 ✨ ${tiers}`
  }
  // 小红书：更长、带话题标签
  return (
    `我的米其林打卡成绩单来啦！✨\n` +
    `🍽️ 已打卡 ${total} 家星级餐厅\n` +
    `⭐ 累计 ${stars} 颗米其林星星\n` +
    `${tiers}\n` +
    (d.levelTitle ? `🏅 当前等级：${d.levelTitle}\n` : '') +
    (d.collectionPct != null ? `🌍 集齐全球 ${d.collectionPct}% 的星级餐厅\n` : '') +
    `\n#米其林 #米其林餐厅 #美食打卡 #美食探店 #摘星之旅`
  )
}

export type ShareResult = 'shared' | 'fallback' | 'error'

// 返回 'shared'（已唤起系统分享）| 'fallback'（已下载图片+复制文案）| 'error'
export async function shareToSocial(d: ShareData, platform: Platform): Promise<ShareResult> {
  const caption = buildCaption(d, platform)
  try {
    const blob = await shareCardBlob(d)
    if (blob) {
      const file = new File([blob], shareFileName(d), { type: 'image/png' })
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData_) => boolean
        share?: (data: ShareData_) => Promise<void>
      }
      type ShareData_ = { files?: File[]; text?: string; title?: string }
      if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], text: caption, title: '我的米其林足迹' })
        return 'shared'
      }
    }
  } catch (e) {
    // 用户取消分享会抛 AbortError —— 视为已处理，不再回退
    if (e instanceof Error && e.name === 'AbortError') return 'shared'
  }
  // 回退：下载图片 + 复制文案
  try {
    await downloadShareImage(d)
    await navigator.clipboard?.writeText(caption)
    return 'fallback'
  } catch {
    return 'error'
  }
}

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成分享预览图 public/og-cover.png（1200×630，Open Graph 标准尺寸）。"""
import os, math
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "public", "og-cover.png")

W, H = 1200, 630
RED = (200, 16, 46)
RED2 = (143, 10, 32)
GOLD = (240, 192, 74)


def load_font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
        "/System/Library/Fonts/Supplemental/Songti.ttc",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                # PingFang.ttc: 靠后的 face 更粗
                idx = 3 if (bold and "PingFang" in p) else 1 if "PingFang" in p else 0
                return ImageFont.truetype(p, size, index=idx)
            except Exception:
                try:
                    return ImageFont.truetype(p, size)
                except Exception:
                    continue
    return ImageFont.load_default()


def draw_star(size, color):
    """花瓣 macaron 星标：6 片旋转花瓣 + 中心圆（自绘，非官方素材）。"""
    S = size * 3  # 超采样
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    c = S / 2
    # 单片花瓣（指向上）
    petal = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    pd = ImageDraw.Draw(petal)
    pw = S * 0.24
    pd.ellipse([c - pw / 2, S * 0.06, c + pw / 2, c + S * 0.06], fill=color)
    for k in range(6):
        rot = petal.rotate(-k * 60, resample=Image.BICUBIC, center=(c, c))
        img.alpha_composite(rot)
    d = ImageDraw.Draw(img)
    cr = S * 0.16
    d.ellipse([c - cr, c - cr, c + cr, c + cr], fill=color)
    return img.resize((size, size), Image.LANCZOS)


def main():
    img = Image.new("RGB", (W, H), RED)
    # 竖向渐变
    for y in range(H):
        t = y / H
        r = int(RED[0] * (1 - t) + RED2[0] * t)
        g = int(RED[1] * (1 - t) + RED2[1] * t)
        b = int(RED[2] * (1 - t) + RED2[2] * t)
        ImageDraw.Draw(img).line([(0, y), (W, y)], fill=(r, g, b))
    d = ImageDraw.Draw(img)

    # 星标
    star = draw_star(150, GOLD)
    img.paste(star, (int(W / 2 - 75), 70), star)

    def center_text(text, y, font, fill):
        bbox = d.textbbox((0, 0), text, font=font)
        w = bbox[2] - bbox[0]
        d.text(((W - w) / 2, y), text, font=font, fill=fill)

    center_text("你吃过多少家米其林？", 240, load_font(78, bold=True), (255, 255, 255))
    center_text("三步统计打卡数量 · 累计星星 · 历年升降星 · 足迹地图", 360, load_font(34), (255, 235, 235))
    center_text("MICHELIN GUIDE 打卡统计 · 非官方", 540, load_font(28), (255, 220, 220))

    img.save(OUT, "PNG")
    print("saved", OUT, os.path.getsize(OUT) // 1024, "KB")


if __name__ == "__main__":
    main()

"""Generate OG image (1200x630) and favicon set from the light logo."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
public = root / "public"
logo_path = public / "alpine-eco-logo.png"

logo = Image.open(logo_path).convert("RGBA")

# --- OG image ---
og = Image.new("RGB", (1200, 630), (243, 247, 248))
draw = ImageDraw.Draw(og)

# subtle grid
for x in range(0, 1200, 22):
    for y in range(0, 630, 22):
        draw.point((x, y), fill=(0, 120, 168))

# soft vignette panel
draw.rounded_rectangle((72, 72, 1128, 558), radius=18, fill=(255, 255, 255))
draw.rounded_rectangle((72, 72, 1128, 558), radius=18, outline=(0, 120, 168, 40), width=2)

# logo
lh = 140
lw = int(logo.width * (lh / logo.height))
logo_r = logo.resize((lw, lh), Image.Resampling.LANCZOS)
og.paste(logo_r, ((1200 - lw) // 2, 170), logo_r)

# tagline
try:
    font = ImageFont.truetype("arial.ttf", 28)
except OSError:
    font = ImageFont.load_default()
tag = "PRINTING & BOOK-BINDING  ·  JOHANNESBURG"
bbox = draw.textbbox((0, 0), tag, font=font)
tw = bbox[2] - bbox[0]
draw.text(((1200 - tw) // 2, 360), tag, fill=(79, 143, 46), font=font)

# color bar
colors = ["#00AEEF", "#EC008C", "#FFF200", "#000000", "#0078A8", "#68B848"]
bar_y = 430
bar_h = 14
bar_w = 520
bx = (1200 - bar_w) // 2
seg = bar_w // len(colors)
for i, c in enumerate(colors):
    draw.rectangle((bx + i * seg, bar_y, bx + (i + 1) * seg - 2, bar_y + bar_h), fill=c)

og.save(public / "og-image.png", optimize=True)
og.save(public / "og-image.webp", "WEBP", quality=90)
print("og-image saved")

# --- Favicons ---
# Crop logo content tightly for icon
bbox = logo.getbbox()
mark = logo.crop(bbox) if bbox else logo

for size, name in [(32, "favicon-32.png"), (180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")]:
    canvas = Image.new("RGBA", (size, size), (243, 247, 248, 255))
    # fit mark with padding
    pad = int(size * 0.12)
    target = size - pad * 2
    ratio = min(target / mark.width, target / mark.height)
    nw, nh = max(1, int(mark.width * ratio)), max(1, int(mark.height * ratio))
    resized = mark.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(resized, ((size - nw) // 2, (size - nh) // 2), resized)
    canvas.save(public / name, optimize=True)
    print(f"saved {name}")

# ICO from 32
ico = Image.open(public / "favicon-32.png").convert("RGBA")
ico.save(public / "favicon.ico", sizes=[(32, 32)])
print("favicon.ico saved")

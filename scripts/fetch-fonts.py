import pathlib
import re
import urllib.request

out = pathlib.Path(__file__).resolve().parents[1] / "public" / "fonts"
out.mkdir(parents=True, exist_ok=True)

ua = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
css_url = (
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500"
    "&family=Inter:wght@400;500&display=swap"
)
css = urllib.request.urlopen(
    urllib.request.Request(css_url, headers={"User-Agent": ua}), timeout=30
).read().decode()

mapping = {
    ("Cormorant Garamond", "italic", "500"): "cormorant-500-italic.woff2",
    ("Cormorant Garamond", "normal", "500"): "cormorant-500.woff2",
    ("Cormorant Garamond", "normal", "600"): "cormorant-600.woff2",
    ("Inter", "normal", "400"): "inter-400.woff2",
    ("Inter", "normal", "500"): "inter-500.woff2",
}

blocks = re.split(r"/\*\s*([^*]+)\s*\*/", css)
saved = set()
for i in range(1, len(blocks), 2):
    comment = blocks[i].strip()
    body = blocks[i + 1]
    if comment != "latin":
        continue
    fam = re.search(r"font-family:\s*'([^']+)'", body)
    style = re.search(r"font-style:\s*(\w+)", body)
    weight = re.search(r"font-weight:\s*(\d+)", body)
    src = re.search(r"url\((https://[^)]+\.woff2)\)", body)
    if not all([fam, style, weight, src]):
        continue
    key = (fam.group(1), style.group(1), weight.group(1))
    if key not in mapping or key in saved:
        continue
    name = mapping[key]
    data = urllib.request.urlopen(src.group(1), timeout=30).read()
    (out / name).write_bytes(data)
    saved.add(key)
    print(f"saved {name} ({len(data)} bytes)")

print("done", len(saved))

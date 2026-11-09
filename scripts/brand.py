"""Generate the favicon, app icons and Open Graph image from one place.

Text is converted to outlines so the SVGs render without the web font.

    python3 -m pip install fonttools brotli   # once, into any venv
    python3 scripts/brand.py                  # needs rsvg-convert on PATH
"""

import struct
import subprocess
import tempfile
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
FONT = PUBLIC / "fonts" / "archivo-latin-var.woff2"

# Keep in sync with the light theme tokens in src/index.css.
PAPER = "#faf8f5"
INK = "#1c1a17"
INK_2 = "#5f594f"
ACCENT = "#b8321a"

_fonts: dict[tuple[int, int], TTFont] = {}


def font(wght: int, wdth: int) -> TTFont:
    key = (wght, wdth)
    if key not in _fonts:
        _fonts[key] = instantiateVariableFont(
            TTFont(FONT), {"wght": wght, "wdth": wdth}
        )
    return _fonts[key]


def text_width(text: str, size: float, wght: int, wdth: int) -> float:
    f = font(wght, wdth)
    cmap, hmtx = f.getBestCmap(), f["hmtx"]
    scale = size / f["head"].unitsPerEm
    return sum(hmtx[cmap[ord(c)]][0] for c in text) * scale


def text_path(
    text: str,
    size: float,
    x: float,
    baseline: float,
    *,
    wght: int = 400,
    wdth: int = 100,
    fill: str = INK,
    anchor: str = "start",
) -> str:
    f = font(wght, wdth)
    cmap, hmtx, glyphs = f.getBestCmap(), f["hmtx"], f.getGlyphSet()
    scale = size / f["head"].unitsPerEm
    if anchor == "end":
        x -= text_width(text, size, wght, wdth)
    elif anchor == "middle":
        x -= text_width(text, size, wght, wdth) / 2
    pen = SVGPathPen(glyphs)
    for c in text:
        name = cmap[ord(c)]
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, baseline)))
        x += hmtx[name][0] * scale
    return f'<path fill="{fill}" d="{pen.getCommands()}"/>'


def icon_svg() -> str:
    size = 340
    cap = font(700, 112)["OS/2"].sCapHeight * size / 1000
    s = text_path(
        "S", size, 256, 256 + cap / 2, wght=700, wdth=112, fill=PAPER, anchor="middle"
    )
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'
        f'<rect width="512" height="512" fill="{ACCENT}"/>{s}</svg>\n'
    )


def og_svg() -> str:
    parts = [
        text_path("Siddhesh Sawant", 100, 96, 226, wght=700, wdth=112),
        text_path(
            "Backend engineer working in Java, Spring Boot and Kafka.",
            36, 96, 302, wght=500,
        ),
        f'<rect x="96" y="482" width="1008" height="2" fill="{INK}"/>',
        text_path(
            "Nearly five years at Walmart Global Tech", 28, 96, 540, fill=INK_2
        ),
        text_path(
            "siddheshsawant.in", 28, 1104, 540, wght=600, fill=ACCENT, anchor="end"
        ),
    ]
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">'
        f'<rect width="1200" height="630" fill="{PAPER}"/>{"".join(parts)}</svg>\n'
    )


def render(svg: Path, out: Path, width: int, height: int | None = None) -> bytes:
    cmd = ["rsvg-convert", "-w", str(width), "-o", str(out), str(svg)]
    if height:
        cmd[3:3] = ["-h", str(height)]
    subprocess.run(cmd, check=True)
    return out.read_bytes()


def write_ico(out: Path, pngs: list[tuple[int, bytes]]) -> None:
    """ICO with embedded PNGs, supported by every current browser."""
    header = struct.pack("<HHH", 0, 1, len(pngs))
    offset = 6 + 16 * len(pngs)
    entries, data = b"", b""
    for size, png in pngs:
        entries += struct.pack(
            "<BBBBHHII", size % 256, size % 256, 0, 0, 1, 32, len(png), offset
        )
        offset += len(png)
        data += png
    out.write_bytes(header + entries + data)


def main() -> None:
    icon = PUBLIC / "favicon.svg"
    icon.write_text(icon_svg())
    with tempfile.TemporaryDirectory() as tmp:
        og = Path(tmp) / "og-image.svg"
        og.write_text(og_svg())
        render(og, PUBLIC / "og-image.png", 1200, 630)

        png = Path(tmp) / "favicon.png"
        small = [(n, render(icon, png, n)) for n in (16, 32, 48)]
        write_ico(PUBLIC / "favicon.ico", small)

    render(icon, PUBLIC / "icon-512.png", 512)
    render(icon, PUBLIC / "icon-192.png", 192)
    render(icon, PUBLIC / "apple-touch-icon.png", 180)


if __name__ == "__main__":
    main()

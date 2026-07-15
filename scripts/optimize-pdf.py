"""
Post-process the generated PDF for fast viewer rendering.

Strategy: rasterize EVERY page at print-grade DPI and embed each as a
single JPEG image. PDF viewers cache images, so each page renders
instantly when scrolled into view — exactly the behavior of an InDesign
flattened export.

Tradeoff: text is no longer selectable / searchable. For a portfolio
brochure that's an acceptable price for instant render + perfect quality.

Usage:
  python scripts/optimize-pdf.py public/portfolio.pdf
"""

import sys
import os
import io
from pathlib import Path

import fitz  # PyMuPDF
from PIL import Image


# Set RASTERIZE=1 to flatten every page to a single high-DPI JPEG.
# Default: keep vector text/graphics (selectable, scalable).
RASTERIZE = os.environ.get('RASTERIZE', '0') == '1'
RASTER_DPI = int(os.environ.get('PDF_DPI', '300'))
JPEG_QUALITY = int(os.environ.get('PDF_JPEG_Q', '90'))
# Human-readable document title (browser tab / viewer header). Passed via
# env by the build:pdf* scripts in package.json; empty → left untouched.
PDF_TITLE = os.environ.get('PDF_TITLE', '')


def rasterize_all(doc: fitz.Document, dpi: int, jpg_quality: int) -> fitz.Document:
    """Render every page as a single high-quality JPEG embedded in a new PDF.

    Uses PIL to encode progressive JPEG with optimized Huffman tables —
    smaller files, faster decode, and viewers can show a low-res preview
    while the full image streams in.
    """
    out = fitz.open()
    for i in range(len(doc)):
        src = doc[i]
        rect = src.rect
        pix = src.get_pixmap(dpi=dpi, alpha=False)

        # Pixmap → PIL → progressive JPEG
        img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        buf = io.BytesIO()
        img.save(
            buf,
            format='JPEG',
            quality=jpg_quality,
            optimize=True,
            progressive=True,
            subsampling=2,  # 4:2:0, smaller without visible quality loss for design content
        )
        img_bytes = buf.getvalue()

        new_page = out.new_page(width=rect.width, height=rect.height)
        new_page.insert_image(rect, stream=img_bytes)
        print(f'  page {i+1:>2}/{len(doc)}: {len(img_bytes)//1024} KB ({pix.width}x{pix.height})')
    return out


def main():
    if len(sys.argv) < 2:
        print('Usage: optimize-pdf.py <pdf-path>', file=sys.stderr)
        sys.exit(1)

    src_path = Path(sys.argv[1]).resolve()
    if not src_path.exists():
        print(f'Not found: {src_path}', file=sys.stderr)
        sys.exit(1)

    print(f'[opt] In:  {src_path} ({src_path.stat().st_size // 1024} KB)')

    doc = fitz.open(str(src_path))
    print(f'[opt] Pages: {len(doc)}')

    if RASTERIZE:
        print(f'[opt] Rasterizing all pages at {RASTER_DPI} DPI, JPEG q={JPEG_QUALITY}...')
        new_doc = rasterize_all(doc, RASTER_DPI, JPEG_QUALITY)
        doc.close()
        doc = new_doc
    else:
        print('[opt] Keeping vector content (set RASTERIZE=1 to flatten).')

    # Force viewers to display one page at a time. Without continuous scroll,
    # the viewer doesn't have to keep neighboring pages decoded — eliminates
    # the white-flash issue completely.
    print('[opt] Setting /PageLayout = SinglePage')
    doc.set_pagelayout('SinglePage')
    doc.set_pagemode('UseNone')

    if PDF_TITLE:
        print(f'[opt] Setting Title: {PDF_TITLE}')
        doc.set_metadata({
            'title': PDF_TITLE,
            'author': 'West Arlan Group',
            'creator': 'West Arlan Group',
            'producer': 'West Arlan Group',
        })

    # Save with full GC + stream deflation.
    # (PyMuPDF dropped `linear=True` in recent versions.)
    tmp_path = src_path.with_suffix('.opt.tmp.pdf')
    print('[opt] Saving with garbage=4, clean=True, deflate=True...')
    doc.save(
        str(tmp_path),
        garbage=4,
        clean=True,
        deflate=True,
        deflate_images=True,
    )
    doc.close()

    # Replace original
    os.replace(tmp_path, src_path)

    print(f'[opt] Out: {src_path} ({src_path.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    main()

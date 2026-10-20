"""
Pack and verify a PDF produced by scripts/build-pdf.mjs.

The PDF stays vector: text remains text, images were already fitted to their
placed size by build-pdf.mjs. This step only
  * repacks the file (unused objects dropped, object streams, deflate);
  * sets the title/author and asks viewers to show the title;
  * rejects the file (exit code 2) if it contains anything that makes PDF
    viewers slow or the print wrong:
      - Type3 fonts — Chromium writes variable fonts and stroked text this
        way; glyphs become unhinted drawings. Tolerated only for the strings
        in STROKED_TEXT (SVG text deliberately drawn with an outline);
      - system fallback fonts (Arial, Segoe UI, ...) — a glyph missing from
        the brand fonts; the print must use static brand fonts only;
      - soft masks — every blurred box-shadow / alpha gradient becomes one;
      - a page count different from EXPECT_PAGES (content spilled over);
      - anything MuPDF can't render cleanly;
      - a file larger than PDF_MAX_MB.

Usage:
  python scripts/optimize-pdf.py <pdf-path>
Env: PDF_TITLE, EXPECT_PAGES, PDF_MAX_MB (default 20), STROKED_TEXT and
OUTLINE_TITLES (JSON lists).
"""

import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

import pymupdf

PDF_TITLE = os.environ.get('PDF_TITLE', '')
EXPECT_PAGES = int(os.environ.get('EXPECT_PAGES') or 0)
MAX_MB = float(os.environ.get('PDF_MAX_MB') or 20)
STROKED_TEXT = [re.sub(r'\s+', '', s) for s in json.loads(os.environ.get('STROKED_TEXT') or '[]')]
OUTLINE_TITLES = json.loads(os.environ.get('OUTLINE_TITLES') or '[]')

SYSTEM_FONTS = re.compile(
    r'Arial|Segoe|Times|Courier|Calibri|Tahoma|Verdana|Helvetica|DejaVu|Liberation|Symbol|Wingdings|Microsoft|MS-',
    re.I,
)


def all_spans(doc: pymupdf.Document) -> list[tuple[str, int, str]]:
    """(font name, page number, text) for every non-empty text span."""
    out = []
    for pno, page in enumerate(doc, 1):
        for block in page.get_text('dict')['blocks']:
            for line in block.get('lines', []):
                for span in line['spans']:
                    if span['text'].strip():
                        out.append((span['font'], pno, span['text'].strip()))
    return out


def describe(spans: list[tuple[str, int, str]]) -> str:
    pages: dict[int, list[str]] = defaultdict(list)
    for _, pno, text in spans:
        if len(pages[pno]) < 3:
            pages[pno].append(text[:30])
    return '; '.join(f'p{p}: {" / ".join(s)}' for p, s in sorted(pages.items())[:6])


def is_outlined(text: str) -> bool:
    """Part of an SVG label drawn with a stroke (font fallback may split it)."""
    t = re.sub(r'\s+', '', text)
    return any(t in label for label in STROKED_TEXT)


def verify(doc: pymupdf.Document) -> list[str]:
    problems = []

    fonts = {}  # base name → type
    for page in doc:
        for xref, ext, ftype, name, *_ in page.get_fonts(full=True):
            fonts[re.sub(r'^[A-Z]{6}\+', '', name) or f'xref {xref}'] = ftype
    spans = all_spans(doc)
    if 'Type3' in fonts.values():
        type3 = [s for s in spans if s[0].startswith('Type3')]
        stray = [s for s in type3 if not is_outlined(s[2])]
        if stray or not type3:
            problems.append(f'Type3 fonts (variable-font or stroked text) — {describe(stray) or "no extractable text"}')
        else:
            print(f'[opt] Type3 only in {len(type3)} outlined SVG labels (allowed)')
    for name, ftype in sorted(fonts.items()):
        if ftype != 'Type3' and SYSTEM_FONTS.search(name):
            where = describe([s for s in spans if name in s[0]])
            problems.append(f'system fallback font {name} — glyphs missing from the brand fonts: {where}')

    # Soft masks live in ExtGState dicts, often inside nested form XObjects,
    # so walk everything reachable from each page (not up via /Parent).
    # Image alpha channels (/SMask on an image, e.g. a PNG logo) are fine.
    smask_pages = []
    for pno, page in enumerate(doc, 1):
        seen, todo = set(), [page.xref]
        while todo:
            xref = todo.pop()
            if xref in seen:
                continue
            seen.add(xref)
            obj = re.sub(r'/Parent\s+\d+ 0 R', '', doc.xref_object(xref, compressed=True))
            if re.search(r'/Type\s*/ExtGState', obj) and re.search(r'/SMask\s*(\d+ 0 R|<<)', obj):
                smask_pages.append(pno)
                break
            todo.extend(int(r) for r in re.findall(r'(\d+) 0 R', obj))
    if smask_pages:
        problems.append(f'soft masks (blurred box-shadow or alpha gradient) on pages {smask_pages}')

    if EXPECT_PAGES and len(doc) != EXPECT_PAGES:
        problems.append(f'{len(doc)} pages, the layout has {EXPECT_PAGES} — content spilled onto extra pages')

    pymupdf.TOOLS.reset_mupdf_warnings()
    for page in doc:
        page.get_pixmap(dpi=24, alpha=False)
    warnings = pymupdf.TOOLS.mupdf_warnings()
    if warnings:
        problems.append('MuPDF render warnings: ' + ' | '.join(sorted(set(warnings.splitlines()))[:5]))
    return problems


def main():
    if len(sys.argv) < 2:
        print('Usage: optimize-pdf.py <pdf-path>', file=sys.stderr)
        sys.exit(1)
    src_path = Path(sys.argv[1]).resolve()
    if not src_path.exists():
        print(f'Not found: {src_path}', file=sys.stderr)
        sys.exit(1)
    pymupdf.TOOLS.mupdf_display_errors(False)

    doc = pymupdf.open(str(src_path))
    print(f'[opt] {len(doc)} pages, {src_path.stat().st_size / 1048576:.1f} MB from Chromium')

    if PDF_TITLE:
        doc.set_metadata({
            'title': PDF_TITLE,
            'author': 'West Arlan Group',
            'creator': 'West Arlan Group',
            'producer': 'West Arlan Group',
        })
        # Viewers show the title instead of the file name.
        doc.xref_set_key(doc.pdf_catalog(), 'ViewerPreferences', '<</DisplayDocTitle true>>')

    # Bookmarks: Chromium glues the words at every line wrap of a heading;
    # use the headings' rendered text from the page instead (same order).
    toc = doc.get_toc(simple=False)
    if OUTLINE_TITLES and toc:
        if len(toc) == len(OUTLINE_TITLES):
            for entry, title in zip(toc, OUTLINE_TITLES):
                entry[1] = title
            doc.set_toc(toc)
        else:
            print(f'[opt] bookmarks kept as is: {len(toc)} entries, {len(OUTLINE_TITLES)} headings')

    # garbage=4 + object streams: Chromium writes thousands of tiny objects.
    # Not `clean=True` or rewrite_images(): both alter content streams, and
    # rewrite_images() breaks the image patterns Chromium emits.
    tmp_path = src_path.with_suffix('.packed.tmp.pdf')
    doc.save(str(tmp_path), garbage=4, deflate=True, use_objstms=1)
    doc.close()
    os.replace(tmp_path, src_path)

    doc = pymupdf.open(str(src_path))
    problems = verify(doc)
    doc.close()
    size_mb = src_path.stat().st_size / 1048576
    if size_mb > MAX_MB:
        problems.append(f'{size_mb:.1f} MB is over the {MAX_MB:g} MB budget (PDF_MAX_MB)')

    print(f'[opt] Packed: {size_mb:.1f} MB')
    if problems:
        for p in problems:
            print(f'[opt] ✗ {p}')
        sys.exit(2)
    print('[opt] Checks passed: brand fonts only, no stray Type3, no soft masks'
          + (f', {EXPECT_PAGES} pages' if EXPECT_PAGES else ''))


if __name__ == '__main__':
    main()

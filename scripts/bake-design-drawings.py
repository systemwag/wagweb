"""
Bake framed drawing previews for the DESIGN portfolio brochure
(src/app/portfolio/print/design).

The design brochure features 4 flagship engineering-network projects, each on
its own sheet with a framed preview of the REAL project drawing (mirroring the
license scans in the main brochure). This script renders the chosen pages of
the client dossier PDF to trimmed images under public/portfolio/design/.

Sources (both kept OUTSIDE public/ — internal documents with signatures,
must never be deployed), in z:/WAG/_site-originals/:
  Информация для портфолио.pdf   — original 22-pp client dossier
  Чертежи WAG-штамп 2026-07.pdf  — 4 re-issued sheets (July 2026): the title
        blocks now name ТОО «West Arlan Group» as the design organisation
        (was АСУЭП / Global Construction Project) and the QazCement ТЭП was
        updated (site area 5046,17 м²). These supersede dossier pp. 5/7/8/9.

Run:    python scripts/bake-design-drawings.py   (needs pymupdf + pillow)
Output: public/portfolio/design/drawing-power24.png   (p2  · ВЛ-110 situational)
        public/portfolio/design/drawing-qazcement.png (p5  · разбивочный план М1:500)
        public/portfolio/design/drawing-gas.jpg       (p7  · спутниковый генплан)
        public/portfolio/design/drawing-sewage.png    (p13 · план сетей канализации)

Re-run only when the source dossier or the page selection changes.
"""
import io
import os
import fitz  # PyMuPDF
from PIL import Image, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGINALS = os.path.join(os.path.dirname(ROOT), "_site-originals")
SRC_DOSSIER = os.path.join(ORIGINALS, "Информация для портфолио.pdf")
SRC_REISSUE = os.path.join(ORIGINALS, "Чертежи WAG-штамп 2026-07.pdf")
SRC_ASPOWER = os.path.join(ORIGINALS, "Актобе Стекло (внеплощадочные электросети).pdf")
# QazCement rail cluster (папка «для презинтации» в корне репо, НЕ в public/)
QC = os.path.join(ROOT, "для презинтации", "2. QazCement Industries")
SRC_QC_INTERNAL = os.path.join(QC, "Внутреннее ЖД развитие", "Том 4. Книга 1 ПЖ Путь железнодорожный 23.02.2026.pdf")
SRC_QC_ACCESS   = os.path.join(QC, "Проект внешний подъездной жд путь для заказчика", "Том 4 Книга 1 Путь железнодорожный 30.06.2026.pdf")
SRC_QC_STATION  = os.path.join(QC, "Проект станционных путей для заказчика", "КТЖ Кенжалы Том IV Книга 1 Путь железнодорожный 28.05.2026.pdf")
# Aktobe Steklo — внешняя инфраструктура завода стеклотары (кластер 03)
AS = os.path.join(ROOT, "для презинтации", "22. Актобе стекло")
SRC_AS_RAIL = os.path.join(AS, "1) Внешний проект", "PDF - Проект", "Том IV Путь железнодорожный - ПЖ по замечаниям.pdf")
SRC_AS_ROAD = os.path.join(AS, "Строительство подъездной автодороги Актобе стекло", "Том_3._Альбом_1_-_АД_0305a7f5ea66ff68d632bd3a7262f4cf.pdf")
# Уральская Сталь — станция Колесопрокатная + пост ЭЦ (кластер 04, РФ)
URAL = os.path.join(ROOT, "для презинтации", "1. Уральская Сталь", "1. Уральская Сталь")
SRC_URAL_GP   = os.path.join(URAL, "Уральская сталь Генеральный план.pdf")
SRC_URAL_POST = os.path.join(URAL, "Эскизный проект Железнодорожный пост.pdf")
# СПК Актобе — ж/д подъездной путь к индустриальной зоне (одиночный лист, кластер 05)
SRC_SPK = os.path.join(ROOT, "для презинтации", "3. 11. СПК Актобе.pdf")
# КТЖ Хоргос — 10 сортировочных путей + база ТОР Сухого порта (кластер 06)
SRC_HORGOS = os.path.join(ROOT, "для презинтации", "4. КТЖ Хоргос.pdf")
# АМК — пути отстоя вагонов + реконструкция ст. Рудная (кластер 07)
SRC_AMK = os.path.join(ROOT, "для презинтации", "5. АМК.pdf")
# НефтеСтройСервис — газопровод высокого давления Ø108 3,8 МПа + ГРПШ (кластер 08)
SRC_NSS = os.path.join(ROOT, "для презинтации", "6. НефтеСтройСервис.pdf")
# Синтез Урал — электроснабжение 0,4 кВ + наружное освещение подъездных путей (кластер 09)
SRC_SINTEZ = os.path.join(ROOT, "для презинтации", "7. Синтез Урал.pdf")
# Zerde Керамика — подъездной + повышенный ж/д путь, ст. Жинишке (кластер 10)
SRC_ZERDE = os.path.join(ROOT, "для презинтации", "9. Zerde керамика.pdf")
# ОРПТ Фаэтон — ж/д подъездной путь к логистическому центру, ст. Жинишке (кластер 11)
SRC_FAETON = os.path.join(ROOT, "для презинтации", "10. ОРПТ Фаэтон.pdf")
# СинеМидасСтрой — РУ-10 кВ (питание АБ и ПЭС ж/д линии), Атырауская обл. (кластер 12)
SRC_MIDAS = os.path.join(ROOT, "для презинтации", "13. СинеМидасСтрой.pdf")
# ТОО АРБЗ — наружные сети водоснабжения/водоотведения + пожаротушение завода (кластер 13)
SRC_ARBZ = os.path.join(ROOT, "для презинтации", "23. ТОО АРБЗ.pdf")
# Завод Светотехника-W — ж/д подъездной путь, ст. Жинишке (кластер 14)
SRC_SVET = os.path.join(ROOT, "для презинтации", "24. План железнодорожного пути ТОО Завод Светохника-W.pdf")
# КазГеоруд — автодорога 102 км + путепровод через трассу Самара-Шымкент (кластер 15)
KGR = os.path.join(ROOT, "для презинтации", "14. Казгеоруд")
SRC_KGR_AD     = os.path.join(KGR, "Раздел I. АД. Том III. Рабочие чертежи.pdf")
SRC_KGR_BRIDGE = os.path.join(KGR, "Раздел III. ТОМ 2. Книга 1.2. Рабочие чертежи.pdf")
# Coca-Cola — схема подключения к сетям ИТО (инвестиционное сопровождение, кластер 17)
SRC_COLA = os.path.join(ROOT, "для презинтации", "8. Схема ИТО Кока кола.pdf")
# ПЗТМ LTD — СМР: ж/д пути рельсосварочного предприятия, ст. Кызгалдакты (кластер 01)
SRC_PZTM = os.path.join(ROOT, "для презинтации", "19. ПЗТМ", "19. ПЗТМ  ПЖ.PDF")
# КСГК — подъездная автодорога 20 км + мост через реку Биже 3×21 м (кластер 16)
KSGK = os.path.join(ROOT, "для презинтации", "20. КСГК")
SRC_KSGK_ROAD   = os.path.join(KSGK, "ТОМ 3. Книга 3.1. Автомобильная дорога.pdf")
SRC_KSGK_BRIDGE = os.path.join(KSGK, "ТОМ 4. Книга 4.1. Мост через реку Биже на ПК11 00.pdf")
OUT_DIR = os.path.join(ROOT, "public", "portfolio", "design")

# (source pdf, 1-indexed page, basename, format, target long edge px[, crop]).
# `crop` is an optional (x0, y0, x1, y1) rect in page-fraction coordinates,
# applied BEFORE rendering — used to pull a readable detail out of an
# ultra-wide sheet. Ultra-wide band sheets get a higher target so their
# small annotation text survives the downscale.
SHEETS = [
    (SRC_DOSSIER, 2,  "drawing-power24",         "png", 2300),  # situational plan, ВЛ-110 кВ network map
    (SRC_REISSUE, 1,  "drawing-qazcement",       "png", 2300),  # разбивочный план М1:500 (штамп WAG, ТЭП 5046 м²)
    (SRC_REISSUE, 2,  "drawing-gas",             "jpg", 2300),  # satellite genplan (штамп WAG)
    (SRC_REISSUE, 3,  "drawing-gas-high",        "png", 2300),  # план газопровода высокого давления I кат. (штамп WAG)
    (SRC_REISSUE, 4,  "drawing-gas-medium",      "png", 3200),  # план газопровода среднего давления (лента, штамп WAG)
    (SRC_DOSSIER, 13, "drawing-sewage",          "png", 2300),  # план сетей напорной канализации М1:1000, лист 4
    (SRC_DOSSIER, 14, "drawing-sewage-grav",     "png", 2300),  # план напорной И самотечной канализации, лист 5
    (SRC_DOSSIER, 17, "drawing-sewage-crossing", "png", 2300),  # переход через ж/д пути + лист согласований
    (SRC_DOSSIER, 19, "drawing-ural-04kv",       "png", 2600),  # Уральская Сталь: план сетей 0,4 кВ + ведомости
    (SRC_DOSSIER, 20, "drawing-ural-lighting",   "png", 3200),  # Уральская Сталь: план освещения (лента)
    # Станция Кенжалы, ЭЦ/СЦБ (штамп WAG, согласовано службами КТЖ):
    # crop = главная горловина с постом ЭЦ и примыканием пути QazCement.
    (SRC_DOSSIER, 22, "drawing-kenzhaly-signal", "png", 2600, (0.215, 0.36, 0.585, 0.97)),
    (SRC_DOSSIER, 22, "drawing-kenzhaly-full",   "png", 3200),  # полный схематический план (лента)
    # ПС 110/10 кВ «Aktobe Steklo» — внеплощадочные электросети (5-10/04-2025):
    (SRC_ASPOWER, 3,  "drawing-asteklo-power",   "png", 2400),  # план сетей ЭС М1:1000, трасса ВЛ 110 кВ
    (SRC_ASPOWER, 1,  "drawing-asteklo-oru",     "png", 2600),  # разбивочный план ОРУ-110 ПС «Городская»
    # QazCement — ж/д кластер (кейсы основного портфолио), hero + extra band:
    (SRC_QC_ACCESS,   4,  "drawing-qc-access",           "png", 3000),  # план внешнего подъездного пути М1:1000
    (SRC_QC_ACCESS,   10, "drawing-qc-access-profile",   "png", 3200),  # продольный профиль с геологией
    (SRC_QC_INTERNAL, 4,  "drawing-qc-internal",         "png", 3000),  # план внутризаводских путей М1:1000
    (SRC_QC_INTERNAL, 12, "drawing-qc-internal-upor",    "png", 2800),  # рельсовый упор — план, сечения, спецификация
    (SRC_QC_STATION,  4,  "drawing-qc-station",          "png", 3200),  # план путевого развития ст. Кенжалы
    (SRC_QC_STATION,  9,  "drawing-qc-station-cross",    "png", 3200),  # поперечные профили земполотна
    # Aktobe Steklo — ж/д путь (2-1-10/04-2025) и подъездная автодорога:
    (SRC_AS_RAIL, 4, "drawing-asteklo-rail",         "png", 3000),  # план внешнего подъездного пути, примыкание рзд. Алжан
    (SRC_AS_RAIL, 5, "drawing-asteklo-rail-profile", "png", 3200),  # продольный профиль пути (лента)
    (SRC_AS_ROAD, 7, "drawing-asteklo-road",         "png", 3000),  # план трассы автодороги, кривые R3000-5000
    (SRC_AS_ROAD, 9, "drawing-asteklo-road-profile", "png", 3200),  # продольный профиль автодороги (лента)
    # Уральская Сталь — станция Колесопрокатная (СЦБ/ЭЦ) + пост ЭЦ.
    # Объединённый кейс основного портфолио: лист (станция hero + освещение band)
    # + annex-страница (сети 0,4 кВ + пост ЭЦ). drawing-ural-04kv / -lighting
    # уже забейканы выше для дизайн-брошюры.
    (SRC_URAL_GP,   2, "drawing-ural-station", "png", 3400),  # разбивочный план станции М1:1000
    (SRC_URAL_POST, 2, "drawing-ural-post",    "png", 2600),  # отображение фасадов поста ЭЦ (annex)
    # СПК Актобе — план путевого развития М1:1000 (единственный лист проекта):
    (SRC_SPK, 1, "drawing-spk-rail", "png", 3600),  # план путевого развития, ведомости путей/стрелок
    # КТЖ Хоргос — единственный лист плана путевого развития (4768×842, 5.66:1)
    # разрезан пополам с нахлёстом → hero (левая) + band (правая):
    (SRC_HORGOS, 2, "drawing-horgos-rail-1", "png", 2800, (0.00, 0, 0.52, 1)),
    (SRC_HORGOS, 2, "drawing-horgos-rail-2", "png", 2800, (0.48, 0, 1.00, 1)),
    # АМК — общий план путевого развития М1:2000 (6077×1290, 4.71:1). Основная
    # информация (ведомости путей/стрелок) — на ПРАВОЙ части, поэтому rail-2 шире
    # (58%) и идёт крупным hero, а rail-1 (левая, 48%) — узкой нижней лентой.
    (SRC_AMK, 1, "drawing-amk-rail-1", "png", 2800, (0.00, 0, 0.48, 1)),
    (SRC_AMK, 1, "drawing-amk-rail-2", "png", 3200, (0.42, 0, 1.00, 1)),
    # НефтеСтройСервис — газопровод ВД: план (p2, 2.12:1) hero + профиль (p4, 4.96:1) band:
    (SRC_NSS, 2, "drawing-nss-gas-plan",    "png", 2600),  # план газопровода, ГРПШ, пересечения
    (SRC_NSS, 4, "drawing-nss-gas-profile", "png", 3600),  # продольный профиль (лента)
    # Синтез Урал — план электроснабжения 0,4 кВ и освещения подъездных путей:
    (SRC_SINTEZ, 2, "drawing-sintez-plan",     "png", 2600),  # план ЭС/освещения, каб. 10/35 кВ (hero)
    (SRC_SINTEZ, 4, "drawing-sintez-lighting", "png", 3200),  # план освещения путей (лента, 2.83:1)
    # Zerde Керамика — план ж/д пути (p2, 1.85:1) hero + раскладка повышенного пути (p4, лента):
    (SRC_ZERDE, 2, "drawing-zerde-plan",     "png", 3200),  # план ж/д пути + ведомости
    (SRC_ZERDE, 4, "drawing-zerde-elevated", "png", 3600),  # раскладка блоков повышенного пути (лента)
    # ОРПТ Фаэтон — план путевого развития (p2, 4167×842, 4.95:1) пополам → hero+band:
    (SRC_FAETON, 2, "drawing-faeton-rail-1", "png", 2800, (0.00, 0, 0.52, 1)),
    (SRC_FAETON, 2, "drawing-faeton-rail-2", "png", 2800, (0.48, 0, 1.00, 1)),
    # СинеМидасСтрой — план РУ-10 кВ (p2, 4167×842, 4.95:1) пополам → hero+band:
    (SRC_MIDAS, 2, "drawing-midas-plan-1", "png", 2800, (0.00, 0, 0.52, 1)),
    (SRC_MIDAS, 2, "drawing-midas-plan-2", "png", 2800, (0.48, 0, 1.00, 1)),
    # ТОО АРБЗ — план наружных сетей водоснабжения/водоотведения (p2, 2.12:1) hero:
    (SRC_ARBZ, 2, "drawing-arbz-plan", "png", 3000),  # план сетей ВК: ПЭ110, ст400/450, ПГ, ОС
    # Завод Светотехника-W — план ж/д пути (p2, 2.83:1) single hero:
    (SRC_SVET, 2, "drawing-svet-rail", "png", 3200),  # план ж/д подъездного пути к ст. Жинишке
    # КазГеоруд — автодорога 102 км + путепровод. Лист: дорога (план+профиль);
    # annex: путепровод (фасад с опорами + разрез опоры/ростверк):
    (SRC_KGR_AD,     10, "drawing-kazgeorud-road",         "png", 3000),  # ситуационный план дороги
    (SRC_KGR_AD,      6, "drawing-kazgeorud-road-profile", "png", 3200),  # продольный профиль (band)
    (SRC_KGR_BRIDGE, 30, "drawing-kazgeorud-bridge",       "png", 3000),  # фасад путепровода, опоры №1-4
    (SRC_KGR_BRIDGE, 14, "drawing-kazgeorud-bridge-pier",  "png", 2600),  # разрез опоры/ростверк, сваи
    # КСГК — автодорога 20 км + мост через р. Биже. Лист: дорога (ситуац. план +
    # поперечный профиль); annex: мост (продольный профиль + разрез опоры):
    (SRC_KSGK_ROAD,   18, "drawing-ksgk-road",         "png", 3000),  # ситуационный план дороги
    (SRC_KSGK_ROAD,    5, "drawing-ksgk-road-profile", "png", 3000),  # поперечный профиль дороги (band)
    (SRC_KSGK_BRIDGE,  5, "drawing-ksgk-bridge",        "png", 3200),  # продольный профиль моста 3×21
    (SRC_KSGK_BRIDGE, 13, "drawing-ksgk-bridge-pier",   "png", 2600),  # разрез опоры, ростверк, сваи
    # ПЗТМ — план путевого развития РСП (p3, 9638×1191, 8.1:1) пополам → hero+band:
    (SRC_PZTM, 3, "drawing-pztm-rail-1", "png", 3400, (0.00, 0, 0.52, 1)),
    (SRC_PZTM, 3, "drawing-pztm-rail-2", "png", 3400, (0.48, 0, 1.00, 1)),
    # Coca-Cola — ситуационная схема подключения к сетям ИТО (спутниковый слайд 16:9):
    (SRC_COLA, 1, "drawing-cola-ito", "png", 2400),
]
TRIM_MARGIN = 24          # px of white padding kept around trimmed content


def autotrim(img: Image.Image) -> Image.Image:
    """Crop near-white borders, then re-pad with a small uniform margin."""
    rgb = img.convert("RGB")
    bg = Image.new("RGB", rgb.size, (255, 255, 255))
    diff = ImageChops.difference(rgb, bg)
    # Threshold so faint JPEG/scan noise near white doesn't defeat the crop.
    diff = diff.point(lambda p: 0 if p < 18 else p)
    bbox = diff.getbbox()
    if not bbox:
        return img
    left = max(bbox[0] - TRIM_MARGIN, 0)
    top = max(bbox[1] - TRIM_MARGIN, 0)
    right = min(bbox[2] + TRIM_MARGIN, img.width)
    bottom = min(bbox[3] + TRIM_MARGIN, img.height)
    return img.crop((left, top, right, bottom))


def main():
    # Optional argv name prefixes: bake only matching sheets
    # (python scripts/bake-design-drawings.py drawing-asteklo-rail ...)
    import sys
    prefixes = sys.argv[1:]
    sheets = [s for s in SHEETS
              if not prefixes or any(s[2].startswith(p) for p in prefixes)]
    for src in {src for src, *_ in sheets}:
        if not os.path.exists(src):
            raise SystemExit(f"[drawings] source PDF not found: {src}")
    os.makedirs(OUT_DIR, exist_ok=True)
    docs = {}  # source path -> open document

    for src, page_no, name, fmt, target_long_edge, *rest in sheets:
        crop = rest[0] if rest else None
        if src not in docs:
            docs[src] = fitz.open(src)
        page = docs[src][page_no - 1]
        rect = page.rect
        if crop:
            x0, y0, x1, y1 = crop
            rect = fitz.Rect(
                rect.x0 + x0 * rect.width, rect.y0 + y0 * rect.height,
                rect.x0 + x1 * rect.width, rect.y0 + y1 * rect.height,
            )
        long_edge = max(rect.width, rect.height)
        scale = target_long_edge / long_edge
        pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=rect, alpha=False)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        img = autotrim(img)

        out = os.path.join(OUT_DIR, f"{name}.{fmt}")
        if fmt == "jpg":
            img.convert("RGB").save(out, "JPEG", quality=84, optimize=True)
        else:
            img.save(out, "PNG", optimize=True)
        kb = round(os.path.getsize(out) / 1024)
        src_tag = os.path.basename(src)[:12]
        print(f"[drawings] {src_tag}… p{page_no:<2} -> {name}.{fmt}  {img.width}x{img.height}  ({kb} KB)")

    for doc in docs.values():
        doc.close()


if __name__ == "__main__":
    main()

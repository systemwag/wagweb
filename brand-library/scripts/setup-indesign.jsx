/*
  WAG Brand Library — InDesign setup
  ──────────────────────────────────
  Создаёт НОВЫЙ документ A4 (поля 18/16/16/14 мм, вылет 3 мм) и в нём:
    • 28 цветовых свотчей (Web + Print палитры)
    • 8 стилей абзацев: WAG Display / H1 / H1 RU / H2 / H2 RU / Body / Meta / Meta RU

  Требования: установить шрифты из brand-library/03-fonts/ ДО запуска
  (Space Grotesk, Onest, Outfit). Если шрифт не найден — стиль создастся
  со шрифтом по умолчанию, поправить вручную.

  Запуск: File → Scripts → Scripts Panel → ПКМ → Reveal → положить файл,
  либо просто дважды кликнуть в панели Scripts.
  (ES3 / ExtendScript.)
*/

(function () {
  /* ── Document ─────────────────────────────────────── */
  var doc = app.documents.add();
  doc.documentPreferences.pageWidth = '210mm';
  doc.documentPreferences.pageHeight = '297mm';
  doc.documentPreferences.facingPages = false;
  doc.documentPreferences.documentBleedUniformSize = true;
  doc.documentPreferences.documentBleedTopOffset = '3mm';

  var mp = doc.pages.item(0).marginPreferences;
  mp.top = '18mm'; mp.left = '16mm'; mp.right = '16mm'; mp.bottom = '14mm';

  /* ── Swatches ─────────────────────────────────────── */
  function addColor(name, r, g, b) {
    var c;
    try { c = doc.colors.itemByName(name); c.name; }
    catch (e) {
      c = doc.colors.add({
        name: name,
        model: ColorModel.PROCESS,
        space: ColorSpace.RGB,
        colorValue: [r, g, b]
      });
    }
    return c;
  }

  var palette = [
    ['WAG web/bg-primary', 4, 6, 12],
    ['WAG web/bg-secondary', 7, 11, 22],
    ['WAG web/gold', 212, 168, 67],
    ['WAG web/gold-light', 240, 200, 90],
    ['WAG web/gold-dark', 196, 154, 48],
    ['WAG web/teal', 0, 196, 167],
    ['WAG web/teal-light', 0, 221, 184],
    ['WAG web/blue', 79, 132, 255],
    ['WAG web/error', 255, 80, 80],
    ['WAG web/text-primary', 240, 242, 248],
    ['WAG web/text-secondary', 136, 146, 164],
    ['WAG web/text-muted', 74, 85, 104],
    ['WAG print/dark', 4, 6, 12],
    ['WAG print/dark-2', 10, 17, 36],
    ['WAG print/cream', 239, 226, 203],
    ['WAG print/cream-card', 248, 239, 224],
    ['WAG print/cream-card-2', 242, 230, 207],
    ['WAG print/ink', 26, 26, 26],
    ['WAG print/ink-2', 74, 64, 50],
    ['WAG print/muted', 138, 123, 92],
    ['WAG print/gold', 201, 148, 31],
    ['WAG print/gold-2', 176, 127, 28],
    ['WAG print/gold-soft', 230, 190, 87],
    ['WAG print/teal', 0, 168, 142],
    ['WAG print/teal-soft', 26, 194, 166],
    ['WAG print/blue', 79, 132, 255],
    ['WAG print/meta', 110, 101, 85],
    ['WAG print/meta-soft', 157, 145, 129]
  ];
  for (var i = 0; i < palette.length; i++) {
    addColor(palette[i][0], palette[i][1], palette[i][2], palette[i][3]);
  }

  /* ── Paragraph styles ─────────────────────────────── */
  function addStyle(name, fontFamily, fontStyle, sizePt, leadingPt, trackingEm, caps, colorName) {
    var st;
    try { st = doc.paragraphStyles.itemByName(name); st.name; }
    catch (e) { st = doc.paragraphStyles.add({ name: name }); }
    try { st.appliedFont = fontFamily; } catch (e2) {}
    try { st.fontStyle = fontStyle; } catch (e3) {}
    st.pointSize = sizePt;
    st.leading = leadingPt;
    st.tracking = trackingEm;           /* 1/1000 em */
    if (caps) st.capitalization = Capitalization.ALL_CAPS;
    try { st.fillColor = doc.colors.itemByName(colorName); } catch (e4) {}
    return st;
  }

  /* Печатная шкала (07-styles/STYLE-GUIDE.md) — 5 уровней. */
  addStyle('WAG Display',  'Outfit',        'Bold',     44, 46, -10, false, 'WAG print/ink');
  addStyle('WAG H1',       'Space Grotesk', 'Bold',     28, 31,  -5, false, 'WAG print/ink');
  addStyle('WAG H1 RU',    'Onest',         'Bold',     28, 31,  -5, false, 'WAG print/ink');
  addStyle('WAG H2',       'Space Grotesk', 'Bold',     16, 19,   0, false, 'WAG print/ink');
  addStyle('WAG H2 RU',    'Onest',         'Bold',     16, 19,   0, false, 'WAG print/ink');
  addStyle('WAG Body',     'Onest',         'Regular',  9.5, 14,  0, false, 'WAG print/ink');
  addStyle('WAG Meta',     'Space Grotesk', 'SemiBold', 7.5, 10, 60, true,  'WAG print/meta');
  addStyle('WAG Meta RU',  'Onest',         'SemiBold', 7.5, 10, 60, true,  'WAG print/meta');

  alert('WAG Brand Library:\nДокумент A4 (поля 18/16/16/14, вылет 3 мм),\n' +
        '28 свотчей и 8 стилей абзацев созданы.\n\n' +
        'Правило: русские заголовки — стили «… RU» (Onest),\n' +
        'латиница/цифры — Space Grotesk/Outfit.\n' +
        'File → Save As → .indt — и это ваш стартовый шаблон.');
})();

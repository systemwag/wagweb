/*
  WAG Brand Library — Illustrator setup
  ─────────────────────────────────────
  Создаёт в АКТИВНОМ документе (или новом, если ничего не открыто):
    • группу свотчей «WAG Web»   (12 цветов RGB)
    • группу свотчей «WAG Print» (16 цветов RGB)
    • 5 фирменных градиентов (появятся в панели Swatches)

  Запуск: File → Scripts → Other Script… → выбрать этот файл.
  (ES3 / ExtendScript — не редактировать в современный JS.)
*/

(function () {
  var doc;
  try {
    doc = app.activeDocument;
  } catch (e) {
    doc = app.documents.add(DocumentColorSpace.RGB);
  }

  function rgb(r, g, b) {
    var c = new RGBColor();
    c.red = r; c.green = g; c.blue = b;
    return c;
  }

  function addGroup(name, colors) {
    var group;
    try { group = doc.swatchGroups.getByName(name); }
    catch (e) { group = doc.swatchGroups.add(); group.name = name; }
    for (var i = 0; i < colors.length; i++) {
      var def = colors[i];
      var sw;
      try {
        sw = doc.swatches.getByName(def[0]);
      } catch (e2) {
        sw = doc.swatches.add();
        sw.name = def[0];
      }
      sw.color = rgb(def[1], def[2], def[3]);
      group.addSwatch(sw);
    }
  }

  /* ── Palettes (sync: brand-library/02-colors/COLORS.md) ── */
  addGroup('WAG Web', [
    ['web/bg-primary', 4, 6, 12],
    ['web/bg-secondary', 7, 11, 22],
    ['web/gold', 212, 168, 67],
    ['web/gold-light', 240, 200, 90],
    ['web/gold-dark', 196, 154, 48],
    ['web/teal', 0, 196, 167],
    ['web/teal-light', 0, 221, 184],
    ['web/blue', 79, 132, 255],
    ['web/error', 255, 80, 80],
    ['web/text-primary', 240, 242, 248],
    ['web/text-secondary', 136, 146, 164],
    ['web/text-muted', 74, 85, 104]
  ]);

  addGroup('WAG Print', [
    ['print/dark', 4, 6, 12],
    ['print/dark-2', 10, 17, 36],
    ['print/cream', 239, 226, 203],
    ['print/cream-card', 248, 239, 224],
    ['print/cream-card-2', 242, 230, 207],
    ['print/ink', 26, 26, 26],
    ['print/ink-2', 74, 64, 50],
    ['print/muted', 138, 123, 92],
    ['print/gold', 201, 148, 31],
    ['print/gold-2', 176, 127, 28],
    ['print/gold-soft', 230, 190, 87],
    ['print/teal', 0, 168, 142],
    ['print/teal-soft', 26, 194, 166],
    ['print/blue', 79, 132, 255],
    ['print/meta', 110, 101, 85],
    ['print/meta-soft', 157, 145, 129]
  ]);

  /* ── Gradients ── */
  function addGradient(name, stops) {
    /* stops: array of [rampPoint 0..100, r, g, b, opacity 0..100] */
    var g;
    try { g = doc.gradients.getByName(name); }
    catch (e) { g = doc.gradients.add(); g.name = name; }
    g.type = GradientType.LINEAR;
    /* ensure enough stops */
    while (g.gradientStops.length < stops.length) g.gradientStops.add();
    for (var i = 0; i < stops.length; i++) {
      var s = stops[i];
      var st = g.gradientStops[i];
      st.rampPoint = s[0];
      st.color = rgb(s[1], s[2], s[3]);
      st.opacity = (s.length > 4) ? s[4] : 100;
    }
  }

  addGradient('WAG Logo Gold (135deg)', [
    [0, 212, 168, 67], [50, 240, 200, 90], [100, 196, 154, 48]
  ]);
  addGradient('WAG Text Gold (135deg)', [
    [0, 212, 168, 67], [60, 240, 200, 90], [100, 250, 224, 138]
  ]);
  addGradient('WAG Text Teal (135deg)', [
    [0, 0, 196, 167], [100, 0, 221, 184]
  ]);
  addGradient('WAG Print CTA Gold (135deg)', [
    [0, 201, 148, 31], [100, 240, 200, 90]
  ]);
  addGradient('WAG Glass Stripe (90deg)', [
    [0, 212, 168, 67, 100], [65, 212, 168, 67, 0], [100, 212, 168, 67, 0]
  ]);

  alert('WAG Brand Library:\n2 группы свотчей + 5 градиентов добавлены.\n' +
        'Угол 135° задавайте инструментом Gradient при заливке.\n' +
        'Конический «луч» кнопки в AI не строится градиентом — см. gradients.svg.');
})();

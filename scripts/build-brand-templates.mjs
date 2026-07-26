/**
 * Build example documents for brand-library/08-templates/:
 *   - example-kp.pdf            (2-page commercial proposal, A4, print palette)
 *   - example-business-card.pdf (front + back, 96x56mm incl. 3mm bleed)
 *
 * Usage: node scripts/build-brand-templates.mjs  (no dev server needed)
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LIB = join(ROOT, 'brand-library');
const OUT = join(LIB, '08-templates');

const fontsUrl = (p) => 'file:///' + join(LIB, '03-fonts', p).replace(/\\/g, '/');

const svg = (p) => readFileSync(join(LIB, p), 'utf8').replace(/^<\?xml[^>]*\?>\s*/, '').replace(/<!--[\s\S]*?-->\s*/, '');

const wordmarkLight = svg('01-logos/wag-wordmark-light-bg.svg');
const wordmarkDark = svg('01-logos/wag-wordmark-dark-bg.svg');
const triangleGold = svg('01-logos/wag-triangle-gold-gradient.svg');
const qrSite = svg('05-graphics/qr-site.svg');

const FONTS = `
@font-face { font-family:'Onest'; font-weight:400; src:url('${fontsUrl('onest/onest-v9-cyrillic_latin-regular.ttf')}'); }
@font-face { font-family:'Onest'; font-weight:600; src:url('${fontsUrl('onest/onest-v9-cyrillic_latin-600.ttf')}'); }
@font-face { font-family:'Onest'; font-weight:700; src:url('${fontsUrl('onest/onest-v9-cyrillic_latin-700.ttf')}'); }
@font-face { font-family:'Onest'; font-weight:800; src:url('${fontsUrl('onest/onest-v9-cyrillic_latin-800.ttf')}'); }
@font-face { font-family:'Space Grotesk'; font-weight:600; src:url('${fontsUrl('space-grotesk/space-grotesk-v22-latin-600.ttf')}'); }
@font-face { font-family:'Space Grotesk'; font-weight:700; src:url('${fontsUrl('space-grotesk/space-grotesk-v22-latin-700.ttf')}'); }
@font-face { font-family:'Outfit'; font-weight:700; src:url('${fontsUrl('outfit/outfit-v15-latin-700.ttf')}'); }
`;

/* ════════════════════ KP (A4 x2) ════════════════════ */

const KP_CSS = `
${FONTS}
:root {
  --dark:#04060C; --dark2:#0A1124; --cream:#EFE2CB; --card:#F8EFE0; --card2:#F2E6CF;
  --ink:#1A1A1A; --ink2:#4A4032; --muted:#8A7B5C; --gold:#C9941F; --gold-soft:#E6BE57;
  --meta:#6E6555; --line-gold:rgba(201,148,31,0.45); --line-cream:rgba(74,64,50,0.12);
}
@page { size:A4 portrait; margin:0; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Onest',sans-serif; color:var(--ink); -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.page { width:210mm; height:297mm; background:var(--cream); padding:18mm 16mm 14mm; position:relative; overflow:hidden; page-break-after:always; }
.meta { font-size:7.5pt; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--meta); }
.header { display:flex; justify-content:space-between; align-items:flex-start; }
.header svg { width:52mm; height:auto; display:block; }
.hRight { text-align:right; }
.hRight .t { font-size:9pt; font-weight:700; letter-spacing:0.1em; color:var(--ink); }
.rule { height:0; border-top:0.75pt solid var(--line-gold); margin:6mm 0 10mm; }
.to { font-size:9.5pt; color:var(--ink2); line-height:1.5; margin-bottom:10mm; }
h1 { font-size:26pt; line-height:1.12; font-weight:800; letter-spacing:-0.005em; margin-bottom:8mm; }
h1 .g { color:var(--gold); }
.lead { font-size:10pt; line-height:1.5; color:var(--ink2); max-width:150mm; margin-bottom:10mm; }
.stats { display:flex; gap:4mm; margin-bottom:11mm; }
.stat { flex:1; background:var(--card); border-radius:2.5mm; padding:5mm 4mm 4mm; position:relative; overflow:hidden; }
.stat::before { content:''; position:absolute; top:0; left:0; right:35%; height:0.7mm; background:linear-gradient(90deg,var(--gold),transparent); }
.stat .n { font-family:'Outfit','Space Grotesk',sans-serif; font-size:20pt; font-weight:700; color:var(--gold); }
.stat .l { font-size:7pt; font-weight:600; letter-spacing:0.05em; text-transform:uppercase; color:var(--meta); margin-top:1.5mm; line-height:1.35; }
h2 { font-size:14pt; font-weight:700; margin-bottom:2.5mm; }
.h2rule { width:24mm; border-top:0.75pt solid var(--gold); margin-bottom:6mm; }
.items { display:grid; grid-template-columns:1fr 1fr; gap:5mm 8mm; }
.item { display:flex; gap:4mm; }
.item svg { width:9mm; height:9mm; flex:none; color:var(--gold); }
.item .it { font-size:10pt; font-weight:700; margin-bottom:1mm; }
.item .id { font-size:8.5pt; line-height:1.45; color:var(--ink2); }
.footer { position:absolute; left:16mm; right:16mm; bottom:10mm; border-top:0.5pt solid var(--line-cream); padding-top:4mm; display:flex; justify-content:space-between; align-items:center; }
.footer .f { font-size:7.5pt; color:var(--meta); line-height:1.6; }
.qr { width:16mm; height:16mm; }
.qr svg { width:100%; height:100%; display:block; }
table { width:100%; border-collapse:collapse; font-size:9pt; margin-bottom:6mm; }
th { background:var(--dark); color:var(--card); font-size:7.5pt; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; text-align:left; padding:3mm 3.5mm; }
th.r, td.r { text-align:right; font-variant-numeric:tabular-nums; }
td { padding:2.8mm 3.5mm; border-bottom:0.5pt solid var(--line-cream); color:var(--ink); vertical-align:top; }
tr:nth-child(even) td { background:var(--card); }
td .sub { font-size:7.5pt; color:var(--muted); margin-top:0.8mm; }
.total { background:var(--dark); color:var(--card); border-radius:2.5mm; padding:5mm 6mm; display:flex; justify-content:space-between; align-items:center; margin-bottom:10mm; }
.total .tl { font-size:8pt; letter-spacing:0.08em; text-transform:uppercase; color:rgba(240,242,248,0.55); }
.total .tn { font-family:'Outfit',sans-serif; font-size:20pt; font-weight:700; color:var(--gold-soft); }
.cond { display:grid; grid-template-columns:1fr 1fr; gap:4mm 8mm; margin-bottom:10mm; }
.cond .c { background:var(--card2); border-radius:2.5mm; padding:4mm 5mm; }
.cond .ct { font-size:7.5pt; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--meta); margin-bottom:1.5mm; }
.cond .cv { font-size:9.5pt; line-height:1.45; }
.req { font-size:8.5pt; line-height:1.7; color:var(--ink2); columns:2; column-gap:8mm; }
.req b { color:var(--ink); }
.pnum { position:absolute; bottom:5mm; left:0; right:0; text-align:center; font-size:7pt; color:var(--muted); letter-spacing:0.08em; }
`;

const iconDesign = svg('04-icons/service-design.svg');
const iconConstruction = svg('04-icons/service-construction.svg');
const iconPipe = svg('04-icons/pipe.svg');
const iconPower = svg('04-icons/power.svg');

const KP_HTML = `<!doctype html><html><head><meta charset="utf-8"><style>${KP_CSS}</style></head><body>

<div class="page">
  <div class="header">
    ${wordmarkLight}
    <div class="hRight">
      <div class="t">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</div>
      <div class="meta" style="margin-top:1.5mm">Исх. № 001-КП · 16 июля 2026 г.</div>
    </div>
  </div>
  <div class="rule"></div>
  <div class="to"><span class="meta">Кому:</span><br><b>ТОО «Компания-Заказчик»</b> — Иванову И. И., директору по капитальному строительству</div>
  <h1>Строительство инженерных сетей<br>промышленной площадки <span class="g">«Объект»</span></h1>
  <p class="lead">С 2010 года West Arlan Group реализует инфраструктурные проекты любой сложности по всему Казахстану — полный цикл от инженерных изысканий и проектирования до сдачи объекта под ключ.</p>
  <div class="stats">
    <div class="stat"><div class="n">136</div><div class="l">проектов в реестре</div></div>
    <div class="stat"><div class="n">49</div><div class="l">объектов СМР</div></div>
    <div class="stat"><div class="n">87</div><div class="l">комплектов ПД</div></div>
    <div class="stat"><div class="n">16 лет</div><div class="l">на рынке · ISO 9001/14001</div></div>
  </div>
  <h2>Что мы предлагаем</h2>
  <div class="h2rule"></div>
  <div class="items">
    <div class="item">${iconDesign}<div><div class="it">Проектная документация</div><div class="id">Изыскания, ПД и РД с прохождением экспертизы, авторский надзор на всём цикле строительства.</div></div></div>
    <div class="item">${iconConstruction}<div><div class="it">Строительно-монтажные работы</div><div class="id">Собственные бригады и парк спецтехники, производственный контроль, сдача госкомиссии.</div></div></div>
    <div class="item">${iconPipe}<div><div class="it">Инженерные сети</div><div class="id">Водоснабжение и канализация, теплосети, наружные сети под ключ с врезкой и пусконаладкой.</div></div></div>
    <div class="item">${iconPower}<div><div class="it">Энергетическая инфраструктура</div><div class="id">Линии электропередачи, подстанции, наружное освещение промышленных площадок.</div></div></div>
  </div>
  <div class="footer">
    <div class="f">г. Актобе, ул. Казангапа 57В, офис 34 · +7 (7132) 53-82-88<br>west_arlan-group@mail.ru · <b>westarlangroup.kz</b></div>
    <div class="qr">${qrSite}</div>
  </div>
</div>

<div class="page">
  <div class="header">
    ${wordmarkLight}
    <div class="hRight meta">КП № 001-КП · стр. 2</div>
  </div>
  <div class="rule"></div>
  <h2>Состав работ и стоимость</h2>
  <div class="h2rule"></div>
  <table>
    <tr><th style="width:8mm">№</th><th>Наименование работ</th><th class="r" style="width:22mm">Ед.</th><th class="r" style="width:20mm">Кол-во</th><th class="r" style="width:34mm">Стоимость, ₸</th></tr>
    <tr><td>1</td><td>Инженерные изыскания и проектная документация<div class="sub">геология, геодезия, стадия П + Р, экспертиза</div></td><td class="r">компл.</td><td class="r">1</td><td class="r">14 500 000</td></tr>
    <tr><td>2</td><td>Наружные сети водоснабжения<div class="sub">ПЭ100 SDR17 Ø160, включая земляные работы</div></td><td class="r">км</td><td class="r">2,4</td><td class="r">86 400 000</td></tr>
    <tr><td>3</td><td>Сети канализации с КНС<div class="sub">самотёчный коллектор + напорная линия</div></td><td class="r">км</td><td class="r">1,8</td><td class="r">97 200 000</td></tr>
    <tr><td>4</td><td>Наружное электроснабжение 10 кВ<div class="sub">КТП 2×630 кВА, кабельные линии</div></td><td class="r">компл.</td><td class="r">1</td><td class="r">64 800 000</td></tr>
    <tr><td>5</td><td>Благоустройство и пусконаладка</td><td class="r">компл.</td><td class="r">1</td><td class="r">18 300 000</td></tr>
  </table>
  <div class="total"><div class="tl">Итого, включая НДС</div><div class="tn">281 200 000 ₸</div></div>
  <div class="cond">
    <div class="c"><div class="ct">Срок выполнения</div><div class="cv">10 месяцев с даты аванса, включая экспертизу ПД</div></div>
    <div class="c"><div class="ct">Порядок оплаты</div><div class="cv">Аванс 30 % · ежемесячно по актам КС-2/КС-3</div></div>
    <div class="c"><div class="ct">Гарантия</div><div class="cv">24 месяца на все виды работ</div></div>
    <div class="c"><div class="ct">Срок действия КП</div><div class="cv">30 календарных дней</div></div>
  </div>
  <h2>Реквизиты</h2>
  <div class="h2rule"></div>
  <div class="req">
    <b>ТОО «West Arlan Group»</b><br>БИН 100340009758<br>АО «Банк ЦентрКредит»<br>ИИК KZ298562203116437574 · БИК KCJBKZKX<br>
    РК, Актюбинская обл., г. Актобе,<br>ул. Казангапа 57В, офис 34<br>+7 (7132) 53-82-88<br>west_arlan-group@mail.ru · westarlangroup.kz
  </div>
  <div class="pnum">West Arlan Group · westarlangroup.kz · стр. 2 из 2</div>
</div>

</body></html>`;

/* ════════════════════ Business card (96x56mm x2) ════════════════════ */

const CARD_CSS = `
${FONTS}
@page { size:96mm 56mm; margin:0; }
* { margin:0; padding:0; box-sizing:border-box; }
body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.card { width:96mm; height:56mm; position:relative; overflow:hidden; page-break-after:always; }
.front { background:#04060C; }
.front .tri { position:absolute; top:11mm; left:11mm; width:13.5mm; }
.front .tri svg { width:100%; height:auto; display:block; }
.front .nameBlock { position:absolute; left:11mm; bottom:11mm; border-left:0.5pt solid rgba(201,148,31,0.6); padding-left:4mm; }
.front .name { font-family:'Onest',sans-serif; font-weight:700; font-size:10.5pt; color:#F0F2F8; }
.front .role { font-family:'Onest',sans-serif; font-weight:600; font-size:6.5pt; letter-spacing:0.08em; text-transform:uppercase; color:#8892A4; margin-top:1.6mm; }
.front .site { position:absolute; right:11mm; bottom:11mm; font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:6.5pt; letter-spacing:0.1em; color:#C9941F; }
.back { background:#EFE2CB; }
.back .wm { position:absolute; top:10mm; left:11mm; width:30mm; }
.back .wm svg { width:100%; height:auto; display:block; }
.back .contacts { position:absolute; right:11mm; bottom:10mm; text-align:left; font-family:'Onest',sans-serif; font-size:7pt; line-height:2; color:#1A1A1A; }
.back .contacts b { font-weight:600; }
.back .contacts .lbl { color:#C9941F; font-weight:700; display:inline-block; width:9mm; letter-spacing:0.05em; }
.back .qr { position:absolute; left:11mm; bottom:10mm; width:12mm; height:12mm; }
.back .qr svg { width:100%; height:100%; display:block; }
`;

const CARD_HTML = `<!doctype html><html><head><meta charset="utf-8"><style>${CARD_CSS}</style></head><body>
<div class="card front">
  <div class="tri">${triangleGold}</div>
  <div class="nameBlock">
    <div class="name">Аронов Аян Садиржанович</div>
    <div class="role">Генеральный директор</div>
  </div>
  <div class="site">WESTARLANGROUP.KZ</div>
</div>
<div class="card back">
  <div class="wm">${wordmarkLight}</div>
  <div class="qr">${qrSite}</div>
  <div class="contacts">
    <div><span class="lbl">тел</span> +7 (777) 669-99-89</div>
    <div><span class="lbl">офис</span> +7 (7132) 53-82-88</div>
    <div><span class="lbl">почта</span> west_arlan-group@mail.ru</div>
    <div><span class="lbl">адрес</span> г. Актобе, ул. Казангапа 57В, оф. 34</div>
  </div>
</div>
</body></html>`;

/* ════════════════════ Render ════════════════════ */

async function render(page, html, pdfOpts, outFile) {
  await page.setContent(html, { waitUntil: 'load', timeout: 90_000 });
  await page.evaluate(async () => { await document.fonts.ready; });
  const pdf = await page.pdf({ printBackground: true, preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }, ...pdfOpts });
  writeFileSync(outFile, pdf);
  console.log('[templates] written', outFile);
}

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await render(page, KP_HTML, { format: 'A4' }, join(OUT, 'example-kp.pdf'));
  await render(page, CARD_HTML, { width: '96mm', height: '56mm' }, join(OUT, 'example-business-card.pdf'));
} finally {
  await browser.close();
}
console.log('[templates] DONE');

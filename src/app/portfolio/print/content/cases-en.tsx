import type { DesignProjectSheet } from '../design/content/types';

/* English case sheets for the MAIN portfolio — structural twin of
   cases-ru.tsx (same order, same drawings, same metrics). Translated, not
   transliterated: company names use their Latin/registered forms, units are
   anglicised (km/m, mln ₸), decimal commas become points. Keep the two files
   in sync: any case added or reworked in cases-ru.tsx must be mirrored here. */

const QAZCEMENT_RAIL_CASES_EN: DesignProjectSheet[] = [
  /* 02.1 · External access track (cat. III-p, 6,733 m) + power annex */
  {
    index: '02.1',
    status: 'DELIVERED',
    category: 'QAZCEMENT INDUSTRIES CEMENT PLANT · EXTERNAL TRACK',
    title: 'External railway access track to the QazCement Industries plant',
    client: 'QazCement Industries LLP · junction at Kenzhaly station, KTZ',
    location: 'Aktobe region, Baiganin district, Koltabansky rural district',
    stage: 'Detail design 2-30/06-2025 · positive State Expertise conclusion No. 01-1085/26 of 02.07.2026',
    lead: (
      <>
        Detail design of a category III-p external access railway from Kenzhaly station to the
        cement plant site: R65 rails, culvert structures, subgrade drainage, crossings of trunk
        fibre-optic and hot-box-detector cables. Several junction options for the external track
        were developed, with the optimal one selected for delivery. The construction cost was
        optimised from 2,288.7 down to 1,902.7 mln ₸. A separate
        project delivered the plant’s external power supply — 24 MW, a 110/10 kV substation and
        a 110 kV overhead line.
      </>
    ),
    metrics: [
      { value: '6,733', unit: 'm', label: 'Track length · category III-p' },
      { value: '350+', unit: 'mln ₸', label: 'Construction cost optimisation' },
      { value: '4', unit: 'culverts', label: 'Culvert structures along the route' },
    ],
    scope: [
      'R65 track on crushed-stone ballast · earthworks and drainage',
      '4 reinforced-concrete culverts',
      'Protection of Transtelecom fibre-optic and detector cables · line relocation',
      'Coordinate, crossing and land-allotment schedules',
    ],
    drawing: '/portfolio/design/drawing-qc-access.png',
    drawingCaption: 'Railway track plan, 1:1000 · schedules of coordinates, crossings and culvert structures',
    drawingKind: 'Railway track · 2-30/06-2025',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-qc-access-profile.png',
      caption: 'Longitudinal track profile with geotechnical elements and design elevations',
      kind: 'Longitudinal profile · 2-30/06-2025',
    },
    annex: {
      eyebrow: '02.1 · QAZCEMENT INDUSTRIES PLANT · EXTERNAL POWER SUPPLY',
      title: 'External power supply of the plant — 24 MW',
      figures: [
        {
          drawing: '/portfolio/design/drawing-power24.png',
          caption: 'Situational plan of the external power supply · 110 kV overhead line routed into the regional grid (Temir — Shubarkuduk)',
          kind: 'Power supply scheme · Appendix 3',
        },
        {
          drawing: '/portfolio/design/drawing-qazcement.png',
          caption: 'Substation 110/10 kV setting-out plan, 1:500 · 16 buildings and structures, 5,046 m² site, outdoor switchgear on a TDN-25000/110 transformer',
          kind: 'Substation general plan · detail design',
        },
      ],
      metricsLabel: 'POWER SUPPLY FIGURES',
      metrics: [
        { value: '24', unit: 'MW', label: 'Connected plant capacity' },
        { value: '110/10', unit: 'kV', label: 'Step-down substation · 110 kV line' },
        { value: '25,000', unit: 'kVA', label: 'TDN/110 transformer' },
      ],
    },
  },

  /* 02.2 · On-site trackwork (3,119 m) */
  {
    index: '02.2',
    status: 'DELIVERED',
    category: 'QAZCEMENT INDUSTRIES CEMENT PLANT · PLANT SITE',
    title: 'On-site railway development at the QazCement Industries plant',
    client: 'QazCement Industries LLP · cement plant',
    location: 'Aktobe region, Baiganin district · Kenzhaly station',
    stage: 'Detail design 10/09-2025 · positive State Expertise conclusion No. 01-0106/26 of 01.04.2026',
    lead: (
      <>
        Detail design of an optimal track layout on the plant site: receiving-departure, loading
        and connecting tracks around the clinker store, an elevated track for unloading inert
        materials, dynamic and static wagon scales, and lighting of the railway tracks.
        The track layout was optimised against the customer’s initial proposal.
      </>
    ),
    metrics: [
      { value: '3,119', unit: 'm', label: 'Access and on-site tracks' },
      { value: 'R65', label: 'Heavy-type rails · 1/9 turnouts' },
      { value: '2', unit: 'types', label: 'Wagon scales · dynamic and static' },
    ],
    scope: [
      'Track layout optimised against the customer’s initial proposal',
      'R65 tracks · R65 1/9 turnouts',
      'Elevated track for unloading inert materials (reinforced concrete)',
      'Dynamic and static wagon scales',
      'Railway track lighting · subgrade works',
    ],
    drawing: '/portfolio/design/drawing-qc-internal.png',
    drawingCaption: 'Plant railway plan, 1:1000 · schedules of tracks, buildings and turnouts',
    drawingKind: 'Railway track · 10/09-2025',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-qc-internal-upor.png',
      caption: 'Rail buffer stop — plan, sections and bill of components',
      kind: 'Details · 10/09-2025',
    },
  },

  /* 02.3 · Kenzhaly station tracks (1,434 m) + signalling */
  {
    index: '02.3',
    status: 'DELIVERED',
    category: 'QAZCEMENT INDUSTRIES CEMENT PLANT · KENZHALY STATION',
    title: 'Track development of Kenzhaly station',
    client: 'Kenzhaly station · KTZ national railway land',
    location: 'Aktobe region, Baiganin district',
    stage: 'Detail design 1-30/06-2025 · positive State Expertise conclusion No. 01-1040/26 of 29.05.2026',
    lead: (
      <>
        Development of Kenzhaly station to receive the cement plant’s trains with optimised
        costs: the track layout is designed for convenient shunting and day-to-day operation,
        category IV track on concrete sleepers. The existing interlocking was replaced with an
        upgraded UECM-type system: a new modular interlocking post with a backup power source
        and category I reliability power supply, plus additional station lighting.
      </>
    ),
    metrics: [
      { value: '1,434', unit: 'm', label: 'Station tracks · category IV' },
      { value: '10', unit: 'turnouts', label: 'In UECM interlocking · 14 signals' },
      { value: 'I', unit: 'category', label: 'Interlocking post power supply reliability' },
    ],
    scope: [
      'R65 track on concrete sleepers · crushed stone / gravel',
      'UECM-type interlocking · 10 turnouts, 14 signals, 18 track circuits',
      'Modular interlocking post · backup power source',
      'Category I power supply: 10/0.4 package substation · station lighting',
      'General plan · approved by all KTZ railway services',
    ],
    drawing: '/portfolio/design/drawing-qc-station.png',
    drawingCaption: 'Kenzhaly station track development plan, 1:1000 · track and turnout schedules, approval sheet',
    drawingKind: 'Track development · 1-30/06-2025',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-kenzhaly-signal.png',
      caption: 'Station throat with signalling · modular interlocking post, junction of the QazCement Industries track',
      kind: 'Interlocking · 1-30/06-2025',
    },
  },
];

const ASTEKLO_INFRA_CASES_EN: DesignProjectSheet[] = [
  {
    index: '03',
    status: 'DELIVERED',
    category: 'AKTOBE STEKLO GLASS PLANT · AKTOBE',
    title: 'External infrastructure of the Aktobe Steklo glass plant',
    client: 'Aktobe Steklo LLP · glass container plant',
    location: 'Aktobe city, Almaty district, 41st siding',
    stage: 'Detail designs · expertise conclusions 2025: rail 01-0505/25 · road ES-0194/25 · gas 04-0267/25 · sewerage ES-0193/25',
    lead: (
      <>
        The full external infrastructure of the new Aktobe Steklo glass container plant: a
        110/10 kV step-down substation and a double-circuit 110 kV line from the Gorodskaya
        substation, a railway access track joining the KTZ network at the Alzhan siding, an
        access road, a supply gas pipeline, external sewerage networks and the relocation of
        existing utilities at railway crossings. Several development options for the Alzhan
        siding were designed, with the optimal track layout and construction cost selected.
      </>
    ),
    metrics: [
      { value: '110/10', unit: 'kV', label: 'Step-down substation + double-circuit 110 kV line' },
      { value: '12.6', unit: 'MVA', label: 'Substation capacity · 2×6.3 MVA' },
      { value: '5.8', unit: 'km', label: 'Tracks, roads and utilities in total' },
    ],
    scope: [
      '110/10 kV substation and double-circuit 110 kV line from Gorodskaya',
      'Category III-p railway track (1,442 m) · category IV access road (1,156 m)',
      'Alzhan siding track development · shunting-neck track within the KTZ land plot',
      'Modular siding technician-mechanic building · interlocking equipment replacement',
      'HP & MP supply gas pipeline · 1,419 m, PE 100',
      'Sewerage 1,755 m · crossing under the mainline tracks · drainage structures',
    ],
    drawing: '/portfolio/design/drawing-asteklo-power.png',
    drawingCaption: 'Power network plan, 1:1000 · double-circuit 110 kV line from the Gorodskaya substation',
    drawingKind: 'Power supply · 5-10/04-2025',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-asteklo-rail.png',
      caption: 'External railway access track plan · junction at the Alzhan siding, KTZ',
      kind: 'Railway track · 2-1-10/04-2025',
    },
    annex: {
      eyebrow: '03 · AKTOBE STEKLO PLANT · PROJECT DRAWINGS',
      title: 'Gas supply, sewerage and the access road',
      figures: [
        {
          drawing: '/portfolio/design/drawing-gas.jpg',
          caption: 'General plan of the supply gas pipeline on satellite base, 1:2000 · category I high pressure + PE 100 medium pressure (1,419 m)',
          kind: 'Gas supply · No. 04-0267/25 · detail design',
        },
        {
          drawing: '/portfolio/design/drawing-sewage.png',
          caption: 'External pressure sewerage plan, 1:1000 · 1,755 m, crossing under the mainline tracks',
          kind: 'Sewerage · No. ES-0193/25 · detail design',
        },
        {
          drawing: '/portfolio/design/drawing-asteklo-road.png',
          caption: 'Access road alignment plan, category IV · curves R 3,000–5,000 m, 1,156 m',
          kind: 'Road · No. ES-0194/25 · Volume 3',
          band: true,
        },
      ],
    },
  },
];

const URAL_STEEL_CASES_EN: DesignProjectSheet[] = [
  {
    index: '04',
    status: 'DELIVERED',
    category: 'KOLESOPROKATNAYA STATION · URAL STEEL JSC',
    title: 'Kolesoprokatnaya station and utilities for Ural Steel JSC',
    client: 'Ural Steel JSC · 360,000 railway wheels per year complex',
    location: 'Novotroitsk, Orenburg region, Russian Federation',
    stage: 'Working documentation · signalling ref. MP180428 · utilities stage D',
    lead: (
      <>
        Integrated design of the new wheel-rolling complex station: demolition of the existing
        Marten station and its relay-based interlocking, construction of the Kolesoprokatnaya
        station with conversion to computer-based interlocking (CBI) covering 68 turnouts of the
        1/7 type, turnout air-blowing and a combined two-storey modular interlocking post.
        The same project delivered the station utilities —
        0.4 kV power, outdoor lighting (61 masts, 2,217 m of cable), water supply and drainage.
      </>
    ),
    metrics: [
      { value: '68', unit: 'turnouts', label: '1/7 type · converted to CBI' },
      { value: '360', unit: 'k', label: 'Wheels per year · complex capacity' },
      { value: '0.4', unit: 'kV', label: 'Station power networks and outdoor lighting' },
    ],
    scope: [
      'Demolition of Marten station and its relay interlocking · Kolesoprokatnaya station construction',
      'Computer-based interlocking · 68 turnouts of the 1/7 type',
      'Combined interlocking post · two-storey modular design · category I power supply',
      'Interlocking post: CCTV, fire safety and staff welfare facilities',
      'Turnout air-blowing system',
      '0.4 kV networks, outdoor lighting, water supply and drainage',
    ],
    drawing: '/portfolio/design/drawing-ural-station.png',
    drawingCaption: 'Kolesoprokatnaya station setting-out plan, 1:1000 · track development and turnouts',
    drawingKind: 'Setting-out plan · ref. MP180428',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-ural-lighting.png',
      caption: 'Station outdoor lighting plan, 1:1000 · 61 masts, 2,217 m of cable lines',
      kind: 'Lighting · stage D',
    },
    annex: {
      eyebrow: '04 · URAL STEEL · PROJECT DRAWINGS',
      title: '0.4 kV utilities and the interlocking post',
      figures: [
        {
          drawing: '/portfolio/design/drawing-ural-04kv.png',
          caption: '0.4 kV network plan, 1:1000 · switchboards, bills of quantities and trench sections',
          kind: 'Power supply · stage D',
        },
        {
          drawing: '/portfolio/design/drawing-ural-post.png',
          caption: 'Combined interlocking post · facades, two-storey modular design',
          kind: 'Interlocking post · concept design · ref. MP180428',
        },
      ],
    },
  },
];

const ZHINISHKE_CASES_EN: DesignProjectSheet[] = [
  {
    index: '05',
    status: 'DELIVERED',
    category: 'AKTOBE INDUSTRIAL ZONE · ZHINISHKE STATION',
    title: 'Railway access tracks for Aktobe industrial zone residents',
    client: 'Residents of the Aktobe industrial zone · junctions at Zhinishke station',
    location: 'Aktobe city, industrial zone · Zhinishke station',
    stage: 'Detail designs of access tracks · junctions at Zhinishke station · 2018–2021',
    lead: (
      <>
        Railway access tracks for several residents of the Aktobe industrial zone, each joining
        the network at Zhinishke station: the track development of SPK Aktobe, the access and
        elevated track of the Zerde Keramika plant, the access track to the Faeton logistics
        centre and the access tracks of the Svetotekhnika-W plant.
      </>
    ),
    metrics: [
      { value: '4', unit: 'residents', label: 'Access tracks to Zhinishke station' },
      { value: '~5', unit: 'km', label: 'Total track development' },
      { value: '10', unit: 'turnouts', label: 'R65 turnouts · types 1/7–1/11' },
    ],
    scope: [
      'SPK Aktobe · 3.1 km track development, six R65 1/11 turnouts',
      'Zerde Keramika LLP · 481 m access track + elevated unloading track',
      'Faeton Company LLP · 869 m track to the logistics centre, Ø1 m culvert',
      'Svetotekhnika-W plant LLP · two category III-p tracks, 1/7 and 1/9 turnouts',
    ],
    drawing: '/portfolio/design/drawing-spk-rail.png',
    drawingCaption: 'SPK Aktobe track development · plan 1:1000, three tracks and six turnouts',
    drawingKind: 'SPK Aktobe · 1-1',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-svet-rail.png',
      caption: 'Svetotekhnika-W plant access track · plan 1:1000, junction at Zhinishke station',
      kind: 'Svetotekhnika-W · 05/06-2021',
    },
    annex: {
      eyebrow: '05 · AKTOBE INDUSTRIAL ZONE · RESIDENTS’ DRAWINGS',
      title: 'Zerde Keramika and Faeton access tracks',
      figures: [
        {
          drawing: '/portfolio/design/drawing-zerde-plan.png',
          caption: 'Zerde Keramika access and elevated track · plan 1:1000, elevated unloading track',
          kind: 'Zerde Keramika · 10-1',
        },
        {
          drawing: '/portfolio/design/drawing-faeton-rail-1.png',
          caption: 'Access track to the Faeton logistics centre · plan 1:1000, culvert',
          kind: 'Faeton Company · 1-1',
        },
      ],
    },
  },
];

const HORGOS_CASES_EN: DesignProjectSheet[] = [
  {
    index: '06',
    status: 'DELIVERED',
    category: 'KHORGOS — EASTERN GATES DRY PORT',
    title: 'Sorting tracks and wagon repair base at Khorgos Gateway dry port',
    client: 'KTZ national railway · Khorgos — Eastern Gates dry port',
    location: 'Khorgos — Eastern Gates SEZ, Almaty region · Chinese border',
    stage: 'Detail design · KTZ technical conditions No. 3334-i of 03.12.2020 · ref. 16/08-2021',
    lead: (
      <>
        Detail design for ten sorting railway tracks and an uncoupled wagon repair base at the
        Khorgos — Eastern Gates dry port, the largest dry port on the Kazakh-Chinese border.
        Category II-p tracks on R65S rails with 1/9 turnouts — 7,981 m of track development.
        The project also covers an unloading ramp for self-propelled machinery, the relocation
        of crossed utilities and 10/0.4 kV networks, and a yard public-address system. Designed
        to the technical conditions of the KTZ national railway.
      </>
    ),
    metrics: [
      { value: '10', unit: 'tracks', label: 'Sorting railway tracks' },
      { value: 'WRB', unit: '', label: 'Uncoupled wagon repair base' },
      { value: '8', unit: 'km', label: 'Track development · 7,981 m in total' },
    ],
    scope: [
      'Ten sorting tracks · R65S rails, R65 1/9 turnouts, category II-p',
      'Repair base: 296 m track, unloading ramp, modular staff building and spare-parts warehouse',
      'Protection of water, sewerage and storm mains: steel casings Ø426–1,020 mm',
      '10/0.4 kV networks in concrete troughs · 23 m lighting masts · base power supply',
      'Crushed-stone ballast with Tensar geogrid',
      'On-site water supply and drainage networks · yard public-address system',
    ],
    drawing: '/portfolio/design/drawing-horgos-rail-1.png',
    drawingCaption: 'Track development plan, 1:1000 · turnout throats and sorting tracks',
    drawingKind: 'Railway track · 16/08-2021',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-horgos-rail-2.png',
      caption: 'Track development plan, continued · sorting tracks and buffer stops',
      kind: 'Railway track · 16/08-2021',
    },
    annex: {
      eyebrow: '06 · KHORGOS DRY PORT · REPAIR BASE',
      title: 'Uncoupled wagon repair base',
      figures: [
        {
          drawing: '/portfolio/design/drawing-horgos-tor-site.png',
          caption: 'Repair base site plan, 80×30 m · 5 t gantry crane with a 16 m span, crane runways, wheelset storage tracks · 21 types of monolithic foundations',
          kind: 'Repair base site · 16/08-2021-2-AS',
        },
        {
          drawing: '/portfolio/design/drawing-horgos-apparel.png',
          caption: 'Unloading ramp for self-propelled machinery, 32.2 m long · FBS block layout, details and specification, monolithic slab with channel edging',
          kind: 'Ramp · 16/08-2021-1-AS',
        },
        {
          drawing: '/portfolio/design/drawing-horgos-04kv.png',
          caption: '0.4 kV and outdoor lighting relocation plan, 1:1000 · cable lines in concrete troughs, 23 m lighting mast relocation',
          kind: 'Power supply · 16/08-2021-0-ES',
          side: true,
        },
      ],
    },
  },
];

const AMK_CASES_EN: DesignProjectSheet[] = [
  {
    index: '07',
    status: 'DELIVERED',
    category: 'AKTOBE COPPER COMPANY · RUDNAYA STATION',
    title: 'Wagon stabling tracks and Rudnaya station reconstruction (AMK)',
    client: 'Aktobe Copper Company LLP · Kyzyl-Kain — Rudnaya section',
    location: 'Koktau village, Khromtau district, Aktobe region · junction at Kempirsai station',
    stage: 'Detail design · general track development plan, 1:2000 · ref. 5-1',
    lead: (
      <>
        Detail design of railway stabling tracks on the connecting section between the Kyzyl-Kain
        industrial station and Rudnaya station, with on-site reconstruction of the Rudnaya station
        tracks of the Aktobe Copper Company. The junction connects to Kempirsai station of the
        national network.
      </>
    ),
    metrics: [
      { value: '8.9', unit: 'km', label: 'Track development · new tracks and reconstruction' },
      { value: '9', unit: 'turnouts', label: 'R65 turnouts, 1/9 type' },
      { value: '2', unit: 'stations', label: 'Kyzyl-Kain and Rudnaya · Kempirsai junction' },
    ],
    scope: [
      'New access, connecting and elevated tracks · 4.2 km, R65',
      'Wagon stabling tracks and connecting-track rebuild · 4.8 km',
      'On-site reconstruction of Rudnaya station tracks',
      'Nine R65 1/9 turnouts · junction at Kempirsai station',
    ],
    drawing: '/portfolio/design/drawing-amk-rail-2.png',
    drawingCaption: 'General track development plan, 1:2000 · stabling tracks, elevated tracks, track and turnout schedules',
    drawingKind: 'Railway track · 5-1',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-amk-rail-1.png',
      caption: 'Left part of the general track development plan · approach and connecting tracks',
      kind: 'Railway track · 5-1',
    },
  },
];

const NSS_CASES_EN: DesignProjectSheet[] = [
  {
    index: '08',
    status: 'DELIVERED',
    category: 'NEFTESTROYSERVIS ACCESS TRACK · TENDYK STATION',
    title: 'Access track with an elevated unloading track for Neftestroyservis LTD',
    client: 'Neftestroyservis LTD LLP (NSS) · junction at Tendyk station, KTZ',
    location: 'Atyrau region, Atyrau city, Novokirpichny aul · KTZ Atyrau mainline division',
    stage: 'Detail design · refs 13/04-2022-PZh and 13/04-2022-KZh · May 2022',
    lead: (
      <>
        Detail design of the access track for Neftestroyservis LTD at Tendyk station of the
        KTZ Atyrau division: a 181 m unloading track on R65S rails tied in 40 m from the
        existing turnout, and a 2.2 m elevated track of FBS blocks on a monolithic slab.
        The site lies at −22.13 m; groundwater with 27 g/l mineralisation is aggressive to
        concrete and steel, so W8 concrete and bituminous protection are used.
      </>
    ),
    metrics: [
      { value: '181', unit: 'm', label: 'Unloading track · R65S rails' },
      { value: '2.2', unit: 'm', label: 'Elevated track height · FBS blocks' },
      { value: 'W8', unit: '', label: 'Concrete grade for aggressive groundwater' },
    ],
    scope: [
      '181 m unloading track · R65S · R65 1/9 turnout and derailer',
      '2.2 m elevated track: FBS blocks on a monolithic slab · C16/20 W8 F200 concrete',
      '6 m wide concreted unloading apron',
      'Tie-in among live gas and power lines',
    ],
    drawing: '/portfolio/design/drawing-nss-rail-plan.png',
    drawingCaption: 'Railway track plan, 1:1000 · track and turnout schedules, tie-in to the Tendyk station throat',
    drawingKind: 'Railway track · 13/04-2022',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-nss-elevated-track.png',
      caption: 'Elevated track block layout, sections and specification · FBS blocks, monolithic slabs Pm1–Pm3',
      kind: 'Elevated track · 13/04-2022',
    },
  },
];

const SINTEZ_CASES_EN: DesignProjectSheet[] = [
  {
    index: '09',
    status: 'DELIVERED',
    category: 'SINTEZ URAL ACCESS TRACK · KARDON STATION',
    title: 'Access track to the Sintez Ural blending plant',
    client: 'Sintez Ural LLP · 20,000 t/year blending plant',
    location: 'West Kazakhstan region, Uralsk, Kardon · Kardon station',
    stage: 'Detail design · refs 03/08-2023 (track, culverts, power, winch) · October 2023',
    lead: (
      <>
        Integrated detail design of the access railway to the new blending plant: 0.8 km of
        track on concrete sleepers — R65(S) rails with Vossloh fastenings, a Ø1.0 m culvert
        under the existing road, a level crossing and a shunting winch. The project also
        delivered the 0.4 kV power supply with outdoor track lighting; the crossed gas main,
        water main and 10 kV cable were cased and inspected.
      </>
    ),
    metrics: [
      { value: '0.8', unit: 'km', label: 'Track development · R65(S), concrete sleepers' },
      { value: 'Ø1.0', unit: 'm', label: 'Culvert under the existing road' },
      { value: '3', unit: 'utilities', label: 'Cased at crossings: gas, water, 10 kV' },
    ],
    scope: [
      '0.8 km track development · concrete sleepers · R65(S) with Vossloh fastenings',
      'Ø1.0 m culvert under the existing road · level crossing',
      'Protection and inspection of utilities: gas main, water main, 10 kV cable',
      '0.4 kV power supply and outdoor lighting · shunting winch',
    ],
    drawing: '/portfolio/design/drawing-sintez-plan.png',
    drawingCaption: 'Access track plan with 0.4 kV power and lighting, 1:1000 · casings at crossings, schedule of structures',
    drawingKind: 'Power supply and lighting · 03/08-2023',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-sintez-culvert.png',
      caption: 'Ø1.0 m reinforced-concrete culvert — section along the road axis · ZKP links, W10 monolithic concrete',
      kind: 'Culvert structures · 03/08-2023',
    },
  },
];

const MIDAS_CASES_EN: DesignProjectSheet[] = [
  {
    index: '12',
    status: 'DELIVERED',
    category: 'SINE MIDAS STROY ACCESS TRACK · ISATAY STATION',
    title: 'Access track with an elevated track for Sine Midas Stroy JV',
    client: 'Sine Midas Stroy JV LLP · junction at Isatay station, KTZ',
    location: 'Atyrau region, Isatay village · KTZ Atyrau mainline division',
    stage: 'Detail design · refs 01/03-2022 (track, elevated track, power, communications) · KTZ TC No. 1009-I',
    lead: (
      <>
        Detail design of the access track for the Sine Midas Stroy joint venture at Isatay
        station of the KTZ Atyrau division: a 0.5 km unloading track on R65S rails with an
        elevated track for unloading inert materials, and the extension of station tracks
        No. 10 and No. 11 by a combined 0.3 km. The project also covers 0.4 kV power networks
        with lighting, communications and signalling, and protection of the existing
        communication line crossed by the track.
      </>
    ),
    metrics: [
      { value: '0.5', unit: 'km', label: 'Unloading track · R65S, 1/9 turnouts' },
      { value: '0.3', unit: 'km', label: 'Extension of station tracks No. 10 and 11' },
      { value: '0.4', unit: 'kV', label: 'Outdoor power and lighting networks' },
    ],
    scope: [
      '440 m unloading track · R65S · R65 1/9 turnout and derailer',
      'Elevated track for unloading inert materials',
      'Extension of station tracks No. 10 and 11 · dismantling of old R50/R43 tracks',
      '0.4 kV power and lighting networks · protection of the existing communication line',
    ],
    drawing: '/portfolio/design/drawing-midas-plan-1.png',
    drawingCaption: 'Railway track plan, 1:1000 · unloading track with an elevated track for inert materials',
    drawingKind: 'Railway track · 01/03-2022',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-midas-plan-2.png',
      caption: 'Plan, continued · Isatay station throat, extension of station tracks No. 10 and 11',
      kind: 'Railway track · 01/03-2022',
    },
  },
];

const ARBZ_CASES_EN: DesignProjectSheet[] = [
  {
    index: '13',
    status: 'DELIVERED',
    category: 'ARBZ RAIL-AND-BEAM MILL · AKTOBE',
    title: 'Track into the rail mill’s cold finished-product warehouse',
    client: 'ARBZ LLP · Aktobe rail-and-beam mill',
    location: 'Aktobe city · ARBZ plant site',
    stage: 'Detail design · ref. 4-05/22 · October 2022',
    lead: (
      <>
        Detail design extending the plant’s existing track No. 6 into a new cold warehouse for
        finished products — rails from 25 to 120 m long, with a storage capacity of 30–35
        thousand tonnes. The 269 m R65 track runs through the warehouse gates: an in-building
        rail way on a foundation slab, a combined span with concrete sleepers at the
        slab-to-subgrade transition, and anti-creep anchoring.
      </>
    ),
    metrics: [
      { value: '269', unit: 'm', label: 'Extension of track No. 6 · R65 rails' },
      { value: '25–120', unit: 'm', label: 'Finished rails stored in the warehouse' },
      { value: '30–35', unit: 'k t', label: 'Cold warehouse capacity' },
    ],
    scope: [
      'Extension of existing track No. 6 · 269 m, R65 rails, timber sleepers',
      'Track led into the warehouse through the gates · rail way on a foundation slab',
      'Combined span with concrete sleepers at the slab-to-subgrade transition',
      'Anti-creep anchoring · buffer stop · drainage into concrete troughs',
    ],
    drawing: '/portfolio/design/drawing-arbz-plan.png',
    drawingCaption: 'Railway track plan, 1:1000 · track led into the cold warehouse, anti-creep anchoring schemes',
    drawingKind: 'Railway track · 4-05/22',
  },
];

const KAZGEORUD_CASES_EN: DesignProjectSheet[] = [
  {
    index: '15',
    status: 'DELIVERED',
    category: 'KOKTAU — LIMANNOE ROAD · KAZGEORUD LLP',
    title: '102 km ore haulage road for KazGeorud LLP',
    client: 'KazGeorud LLP · Limannoe deposit',
    location: 'Aktobe region · Koktau village — Limannoe deposit',
    stage: 'Detail design · road, overpass, minor structures, utility relocations · ref. 30/04-2021',
    lead: (
      <>
        Design of a 102 km category III motor road from Koktau village to the Limannoe deposit —
        built to haul 1,400 thousand tonnes of ore per year. The project includes an overpass on
        piled supports across the Samara — Shymkent republican highway, minor culvert structures,
        and the relocation of crossed power, communication and gas networks.
      </>
    ),
    metrics: [
      { value: '102', unit: 'km', label: 'Category III motor road' },
      { value: '1,400', unit: 'kt', label: 'Ore per year · from the Limannoe deposit' },
      { value: '1', unit: 'overpass', label: 'Across the Samara — Shymkent highway' },
    ],
    scope: [
      'Category III motor road · 102 km, designed for ore haulage',
      'Overpass across the Samara — Shymkent highway · piled supports',
      'Minor culvert structures',
      'Relocation of power, communication and gas networks',
    ],
    drawing: '/portfolio/design/drawing-kazgeorud-road.png',
    drawingCaption: 'Situational road plan · pavement types, cross-sections, slope protection',
    drawingKind: 'Motor road · 30/04-2021',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-kazgeorud-road-profile.png',
      caption: 'Longitudinal road profile with design elevations, grades and culverts',
      kind: 'Motor road · longitudinal profile',
    },
    annex: {
      eyebrow: '15 · KAZGEORUD · OVERPASS ACROSS THE SAMARA — SHYMKENT HIGHWAY',
      title: 'Overpass across the republican highway',
      figures: [
        {
          drawing: '/portfolio/design/drawing-kazgeorud-bridge.png',
          caption: 'Overpass erection scheme · piers 1–4, span installation above the republican highway',
          kind: 'Overpass · piers and spans',
        },
        {
          drawing: '/portfolio/design/drawing-kazgeorud-bridge-pier.png',
          caption: 'Pier section · pile cap and bored-pile foundation (Ø1270/1500 piles)',
          kind: 'Overpass · pier structure',
        },
      ],
    },
  },
];

const KSGK_CASES_EN: DesignProjectSheet[] = [
  {
    index: '16',
    status: 'DELIVERED',
    category: 'KOSPAN ROAD AND BIZHE RIVER BRIDGE · KSGK',
    title: '20 km access road and the Bizhe river bridge (KSGK)',
    client: 'Consolidated Construction Mining Company LLP',
    location: 'Almaty region · Kospan village — production site',
    stage: 'Detail design · category III road, 3×21 m bridge, minor structures · 2024',
    lead: (
      <>
        Design of a 20.2 km category III access road from Kospan village to the production site,
        with a bridge over the Bizhe river at station 11+00. The 3×21 m bridge, 68.2 m in total
        length on cast-in-place piled piers, is designed for the A13 load class. The scope covers
        minor culvert structures, road furnishing and the relocation of crossed 10 and 35 kV
        overhead lines.
      </>
    ),
    metrics: [
      { value: '20.2', unit: 'km', label: 'Category III access road' },
      { value: '68.2', unit: 'm', label: 'Bizhe river bridge · 3×21 m spans' },
      { value: 'A13', unit: '', label: 'Bridge design load class' },
    ],
    scope: [
      'Category III access road · 20.2 km',
      'Bizhe river bridge (3×21 m, 68.2 m total) · cast-in-place piled piers',
      'Minor culvert structures · road furnishing',
      'Relocation of crossed 10 and 35 kV lines · safety barriers',
    ],
    drawing: '/portfolio/design/drawing-ksgk-road.png',
    drawingCaption: 'Situational road plan · pavement types, cross-sections, slope protection',
    drawingKind: 'Motor road · category III',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-ksgk-road-profile.png',
      caption: 'Road cross-section · pavement and subgrade structure',
      kind: 'Motor road · cross-section',
    },
    annex: {
      eyebrow: '16 · KSGK · BIZHE RIVER BRIDGE (STATION 11+00)',
      title: 'Bizhe river bridge · 3×21 m spans',
      figures: [
        {
          drawing: '/portfolio/design/drawing-ksgk-bridge.png',
          caption: 'Longitudinal bridge profile · three 21 m spans, 68.2 m total, piled piers',
          kind: 'Bridge · longitudinal profile',
          band: true,
        },
        {
          drawing: '/portfolio/design/drawing-ksgk-bridge-pier.png',
          caption: 'Pier section · pile cap and bored-pile foundation (Ø1270 piles)',
          kind: 'Bridge · pier structure',
        },
      ],
    },
  },
];

const COLA_CASES_EN: DesignProjectSheet[] = [
  {
    index: '17',
    status: 'DELIVERED',
    category: 'COCA-COLA PLANT · AKTOBE',
    title: 'Utility connection scheme for the Coca-Cola plant',
    client: 'Coca-Cola · beverage production plant',
    location: 'Aktobe region · Ilek water intake area',
    stage: 'Pre-design study · three utility connection options · optimal option selected',
    lead: (
      <>
        Investment-stage support for connecting the Coca-Cola plant near Aktobe to its utilities:
        the nearest connection points for power, gas, water, sewerage, road and railway access
        were identified, three connection scheme options were developed, and the optimal one was
        selected — cutting the investor’s capital costs and construction schedule.
      </>
    ),
    metrics: [
      { value: '3', unit: 'options', label: 'Utility connection schemes' },
      { value: '15', unit: 'ha', label: 'Coca-Cola plant site' },
      { value: '7', unit: 'networks', label: 'Power, gas, water, sewer, road and rail' },
    ],
    scope: [
      'Connection points: 110/10 kV substation, AGRS-300, Ilek water intake, PS-24',
      'Power 3.9 km · gas 0.62 km · water 8.4 km',
      'Sewerage 5.3 km · road 0.43 km · railway 1.81 km',
      'Three connection schemes · optimal option by cost and schedule',
    ],
    drawing: '/portfolio/design/drawing-cola-ito.png',
    drawingCaption: 'Situational utility connection scheme · nearest connection points and distances on satellite base',
    drawingKind: 'Utility scheme · pre-design study',
  },
];

/* All main-portfolio case sheets in brochure order. */
const PROJECT_CASES_EN: DesignProjectSheet[] = [
  ...QAZCEMENT_RAIL_CASES_EN,
  ...ASTEKLO_INFRA_CASES_EN,
  ...URAL_STEEL_CASES_EN,
  ...ZHINISHKE_CASES_EN,
  ...HORGOS_CASES_EN,
  ...AMK_CASES_EN,
  ...NSS_CASES_EN,
  ...SINTEZ_CASES_EN,
  ...MIDAS_CASES_EN,
  ...ARBZ_CASES_EN,
  ...KAZGEORUD_CASES_EN,
  ...KSGK_CASES_EN,
  ...COLA_CASES_EN,
];

export default PROJECT_CASES_EN;

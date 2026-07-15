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
        cement plant site: R65 rails, four culvert structures, crossings of trunk fibre-optic and
        hot-box-detector cables. Following State Expertise review the construction cost was
        optimised from 2,288.7 down to 1,902.7 mln ₸. A separate project delivered the plant’s
        external power supply — 24 MW, a 110/10 kV substation and a 110 kV overhead line.
      </>
    ),
    metrics: [
      { value: '6,733', unit: 'm', label: 'Track length · category III-p' },
      { value: '1,902.7', unit: 'mln ₸', label: 'Approved construction cost' },
      { value: '6', unit: 'mo', label: 'Construction duration' },
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
        Detail design of the plant’s internal railway development: receiving-departure, loading
        and connecting tracks around the clinker store, an elevated unloading track and outdoor
        lighting of the track layout. Construction cost recommended by State Expertise —
        1,466.3 mln ₸.
      </>
    ),
    metrics: [
      { value: '3,119', unit: 'm', label: 'Access and on-site tracks' },
      { value: '1,466.3', unit: 'mln ₸', label: 'Approved construction cost' },
      { value: '6', unit: 'mo', label: 'Construction duration' },
    ],
    scope: [
      'R65 tracks · R65 1/9 turnouts',
      'Elevated unloading track (reinforced concrete)',
      'Outdoor lighting of the track development',
      '5.8 m subgrade · crushed-stone ballast',
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
        Extension of Kenzhaly station tracks to receive the cement plant’s trains: category IV
        track on concrete sleepers with 10/0.4 kV power supply. The station was converted to
        VOL-M electric interlocking — 10 turnouts and 14 signals brought into centralised and
        dispatcher control. Approved cost — 1,729.5 mln ₸, including 570.8 mln of equipment.
      </>
    ),
    metrics: [
      { value: '1,434', unit: 'm', label: 'Station tracks · category IV' },
      { value: '1,729.5', unit: 'mln ₸', label: 'Approved construction cost' },
      { value: '5', unit: 'mo', label: 'Construction duration' },
    ],
    scope: [
      'R65 track on concrete sleepers · crushed stone / gravel',
      'VOL-M interlocking · 10 turnouts, 14 signals, 18 track circuits',
      'Power supply: 10 kV, 0.4 kV, 10/0.4 package substation · communications',
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
        The full external infrastructure of the new Aktobe Steklo glass container plant: off-site
        power supply — a 110/10 kV step-down substation and a double-circuit 110 kV line from the
        Gorodskaya substation, an external railway access track joining the KTZ network at the
        Alzhan siding, an access road, a high- and medium-pressure gas pipeline and external
        sewerage networks. Every part received a positive expertise conclusion (2025).
      </>
    ),
    metrics: [
      { value: '110/10', unit: 'kV', label: 'Step-down substation + double-circuit 110 kV line' },
      { value: '12.6', unit: 'MVA', label: 'Substation capacity · 2×6.3 MVA' },
      { value: '5.8', unit: 'km', label: 'Tracks, roads and utilities in total' },
    ],
    scope: [
      '110/10 kV substation and double-circuit 110 kV line from Gorodskaya',
      'Category V railway track (1,442 m) and category IV access road (1,156 m)',
      'High- and medium-pressure gas pipeline · 1,419 m, PE 100',
      'External sewerage networks · 1,755 m · with a railway crossing',
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
          caption: 'External pressure sewerage plan, 1:1000 · 1,755 m, railway crossing',
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
        1/7 type, and turnout air-blowing. The same project delivered the station utilities —
        0.4 kV power, outdoor lighting (61 masts, 2,217 m of cable), water supply and drainage.
      </>
    ),
    metrics: [
      { value: '68', unit: 'turnouts', label: '1/7 type · converted to CBI' },
      { value: '360', unit: 'k', label: 'Wheels per year · complex capacity' },
      { value: '0.4', unit: 'kV', label: 'Station power networks and outdoor lighting' },
    ],
    scope: [
      'Marten station demolition · Kolesoprokatnaya station construction',
      'Computer-based interlocking · 68 turnouts of the 1/7 type',
      'Two-storey combined interlocking post · category I power supply',
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
        Category II-p tracks on R65S rails with 1/9 turnouts, single-layer crushed-stone ballast
        reinforced with Tensar geogrid. Designed to the technical conditions of the KTZ national
        railway.
      </>
    ),
    metrics: [
      { value: '10', unit: 'tracks', label: 'Sorting railway tracks' },
      { value: 'WRB', unit: '', label: 'Uncoupled wagon repair base' },
      { value: '9', unit: 'mo', label: 'Construction · category II-p, R65S rails' },
    ],
    scope: [
      'Ten sorting railway tracks within the dry port',
      'Wagon repair base with a working area and loading ramp',
      'R65S rails, R65 1/9 turnouts, category II-p',
      'Single-layer crushed-stone ballast reinforced with Tensar geogrid',
    ],
    drawing: '/portfolio/design/drawing-horgos-rail-1.png',
    drawingCaption: 'Track development plan, 1:1000 · turnout throats and sorting tracks',
    drawingKind: 'Railway track · 16/08-2021',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-horgos-rail-2.png',
      caption: 'Track development plan, continued · sorting tracks and buffer stops',
      kind: 'Railway track · 16/08-2021',
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
    location: 'Koktau village, Khromtau district, Aktobe region · junction at Kimpersai station',
    stage: 'Detail design · general track development plan, 1:2000 · ref. 5-1',
    lead: (
      <>
        Detail design of railway stabling tracks on the connecting section between the Kyzyl-Kain
        industrial station and Rudnaya station, with on-site reconstruction of the Rudnaya station
        tracks of the Aktobe Copper Company. The junction connects to Kimpersai station of the
        national network.
      </>
    ),
    metrics: [
      { value: '8.9', unit: 'km', label: 'Track development · new tracks and reconstruction' },
      { value: '9', unit: 'turnouts', label: 'R65 turnouts, 1/9 type' },
      { value: '2', unit: 'stations', label: 'Kyzyl-Kain and Rudnaya · Kimpersai junction' },
    ],
    scope: [
      'New access, connecting and elevated tracks · 4.2 km, R65',
      'Wagon stabling tracks and connecting-track rebuild · 4.8 km',
      'On-site reconstruction of Rudnaya station tracks',
      'Nine R65 1/9 turnouts · junction at Kimpersai station',
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
    category: 'NEFTESTROYSERVICE GAS PIPELINE · NSS',
    title: 'High-pressure gas pipeline for NefteStroyService LLP',
    client: 'NefteStroyService LTD LLP (NSS)',
    location: 'Aktobe region',
    stage: 'Detail design · gas pipeline plan and longitudinal profile',
    lead: (
      <>
        Design of a high-pressure gas pipeline for NefteStroyService: a Ø108 steel and
        polyethylene pipeline for a working pressure of 3.8 MPa with a cabinet-type gas control
        unit and a Ø63/57 low-pressure distribution pipeline at 0.2 MPa. The route crosses a
        railway track and overhead power lines.
      </>
    ),
    metrics: [
      { value: 'Ø108', unit: 'mm', label: 'High-pressure pipeline · steel + PE' },
      { value: '3.8', unit: 'MPa', label: 'Working pressure' },
      { value: 'GCU', unit: '', label: 'Gas control unit · outlet at 0.2 MPa' },
    ],
    scope: [
      'High-pressure Ø108 pipeline (steel + polyethylene), 3.8 MPa',
      'Cabinet-type gas control unit · reduction to 0.2 MPa',
      'Ø63/57 low-pressure distribution pipeline (0.2 MPa)',
      'Railway and overhead power line crossings',
    ],
    drawing: '/portfolio/design/drawing-nss-gas-plan.png',
    drawingCaption: 'Gas pipeline plan · route, control unit, tie-in points and crossings',
    drawingKind: 'Gas supply · pipeline plan',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-nss-gas-profile.png',
      caption: 'Longitudinal pipeline profile with design elevations and burial depth',
      kind: 'Gas supply · longitudinal profile',
    },
  },
];

const SINTEZ_CASES_EN: DesignProjectSheet[] = [
  {
    index: '09',
    status: 'DELIVERED',
    category: 'SINTEZ URAL ACCESS TRACKS · URALSK',
    title: 'Power supply and lighting of the Sintez Ural access tracks',
    client: 'Sintez Ural LLP · 20,000 t/year blending plant',
    location: 'West Kazakhstan region, Uralsk, Kardon · Kardon station',
    stage: 'Detail design · 0.4 kV power supply and outdoor lighting of the access tracks',
    lead: (
      <>
        Design of the 0.4 kV power supply and outdoor lighting for the access railway tracks,
        dead-end and turnouts of Sintez Ural LLP. 380/220 V supply of the tracks and winch from
        the power unit’s 0.4 kV switchgear, outdoor lighting with LED floodlights on SV-95
        concrete masts, VBbShv-1 cable networks in trenches with mast earthing.
      </>
    ),
    metrics: [
      { value: '0.4', unit: 'kV', label: 'Track and winch power supply · 380/220 V' },
      { value: '150', unit: 'W', label: 'LED floodlights · SV-95 masts' },
      { value: 'III', unit: 'cat.', label: 'Power supply reliability category' },
    ],
    scope: [
      '0.4 kV (380/220 V) supply of tracks, dead-end, turnouts and winch',
      'Feed from the power unit’s 0.4 kV switchgear · control cabinets',
      'Outdoor lighting: 150 W LED floodlights on SV-95 masts',
      'VBbShv-1 cables in trenches · lighting mast earthing',
    ],
    drawing: '/portfolio/design/drawing-sintez-plan.png',
    drawingCaption: 'Access track power and lighting plan · cable routes, masts, crossings',
    drawingKind: '0.4 kV power supply · plan',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-sintez-lighting.png',
      caption: 'Track outdoor lighting plan · SV-95 masts, LED floodlights',
      kind: 'Outdoor lighting · plan',
    },
  },
];

const MIDAS_CASES_EN: DesignProjectSheet[] = [
  {
    index: '12',
    status: 'DELIVERED',
    category: 'SINEMIDASSTROY LLP · ATYRAU REGION',
    title: '10 kV switchgear for SineMidasStroy LLP',
    client: 'SineMidasStroy LLP',
    location: 'Atyrau region · railway line (Ganyushkino · Akkistau · Zaburunye)',
    stage: 'Detail design · 10 kV switchgear plan · ref. 03-22',
    lead: (
      <>
        Design of a 10 kV distribution switchgear at a railway station: nine bays (including
        reserves) feeding the automatic block signalling and the power supply points of
        Ganyushkino and Akkistau, plus the Zaburunye feeder. The scope covers 10 kV overhead
        lines, package cabinets and distribution boards arranged by the station building,
        communications house and depot.
      </>
    ),
    metrics: [
      { value: '10', unit: 'kV', label: 'Distribution switchgear' },
      { value: '9', unit: 'bays', label: '10 kV bays · feeders and reserve' },
      { value: 'ABS', unit: '', label: 'Feeds block signalling and line supply points' },
    ],
    scope: [
      '10 kV switchgear with nine bays (feeders and reserve) · cabinets and boards',
      'Supply of the Ganyushkino and Akkistau automatic block signalling',
      'Supply of the Ganyushkino and Akkistau line power points',
      '10 kV overhead lines (6 and 3 wires) · Zaburunye feeder',
    ],
    drawing: '/portfolio/design/drawing-midas-plan-1.png',
    drawingCaption: '10 kV switchgear plan · bays, block-signalling and power-point feeders',
    drawingKind: 'Power supply · 10 kV switchgear · 03-22',
    extraDrawing: {
      drawing: '/portfolio/design/drawing-midas-plan-2.png',
      caption: 'Plan, continued · 10 kV overhead lines, package cabinets, layout by the station and depot',
      kind: 'Power supply · 10 kV switchgear · 03-22',
    },
  },
];

const ARBZ_CASES_EN: DesignProjectSheet[] = [
  {
    index: '13',
    status: 'DELIVERED',
    category: 'ARBZ LLP INDUSTRIAL SITE',
    title: 'External water supply and sewerage networks for ARBZ LLP',
    client: 'ARBZ LLP · industrial site',
    location: 'Aktobe region',
    stage: 'Detail design · external water supply and sewerage network plan',
    lead: (
      <>
        Design of the external water supply, sewerage and fire-fighting networks of the ARBZ
        industrial site. The solution includes Ø400/450 steel pressure mains and a Ø110
        polyethylene water line with manholes, outdoor fire hydrants, an industrial effluent
        treatment facility and concrete drainage channels — tied to the plant’s general layout.
      </>
    ),
    metrics: [
      { value: 'Ø450', unit: 'mm', label: 'Steel pressure mains of the external networks' },
      { value: 'PE 110', unit: '', label: 'Polyethylene water line · fire hydrants' },
      { value: 'ETF', unit: '', label: 'Effluent treatment · plant drainage' },
    ],
    scope: [
      'Ø400/450 steel pressure mains · water manholes',
      'Ø110 polyethylene water line · connection points',
      'Outdoor fire-fighting hydrants',
      'Effluent treatment facility · concrete drainage channels',
    ],
    drawing: '/portfolio/design/drawing-arbz-plan.png',
    drawingCaption: 'External water and sewerage network plan · mains, manholes, hydrants, treatment facility',
    drawingKind: 'External networks · plan',
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

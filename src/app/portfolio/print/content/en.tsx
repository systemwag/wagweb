import styles from '../print.module.css';
import type { PrintContent, PrintTestimonial } from './types';

/* ─────────────────────────────────────────────────────────────────
   English brochure copy — extracted verbatim from the original
   src/app/portfolio/print/en/page.tsx. Do not reword without
   rebuilding public/portfolio/portfolio-en.pdf (see CLAUDE.md).
   ───────────────────────────────────────────────────────────────── */

// NOTE: client letters were originally addressed to the legacy juridical name
// «West Capital Construction LLP». Per request, quotes display the group name
// «West Arlan Group». The page-2 legal-entities card keeps the real subsidiary.
const PRINT_TESTIMONIALS: PrintTestimonial[] = [
  { client: 'Aktobe Industrial Zone LLP', signatory: 'A. N. Tulebayev', role: 'Director', date: 'January 5, 2020', category: 'Maintenance · 4.5 km',
    quote: 'Throughout our cooperation, the routine maintenance of the access railway tracks has been carried out by qualified specialists. All defects are remedied properly and on time. The professionalism of West Arlan Group staff gives us confidence in safe operation.' },
  { client: 'Aktobe Copper Company LLP', signatory: 'N. S. Bondarenko', role: 'General Director', category: 'Re-decking · 63 km',
    quote: 'The highly qualified personnel approached the assigned tasks responsibly and completed the work to a high standard within the contractual deadlines. West Arlan Group has all the equipment and machinery required for both dismantling and construction & installation works.' },
  { client: 'Aktobe Copper Company LLP', signatory: 'N. S. Bondarenko', role: 'General Director', category: 'Maintenance · 7.2 + 20 km',
    quote: 'Maintaining a track network of this scale demands great responsibility and professional attention. We entered into a contract with West Arlan Group because their specialists have proven to be professional and conscientious workers.' },
  { client: 'Aktobe Copper Company LLP', signatory: 'N. S. Bondarenko', role: 'General Director', date: 'September 21, 2018', category: 'Reconstruction · Rudnaya station',
    quote: 'The company staff resolved the many issues that arose during construction promptly and to a high standard. West Arlan Group patiently coordinated every subsequent construction stage with the management of Aktobe Copper Company LLP. We recommend them as a reliable team for projects of any complexity.' },
  { client: 'Zerde-Keramika Aktobe LLP', signatory: 'E. R. Tleukabylov', role: 'Director', date: 'September 2021', category: 'Construction · 481 m',
    quote: 'Given the diligence and responsibility of West Arlan Group staff and their serious approach to the work, we are confident in the safe operation of the railway track and look forward to further cooperation.' },
  { client: 'Zerde-Keramika Aktobe LLP', signatory: 'E. R. Tleukabylov', role: 'Director', category: 'Dismantling · 6.7 km',
    quote: 'Your specialists completed the work to a high standard and on schedule, confirming your reliability and competence. As your company has worked with us on construction, maintenance and now dismantling, we express our readiness for continued cooperation.' },
  { client: 'Faeton Company LLP', signatory: 'V. Yu. Rusmanova', role: 'Director', date: 'October 20, 2018', category: 'Maintenance · 70 m ramp',
    quote: 'West Arlan Group staff are distinguished by their responsibility, integrity and professionalism. Inspection, examination and rectification of defects on the access track are carried out properly and on time. Their work gives us confidence in the safe operation of the track.' },
  { client: 'AltynNuran LLP', signatory: 'Zh. N. Murzabekov', role: 'Director', date: 'Since September 2019', category: 'Maintenance · 115 m',
    quote: 'All routine maintenance of the railway track and structures was performed by highly qualified specialists. Given the diligence and responsibility of the staff, we are confident in safe operation and look forward to further cooperation.' },
  { client: 'Sintez Ural LLP', signatory: 'S. A. Morozov', role: 'Director', date: 'Since November 2024', category: 'Construction · 500 m',
    quote: 'We would like to note the professionalism and responsibility of West Arlan Group staff, as well as the efficiency with which issues were resolved during construction. A high level of organization allowed the facility to be commissioned to a high standard and on time.' },
  { client: 'Portal KZ LLP', signatory: 'M. M. Nyshanov', role: 'Director', category: 'Construction · Nikeltau station',
    quote: 'Construction was carried out in strict compliance with all terms of the contract: the work was completed on time and in accordance with the technical specification. A sound practice of efficient interaction in coordinating technical decisions has developed between our organizations.' },
  { client: 'Sole Proprietor B. S. Zhanazhanov', signatory: 'B. S. Zhanazhanov', role: 'Sole Proprietor', category: 'Construction · 200 m',
    quote: 'Thanks to the professional approach of West Arlan Group staff, the construction of our private-use railway track was completed ahead of schedule, while the quality and reliability of the completed facility deserve the highest marks.' },
  { client: 'Neftestroyservis LTD LLP · NSS', signatory: 'R. K. Otarov', role: 'Director', date: 'November 1, 2022', category: 'Construction · Tendyk station',
    quote: 'The work was performed in accordance with applicable building codes and regulations, the technical specification and the terms of the contract, to proper quality and within the established deadline. West Arlan Group has proven itself a highly professional company.' },
  { client: 'Private Customer K. A. Ni', signatory: 'K. A. Ni', role: 'Private Customer', category: 'Construction · Siding 41',
    quote: 'The company has proven to be a diligent contractor that meets its contractual obligations with excellent quality of work and within the set deadlines. The modern construction methods it employs comply with the requirements of SN RK, SP RK and GOST.' },
  { client: 'Sine Midas Stroy JV LLP', signatory: 'B. T. Imankulova', role: 'Executive Director', category: 'Dismantling · 850 m',
    quote: 'We cannot fail to note the high professionalism of West Arlan Group staff and their utmost responsibility in carrying out the assigned tasks. The quality of the work leaves no doubt, and we hope for even closer cooperation.' },
  { client: 'PGS-Tamdy LLP', signatory: 'A. K. Ispanov', role: 'Director', category: 'Construction · Tamdy station',
    quote: 'The professional and responsible approach of West Arlan Group staff ensured the construction of our private-use railway track into a permanent line during a track-possession window. All approvals with the branches of JSC NC KTZ were handled in a timely manner.' },
];

const EN_CONTENT: PrintContent = {
  cover: {
    eyebrow: 'CORPORATE PROFILE · 2026',
    issue: 'AKTOBE · SINCE 2010',
    badges: [
      { level: 'Category I', area: 'CIW' },
      { level: 'Category I', area: 'Engineering' },
      { level: 'Accreditation', area: 'Inspection of buildings & structures' },
      { level: 'Class 1', area: 'Environmental engineering: EIA & SPZ' },
    ],
    tagline: [
      { main: 'Surveys' },
      { main: 'Engineering' },
      { main: 'Construction' },
    ],
    binLabel: 'BIN',
  },

  about: {
    eyebrow: 'ABOUT THE COMPANY',
    title: (
      <>
        We build<br />
        <span className={styles.titleAccent}>the nation&rsquo;s infrastructure</span>
      </>
    ),
    statSmrLabel: 'projects',
    statPdLabel: 'engineering works',
    statSectorsLabel: 'sectors',
    statRegionsLabel: 'years in business',
    lead: (
      <>
        <span className={styles.aboutColLede}>Full cycle</span> — from surveys and engineering through construction to turnkey commissioning.
        Transport, energy, oil &amp; gas and industrial infrastructure across Kazakhstan and Russia:
        chief project engineers, design engineers, surveyors, estimators, foremen and signalling engineers working on projects
        that serve for decades.
      </>
    ),
    industriesLabel: 'SECTORS',
    industryChips: [
      'Railways & roads',
      'Pipelines',
      'Power lines & low-current systems',
      'Industrial facilities',
      <>Engineering networks<span className={styles.industryCardSub}>gas · water supply · sewerage · power · heat supply</span></>,
    ],
    missionLabel: 'OUR MISSION',
    mission: (
      <>
        <span className={styles.aboutColLede}>To build reliable infrastructure for the future of Kazakhstan.</span>{' '}
        Operational safety, durability and precise adherence to schedules are commitments
        we set in every contract. Technical discipline and engineering precision are the
        foundation of our reputation.
      </>
    ),
    approachLabel: 'OUR APPROACH',
    approach: (
      <>
        <span className={styles.aboutColLede}>One contract — one party accountable.</span>{' '}
        The group delivers the entire cycle in-house:
        engineering surveys, engineering and working documentation, clearance through the State Expert Review (GosExpertiza),
        construction &amp; installation works and commissioning. Timelines and quality are backed by Category I licenses
        and state accreditations of the authorized bodies.
      </>
    ),
    legalLabel: ' GROUP LEGAL ENTITIES',
    hqRole: 'Holding company · group coordination',
    hqMeta: 'LLP · BIN 100340009758 · Aktobe',
    legalCards: [
      { badge: 'CIW', name: 'West Capital Construction LLP', role: 'Group member · construction & installation works' },
      { badge: 'DES', name: 'Global Construction Project', role: 'Group member · engineering activities' },
      { badge: 'S&M', name: 'West Altyn Kyran', role: 'Group member · supply & maintenance' },
      { badge: 'LOG', name: 'West Logistics', role: 'Group member · logistics' },
    ],
    legalNote: (
      <>
        All divisions operate under unified management and a shared quality policy: Category I
        licenses, state accreditations valid through 2028 and end-to-end control at every stage —
        from engineering through commissioning.
      </>
    ),
  },

  scale: {
    eyebrow: 'SCALE & GEOGRAPHY OF OPERATIONS',
    title: (
      <>
        Over <span className={styles.titleAccentGold}>sixteen</span> years<br />
        of work
      </>
    ),
    lead: (
      <>
        The infrastructure that carries the nation&rsquo;s economy, the networks that power its cities, the industrial
        facilities that sustain production — across the regions of Kazakhstan and beyond.
      </>
    ),
    statBuildLabel: 'Construction',
    statMaintenanceLabel: <>Maintenance<br />&amp; repair</>,
    statPdLabel: <>Engineering<br />works</>,
    statRegionsLabel: <>Years in<br />business</>,
    statCountriesLabel: 'Countries',
    peopleTitle: (
      <>
        <span className={styles.titleAccentGold}>The people</span> who build
      </>
    ),
    // Team composition — mirrors the «People who build» block on the website.
    people: [
      { num: '4+',  label: 'Top management',       desc: 'CEO and senior leadership' },
      { num: '15+', label: 'Engineering department', desc: 'Design engineers, chief project engineers, estimators' },
      { num: '10+', label: 'Survey department',    desc: 'Surveyors, geologists' },
      { num: '50+', label: 'Construction crews',   desc: 'Foremen, signalling engineers, track engineers, road masters, general construction foremen' },
    ],
  },

  iso: {
    // ⚠️ ISO page removed from the brochure 2026-07-16: the certificates (ST RK ISO
    // 9001/14001/45001) were issued to Global Construction Project LLP and expired
    // 19.06.2023. The block below is not rendered (PrintBrochure) — kept for the
    // PrintContent type; restore the page after recertification.
    eyebrow: 'CERTIFICATES · ISO',
    title: (
      <>
        International<br />
        <span className={styles.titleAccent}>quality standards</span>
      </>
    ),
    badgeLabel: <>ISO<br />CERTIFICATES</>,
    lead: (
      <>
        The group is certified to international standards of quality and environmental management.
        Process audits are conducted regularly — securing a{' '}
        <span className={styles.aboutColLede}>single standard of work</span> across all three
        group legal entities.
      </>
    ),
    cards: [
      { name: 'ISO 9001 · Quality Management', detail: 'Quality management system' },
      { name: 'ISO 9001 · KZ', detail: 'Quality certificate of the Republic of Kazakhstan' },
      { name: 'ISO 14001 · Environmental', detail: 'Environmental management' },
      { name: 'ISO 9001:2016', detail: 'Process audit · recertification' },
    ],
  },

  licNumberPrefix: 'No. ',
  licenses: [
    {
      eyebrow: 'LICENSE · CONSTRUCTION',
      number: '25008103',
      date: '14.03.2025',
      titleAccent: 'Construction & installation',
      titleMain: 'works',
      badgeNum: 'I',
      badgeLabel: <>Category<br />CIW</>,
      scan: '/licenses/license-smr.jpg',
      meta: [
        { label: 'ISSUING AUTHORITY', value: 'GASK Department, Aktobe Region' },
        { label: 'FIRST ISSUED', value: '13.07.2010' },
        { label: 'VALID UNTIL', value: 'Termless · class 1' },
        { label: 'SCOPE', value: 'All Category I CIW types' },
      ],
    },
    {
      eyebrow: 'LICENSE · ENGINEERING',
      number: '25031072',
      date: '05.09.2025',
      titleAccent: 'Engineering',
      titleMain: 'activities',
      badgeNum: 'I',
      badgeLabel: <>Category<br />Design</>,
      scan: '/portfolio/page7_img3.jpeg',
      meta: [
        { label: 'ISSUING AUTHORITY', value: 'GASK Department, Aktobe Region' },
        { label: 'FIRST ISSUED', value: '28.04.2010' },
        { label: 'VALIDITY', value: 'Unlimited · class 1' },
        { label: 'SCOPE', value: 'Full-cycle engineering documentation' },
      ],
    },
    {
      eyebrow: 'LICENSE · ENVIRONMENTAL',
      number: '02962R',
      date: '22.09.2025',
      titleAccent: 'Environmental',
      titleMain: 'protection',
      badgeNum: '1',
      badgeLabel: <>Class<br />ENV</>,
      scan: '/portfolio/page7_img1.jpeg',
      meta: [
        { label: 'ISSUING BODY', value: 'Ministry of Ecology & Natural Resources of the RK' },
        { label: 'PLACE OF ISSUE', value: 'Astana' },
        { label: 'SPECIAL TERMS', value: 'Non-transferable' },
        { label: 'SCOPE', value: 'EIA section within design documentation & sanitary protection zones (SPZ)' },
      ],
    },
  ],

  accreditations: {
    eyebrow: 'ACCREDITATION CERTIFICATES · 2026',
    title: (
      <>
        <span className={styles.titleAccent}>Accreditations</span><br />
        of the group
      </>
    ),
    badgeLabel: <>CERTIFICATES<br />UNTIL 2028</>,
    lead: (
      <>
        In 2026 the group renewed and{' '}
        <span className={styles.aboutColLede}>expanded its accreditations</span>{' '}
        with the authorised body — technical inspection, construction supervision and project
        management on technically and technologically complex facilities of responsibility
        levels I and II. All certificates are valid until 26.06.2028.
      </>
    ),
    cards: [
      {
        number: 'No. KZ83VWC00283699',
        scope: 'Expert works on technical inspection of the reliability and stability of buildings & structures',
        level: 'Responsibility levels I & II',
        holder: 'West Arlan Group',
        validUntil: 'until 26.06.2028',
        scan: '/licenses/accr-tech-survey.jpg',
      },
      {
        number: 'No. KZ56VWC00283700',
        scope: 'Engineering services for construction supervision on technically & technologically complex facilities',
        level: 'Responsibility level I',
        holder: 'West Arlan Group',
        validUntil: 'until 26.06.2028',
        scan: '/licenses/accr-supervision-wag.jpg',
      },
      {
        number: 'No. KZ29VWC00283701',
        scope: 'Project management in architecture, urban planning and construction',
        level: 'GASK Department, Aktobe Region',
        holder: 'West Arlan Group',
        validUntil: 'until 26.06.2028',
        scan: '/licenses/accr-project-mgmt.jpg',
      },
      {
        number: 'No. KZ02VWC00283702',
        scope: 'Engineering services for construction supervision on technically & technologically complex facilities',
        level: 'Responsibility level I',
        holder: 'Global Construction Project',
        validUntil: 'until 26.06.2028',
        scan: '/licenses/accr-supervision-gcp.jpg',
      },
    ],
  },

  dirDesign: {
    eyebrow: 'DIVISION 01 · ENGINEERING ACTIVITIES',
    title: (
      <>
        <span className={styles.titleAccentGold}>Engineering</span><br />
        and site surveys
      </>
    ),
    badgeTop: 'CAT. I',
    badgeBottom: 'SINCE 2010',
    lead: (
      <>
        <span className={styles.aboutColLede}>Category I license</span>{' '}
        for engineering activities since 2010. A complete engineering documentation package for the State Expert Review (GosExpertiza) —
        roads and railways, trunk pipelines, power transmission lines, industrial facilities and
        engineering networks.
      </>
    ),
    svcs: [
      { num: '01', title: 'Comprehensive engineering surveys', desc: 'Geodetic, geological, environmental, hydrological and archaeological surveys to substantiate engineering decisions.' },
      { num: '02', title: 'Industrial facilities',             desc: 'Process engineering of plants, factories and industrial production complexes.' },
      { num: '03', title: 'Residential & civil buildings',     desc: 'Engineering of residential and civil buildings and structures in line with applicable codes and standards.' },
      { num: '04', title: 'Transport infrastructure',          desc: 'Engineering of transport, communications and utility facilities, including road and railway infrastructure.' },
      { num: '05', title: 'Engineering systems & networks',    desc: 'Engineering documentation for utility systems: power, water and heat supply, sewerage and low-current networks.' },
      { num: '06', title: 'Reconstruction & strengthening',    desc: 'Structural engineering for the reconstruction of buildings and structures and the strengthening of load-bearing elements.' },
    ],
    processLabel: 'PROJECT WORKFLOW STAGES',
    process: [
      { roman: 'I',  title: 'Surveys',         meta: 'Geodesy · geology · hydrology' },
      { roman: 'II', title: 'Engineering docs', meta: 'Engineering-estimate & working documentation' },
      { roman: 'III',title: 'State Review',    meta: 'GosExpertiza approval' },
      { roman: 'IV', title: 'Author supervision', meta: 'Construction oversight · technical supervision' },
    ],
    footerLabel: 'ENGINEERING WORKS IN THE REGISTRY',
  },

  dirBuild: {
    eyebrow: 'DIVISION 02 · CONSTRUCTION & INSTALLATION WORKS',
    title: (
      <>
        <span className={styles.titleAccentTeal}>Construction & installation</span><br />
        works
      </>
    ),
    badgeTop: 'CAT. I',
    badgeBottom: 'SINCE 2010',
    lead: (
      <>
        <span className={styles.aboutColLedeTeal}>Category I license</span>{' '}
        for CIW since 2010. Construction across five infrastructure
        sectors — from roads and railways to trunk pipelines, power transmission lines,
        industrial facilities and engineering networks.
      </>
    ),
    svcs: [
      { num: '01', title: 'Construction, major repair & reconstruction', desc: 'Full-cycle construction, major repair and reconstruction of production and industrial facilities.' },
      { num: '02', title: 'Cost estimation',                   desc: 'Preparation of estimate documentation and costing of construction & installation works to current norms.' },
      { num: '03', title: 'PPR, GPR & POS development',        desc: 'Work execution plan, work schedule and construction organization plan.' },
      { num: '04', title: 'Engineering support',              desc: 'Support of industrial construction: contractor coordination and schedule and quality control.' },
      { num: '05', title: 'Technical documentation management', desc: 'Maintenance and support of the full package of construction technical documentation.' },
      { num: '06', title: 'Handover & commissioning',          desc: 'Organization of handover and commissioning procedures and liaison with supervisory authorities.' },
    ],
    processLabel: 'ON-SITE WORK STAGES',
    process: [
      { roman: 'I',  title: 'Preparation',     meta: 'Mobilization · temporary utilities' },
      { roman: 'II', title: 'Earthworks',      meta: 'Excavation · embankment · subgrade preparation' },
      { roman: 'III',title: 'Superstructure',  meta: 'Track panel · surfacing & pavement · installation' },
      { roman: 'IV', title: 'Handover & start-up', meta: 'Commissioning · acceptance certificate' },
    ],
    footerLabel: 'CIW PROJECTS IN THE REGISTRY',
  },

  qr: {
    eyebrow: 'FULL REGISTRY · ONLINE',
    title: (
      <>
        <span className={styles.titleAccent}>Portfolio</span><br />
        of projects and works
      </>
    ),
    badgeLabel: <>RECORDS<br />IN THE REGISTRY</>,
    lead: (
      <>
        An up-to-date project registry with the full scope of works, clients, timelines and statuses — on our website.
        The registry is updated as new projects are completed and clear expert review.
      </>
    ),
    cards: [
      { title: 'Construction works', countLabel: <>CIW projects<br />· 2015—2026</>, hint: 'Scan with your phone camera' },
      { title: 'Maintenance', countLabel: <>projects<br />· maintenance</>, hint: 'Scan with your phone camera' },
      { title: 'Engineering works', countLabel: <>works<br />· engineering &amp; feasibility</>, hint: 'Scan with your phone camera' },
    ],
    infoLabel: ' WHAT YOU’LL FIND IN THE REGISTRY',
    infoChips: [
      { title: ' Scope of works', desc: 'Volumes, timelines and status for each project' },
      { title: ' Clients', desc: 'KTZ, industrial zones, private clients' },
      { title: ' Geography', desc: 'Map with coordinates and regions' },
    ],
    remark: <>Next — selected design and construction projects</>,
    remarkTag: 'PROJECT SHOWCASE',
  },

  testimonials: {
    eyebrow: 'CLIENT TESTIMONIALS',
    title: (
      <>
        <span className={styles.titleAccent}>What our clients</span><br />
        say
      </>
    ),
    lead: (
      <>
        Our clients&rsquo; own words are the truest measure of our work. Letters of appreciation accumulated over years
        of cooperation confirm what we set in every contract: quality, adherence to schedules and
        accountability at every stage.
      </>
    ),
    quoteOpen: '“',
    quoteClose: '”',
    items: PRINT_TESTIMONIALS,
  },

  partners: {
    eyebrow: 'PARTNERS & CLIENTS · REGISTRY EXCERPT',
    title: (
      <>
        <span className={styles.titleAccent}>Trusted by</span><br />
        the country&rsquo;s largest companies
      </>
    ),
    categories: [
      'State corporations',
      'Oil & gas',
      'Industrial zones',
    ],
    lead: (
      <>
        Our clients include{' '}
        <span className={styles.aboutColLede}>state operators (JSC NC KTZ, SPK)</span>,
        metallurgical and oil &amp; gas holdings, industrial zones and private enterprises across
        Kazakhstan and Russia.
      </>
    ),
    items: [
      { file: '9.png',          name: 'Kazakhstan Temir Zholy' },
      { file: '1.png',          name: 'Russian Copper Company' },
      { file: '5554453.png',    name: 'Ural Sintez' },
      { file: '645b7c47-e4a5-4c84-b1ef-17bd24e7e09d.jpg', name: 'Sintez Group' },
      { file: '4.png',          name: 'Shubarkol Premium' },
      { file: '7.png',          name: 'Altynex' },
      { file: 'metprom-logo-rus-Photoroom.png',           name: 'Metprom' },
      { file: '1637e7d5-4f7c-42f8-a84d-5aeef15cf0a6.jpg', name: 'Tengizchevroil' },
      { file: '20bd4962-9777-4243-9b6d-e953b080c142.jpg', name: 'Khorgos Gateway' },
      { file: 'QB_-01_1__.png', name: 'Qazaq Bitum' },
      { file: '5.png',          name: 'NSS' },
      { file: '3.png',          name: 'Sine Midas Stroy' },
      { file: '6.png',          name: 'Aktobe Glass' },
      { file: 'Снимок экрана 2025-06-21 162017-Photoroom.png', name: 'SPK Aktobe' },
      { file: '7a29c2e4-bc43-4817-8212-f7e985ee9929.jpg', name: 'SPS Energo' },
      { file: '2.png',          name: 'Zerde Keramika' },
    ],
    repeatLabel: 'CLIENTS WITH REPEAT CONTRACTS',
    registryLabel: 'FULL CLIENT REGISTRY · www.westarlangroup.kz',
  },

  contacts: {
    eyebrow: 'CONTACTS · AKTOBE OFFICE',
    title: (
      <>
        <span className={styles.titleAccentGold}>Ready</span><br />to collaborate
      </>
    ),
    badgeTopSmall: 'RESPONSE TIME',
    badgeNumBig: <>1<span>day</span></>,
    badgeBottom: 'MON — FRI',
    lead: (
      <>
        Tell us about your project — surveys, engineering or construction &amp; installation — and receive a commercial proposal.{' '}
        <span className={styles.aboutColLede}>Support from the first call through to commissioning.</span>
      </>
    ),
    rows: [
      { label: 'OFFICE PHONE', value: '8 (7132) 538-288' },
      { label: 'EMAIL', value: 'west_arlan-group@mail.ru' },
      { label: 'OFFICE ADDRESS', value: <>Aktobe, Kazangap St.,<br />57V, office 34</> },
      { label: 'WORKING HOURS', value: 'Mon — Fri · 09:00 — 18:00 (GMT+5)' },
    ],
    teamLabel: 'DIRECT MANAGEMENT CONTACTS',
    team: [
      { num: '01', role: 'General Director',          name: 'Aronov Ayan Sadirzhanovich',    phone: '+7 (777) 669-99-89' },
      { num: '02', role: 'Director, Engineering Group', name: 'Valeyev Aleksey Sergeyevich',    phone: '+7 (775) 645-90-51' },
      { num: '03', role: 'Production Director',       name: 'Pruss Albert Ruslanovich',      phone: '+7 (747) 135-14-92' },
      { num: '04', role: 'Chief Project Engineer',    name: 'Shturmilov Valentin Petrovich', phone: '+7 (771) 229-38-78' },
    ],
    legalLabel: 'LEGAL ENTITY',
    legalValue: 'West Arlan Group LLP · BIN 100340009758',
    licensesLabel: 'LICENSES',
    licensesValue: 'CIW No. 25008103 · DES No. 25031072 · ENV No. 02962R',
    siteLabel: 'COMPANY WEBSITE',
  },

  closing: {
    eyebrow: 'MANIFESTO · WAG',
    quote: (
      <>
        Every project is a <span className={styles.titleAccentGold}>commitment</span> for decades.
      </>
    ),
    byline: (
      <>
        We design as if we were the ones to build, and build as if we were the ones to maintain.
        Every completed project remains under our responsibility — a year later, five years
        later, twenty years later. Behind this stand the repeat signatures of our clients and a
        reputation built over decades.
      </>
    ),
  },
};

export default EN_CONTENT;

import type { Metadata } from 'next';
import Footer from '@/components/Footer/Footer';
import { getDesignProjects } from '@/lib/data';
import DesignTable from './DesignTable';
import styles from './design.module.css';

export const metadata: Metadata = {
  title: 'Проектирование и разработка ПСД',
  description: 'Проектирование инженерных сетей и промышленных объектов в Казахстане: рабочие проекты, ПСД, изыскания, техническая документация. 87 выполненных проектных работ.',
};

export const dynamic = 'force-dynamic';

/* Русское склонение по числу: 1 цикл, 2–4 цикла, 5+ циклов.
   Раньше формы были зашиты жёстко и врали на любом количестве, кроме 2–4. */
function plural(n: number, one: string, few: string, many: string) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  const mod10 = n % 10;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export default async function DesignPage() {
  const projects = await getDesignProjects();

  const fullCycle    = projects.filter(p => p.category === 'full-cycle').length;
  const design       = projects.filter(p => p.category === 'design').length;
  const docs         = projects.filter(p => p.category === 'documentation').length;
  const feasibility  = projects.filter(p => p.category === 'feasibility').length;

  return (
    <>
      <main className={styles.main}>

        <section className={`${styles.hero} filmgrain`}>
          <div className="hero-hairline" aria-hidden="true" />
          <div className="container hero-parallax">
            <span className="section-label hero-reveal-1">Проектная деятельность</span>
            <h1 className={`heading-1 ${styles.heroTitle} hero-reveal-2`}>
              Выполненные<br />
              <span className="text-gradient-gold">проектные работы</span>
            </h1>
            <p className={`${styles.heroDesc} hero-reveal-3`}>
              {projects.length} {plural(projects.length, 'объект', 'объекта', 'объектов')} в реестре —{' '}
              {fullCycle} {plural(fullCycle, 'полный цикл', 'полных цикла', 'полных циклов')},{' '}
              {design} {plural(design, 'рабочий проект', 'рабочих проекта', 'рабочих проектов')},{' '}
              {docs} {plural(docs, 'техническая документация', 'технические документации', 'технических документаций')},{' '}
              {feasibility} ТЭО.
            </p>
          </div>
          <div className={styles.heroGlow} aria-hidden="true" />
        </section>

        <section className={styles.tableSection}>
          <div className="container">
            <DesignTable projects={projects} />
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

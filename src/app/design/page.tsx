import type { Metadata } from 'next';
import Footer from '@/components/Footer/Footer';
import { getDesignProjects } from '@/lib/data';
import DesignTable from './DesignTable';
import styles from './design.module.css';

export const metadata: Metadata = {
  title: 'Проектная деятельность | West Arlan Group',
  description: 'Перечень выполненных проектных работ West Arlan Group: рабочие проекты, изыскания, ПСД, техническая документация для объектов транспортной инфраструктуры Казахстана.',
};

export const dynamic = 'force-dynamic';

export default async function DesignPage() {
  const projects = await getDesignProjects();

  const fullCycle    = projects.filter(p => p.category === 'full-cycle').length;
  const design       = projects.filter(p => p.category === 'design').length;
  const docs         = projects.filter(p => p.category === 'documentation').length;
  const feasibility  = projects.filter(p => p.category === 'feasibility').length;

  return (
    <>
      <main className={styles.main}>

        <section className={styles.hero}>
          <div className="container">
            <span className="section-label">Проектная деятельность</span>
            <h1 className={`heading-1 ${styles.heroTitle}`}>
              Выполненные<br />
              <span className="text-gradient-gold">проектные работы</span>
            </h1>
            <p className={styles.heroDesc}>
              {projects.length} объектов в реестре —{' '}
              {fullCycle} полных цикла,{' '}
              {design} рабочих проектов,{' '}
              {docs} технических документаций,{' '}
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

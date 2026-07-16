import Hero      from '@/components/Hero/Hero';
import Stats     from '@/components/Stats/Stats';
import About     from '@/components/About/About';
import Geography from '@/components/Map/Geography';
import Services  from '@/components/Services/Services';
import Partners  from '@/components/Partners/Partners';
import Footer    from '@/components/Footer/Footer';
import { getPartners, getProjects, getMaintenanceProjects, getDesignProjects } from '@/lib/data';
import { yearsOnMarket } from '@/lib/company-facts';

export default async function HomePage() {
  const [partners, projects, maintenance, design] = await Promise.all([
    getPartners(),
    getProjects(),
    getMaintenanceProjects(),
    getDesignProjects(),
  ]);
  const registryTotal = projects.length + maintenance.length + design.length;
  const years = yearsOnMarket();

  return (
    <>
      <main>
        <Hero registryTotal={registryTotal} years={years} />
        <Stats registryTotal={registryTotal} years={years} />
        <About />
        <Geography />
        <Services />
        <Partners partners={partners} />
      </main>
      <Footer />
    </>
  );
}

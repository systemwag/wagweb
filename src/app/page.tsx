import Hero      from '@/components/Hero/Hero';
import Stats     from '@/components/Stats/Stats';
import About     from '@/components/About/About';
import Geography from '@/components/Map/Geography';
import Services  from '@/components/Services/Services';
import Partners  from '@/components/Partners/Partners';
import Footer    from '@/components/Footer/Footer';

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <Stats />
        <About />
        <Geography />
        <Services />
        <Partners />
      </main>
      <Footer />
    </>
  );
}

import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import MenuCTA from '@/components/sections/MenuCTA';
import Gallery from '@/components/sections/Gallery';
import Location from '@/components/sections/Location';
import Blog from '@/components/sections/Blog';
import Footer from '@/components/footer/Footer';

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <MenuCTA />
      <Gallery />
      <Location />
      <Blog />
      <Footer />
    </>
  );
}

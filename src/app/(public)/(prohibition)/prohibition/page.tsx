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
      <Hero venueKey="prohibition" />
      <About venueKey="prohibition" />
      <MenuCTA venueKey="prohibition" />
      <Gallery venueKey="prohibition" />
      <Location venueKey="prohibition" />
      <Blog venueKey="prohibition" />
      <Footer venueKey="prohibition" />
    </>
  );
}

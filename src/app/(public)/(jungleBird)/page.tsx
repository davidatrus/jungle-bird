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
      <Hero venueKey="jungle_bird" />
      <About venueKey="jungle_bird" />
      <MenuCTA venueKey="jungle_bird" />
      <Gallery venueKey="jungle_bird" />
      <Location venueKey="jungle_bird" />
      <Blog venueKey="jungle_bird" />
      <Footer venueKey="jungle_bird" />
    </>
  );
}

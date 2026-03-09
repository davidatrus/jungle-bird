import NavbarClient from './Navbar.client';

export default async function Navbar({
  venueKey,
}: {
  venueKey: 'jungle_bird' | 'prohibition';
}) {
  return <NavbarClient venueKey={venueKey} />;
}

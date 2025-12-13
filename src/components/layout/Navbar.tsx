// src/components/layout/Navbar.tsx  (SERVER)
import NavbarClient from './Navbar.client';

export const revalidate = 60;

export default async function Navbar() {
  return <NavbarClient />;
}

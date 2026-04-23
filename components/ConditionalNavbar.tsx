'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/header';

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't show navbar if we're in the staff section or on the vehicle registration page
  if (pathname.startsWith('/staff') || pathname === '/vehicle-registration') {
    return null;
  }


  // Define pages that HAVE hero sections (where navbar should be transparent/white text)
  const heroPages = ['/', '/all_packages', '/about_us'];
  const isHeroPage = heroPages.includes(pathname);

  return <Navbar isHeroPage={isHeroPage} />;
}
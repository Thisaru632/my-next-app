'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/header';

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't show navbar if we're in the staff section
  if (pathname.startsWith('/staff')) {
    return null;
  }

  // Define pages that HAVE hero sections (where navbar should be transparent/white text)
  const heroPages = ['/', '/all_packages', '/about_us'];
  const isHeroPage = heroPages.includes(pathname);

  return <Navbar isHeroPage={isHeroPage} />;
}
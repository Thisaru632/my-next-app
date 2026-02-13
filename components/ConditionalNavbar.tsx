'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/header';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Don't show navbar if we're in the staff section
  if (pathname.startsWith('/staff')) {
    return null;
  }
  
  return <Navbar />;
}
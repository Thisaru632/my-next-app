"use client";

import dynamic from "next/dynamic";
import PackHeader from './pack_header';
import ScrollReveal from "@/components/ScrollReveal";

const ToursTabs = dynamic(() => import('./ToursTabs'), { ssr: false });
const Footer = dynamic(() => import('@/components/footer'), { ssr: false });

export default function AllPackagesPage() {
  return (
    <>
      <PackHeader />
      <ScrollReveal distance={30} delay={0.2}>
        <ToursTabs />
      </ScrollReveal>
      <Footer />
    </>
  );
}
"use client";

import dynamic from "next/dynamic";
import HeroSection from "@/components/hero";
import ScrollReveal from "@/components/ScrollReveal";

import RatingBar from "@/components/RatingBar";
import HeroDescription from "@/components/hero-description";
import ServicesSection from "@/components/category";
import FreedomPackages from "@/components/FreedomPackages";
import DiscoverParadise from "@/components/packages";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <HeroSection />
      
      <ScrollReveal delay={0.2}>
        <RatingBar />
      </ScrollReveal>
      
      <ScrollReveal delay={0.1}>
        <HeroDescription />
      </ScrollReveal>
      
      <ScrollReveal direction="left" distance={100}>
        <ServicesSection />
      </ScrollReveal>
      
      <ScrollReveal direction="right" distance={100}>
        <FreedomPackages />
      </ScrollReveal>
      
      <ScrollReveal>
        <DiscoverParadise />
      </ScrollReveal>
      
      <Footer />
    </>
  );
}
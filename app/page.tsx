import Image from "next/image";
import HeroSection from "@/components/hero";
import HeroDescription from "@/components/hero-description";
import ServicesSection from "@/components/category";
import TestimonialsSection from "@/components/testimonials";
import DiscoverParadise from "@/components/packages";
import FreedomPackages from "@/components/FreedomPackages";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <HeroSection />
      <HeroDescription />
      <ServicesSection />
      <FreedomPackages />
      <DiscoverParadise />
      <TestimonialsSection />
      <Footer />
    </>
  );
}
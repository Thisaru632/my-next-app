import Image from "next/image";
import HeroSection from "@/components/hero";
import ServicesSection from "@/components/category";
import TestimonialsSection from "@/components/testimonials";
import  DiscoverParadise from "@/components/packages";
import Footer from "@/components/footer";


export default function Home() {
  return (
    <>
      
      <HeroSection />
      <ServicesSection />
      <DiscoverParadise />
      <TestimonialsSection />
      <Footer />
      
    </>
  );
}
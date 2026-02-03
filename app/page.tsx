import Image from "next/image";
import HeroSection from "@/components/hero";
import ServicesSection from "@/components/category";
import DiscoverParadise from "@/components/packages";
import VehicleSection from "@/components/vehicle";
import Footer from "@/components/footer";


export default function Home() {
  return (
    <>
      
      <HeroSection />
      <ServicesSection />
      <DiscoverParadise />
      <VehicleSection />
      <Footer />
    </>
  );
}
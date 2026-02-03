import Image from "next/image";
import HeroSection from "@/components/hero";
import ServicesSection from "@/components/category";
import DiscoverParadise from "@/components/packages";
import VehicleSection from "@/components/vehicle";


export default function Home() {
  return (
    <>
      
      <HeroSection />
      <ServicesSection />
      <DiscoverParadise />
      <VehicleSection />
    </>
  );
}
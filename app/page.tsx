import Image from "next/image";
import HeroSection from "@/components/hero";
import ServicesSection from "@/components/category";
<<<<<<< HEAD
import DiscoverParadise from "@/components/packages";
import VehicleSection from "@/components/vehicle";
=======
import TestimonialsSection from "@/components/testimonials";
import  DiscoverParadise from "@/components/packages";
>>>>>>> f7fc7b1d40a44f30fd5223b75aa94d8c52570044
import Footer from "@/components/footer";


export default function Home() {
  return (
    <>
      
      <HeroSection />
      <ServicesSection />
      <DiscoverParadise />
<<<<<<< HEAD
      <VehicleSection />
      <Footer />
=======
      <TestimonialsSection />
      <Footer />
      
>>>>>>> f7fc7b1d40a44f30fd5223b75aa94d8c52570044
    </>
  );
}
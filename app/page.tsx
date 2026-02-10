import Image from "next/image";
import HeroSection from "@/components/hero";
import ServicesSection from "@/components/category";
import TestimonialsSection from "@/components/testimonials";
import  DiscoverParadise from "@/components/packages";
import Footer from "@/components/footer";
import BookingForm from "./all_packages/filters";


export default function Home() {
  return (
    <>
      
      <HeroSection />
      <BookingForm />
      <ServicesSection />
      <DiscoverParadise />
      <TestimonialsSection />
      <Footer />
      
    </>
  );
}
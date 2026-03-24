import Image from "next/image";
import HeroSection from "@/components/hero";
import RatingBar from "@/components/RatingBar";
import HeroDescription from "@/components/hero-description";
import ServicesSection from "@/components/category";
import DiscoverParadise from "@/components/packages";
import FreedomPackages from "@/components/FreedomPackages";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <HeroSection />
      <RatingBar />
      <HeroDescription />
      <ServicesSection />
      <FreedomPackages />
      <DiscoverParadise />
      <Footer />
    </>
  );
}
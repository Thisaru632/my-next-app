"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "@/components/footer";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const HERO_DESTINATIONS = [
  {
    name: "Galle Fort",
    label: "Heritage",
    description: "Centuries of history preserved in stone walls.",
    bg: "/Galle/galle fort.webp",
    tall: true,
  },
  {
    name: "Hikkaduwa",
    label: "Coastal",
    description: "Vibrant coral reefs and energetic beach life.",
    bg: "/Galle/hikkaduwa.jpg",
    tall: false,
  },
  {
    name: "Unawatuna",
    label: "Relaxation",
    description: "A stunning crescent-shaped bay with turquoise waters.",
    bg: "/Galle/unawatuna.jpg",
    tall: false,
  },
  {
    name: "Japanese Peace Pagoda",
    label: "Peace",
    description: "Quiet reflection overlooking the vast blue sea.",
    bg: "/Galle/pagoda.jpg",
    tall: true,
  },
];

const THINGS_TO_DO = [
  {
    title: "Walk the Galle Fort Ramparts",
    desc: "Experience breathtaking sunset views over the Indian Ocean while walking along the ancient stone walls.",
    image: "/destination/galle/zoshua-colah-bYdRfOLE2JU-unsplash.webp",
  },
  {
    title: "Old Dutch Hospital",
    desc: "A beautifully restored colonial building now housing upscale restaurants, cafes, and boutique shops.",
    image: "/destination/galle/chathura-indika-LAj-XlHP6Rs-unsplash.webp",
  },
  {
    title: "Galle Lighthouse",
    desc: "One of the island's most iconic landmarks, standing tall on the fort's southeast tip since 1848.",
    image: "/destination/galle/matt-dany-FOYmbDX-sTs-unsplash.webp",
  },
  {
    title: "Unawatuna Beach",
    desc: "A stunning crescent-shaped bay known for its golden sands and vibrant turquoise waters.",
    image: "/destination/galle/polina-kneis-KcqxBAqYk2M-unsplash.webp",
  },
  {
    title: "Rumassala Jungle Beach",
    desc: "A hidden gem tucked away in the jungle, perfect for snorkeling and quiet relaxation.",
    image: "/destination/galle/sarmat-batagov-VB-ugSBaVzA-unsplash.webp",
  },
  {
    title: "Flag Rock Cliff Jumping",
    desc: "Watch local daredevils jump into the sea or simply enjoy the historical significance of this lookout point.",
    image: "/destination/galle/sarmat-batagov-ehxQ3o8FKTs-unsplash.webp",
  },
];

const PLACES_TO_VISIT = [
  {
    name: "3 Person Galle Tour",
    desc: "Experience the essential highlights of Galle in a perfectly curated day. From the colonial grandeur of the Fort to the iconic lighthouse and vibrant local markets, see the best of the southern coast.",
    image: "/destination/galle/matt-dany-iitTkHI4Tqw-unsplash.webp",
    days: "3 Persons",
    vehicle: "Wagon R",
    price: "Rs 12,000",
    itinerary: ["Hikkaduwa", "Galle Fort", "Unawatuna", "Japanese Peace Pagoda"]
  },
  {
    name: "4 Person Galle Tour",
    desc: "A balanced blend of history and coastal relaxation. Dive deeper into the local culture and enjoy the pristine hidden beaches surrounding the historic city center.",
    image: "/destination/galle/polina-kneis-KcqxBAqYk2M-unsplash.webp",
    days: "4 Persons",
    vehicle: "Aqua",
    price: "Rs 18,000",
    itinerary: ["Hikkaduwa", "Galle Fort", "Unawatuna", "Japanese Peace Pagoda"]
  },
  {
    name: "6 Person Galle Tour",
    desc: "The complete southern experience. Explore the rich maritime history, lush tea estates, and the sophisticated dining scene that makes Galle a premier global destination.",
    image: "/destination/galle/zoshua-colah-bYdRfOLE2JU-unsplash.webp",
    days: "6 Persons",
    vehicle: "Mini Van",
    price: "Rs 27,000",
    itinerary: ["Hikkaduwa", "Galle Fort", "Unawatuna", "Japanese Peace Pagoda"]
  },
  {
    name: "9 Person Galle Tour",
    desc: "The ultimate colonial retreat. A luxurious deep dive into the south coast's heritage, including day trips to nearby gems and exclusive private tours.",
    image: "/destination/galle/chathura-indika-LAj-XlHP6Rs-unsplash.webp",
    days: "9 Persons",
    vehicle: "KDH Flat Roof",
    price: "Rs 39,000",
    itinerary: ["Hikkaduwa", "Galle Fort", "Unawatuna", "Japanese Peace Pagoda"]
  },
  {
    name: "14 Person Galle Tour",
    desc: "An expansive journey designed for larger groups. Enjoy the best of Galle's culture, heritage, and scenery with exclusive group arrangements and private guides.",
    image: "/destination/galle/sarmat-batagov-VB-ugSBaVzA-unsplash.webp",
    days: "14 Persons",
    vehicle: "KDH High Roof",
    price: "Rs 60,000",
    itinerary: ["Hikkaduwa", "Galle Fort", "Unawatuna", "Japanese Peace Pagoda"]
  },
];

function DestCard({ dest, index, inView }: { dest: any; index: number; inView: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className={`dest-card ${dest.tall ? "dest-tall" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="dest-img-container">
        <Image
          src={dest.bg}
          alt={dest.name}
          fill
          priority={index < 2}
          className={`dest-img-optimized ${hovered ? "hovered" : ""}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>
      <div
        className="dest-overlay"
        style={{
          background: hovered
            ? "linear-gradient(to top, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.3) 60%, rgba(5,5,5,0.06) 100%)"
            : "linear-gradient(to top, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.18) 60%, rgba(5,5,5,0.02) 100%)",
        }}
      />
      <div className="dest-content">
        <p
          className="dest-desc"
          style={{
            maxHeight: hovered ? "80px" : "0px",
            opacity: hovered ? 1 : 0,
          }}
        >
          {dest.description}
        </p>
        <div className="dest-bottom">
          <h3 className="dest-name">{dest.name}</h3>
          <span className="dest-label">{dest.label}</span>
        </div>
        <div
          className="dest-cta"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <span>Explore</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

const TOUR_ROUTE = [
  {
    name: "Hikkaduwa",
    desc: "A vibrant coastal town famous for its lively beach culture, coral sanctuary, and thrilling water sports.",
    images: [
      "/Galle/hikkaduwa.jpg",
      "/destination/galle/polina-kneis-KcqxBAqYk2M-unsplash.webp"
    ]
  },
  {
    name: "Galle Fort",
    desc: "A living UNESCO World Heritage site, offering winding cobblestone streets, Dutch colonial architecture, and chic boutiques.",
    images: [
      "/Galle/galle fort.webp",
      "/destination/galle/chathura-indika-LAj-XlHP6Rs-unsplash.webp"
    ]
  },
  {
    name: "Galle Lighthouse",
    desc: "An iconic landmark standing tall on the fort's ramparts, providing breathtaking views of the Indian Ocean.",
    images: [
      "/destination/galle/matt-dany-iitTkHI4Tqw-unsplash.webp",
      "/destination/galle/matt-dany-FOYmbDX-sTs-unsplash.webp"
    ]
  },
  {
    name: "Unawatuna",
    desc: "A stunning palm-fringed, crescent-shaped bay known for its calm turquoise waters and relaxed coastal vibe.",
    images: [
      "/Galle/unawatuna.jpg",
      "/destination/galle/sarmat-batagov-ehxQ3o8FKTs-unsplash.webp"
    ]
  },
  {
    name: "Japanese Peace Pagoda",
    desc: "A serene Buddhist stupa nestled on the Rumassala hill, offering panoramic views of the bay and a sense of deep tranquility.",
    images: [
      "/Galle/pagoda.jpg",
      "/destination/galle/sarmat-batagov-VB-ugSBaVzA-unsplash.webp"
    ]
  }
];

function RouteSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="route-slider relative w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden shadow-xl group">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image src={images[current]} alt="Location image" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-4 z-10">
        <button onClick={prevSlide} className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition text-gray-800">
          <ChevronLeft size={20} />
        </button>
        <button onClick={nextSlide} className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition text-gray-800">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-2 bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}

export default function GalleDestinationPage() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mobileDestGridRef = useRef<HTMLDivElement>(null);
  const [activePlace, setActivePlace] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (typeof window !== "undefined" && window.innerWidth <= 640) {
      interval = setInterval(() => {
        if (mobileDestGridRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = mobileDestGridRef.current;
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            mobileDestGridRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            mobileDestGridRef.current.scrollBy({ left: clientWidth * 0.85, behavior: 'smooth' });
          }
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - (clientWidth * 0.8) : scrollLeft + (clientWidth * 0.8);
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const nextPlace = () => setActivePlace((prev) => (prev + 1) % PLACES_TO_VISIT.length);
  const prevPlace = () => setActivePlace((prev) => (prev - 1 + PLACES_TO_VISIT.length) % PLACES_TO_VISIT.length);

  const getPosition = (index: number) => {
    const total = PLACES_TO_VISIT.length;
    const diff = (index - activePlace + total) % total;

    if (diff === 0) return 'center';
    if (diff === 1) return 'right';
    if (diff === total - 1) return 'left';
    return 'hidden';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="galle-page"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Montserrat:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .magical-section {
          background: #ffffff;
          padding: 20px 4% 80px;
          position: relative;
          overflow: hidden;
        }
        .magical-header {
          text-align: center;
          max-width: 900px;
          margin: 0 auto 52px;
        }
        .magical-eyebrow-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 18px;
        }
        .magical-rule {
          flex: 1;
          max-width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(13,148,136,0.55));
        }
        .magical-eyebrow-row .magical-rule:last-child {
          background: linear-gradient(270deg, transparent, rgba(13,148,136,0.55));
        }
        .magical-eyebrow {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #0d9488;
        }
        .magical-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2rem, 4.5vw, 3.4rem);
          font-weight: 700;
          color: #111;
          line-height: 1.18;
          margin: 0 0 16px;
        }
        .magical-heading em {
          font-style: italic;
          color: #374151;
        }
        .heading-accent {
          color: #0d9488;
          font-style: italic;
        }
        .magical-sub {
          font-family: 'Montserrat', sans-serif;
          font-size: 15px;
          color: #6b7280;
          line-height: 1.7;
          max-width: 560px;
          margin: 0 auto;
        }
        .dest-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 14px;
        }
        .dest-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .dest-card {
           position: relative;
           border-radius: 14px;
           overflow: hidden;
           cursor: pointer;
           height: 260px;
           background: #f3f4f6;
        }
        .dest-img-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .dest-img-optimized {
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(.4,0,.2,1) !important;
        }
        .dest-img-optimized.hovered {
          transform: scale(1.1);
        }
        .dest-tall { height: 534px; }
        .dest-overlay {
          position: absolute;
          inset: 0;
          transition: background 0.45s ease;
        }
        .dest-content {
          position: absolute;
          inset: 0;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          z-index: 2;
        }
        .dest-desc {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.82);
          line-height: 1.55;
          margin: 0 0 10px;
          overflow: hidden;
          transition: max-height 0.45s ease, opacity 0.4s ease;
        }
        .dest-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }
        .dest-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(18px, 2vw, 24px);
          font-weight: 700;
          color: #ffffff;
          line-height: 1.15;
          margin: 0;
        }
        .dest-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.22);
          padding: 3px 9px;
          border-radius: 30px;
          white-space: nowrap;
          align-self: flex-start;
          margin-left: 8px;
          backdrop-filter: blur(4px);
        }
        .dest-cta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          color: #ffffff;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }

        /* ── DESCRIPTION ── */
        .galle-desc-section {
          padding: 60px 5% 100px;
          background: #ffffff;
        }
        .desc-container {
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
        }
        .desc-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 24px;
        }
        .desc-text {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.05rem;
          line-height: 1.8;
          color: #4b5563;
          margin-bottom: 20px;
        }

        /* ── THINGS TO DO ── */
        .things-section {
          padding: 100px 5%;
          background: #fdfdfd;
          border-top: 1px solid rgba(13,148,136,0.1);
          position: relative;
        }
        /* ── DESTINATION VIDEO SECTION ── */
        .destination-video-section {
          padding: 80px 5%;
          background: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .video-container {
          width: 100%;
          max-width: 1200px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.15);
          position: relative;
          aspect-ratio: 16 / 9;
          background: #000;
          transition: transform 0.5s ease;
        }
        .video-container:hover {
          transform: scale(1.02);
        }
        .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        .section-header {
          text-align: center;
          margin-bottom: 64px;
        }
        .section-eyebrow-small {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #0d9488;
          margin-bottom: 12px;
        }
        .section-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 700;
          color: #111;
        }

        .things-slider-container {
          position: relative;
          max-width: 1800px;
          margin: 0 auto;
          padding: 0 4%;
        }
        .things-grid {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          gap: 28px;
          padding: 20px 0 40px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .things-grid::-webkit-scrollbar {
          display: none;
        }
        .thing-card {
          flex: 0 0 320px;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.04);
          transition: all 0.4s ease;
          scroll-snap-align: start;
        }
        .thing-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(13,148,136,0.1);
          border-color: rgba(13,148,136,0.2);
        }
        .thing-img-box {
          height: 220px;
          background-size: cover;
          background-position: center;
        }
        .thing-content {
          padding: 24px;
        }
        .thing-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #111;
          margin-bottom: 12px;
        }
        .thing-desc {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.9rem;
          line-height: 1.6;
          color: #6b7280;
        }

        /* ── SLIDER ARROWS ── */
        .slider-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          background: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border: 1px solid rgba(13,148,136,0.1);
          color: #0d9488;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s ease;
        }
        .slider-arrow:hover {
          background: #0d9488;
          color: #ffffff;
          transform: translateY(-50%) scale(1.1);
        }
        .arrow-left { left: 0; }
        .arrow-right { right: 0; }

        @media (max-width: 768px) {
          .things-slider-container { padding: 0 10px; }
          .slider-arrow { width: 40px; height: 40px; }
          .thing-card { flex: 0 0 280px; }
        }

        /* ── PLACES WITH SENU (Dynamic Carousel) ── */
        .senu-section {
          padding: 120px 5% 40px;
          background: #ffffff;
          overflow: hidden;
        }
        .senu-inner {
          max-width: 1600px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 100px;
          align-items: center;
        }
        .senu-content {
          padding-right: 40px;
        }
        .senu-content h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 5vw, 4rem);
          font-weight: 700;
          color: #111;
          margin: 0 0 30px;
          line-height: 1.1;
        }
        .senu-content h2 em {
          color: #0d9488;
          font-style: italic;
        }
        .active-place-meta {
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }
        .active-place-meta.active {
          opacity: 1;
          transform: translateY(0);
        }
        .active-place-name {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #111;
          margin-bottom: 15px;
        }
        .active-place-desc {
          font-family: 'Montserrat', sans-serif;
          font-size: 1rem;
          line-height: 1.7;
          color: #555;
          max-width: 500px;
          margin-bottom: 25px;
        }
        .itinerary-box {
          background: rgba(13, 148, 136, 0.05);
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #0d9488;
          max-width: 500px;
        }
        .itinerary-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #0d9488;
          margin-bottom: 12px;
          display: block;
        }
        .itinerary-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .itinerary-item {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .itinerary-item::before {
          content: '•';
          color: #0d9488;
          font-weight: bold;
        }

        .senu-visual {
          position: relative;
          height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .carousel-card {
           position: absolute;
           width: 320px;
           height: 450px;
           border-radius: 24px;
           overflow: hidden;
           transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1);
           cursor: pointer;
           box-shadow: 0 20px 50px rgba(0,0,0,0.15);
        }
        .carousel-card.center {
          z-index: 10;
          transform: translateX(0) scale(1.1);
          opacity: 1;
        }
        .carousel-card.left {
          z-index: 5;
          transform: translateX(-60%) scale(0.9);
          opacity: 0.5;
          filter: blur(2px);
        }
        .carousel-card.right {
          z-index: 5;
          transform: translateX(60%) scale(0.9);
          opacity: 0.5;
          filter: blur(2px);
        }
        .carousel-card.hidden {
          opacity: 0;
          transform: scale(0.5);
          pointer-events: none;
        }
        .card-img {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transition: transform 1s ease;
        }
        .carousel-card:hover .card-img {
          transform: scale(1.1);
        }
        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 30px;
          color: #fff;
        }
        .day-count {
           font-family: 'Montserrat', sans-serif;
           font-size: 11px;
           font-weight: 700;
           letter-spacing: 0.2em;
           text-transform: uppercase;
           color: #0d9488;
           margin-bottom: 8px;
           background: rgba(255,255,255,0.95);
           padding: 4px 10px;
           border-radius: 4px;
           width: fit-content;
        }
        .card-title-small {
           font-family: 'Playfair Display', serif;
           font-size: 1.5rem;
           font-weight: 700;
           margin-bottom: 20px;
        }
        .request-btn {
           background: #0d9488;
           color: #fff;
           font-family: 'Montserrat', sans-serif;
           font-size: 11px;
           font-weight: 700;
           letter-spacing: 0.1em;
           text-transform: uppercase;
           padding: 12px 20px;
           border-radius: 8px;
           border: none;
           cursor: pointer;
           transition: all 0.3s ease;
        }
        .request-btn:hover {
           background: #0f766e;
           transform: translateY(-2px);
        }

        .nav-btn {
           position: absolute;
           top: 50%;
           transform: translateY(-50%);
           width: 50px;
           height: 50px;
           border-radius: 50%;
           border: 1px solid rgba(0,0,0,0.1);
           background: #fff;
           display: flex;
           align-items: center;
           justify-content: center;
           cursor: pointer;
           transition: all 0.3s ease;
           color: #333;
           z-index: 30;
           box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .nav-btn.prev {
           left: -25px;
        }
        .nav-btn.next {
           right: -25px;
        }
        .nav-btn:hover {
           background: #0d9488;
           color: #fff;
           border-color: #0d9488;
           transform: translateY(-50%) scale(1.1);
        }

        @media (max-width: 1024px) {
            .dest-grid { grid-template-columns: repeat(2, 1fr); }
            .dest-tall { height: 300px; }
            .dest-card { height: 300px; }
            .senu-inner { display: flex; flex-direction: column; gap: 40px; }
            .senu-content { display: contents; }
            .senu-content > .section-eyebrow-small { order: 1; }
            .senu-content > h2 { order: 2; margin-bottom: 10px; }
            .senu-visual { order: 3; position: static; width: 100%; height: auto; }
            .senu-carousel-container { height: 450px !important; }
            .active-place-meta { order: 4; margin-top: 20px; }
        }
        @media (max-width: 640px) {
            .magical-hero { padding-top: 60px; }
            .magical-heading { font-size: 2.2rem; }
            .dest-grid { 
               display: flex; 
               overflow-x: auto; 
               scroll-snap-type: x mandatory; 
               gap: 16px; 
               padding-bottom: 20px;
               -ms-overflow-style: none; 
               scrollbar-width: none;
            }
            .dest-grid::-webkit-scrollbar { display: none; }
            .dest-col { display: contents; }
            .dest-tall, .dest-card { 
               height: 260px; 
               flex: 0 0 85vw; 
               scroll-snap-align: center; 
            }

            .senu-section { padding: 60px 5% 10px; }
            .magical-section { padding: 10px 4% 80px; }
            .senu-inner { gap: 15px; }
            .senu-visual { height: auto; }
            .senu-carousel-container { height: 440px !important; margin: 0; }
            .carousel-card { width: 260px !important; height: 380px !important; }
            .nav-btn { width: 36px !important; height: 36px !important; }
            .nav-btn.prev { left: -10px !important; }
            .nav-btn.next { right: -10px !important; }
            .card-title-small { font-size: 1.2rem; }
            .senu-content > h2 { font-size: 2rem; margin-bottom: 0; }
            .active-place-meta { margin-top: 5px; display: flex; flex-direction: column; }
            .active-place-meta .itinerary-box { order: -1; margin-bottom: 20px; }
            .active-place-name, .active-place-desc { display: none; }
        }

        /* ── TOUR ROUTE SECTION ── */
        .tour-route-section {
          padding: 100px 5%;
          background: #fafafa;
          position: relative;
        }
        .tour-route-header {
          text-align: center;
          margin-bottom: 80px;
        }
        .tour-route-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3.5rem);
          color: #111;
          margin-bottom: 16px;
        }
        .tour-route-subtitle {
          font-family: 'Montserrat', sans-serif;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .timeline-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }
        .timeline-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(13, 148, 136, 0.2);
          transform: translateX(-50%);
        }
        .timeline-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 100px;
          position: relative;
        }
        .timeline-item:last-child {
          margin-bottom: 0;
        }
        .timeline-content {
          width: 45%;
        }
        .timeline-slider {
          width: 45%;
        }
        .timeline-item:nth-child(even) {
          flex-direction: row-reverse;
        }
        .timeline-item:nth-child(even) .timeline-content {
          text-align: right;
        }
        .timeline-dot {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #0d9488;
          border: 4px solid #fafafa;
          z-index: 2;
          box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
        }
        .timeline-step {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          color: #0d9488;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
          display: block;
        }
        .timeline-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          color: #111;
          margin-bottom: 16px;
        }
        .timeline-desc {
          font-family: 'Montserrat', sans-serif;
          color: #555;
          line-height: 1.7;
          font-size: 1rem;
        }
        @media (max-width: 768px) {
          .timeline-line {
            left: 20px;
          }
          .timeline-item, .timeline-item:nth-child(even) {
            flex-direction: column;
            align-items: flex-start;
          }
          .timeline-item:nth-child(even) .timeline-content {
            text-align: left;
          }
          .timeline-content, .timeline-slider {
            width: 100%;
            padding-left: 50px;
          }
          .timeline-slider {
            margin-top: 30px;
          }
          .timeline-dot {
            left: 20px;
            top: 20px;
          }
        }
      `}</style>

      {/* ── Places with Senu (Interactive Carousel) ── */}
      <section className="senu-section">
        <div className="senu-inner">
          <div className="senu-content">
            <span className="section-eyebrow-small">Expert Picks</span>
            <h2>Galle Tour Packages <em>with Senu</em></h2>

            <div className={`active-place-meta active`}>
              <h3 className="active-place-name">{PLACES_TO_VISIT[activePlace].name}</h3>
              <p className="active-place-desc">{PLACES_TO_VISIT[activePlace].desc}</p>

              <div className="itinerary-box">
                <span className="itinerary-label">Traveling Places</span>
                <div className="itinerary-list">
                  {PLACES_TO_VISIT[activePlace].itinerary?.map((place, idx) => (
                    <div key={idx} className="itinerary-item">{place}</div>
                  ))}
                </div>
                <button className="mt-6 w-full py-3 bg-[#0a937c] text-white rounded font-bold uppercase tracking-wider text-sm hover:bg-[#087a66] transition-colors shadow-md" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  See Tour Details
                </button>
              </div>
            </div>


          </div>

          <div className="senu-visual">
            <div className="senu-carousel-container relative w-full h-[600px] flex items-center justify-center overflow-visible">
              <AnimatePresence>
                {PLACES_TO_VISIT.map((place, i) => {
                  const pos = getPosition(i);
                  if (pos === 'hidden') return null;
                  return (
                    <motion.div
                      key={i}
                      className={`carousel-card ${pos}`}
                      onClick={() => pos !== 'center' && setActivePlace(i)}
                      initial={false}
                      animate={{
                        opacity: pos === 'center' ? 1 : 0.6,
                        scale: pos === 'center' ? 1.1 : 0.85,
                        x: pos === 'left' ? '-75%' : pos === 'right' ? '75%' : '0%',
                        zIndex: pos === 'center' ? 10 : 5,
                        filter: pos === 'center' ? 'blur(0px)' : 'blur(2px)'
                      }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 25,
                      }}
                    >
                      <div className="card-img relative w-full h-full">
                        <Image
                          src={place.image}
                          alt={place.name}
                          fill
                          className="object-cover transition-transform duration-700 hover:scale-105"
                          sizes="400px"
                        />
                      </div>
                      <div className="card-overlay">
                        <span className="day-count">{place.days}</span>
                        <h4 className="card-title-small">{place.name}</h4>
                        <div style={{ fontFamily: "'Montserrat', sans-serif" }} className="flex justify-between items-center mb-4 text-xs font-semibold opacity-90">
                          <span>{place.vehicle}</span>
                          <span className="text-teal-400">{place.price}</span>
                        </div>
                        <button className="request-btn">Request Booking</button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Navigation arrows */}
              <button className="nav-btn prev" onClick={prevPlace} style={{ left: '-60px' }}>
                <ChevronLeft size={24} />
              </button>
              <button className="nav-btn next" onClick={nextPlace} style={{ right: '-60px' }}>
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Top Hero Section (Exactly as MagicalDestinations) ── */}
      <section ref={sectionRef} className="magical-section">
        <div
          className="magical-header"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <div className="magical-eyebrow-row">
            <div className="magical-rule" />
            <span className="magical-eyebrow">Magical destinations</span>
            <div className="magical-rule" />
          </div>

          <h2 className="magical-heading">
            Visit most beautiful places in Galle{" "}
            <span className="heading-accent">with us</span>
          </h2>


        </div>

        <div className="dest-grid" ref={mobileDestGridRef}>
          <div className="dest-col">
            <DestCard dest={HERO_DESTINATIONS[0]} index={0} inView={inView} />
          </div>
          <div className="dest-col">
            <DestCard dest={HERO_DESTINATIONS[1]} index={1} inView={inView} />
            <DestCard dest={HERO_DESTINATIONS[2]} index={2} inView={inView} />
          </div>
          <div className="dest-col">
            <DestCard dest={HERO_DESTINATIONS[3]} index={3} inView={inView} />
          </div>

        </div>
      </section>

      {/* ── Tour Route Section ── */}
      <section className="tour-route-section">
        <div className="tour-route-header">
          <h2 className="tour-route-title">The Tour Route</h2>
          <p className="tour-route-subtitle">Follow our perfectly curated journey through the most beautiful spots in Galle and its surrounding coastal gems.</p>
        </div>
        <div className="timeline-container">
          <div className="timeline-line"></div>
          {TOUR_ROUTE.map((stop, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-step">Stop 0{i + 1}</span>
                <h3 className="timeline-title">{stop.name}</h3>
                <p className="timeline-desc">{stop.desc}</p>
              </div>
              <div className="timeline-slider">
                <RouteSlider images={stop.images} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </motion.div>
  );
}

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
    bg: "/destination/galle/chathura-indika-LAj-XlHP6Rs-unsplash.webp",
    tall: true,
  },
  {
    name: "Dutch Hospital",
    label: "Landmark",
    description: "Restored colonial architecture with modern vibes.",
    bg: "/destination/galle/matt-dany-FOYmbDX-sTs-unsplash.webp",
    tall: false,
  },
  {
    name: "Lighthouse",
    label: "Iconic",
    description: "The guardian of the southern coast since 1848.",
    bg: "/destination/galle/matt-dany-iitTkHI4Tqw-unsplash.webp",
    tall: false,
  },
  {
    name: "Beachfront",
    label: "Coastal",
    description: "Where the Indian Ocean meets the golden sands.",
    bg: "/destination/galle/polina-kneis-KcqxBAqYk2M-unsplash.webp",
    tall: true,
  },
  {
    name: "Old Streets",
    label: "Culture",
    description: "Winding cobblestone paths filled with charm.",
    bg: "/destination/galle/sarmat-batagov-VB-ugSBaVzA-unsplash.webp",
    tall: false,
  },
  {
    name: "Pagoda",
    label: "Peace",
    description: "Quiet reflection overlooking the vast blue sea.",
    bg: "/destination/galle/sarmat-batagov-ehxQ3o8FKTs-unsplash.webp",
    tall: false,
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
    name: "One Day Galle Tour",
    desc: "Experience the essential highlights of Galle in a perfectly curated day. From the colonial grandeur of the Fort to the iconic lighthouse and vibrant local markets, see the best of the southern coast.",
    image: "/destination/galle/matt-dany-iitTkHI4Tqw-unsplash.webp",
    days: "1 Day",
    itinerary: ["Galle Fort Heritage Walk", "Ramparts Sunset", "Old Dutch Hospital", "Galle Lighthouse"]
  },
  {
    name: "Two Day Galle Tour",
    desc: "A balanced blend of history and coastal relaxation. Dive deeper into the local culture and enjoy the pristine hidden beaches surrounding the historic city center.",
    image: "/destination/galle/polina-kneis-KcqxBAqYk2M-unsplash.webp",
    days: "2 Days",
    itinerary: ["Japanese Peace Pagoda", "Rumassala Jungle Beach", "Sea Turtle Hatchery", "Stilt Fishing Experience"]
  },
  {
    name: "Three Day Galle Tour",
    desc: "The complete southern experience. Explore the rich maritime history, lush tea estates, and the sophisticated dining scene that makes Galle a premier global destination.",
    image: "/destination/galle/zoshua-colah-bYdRfOLE2JU-unsplash.webp",
    days: "3 Days",
    itinerary: ["Handunugoda Tea Estate", "Maritime Archeology Museum", "Coastal Village Tour", "Premium Beach Club Access"]
  },
  {
    name: "Four Day Galle Tour",
    desc: "The ultimate colonial retreat. A luxurious deep dive into the south coast's heritage, including day trips to nearby gems and exclusive private tours.",
    image: "/destination/galle/chathura-indika-LAj-XlHP6Rs-unsplash.webp",
    days: "4 Days",
    itinerary: ["Mirissa Whale Watching", "Koggala Lake Boat Safari", "Antique Mansion Tour", "Luxury Fine Dining Experience"]
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

export default function GalleDestinationPage() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePlace, setActivePlace] = useState(0);

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
          padding: 100px 4% 80px;
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
          grid-template-columns: repeat(4, 1fr);
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
          padding: 120px 5%;
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
            .senu-inner { grid-template-columns: 1fr; gap: 50px; }
            .senu-visual { position: static; }
        }
        @media (max-width: 640px) {
            .magical-hero { padding-top: 60px; }
            .magical-heading { font-size: 2.2rem; }
            .dest-grid { grid-template-columns: 1fr; }
            .dest-col { flex-direction: column; }
            .dest-tall, .dest-card { height: 260px; }
        }
      `}</style>

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
            Ramparts, Reefs,{" "}
            <em>Heritage,</em>{" "}
            <span className="heading-accent">Treasures</span>
          </h2>

          <p className="magical-sub">
            Galle awaits with its timeless Dutch colonial legacy, winding cobblestone streets,
            and the golden shores of the Indian Ocean—a perfect blend of history and coastal charm.
          </p>
        </div>

        <div className="dest-grid">
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
          <div className="dest-col">
            <DestCard dest={HERO_DESTINATIONS[4]} index={4} inView={inView} />
            <DestCard dest={HERO_DESTINATIONS[5]} index={5} inView={inView} />
          </div>
        </div>
      </section>

      {/* ── Description ── */}
      <section className="galle-desc-section">
        <div className="desc-container">
          <h2 className="desc-title">Galle Heritage</h2>
          <p className="desc-text">
            Galle is a jewel of Sri Lanka, where history and the ocean meet in a beautiful dance.
            The iconic Galle Fort, a UNESCO World Heritage site, is a living museum of colonial architecture,
            with its winding cobblestone streets, charming boutiques, and historic ramparts.
          </p>
          <p className="desc-text">
            Beyond the fort, you'll find golden beaches, vibrant local markets, and a sense of timelessness
            that makes Galle one of the most beloved destinations on the island. Experience the perfect
            blend of culture, heritage, and coastal beauty.
          </p>
        </div>
      </section>

      {/* ── Destination Video Section ── */}
      <section className="destination-video-section">
        <div className="video-container">
          <iframe
            src="https://www.youtube.com/embed/nE1E1U8GvL8?si=9kX5Xl_0x3H5T4-y&autoplay=0&mute=1&loop=1&playlist=nE1E1U8GvL8"
            title="Things to do in Galle Sri Lanka"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* ── Things to Do (Slider with Arrows) ── */}
      <section className="things-section">
        <div className="section-header">
          <span className="section-eyebrow-small">Top Activities</span>
          <h2 className="section-heading">Things to Do in Galle</h2>
        </div>

        <div className="things-slider-container">
          <button className="slider-arrow arrow-left" onClick={() => scroll('left')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="things-grid" ref={scrollRef}>
            {THINGS_TO_DO.map((item, i) => (
              <motion.div
                key={i}
                className="thing-card"
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="thing-img-box relative overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                </div>
                <div className="thing-content">
                  <h3 className="thing-title">{item.title}</h3>
                  <p className="thing-desc">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <button className="slider-arrow arrow-right" onClick={() => scroll('right')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── Places with Senu (Interactive Carousel) ── */}
      <section className="senu-section">
        <div className="senu-inner">
          <div className="senu-content">
            <span className="section-eyebrow-small">Expert Picks</span>
            <h2>Places we must travel in Galle <em>with Senu</em></h2>

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
              </div>
            </div>


          </div>

          <div className="senu-visual">
            <div className="relative w-full h-[600px] flex items-center justify-center overflow-visible">
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
                        <button className="request-btn">Select a Vehicle and Request Booking</button>
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

      <Footer />
    </motion.div>
  );
}

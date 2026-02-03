"use client";

import { useState, useEffect, useRef } from "react";

/* ─── DATA ─────────────────────────────────────────────────────── */
const tours = [
  {
    id: 1,
    days: 8,
    title: "Everlasting Summer",
    subtitle: "Around the island",
    description:
      "Immerse in tropical bliss, explore vibrant culture and savor unforgettable moments on this sun-kissed adventure.",
    category: "Sri Lanka with Senu Tours",
    theme: "Passion",
    gradient: "from-amber-900/60 via-orange-800/40 to-yellow-700/30",
    accent: "#f59e0b",
    bg: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  },
  {
    id: 2,
    days: 7,
    title: "Experiential East",
    subtitle: "Enchanting escapade",
    description:
      "Embark on a soul-stirring journey where ancient ruins, vibrant culture and pristine beaches weave unforgettable tales.",
    category: "Sri Lanka with Senu Tours",
    theme: "Serendipity",
    gradient: "from-sky-900/60 via-cyan-800/40 to-teal-700/30",
    accent: "#06b6d4",
    bg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  },
  {
    id: 3,
    days: 12,
    title: "Sustainable Luxury",
    subtitle: "Luxe serenity",
    description:
      "Embark on an eco-luxury journey where sustainability meets opulence in breathtaking landscapes and cultural richness.",
    category: "Sri Lanka with Senu Tours",
    theme: "Luxe",
    gradient: "from-emerald-900/60 via-green-800/40 to-lime-700/30",
    accent: "#10b981",
    bg: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80",
  },
  {
    id: 4,
    days: 9,
    title: "Cultural Heartland",
    subtitle: "Timeless heritage",
    description:
      "Discover ancient temples, traditional villages and rich rituals in the spiritual core of the island.",
    category: "Sri Lanka with Senu Tours",
    theme: "Heritage",
    gradient: "from-purple-900/60 via-indigo-800/40 to-violet-700/30",
    accent: "#8b5cf6",
    bg: "https://images.unsplash.com/photo-1580130718646-9f694209b207?w=800&q=80",
  },
  {
    id: 5,
    days: 10,
    title: "Wildlife & Wilderness",
    subtitle: "Safari & nature",
    description:
      "Track leopards, elephants and exotic birds in national parks surrounded by untouched wilderness.",
    category: "Sri Lanka with Senu Tours",
    theme: "Wild",
    gradient: "from-amber-900/60 via-yellow-800/40 to-orange-700/30",
    accent: "#f97316",
    bg: "https://images.unsplash.com/photo-1564760054108-694b5fb36362?w=800&q=80",
  },
  {
    id: 6,
    days: 6,
    title: "Coastal Escape",
    subtitle: "Beach & ocean",
    description:
      "Relax on golden sands, dive into turquoise waters and enjoy fresh seafood by the shore.",
    category: "Sri Lanka with Senu Tours",
    theme: "Coastal",
    gradient: "from-blue-900/60 via-cyan-800/40 to-sky-700/30",
    accent: "#0ea5e9",
    bg: "https://images.unsplash.com/photo-1506929562872-bb421503ef7e?w=800&q=80",
  },
  {
    id: 7,
    days: 11,
    title: "Hill Country Retreat",
    subtitle: "Tea & mountains",
    description:
      "Wander through misty tea plantations, stay in colonial bungalows and breathe crisp mountain air.",
    category: "Sri Lanka with Senu Tours",
    theme: "Highland",
    gradient: "from-green-900/60 via-emerald-800/40 to-teal-700/30",
    accent: "#059669",
    bg: "https://images.unsplash.com/photo-1593511655855-d069183787a1?w=800&q=80",
  },
  {
    id: 8,
    days: 8,
    title: "Ayurveda & Wellness",
    subtitle: "Healing journey",
    description:
      "Rejuvenate body and mind with authentic Ayurvedic treatments in serene natural surroundings.",
    category: "Sri Lanka with Senu Tours",
    theme: "Wellness",
    gradient: "from-rose-900/60 via-pink-800/40 to-fuchsia-700/30",
    accent: "#ec4899",
    bg: "https://images.unsplash.com/photo-1545205597-2aaef9a7a318?w=800&q=80",
  },
  {
    id: 9,
    days: 7,
    title: "Adventure Trails",
    subtitle: "Active exploration",
    description:
      "Hike, cycle, kayak and surf your way through Sri Lanka’s most exciting landscapes.",
    category: "Sri Lanka with Senu Tours",
    theme: "Adventure",
    gradient: "from-red-900/60 via-rose-800/40 to-orange-700/30",
    accent: "#ef4444",
    bg: "https://images.unsplash.com/photo-1520962922320-2038eebab146?w=800&q=80",
  },
  {
    id: 10,
    days: 13,
    title: "Grand Island Journey",
    subtitle: "Complete discovery",
    description:
      "The ultimate in-depth exploration covering culture, wildlife, beaches and mountains.",
    category: "Sri Lanka with Senu Tours",
    theme: "Signature",
    gradient: "from-indigo-900/60 via-purple-800/40 to-pink-700/30",
    accent: "#7c3aed",
    bg: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  },
  {
    id: 11,
    days: 5,
    title: "Short & Sweet",
    subtitle: "Weekend getaway",
    description:
      "Perfect introduction to Sri Lanka’s beauty in just a few relaxing and memorable days.",
    category: "Sri Lanka with Senu Tours",
    theme: "Quick",
    gradient: "from-amber-900/60 via-yellow-800/40 to-amber-700/30",
    accent: "#d97706",
    bg: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
  },
  {
    id: 12,
    days: 14,
    title: "Ultimate Luxury Loop",
    subtitle: "Elite experience",
    description:
      "Exclusive stays, private guides, gourmet dining and VIP access across the island.",
    category: "Sri Lanka with Senu Tours",
    theme: "Elite",
    gradient: "from-gray-900/60 via-slate-800/40 to-zinc-700/30",
    accent: "#cbd5e1",
    bg: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
  },
];

/* ─── HELPERS ──────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── DECORATIVE LEAF SVG ──────────────────────────────────────── */
const LeafIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path
      d="M24 4C24 4 8 12 8 28C8 36 14 42 24 44C34 42 40 36 40 28C40 12 24 4 24 4Z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      opacity="0.4"
    />
    <path d="M24 44V16" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
    <path d="M24 24L18 19" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    <path d="M24 30L30 25" stroke="currentColor" strokeWidth="1" opacity="0.3" />
  </svg>
);

/* ─── TOUR CARD ────────────────────────────────────────────────── */
function TourCard({ tour, index, inView }: { tour: (typeof tours)[0]; index: number; inView: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.7s cubic-bezier(.22,.61,0,1) ${index * 0.18}s, transform 0.7s cubic-bezier(.22,.61,0,1) ${index * 0.18}s`,
      }}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
    >
      {/* ── Card Shell (aspect ratio box) ── */}
      <div className="relative" style={{ aspectRatio: "4 / 5" }}>
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
          style={{
            backgroundImage: `url(${tour.bg})`,
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}
        />

        {/* Dark gradient overlay – always present, deepens on hover */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: hovered
              ? "linear-gradient(to top, rgba(15,10,10,0.92) 0%, rgba(15,10,10,0.55) 50%, rgba(15,10,10,0.25) 100%)"
              : "linear-gradient(to top, rgba(15,10,10,0.75) 0%, rgba(15,10,10,0.35) 55%, rgba(15,10,10,0.12) 100%)",
          }}
        />

        {/* ── Content layer ── */}
        <div className="absolute inset-0 flex flex-col justify-between p-6">
          {/* Top row: days badge + accent dot */}
          <div className="flex items-start justify-between">
            <span
              className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
              }}
            >
              {tour.days} Days
            </span>
            {/* Decorative accent circle */}
            <div
              className="w-3 h-3 rounded-full transition-transform duration-500"
              style={{
                background: tour.accent,
                boxShadow: hovered ? `0 0 16px ${tour.accent}88` : "none",
                transform: hovered ? "scale(1.3)" : "scale(1)",
              }}
            />
          </div>

          {/* Bottom: text block */}
          <div>
            {/* Category tag */}
            <p
              className="text-xs tracking-widest uppercase mb-2"
              style={{ color: tour.accent }}
            >
              {tour.category}
            </p>

            {/* Title */}
            <h3
              className="text-white font-bold text-2xl leading-tight mb-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {tour.title}
            </h3>

            {/* Subtitle */}
            <p className="text-white/60 text-sm italic mb-3">{tour.subtitle}</p>

            {/* Description – slides in on hover */}
            <div
              className="overflow-hidden transition-all duration-500 ease-out"
              style={{
                maxHeight: hovered ? "60px" : "0px",
                opacity: hovered ? 1 : 0,
              }}
            >
              <p className="text-white/70 text-sm leading-relaxed">
                {tour.description}
              </p>
            </div>

            {/* CTA link */}
            <div
              className="flex items-center gap-2 mt-3 transition-all duration-400"
              style={{
                opacity: hovered ? 1 : 0.5,
                transform: hovered ? "translateX(4px)" : "translateX(0)",
                transition: "opacity 0.4s, transform 0.4s",
              }}
            >
              <span
                className="text-sm font-semibold tracking-wide"
                style={{ color: tour.accent }}
              >
                View More
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="transition-transform duration-300"
                style={{ transform: hovered ? "translateX(3px)" : "translateX(0)" }}
              >
                <path d="M4 9h10M10 5l4 4-4 4" stroke={tour.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN SECTION ─────────────────────────────────────────────── */
export default function DiscoverParadise() {
  const { ref, inView } = useInView(0.12);

  return (
    <section
      ref={ref}
      className="journey-section relative w-full min-h-screen flex flex-col items-center justify-center px-5 py-24"
    >
      {/* ── Subtle grain overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* ── Decorative floating elements ── */}
      <div className="absolute top-16 left-12 opacity-10 text-amber-300 pointer-events-none">
        <LeafIcon />
      </div>
      <div className="absolute bottom-24 right-16 opacity-8 text-emerald-300 pointer-events-none" style={{ transform: "rotate(30deg)", opacity: 0.08 }}>
        <LeafIcon />
      </div>

      {/* ── Thin horizontal rule ── */}
      <div
        className="w-16 mx-auto mb-6"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(212,175,110,0.6), transparent)",
          opacity: inView ? 1 : 0,
          transition: "opacity 1s ease 0.2s",
        }}
      />

      {/* ── Eyebrow ── */}
      <p
        className="text-xs tracking-widest uppercase text-center mb-4"
        style={{
          color: "rgba(139, 92, 246, 0.7)",
          fontFamily: "'Montserrat', sans-serif",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
        }}
      >
        Your voyage of discovery begins here. Say yes.
      </p>

      {/* ── Main heading ── */}
      <h2
        className="text-center text-gray-900 font-bold leading-tight mb-2"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(2rem, 5vw, 3.4rem)",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(18px)",
          transition: "opacity 0.8s cubic-bezier(.22,.61,0,1) 0.2s, transform 0.8s cubic-bezier(.22,.61,0,1) 0.2s",
        }}
      >
        Discover paradise,
        <span style={{ fontStyle: "italic", color: "#8b5cf6" }}> the Senu Tours way</span>
      </h2>

      {/* ── Sub-heading ── */}
      <h3
        className="text-center text-gray-600 font-light italic text-lg mb-2"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 0.7s ease 0.35s, transform 0.7s ease 0.35s",
        }}
      >
        Your journey: your plan.
      </h3>

      {/* ── Decorative divider ── */}
      <div
        className="flex items-center justify-center gap-3 mb-12"
        style={{
          opacity: inView ? 1 : 0,
          transition: "opacity 0.8s ease 0.45s",
        }}
      >
        <div className="h-px w-12" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5))" }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(139,92,246,0.7)" }} />
        <div className="h-px w-12" style={{ background: "linear-gradient(270deg, transparent, rgba(139,92,246,0.5))" }} />
      </div>

      {/* ── Cards grid ── 4 columns on lg+ */}
      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {tours.map((tour, i) => (
          <TourCard key={tour.id} tour={tour} index={i} inView={inView} />
        ))}
      </div>

      {/* ── CTA button ── */}
      <div
        className="mt-14"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.7s ease 0.75s, transform 0.7s ease 0.75s",
        }}
      >
        <ViewAllButton />
      </div>
    </section>
  );
}

/* ─── VIEW-ALL BUTTON ──────────────────────────────────────────── */
function ViewAllButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden px-8 py-3 rounded-full text-sm font-semibold tracking-widest uppercase"
      style={{
        color: hovered ? "#faf8f5" : "#1f2937",
        border: "1px solid rgba(139,92,246,0.45)",
        background: hovered ? "rgba(139,92,246,0.95)" : "rgba(139,92,246,0.1)",
        backdropFilter: "blur(4px)",
        transition: "background 0.4s, color 0.4s, border-color 0.4s",
        borderColor: hovered ? "rgba(139,92,246,0.95)" : "rgba(139,92,246,0.45)",
        cursor: "pointer",
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      View All Tours
    </button>
  );
}
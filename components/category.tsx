"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Types ─── */
interface ServiceData {
  id: string;
  title: string;
  desc: string;
  passion: string;
  bgImage: string;
  icon: React.FC<{ className?: string }>;
}

/* ─── SVG Icons ─── */
const PlaneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849" />
  </svg>
);
const BuildingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
    <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z" />
  </svg>
);
const CompassIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M8 .5a.5.5 0 0 1 .5.5v.518A7 7 0 0 1 14.74 7.5h.518a.5.5 0 0 1 0 1h-.518A7 7 0 0 1 8.5 14.982v.518a.5.5 0 0 1-1 0v-.518A7 7 0 0 1 1.258 8.5H.74a.5.5 0 0 1 0-1h.518A7 7 0 0 1 7.5 1.518V1a.5.5 0 0 1 .5-.5M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11" />
    <path d="M8 4a.5.5 0 0 1 .5.5v1.61a4.5 4.5 0 0 1 2.97 1.42l1.138-1.137a.5.5 0 0 1 .707.707L12.177 8.24a4.5 4.5 0 0 1-1.42 2.97H12.5a.5.5 0 0 1 0 1H8.5v1.75a.5.5 0 0 1-1 0V12.5H5.75a.5.5 0 0 1 0-1h1.743a4.5 4.5 0 0 1-1.42-2.97L4.935 9.668a.5.5 0 1 1-.707-.707l1.138-1.138A4.5 4.5 0 0 1 8.336 6.11V4.5A.5.5 0 0 1 8 4" />
  </svg>
);
const BriefcaseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5m1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0M1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5" />
  </svg>
);
const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314" />
  </svg>
);
const MapPinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
  </svg>
);

/* ─── Service Data ─── */
const SERVICES: ServiceData[] = [
  { id: "1", title: "Airport Transfers", desc: "Seamless door-to-airport journeys with comfort and punctuality. Our professional drivers ensure you never miss a flight, with real-time tracking and immaculate vehicles standing by.", passion: "Seamless", bgImage: "/hero/young-woman-traveling-beach-against-backdrop-old-ship.jpg", icon: PlaneIcon },
  { id: "2", title: "City Tours", desc: "Discover the vibrant heart of the city with expert local guides. From ancient temples to bustling markets, immerse yourself in the culture, history and hidden gems of Sri Lanka's finest cities.", passion: "Vibrant", bgImage: "/hero/female-tourists.jpg", icon: BuildingIcon },
  { id: "3", title: "Island Tours", desc: "Enchanting escapes across breathtaking islands and hidden beaches. Explore pristine coastlines, turquoise lagoons, and secluded coves found only with a trusted local guide by your side.", passion: "Enchanting", bgImage: "/hero/beautiful-woman-dress-by-waterfall.jpg", icon: CompassIcon },
  { id: "4", title: "Corporate Travel", desc: "Professional, efficient, and tailored business travel solutions. From executive airport transfers to full conference logistics, we handle every detail so your team can focus on what matters.", passion: "Professional", bgImage: "/hero/don-kaveen-93IYznJPkOA-unsplash.jpg", icon: BriefcaseIcon },
  { id: "5", title: "Wedding & Events", desc: "Magical moments crafted with elegance and unforgettable detail. Let us curate luxurious transportation and bespoke event travel that makes your special day truly extraordinary.", passion: "Magical", bgImage: "/hero/promodhya-abeysekara-gjd-7_3Ek_w-unsplash.jpg", icon: HeartIcon },
  { id: "6", title: "Long Distance", desc: "Exploring far horizons with comfort, safety, and style. Whether crossing the island or journeying to remote highland retreats, our long-distance service keeps you relaxed every mile of the way.", passion: "Exploring", bgImage: "/hero/branislav-rodman-aLkYtSh5zCY-unsplash.jpg", icon: MapPinIcon },
];

/* ─── Main Component ─── */
export default function ServicesSection() {
  const [activeCard, setActiveCard] = useState<string>("1");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Slider state
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const autoRef = useRef<NodeJS.Timeout | null>(null);

  const total = SERVICES.length;

  const goTo = useCallback((idx: number, dir: "next" | "prev") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 480);
  }, [animating]);

  const next = useCallback(() => goTo((current + 1) % total, "next"), [current, total, goTo]);
  const prev = useCallback(() => goTo((current - 1 + total) % total, "prev"), [current, total, goTo]);

  // Auto-advance every 5 s
  useEffect(() => {
    autoRef.current = setInterval(next, 5000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [next]);

  const resetAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(next, 5000);
  };

  const service = SERVICES[current];
  const isReversed = current % 2 !== 0; // alternates layout
  const Icon = service.icon;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Raleway:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        /* ── Section Wrapper ── */
        .journey-section {
          background: #ffffff;
          padding: 90px 0 0;
          position: relative;
          overflow: hidden;
        }
        .journey-section::before {
          content: '';
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(13,148,136,0.4), transparent);
        }
        .journey-section::after {
          content: '';
          position: absolute;
          bottom: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(13,148,136,0.3), transparent);
        }

        /* ── Header ── */
        .journey-header {
          text-align: center;
          margin-bottom: 52px;
        }
        .journey-header .eyebrow {
          display: block;
          font-family: 'Raleway', sans-serif;
          font-size: 13px; font-weight: 400;
          letter-spacing: 3px; text-transform: uppercase;
          color: #0d9488; margin-bottom: 14px;
        }
        .journey-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4.5vw, 42px);
          font-weight: 700; color: #1a1a2e;
          margin-bottom: 10px; line-height: 1.2;
        }
        .journey-header h3 {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(16px, 2.2vw, 20px);
          font-weight: 400; color: #6b7280; margin: 0;
        }
        .journey-header .teal-line {
          display: block; width: 48px; height: 2px;
          background: #0d9488; margin: 18px auto 0;
        }

        /* ── Card Grid ── */
        .journey-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
          max-width: 1200px; margin: 0 auto;
          padding: 0 20px 60px;
        }
        .journey-card {
          position: relative; border-radius: 12px;
          overflow: hidden; aspect-ratio: 3 / 4;
          cursor: pointer; transition: all 0.3s ease;
        }
        .journey-card .card-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transition: transform 0.6s ease;
        }
        .journey-card:hover .card-bg,
        .journey-card.active .card-bg { transform: scale(1.07); }
        .journey-card .card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(10,12,20,0.82) 0%, rgba(10,12,20,0.45) 45%, rgba(10,12,20,0.15) 100%);
          z-index: 1; transition: background 0.4s ease;
        }
        .journey-card:hover .card-overlay,
        .journey-card.active .card-overlay {
          background: linear-gradient(to top, rgba(10,12,20,0.88) 0%, rgba(10,12,20,0.55) 50%, rgba(10,12,20,0.22) 100%);
        }
        .journey-card .card-content {
          position: absolute; inset: 0; z-index: 2;
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-end;
          padding: 24px 16px; text-align: center;
        }
        .journey-card .card-icon-wrap {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -60%); z-index: 2;
          width: 56px; height: 56px;
          border: 1.5px solid rgba(13,148,136,0.5);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.4s ease;
        }
        .journey-card:hover .card-icon-wrap,
        .journey-card.active .card-icon-wrap {
          border-color: #0d9488;
          transform: translate(-50%, -60%) scale(1.08);
        }
        .journey-card .card-icon-wrap svg {
          width: 24px; height: 24px;
          fill: rgba(255,255,255,0.85);
          transition: fill 0.3s ease;
        }
        .journey-card:hover .card-icon-wrap svg,
        .journey-card.active .card-icon-wrap svg { fill: #0d9488; }
        .journey-card .card-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(13px, 1.5vw, 16px);
          font-weight: 600; color: #fff;
          margin-bottom: 6px; line-height: 1.3;
        }
        .journey-card .card-passion {
          font-family: 'Raleway', sans-serif;
          font-size: 10px; font-weight: 500;
          letter-spacing: 2px; text-transform: uppercase;
          color: #0d9488; opacity: 0;
          transform: translateY(6px);
          transition: all 0.35s ease 0.1s;
        }
        .journey-card:hover .card-passion,
        .journey-card.active .card-passion { opacity: 1; transform: translateY(0); }
        .journey-card.active { outline: 2px solid #0d9488; outline-offset: -2px; }

        /* ── Showcase Slider ── */
        .showcase-slider {
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        /* Slide wrapper */
        .showcase-slide {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 520px;
          transition: opacity 0.48s ease, transform 0.48s cubic-bezier(.4,0,.2,1);
        }

        /* Enter/Exit animations */
        .showcase-slide.exit-next  { opacity: 0; transform: translateX(-4%); }
        .showcase-slide.exit-prev  { opacity: 0; transform: translateX(4%); }
        .showcase-slide.enter      { opacity: 1; transform: translateX(0); }

        /* reversed: swap columns via order */
        .showcase-slide.reversed .slide-image-wrap { order: 2; }
        .showcase-slide.reversed .slide-text       { order: 1; }

        /* Image side */
        .slide-image-wrap {
          position: relative; overflow: hidden;
        }
        .slide-image {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transition: transform 6s ease;
        }
        .showcase-slide.enter .slide-image { transform: scale(1.04); }
        .slide-image-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(13,148,136,0.12) 0%, rgba(0,0,0,0.22) 100%);
        }
        .slide-badge {
          position: absolute; bottom: 28px; left: 28px;
          display: flex; align-items: center; gap: 8px;
          padding: 9px 18px;
          background: rgba(13,148,136,0.9);
          color: #fff; border-radius: 50px;
          font-family: 'Raleway', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 16px rgba(13,148,136,0.4);
        }
        .slide-badge svg { width: 13px; height: 13px; fill: #fff; }
        .showcase-slide.reversed .slide-badge { left: auto; right: 28px; }

        /* Text side */
        .slide-text {
          display: flex; flex-direction: column;
          justify-content: center;
          padding: clamp(40px, 6vw, 80px) clamp(36px, 5.5vw, 80px);
          background: #ffffff;
          position: relative;
        }
        .slide-text::before {
          content: '';
          position: absolute; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(to bottom, transparent, #0d9488, transparent);
        }
        .showcase-slide:not(.reversed) .slide-text::before { left: 0; }
        .showcase-slide.reversed .slide-text::before { right: 0; left: auto; }

        .slide-counter {
          font-family: 'Raleway', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 3px; text-transform: uppercase;
          color: #0d9488; margin-bottom: 12px; display: block;
        }
        .slide-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 3.5vw, 42px);
          font-weight: 700; color: #1a1a2e;
          line-height: 1.15; margin: 0 0 18px;
        }
        .slide-rule {
          width: 40px; height: 2px;
          background: #0d9488;
          margin-bottom: 22px; border-radius: 2px;
        }
        .slide-desc {
          font-family: 'Raleway', sans-serif;
          font-size: clamp(14px, 1.2vw, 16px);
          font-weight: 400; color: #4b5563;
          line-height: 1.85; margin-bottom: 36px;
        }
        .slide-btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 13px 28px;
          background: #0d9488; color: #fff;
          font-family: 'Raleway', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 1.2px; text-transform: uppercase;
          text-decoration: none; border-radius: 50px;
          transition: all 0.3s ease; width: fit-content;
          box-shadow: 0 4px 16px rgba(13,148,136,0.3);
        }
        .slide-btn svg { width: 16px; height: 16px; transition: transform 0.3s ease; }
        .slide-btn:hover { background: #0f766e; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13,148,136,0.4); }
        .slide-btn:hover svg { transform: translateX(4px); }

        /* ── Navigation Controls ── */
        .slider-controls {
          position: absolute;
          bottom: 28px; right: 36px;
          display: flex; align-items: center; gap: 10px;
          z-index: 10;
        }
        .slider-arrow {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: #fff;
          border: 1.5px solid rgba(13,148,136,0.3);
          color: #0d9488;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 2px 10px rgba(13,148,136,0.15);
        }
        .slider-arrow:hover { background: #0d9488; color: #fff; border-color: #0d9488; box-shadow: 0 4px 16px rgba(13,148,136,0.35); }
        .slider-arrow svg { width: 18px; height: 18px; }

        /* Dots */
        .slider-dots {
          display: flex; gap: 7px; align-items: center;
        }
        .slider-dot {
          width: 8px; height: 8px;
          border-radius: 50%; border: none;
          background: rgba(13,148,136,0.25);
          cursor: pointer; padding: 0;
          transition: all 0.3s ease;
        }
        .slider-dot.active {
          background: #0d9488;
          width: 24px; border-radius: 4px;
        }
        .slider-dot:hover { background: rgba(13,148,136,0.55); }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .journey-grid { grid-template-columns: repeat(3, 1fr); }
          .showcase-slide { min-height: 440px; }
        }
        @media (max-width: 768px) {
          .journey-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 0 14px 40px; }
          .journey-section { padding: 60px 0 0; }
          .showcase-slide,
          .showcase-slide.reversed {
            grid-template-columns: 1fr;
          }
          .showcase-slide.reversed .slide-image-wrap,
          .showcase-slide.reversed .slide-text { order: unset; }
          .slide-image-wrap { height: 280px; }
          .slide-text { padding: 36px 24px; }
          .slide-text::before { display: none; }
          .showcase-slide.reversed .slide-badge { left: 24px; right: auto; }
          .slider-controls { bottom: 16px; right: 16px; }
        }
      `}</style>

      <section className="journey-section">
        {/* ── Header ── */}
        <div className="journey-header" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 0" }}>
          <span className="eyebrow">The paths are many — you choose.</span>
          <h2>What&apos;s your journey?</h2>
          <h3>Your adventure. Your way.</h3>
          <span className="teal-line" />
        </div>

        {/* ── Card Grid ── */}
        <div className="journey-grid">
          {SERVICES.map((svc) => {
            const Icon = svc.icon;
            const isActive = activeCard === svc.id;
            return (
              <div
                key={svc.id}
                className={`journey-card ${isActive ? "active" : ""}`}
                onMouseEnter={() => setHoveredCard(svc.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => {
                  setActiveCard(svc.id);
                  const idx = SERVICES.findIndex((s) => s.id === svc.id);
                  goTo(idx, idx > current ? "next" : "prev");
                  resetAuto();
                }}
                role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveCard(svc.id); } }}
                aria-label={svc.title}
              >
                <div className="card-bg" style={{ backgroundImage: `url('${svc.bgImage}')` }} />
                <div className="card-overlay" />
                <div className="card-icon-wrap"><Icon /></div>
                <div className="card-content">
                  <div className="card-title">{svc.title}</div>
                  <div className="card-passion">{svc.passion}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Showcase Slider ── */}
        <div className="showcase-slider">
          <div
            className={[
              "showcase-slide",
              isReversed ? "reversed" : "",
              animating ? (direction === "next" ? "exit-next" : "exit-prev") : "enter",
            ].filter(Boolean).join(" ")}
          >
            {/* Image */}
            <div className="slide-image-wrap">
              <div
                className="slide-image"
                style={{ backgroundImage: `url('${service.bgImage}')` }}
              />
              <div className="slide-image-overlay" />
              <div className="slide-badge">
                <Icon className="" />
                <span>{service.passion}</span>
              </div>
            </div>

            {/* Text */}
            <div className="slide-text">
              <span className="slide-counter">
                {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
              <h3 className="slide-title">{service.title}</h3>
              <div className="slide-rule" />
              <p className="slide-desc">{service.desc}</p>
              <a href="#" className="slide-btn">
                View More
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 1 8" />
                  <path fillRule="evenodd" d="M7.5 5.5a.5.5 0 0 1 .707 0l3 3a.5.5 0 0 1 0 .707l-3 3a.5.5 0 0 1-.707-.707L9.793 8.5 7.5 6.207a.5.5 0 0 1 0-.707" />
                </svg>
              </a>
            </div>
          </div>

          {/* Controls */}
          <div className="slider-controls">
            {/* Dots */}
            <div className="slider-dots">
              {SERVICES.map((_, i) => (
                <button
                  key={i}
                  className={`slider-dot ${i === current ? "active" : ""}`}
                  onClick={() => { goTo(i, i > current ? "next" : "prev"); resetAuto(); }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Prev */}
            <button
              className="slider-arrow"
              onClick={() => { prev(); resetAuto(); }}
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Next */}
            <button
              className="slider-arrow"
              onClick={() => { next(); resetAuto(); }}
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
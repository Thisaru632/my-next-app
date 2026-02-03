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

/* ─── SVG Icon Components ─── */
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
  {
    id: "1",
    title: "Airport Transfers",
    desc: "Seamless door-to-airport journeys with comfort and punctuality",
    passion: "Seamless",
    bgImage: "/hero/young-woman-traveling-beach-against-backdrop-old-ship.jpg",
    icon: PlaneIcon,
  },
  {
    id: "2",
    title: "City Tours",
    desc: "Discover the vibrant heart of the city with expert local guides",
    passion: "Vibrant",
    bgImage: "/hero/female-tourists.jpg",
    icon: BuildingIcon,
  },
  {
    id: "3",
    title: "Island Tours",
    desc: "Enchanting escapes across breathtaking islands and hidden beaches",
    passion: "Enchanting",
    bgImage: "/hero/beautiful-woman-dress-by-waterfall.jpg",
    icon: CompassIcon,
  },
  {
    id: "4",
    title: "Corporate Travel",
    desc: "Professional, efficient, and tailored business travel solutions",
    passion: "Professional",
    bgImage: "/hero/don-kaveen-93IYznJPkOA-unsplash.jpg",
    icon: BriefcaseIcon,
  },
  {
    id: "5",
    title: "Wedding & Events",
    desc: "Magical moments crafted with elegance and unforgettable detail",
    passion: "Magical",
    bgImage: "/hero/promodhya-abeysekara-gjd-7_3Ek_w-unsplash.jpg",
    icon: HeartIcon,
  },
  {
    id: "6",
    title: "Long Distance",
    desc: "Exploring far horizons with comfort, safety, and style",
    passion: "Exploring",
    bgImage: "/hero/branislav-rodman-aLkYtSh5zCY-unsplash.jpg",
    icon: MapPinIcon,
  },
];

/* ─── Banner Slide Component ─── */
interface BannerSlide {
  id: string;
  bgImage: string;
  active: boolean;
}

/* ─── Main Component ─── */
export default function ServicesSection() {
  const [activeService, setActiveService] = useState<string>("1");
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [bannerSlides, setBannerSlides] = useState<BannerSlide[]>([
    { id: "1", bgImage: SERVICES[0].bgImage, active: true },
  ]);
  const [bannerTitle, setBannerTitle] = useState(SERVICES[0].title);
  const [bannerDesc, setBannerDesc] = useState(SERVICES[0].desc);
  const transitionRef = useRef<NodeJS.Timeout | null>(null);

  /* ── Slide Transition Logic ── */
  const changeBanner = useCallback((service: ServiceData) => {
    if (transitionRef.current) clearTimeout(transitionRef.current);

    setBannerTitle(service.title);
    setBannerDesc(service.desc);

    setBannerSlides((prev) => {
      const alreadyActive = prev.find((s) => s.active && s.bgImage === service.bgImage);
      if (alreadyActive) return prev;

      // Mark the new slide as active, keep old ones for fade-out
      const updated = prev.map((s) => ({ ...s, active: false }));
      updated.push({ id: service.id, bgImage: service.bgImage, active: true });
      return updated;
    });

    // Remove old inactive slides after transition completes
    transitionRef.current = setTimeout(() => {
      setBannerSlides((prev) => prev.filter((s) => s.active));
    }, 900);
  }, []);

  /* ── Hover / Click Handlers ── */
  const handleMouseEnter = (service: ServiceData) => {
    setHoveredService(service.id);
    changeBanner(service);
  };

  const handleMouseLeave = () => {
    setHoveredService(null);
    const active = SERVICES.find((s) => s.id === activeService);
    if (active) changeBanner(active);
  };

  const handleClick = (service: ServiceData) => {
    setActiveService(service.id);
    setHoveredService(null);
    changeBanner(service);
  };

  /* ── Initial mount ── */
  useEffect(() => {
    changeBanner(SERVICES[0]);
  }, [changeBanner]);

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      if (transitionRef.current) clearTimeout(transitionRef.current);
    };
  }, []);

  /* ── Determine "display" service (hover overrides active) ── */
  const displayId = hoveredService ?? activeService;

  return (
    <>
      {/* ─── Google Fonts ─── */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Raleway:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        /* ─── Section Wrapper ─── */
        .journey-section {
          background: #faf8f5;
          padding: 90px 0 0;
          position: relative;
          overflow: hidden;
        }
        .journey-section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #c9a96e44, transparent);
        }

        /* ─── Section Header ─── */
        .journey-header {
          text-align: center;
          margin-bottom: 52px;
          position: relative;
        }
        .journey-header .eyebrow {
          display: block;
          font-family: 'Raleway', sans-serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #c9a96e;
          margin-bottom: 14px;
        }
        .journey-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4.5vw, 42px);
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 10px;
          line-height: 1.2;
        }
        .journey-header h3 {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(16px, 2.2vw, 20px);
          font-weight: 400;
          color: #6b7280;
          margin: 0;
        }
        .journey-header .gold-line {
          display: block;
          width: 48px; height: 2px;
          background: #c9a96e;
          margin: 18px auto 0;
        }

        /* ─── Card Grid ─── */
        .journey-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px 40px;
        }

        /* ─── Individual Card ─── */
        .journey-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 3 / 4;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .journey-card .card-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: transform 0.6s ease;
        }
        .journey-card:hover .card-bg,
        .journey-card.active .card-bg {
          transform: scale(1.07);
        }
        .journey-card .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,12,20,0.82) 0%, rgba(10,12,20,0.45) 45%, rgba(10,12,20,0.15) 100%);
          z-index: 1;
          transition: background 0.4s ease;
        }
        .journey-card:hover .card-overlay,
        .journey-card.active .card-overlay {
          background: linear-gradient(to top, rgba(10,12,20,0.88) 0%, rgba(10,12,20,0.55) 50%, rgba(10,12,20,0.22) 100%);
        }
        .journey-card .card-content {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding: 24px 16px;
          text-align: center;
        }
        .journey-card .card-icon-wrap {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -60%);
          z-index: 2;
          width: 56px; height: 56px;
          border: 1.5px solid rgba(201,169,110,0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s ease;
        }
        .journey-card:hover .card-icon-wrap,
        .journey-card.active .card-icon-wrap {
          border-color: #c9a96e;
          transform: translate(-50%, -60%) scale(1.08);
        }
        .journey-card .card-icon-wrap svg {
          width: 24px; height: 24px;
          fill: rgba(255,255,255,0.85);
          transition: fill 0.3s ease;
        }
        .journey-card:hover .card-icon-wrap svg,
        .journey-card.active .card-icon-wrap svg {
          fill: #c9a96e;
        }
        .journey-card .card-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(13px, 1.5vw, 16px);
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 6px;
          letter-spacing: 0.3px;
          line-height: 1.3;
        }
        .journey-card .card-passion {
          font-family: 'Raleway', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #c9a96e;
          opacity: 0;
          transform: translateY(6px);
          transition: all 0.35s ease 0.1s;
        }
        .journey-card:hover .card-passion,
        .journey-card.active .card-passion {
          opacity: 1;
          transform: translateY(0);
        }
        .journey-card.active {
          outline: 2px solid #c9a96e;
          outline-offset: -2px;
        }

        /* ─── Full-width Banner ─── */
        .journey-banner {
          margin-top: 0;
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          margin-right: calc(-50vw + 50%);
          height: 75vh;
          min-height: 620px;
          position: relative;
          overflow: hidden;
        }
        .journey-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.68) 0%,
            rgba(0,0,0,0.48) 10%,
            rgba(0,0,0,0.20) 25%,
            rgba(0,0,0,0.08) 40%,
            rgba(0,0,0,0.02) 65%,
            transparent 100%
          );
          z-index: 1;
          pointer-events: none;
        }
        .banner-slides {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .banner-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transition: opacity 0.9s ease-in-out;
        }
        .banner-slide.active {
          opacity: 1;
        }

        /* ─── Banner Text Overlay ─── */
        .banner-text {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          pointer-events: none;
        }
        .banner-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 6vw, 72px);
          font-weight: 700;
          margin-bottom: 12px;
          text-shadow: 0 4px 12px rgba(0,0,0,0.7);
          letter-spacing: -0.5px;
        }
        .banner-description {
          font-family: 'Raleway', sans-serif;
          font-size: clamp(16px, 2.2vw, 22px);
          font-weight: 400;
          max-width: 720px;
          opacity: 0.95;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6);
          margin-bottom: 32px;
        }
        .banner-viewmore {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          border: 2px solid #ffffff;
          background: transparent;
          color: #ffffff;
          font-family: 'Raleway', sans-serif;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 50px;
          transition: all 0.3s ease;
          pointer-events: auto;
          cursor: pointer;
          text-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }
        .banner-viewmore:hover {
          background: #ffffff;
          color: #1a1a2e;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255,255,255,0.3);
          text-shadow: none;
        }
        .banner-viewmore svg {
          width: 20px; height: 20px;
          transition: transform 0.3s ease;
        }
        .banner-viewmore:hover svg {
          transform: translateX(4px);
        }

        /* ─── Responsive ─── */
        @media (max-width: 1024px) {
          .journey-grid { grid-template-columns: repeat(3, 1fr); }
          .journey-banner { min-height: 520px; height: 70vh; }
          .banner-title { font-size: clamp(32px, 5.5vw, 58px); }
          .banner-description { font-size: clamp(15px, 2vw, 20px); }
        }
        @media (max-width: 640px) {
          .journey-section { padding: 64px 0 0; }
          .journey-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            padding: 0 14px 30px;
          }
          .journey-banner { min-height: 420px; height: 65vh; }
          .banner-title { font-size: clamp(28px, 7vw, 44px); }
          .banner-description { font-size: clamp(14px, 3.5vw, 18px); padding: 0 20px; }
          .banner-viewmore { padding: 14px 28px; font-size: 15px; }
        }
      `}</style>

      <section className="journey-section">
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          {/* ─── Header ─── */}
          <div className="journey-header">
            <span className="eyebrow">The paths are many — you choose.</span>
            <h2>What&apos;s your journey?</h2>
            <h3>Your adventure. Your way.</h3>
            <span className="gold-line" />
          </div>

          {/* ─── Card Grid ─── */}
          <div className="journey-grid">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              const isActive = activeService === service.id;
              const isHighlighted = displayId === service.id;

              return (
                <div
                  key={service.id}
                  className={`journey-card ${isActive ? "active" : ""}`}
                  onMouseEnter={() => handleMouseEnter(service)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleClick(service)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleClick(service);
                    }
                  }}
                  aria-label={`${service.title}: ${service.desc}`}
                >
                  {/* Background Image */}
                  <div
                    className="card-bg"
                    style={{ backgroundImage: `url('${service.bgImage}')` }}
                  />
                  {/* Dark Overlay */}
                  <div className="card-overlay" />
                  {/* Centered Icon */}
                  <div className="card-icon-wrap">
                    <Icon />
                  </div>
                  {/* Bottom Text */}
                  <div className="card-content">
                    <div className="card-title">{service.title}</div>
                    <div className="card-passion">{service.passion}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Full-width Banner ─── */}
        <div className="journey-banner">
          {/* Slide layers */}
          <div className="banner-slides">
            {bannerSlides.map((slide, i) => (
              <div
                key={`${slide.id}-${slide.bgImage}-${i}`}
                className={`banner-slide ${slide.active ? "active" : ""}`}
                style={{ backgroundImage: `url('${slide.bgImage}')` }}
              />
            ))}
          </div>

          {/* Centered text overlay */}
          <div className="banner-text">
            <h2 className="banner-title">{bannerTitle}</h2>
            <p className="banner-description">{bannerDesc}</p>
            <a href="#" className="banner-viewmore">
              View More
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 1 8" />
                <path fillRule="evenodd" d="M7.5 5.5a.5.5 0 0 1 .707 0l3 3a.5.5 0 0 1 0 .707l-3 3a.5.5 0 0 1-.707-.707L9.793 8.5 7.5 6.207a.5.5 0 0 1 0-.707" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const SLIDES = [
  { src: "/hero/beautiful-woman-dress-by-waterfall.jpg", alt: "Woman by waterfall" },
  { src: "/hero/don-kaveen-93IYznJPkOA-unsplash.jpg", alt: "Tropical scenery" },
  { src: "/hero/promodhya-abeysekara-gjd-7_3Ek_w-unsplash.jpg", alt: "Beach view" },
];

const INTERVAL_MS = 6000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [kenKey, setKenKey] = useState(0); // bumped on every slide change to re-mount & restart Ken Burns

  // -----------------------------------------------------------------------
  // Auto-advance
  // -----------------------------------------------------------------------
  const next = useCallback(() => {
    setCurrent((prev) => {
      const n = (prev + 1) % SLIDES.length;
      setKenKey((k) => k + 1);
      return n;
    });
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, next]);

  const goTo = (i: number) => {
    setCurrent(i);
    setKenKey((k) => k + 1);
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <section
      style={{ height: "100vh", minHeight: "700px" }}
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ----------------------------------------------------------------
          SLIDE STACK
      ---------------------------------------------------------------- */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ zIndex: i === current ? 1 : 0, opacity: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          {/* Background image + Ken Burns zoom */}
          <div
            key={`${kenKey}-${i}`}
            className="absolute inset-0"
            style={{
              backgroundImage: `url('${slide.src}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              animation: i === current ? "kenBurns 8s ease-out forwards" : "none",
            }}
          />

          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(45,35,25,0.5) 50%, rgba(45,35,25,0.75) 100%)",
            }}
          />
        </div>
      ))}

      {/* ----------------------------------------------------------------
          HERO CONTENT
      ---------------------------------------------------------------- */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
        style={{ zIndex: 10 }}
      >
        <div className="w-full max-w-4xl">

          {/* Headline */}
          <div className="mb-4" style={{ animation: "fadeInUp 1s ease-out" }}>
            <h1
              className="text-white font-semibold tracking-tight"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(3rem, 8vw, 5.5rem)",
                lineHeight: 1.1,
                textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                marginBottom: "1.5rem",
              }}
            >
              SENU TOURS
            </h1>

            <p
              className="text-white uppercase"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 300,
                letterSpacing: "0.05em",
                fontSize: "clamp(0.75rem, 2vw, 1.125rem)",
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                opacity: 0.95,
              }}
            >
              Your Home, Your Journey, Your Hospitality Haven
            </p>
          </div>

          {/* Glassmorphism destination card */}
          <div
            className="flex justify-center mt-6 mb-6"
            style={{ animation: "fadeInUp 1s ease-out 0.3s both" }}
          >
            <div
              className="w-full max-w-xl rounded-xl px-8 py-10 text-center transition-all duration-500 ease-out"
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = "rgba(255,255,255,0.12)";
                el.style.transform = "translateY(-8px)";
                el.style.boxShadow = "0 20px 60px rgba(0,0,0,0.4)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = "rgba(255,255,255,0.08)";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              {/* Location pin icon (inline SVG – no extra dependency) */}
              <div className="mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mx-auto"
                  style={{ width: "2.5rem", height: "2.5rem", color: "#C9A961" }}
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>

              <h3
                className="text-white mb-2"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: "1.8rem",
                }}
              >
                Explore Sri Lanka
              </h3>

              <p
                className="mb-4"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 300,
                  fontSize: "0.95rem",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                A safely comfortable escorted journey within SenuTours offering
                serene routes, trusted service and joyful memories.
              </p>

              {/* CTA button */}
              <a
                href="/packages"
                className="inline-flex items-center text-white uppercase"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  letterSpacing: "0.05em",
                  border: "1.5px solid #C9A961",
                  borderRadius: "9999px",
                  padding: "0.75rem 2rem",
                  background: "transparent",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "#C9A961";
                  el.style.color = "#5D4E37";
                  el.style.transform = "translateY(-2px)";
                  el.style.boxShadow = "0 10px 30px rgba(201,169,97,0.3)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "transparent";
                  el.style.color = "#fff";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
              >
                View All Packages
                <span className="ml-2 inline-block" style={{ transition: "transform 0.3s ease" }}>
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------
          SLIDE INDICATOR DOTS
      ---------------------------------------------------------------- */}
      <div
        className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-3"
        style={{ zIndex: 15 }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="transition-all duration-300 ease-in-out"
            style={{
              width: i === current ? "30px" : "10px",
              height: "10px",
              borderRadius: i === current ? "5px" : "50%",
              background: i === current ? "#C9A961" : "rgba(255,255,255,0.4)",
              border: `1px solid ${i === current ? "#C9A961" : "rgba(255,255,255,0.6)"}`,
              padding: 0,
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/* ----------------------------------------------------------------
          SCROLL INDICATOR  (desktop only – hidden on mobile)
      ---------------------------------------------------------------- */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-4 hidden sm:block"
        style={{ zIndex: 10, animation: "fadeIn 1s ease-out 1s both" }}
      >
        <div className="flex flex-col items-center">
          <span
            className="text-white block mb-2"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "0.75rem",
              fontWeight: 400,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            Scroll
          </span>
          <div
            className="mx-auto"
            style={{
              width: "1px",
              height: "50px",
              background: "linear-gradient(to bottom, #C9A961, transparent)",
              animation: "scrollLineMove 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* ----------------------------------------------------------------
          KEYFRAMES  +  GOOGLE FONTS  (injected once per mount)
      ---------------------------------------------------------------- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');

        @keyframes kenBurns {
          0%   { transform: scale(1); }
          100% { transform: scale(1.1); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes scrollLineMove {
          0%, 100% { height: 30px; opacity: 0.5; }
          50%      { height: 50px; opacity: 1; }
        }

        /* Respect user motion preferences */
        @media (prefers-reduced-motion: reduce) {
          [style*="kenBurns"],
          [style*="fadeInUp"],
          [style*="fadeIn"],
          [style*="scrollLineMove"] {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
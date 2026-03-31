"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CallPopupDialog } from "./CallPopupDialog";
import { Snackbar, Alert } from "@mui/material";
import { Phone } from "@mui/icons-material";

/* ─── DESTINATIONS DATA ─────────────────────────────────────────── */
const destinations = [
  {
    id: 1,
    name: "Sigiriya",
    label: "Destinations",
    description: "Ancient rock fortress & UNESCO world heritage site",
    bg: "/destination/sigiriya.webp",
    tall: true,
  },
  {
    id: 2,
    name: "Ella",
    label: "Destinations",
    description: "Misty mountains & iconic Nine Arch Bridge",
    bg: "/destination/ella.webp",
    tall: false,
  },
  {
    id: 3,
    name: "Galle",
    label: "Destinations",
    description: "Colonial fort city by the sea",
    bg: "/destination/galle.webp",
    tall: false,
    slug: "galle",
  },
  {
    id: 4,
    name: "Yala",
    label: "Destinations",
    description: "Sri Lanka's premier wildlife sanctuary",
    bg: "/destination/yala.webp",
    tall: true,
  },
  {
    id: 5,
    name: "Kandy",
    label: "Destinations",
    description: "Temple of the Tooth & cultural capital",
    bg: "/destination/kandy.webp",
    tall: false,
  },
  {
    id: 6,
    name: "Mirissa",
    label: "Destinations",
    description: "Whale watching & golden beaches",
    bg: "/destination/mirissa.webp",
    tall: false,
  },
  {
    id: 7,
    name: "Polonnaruwa",
    label: "Destinations",
    description: "Ancient kingdoms & sacred ruins",
    bg: "/destination/polonnaruwa.webp",
    tall: false,
  },
  {
    id: 8,
    name: "Nuwara Eliya",
    label: "Destinations",
    description: "Tea trails & colonial hill station",
    bg: "/destination/34.webp",
    tall: false,
  },
];

/* ─── IN-VIEW HOOK ─────────────────────────────────────────────── */
function useInView(threshold = 0.1) {
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

/* ─── DESTINATION CARD ──────────────────────────────────────────── */
function DestCard({
  dest,
  index,
  inView,
}: {
  dest: (typeof destinations)[0];
  index: number;
  inView: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`dest-card ${dest.tall ? "dest-tall" : ""}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(36px)",
        transition: `opacity 0.75s cubic-bezier(.22,.61,0,1) ${index * 0.1}s, transform 0.75s cubic-bezier(.22,.61,0,1) ${index * 0.1}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {dest.slug ? (
        <Link href={`/destination/${dest.slug}`} style={{ display: 'block', height: '100%', width: '100%', textDecoration: 'none', color: 'inherit' }}>
          {/* Background image with zoom */}
          <div
            className="dest-img"
            style={{
              backgroundImage: `url(${dest.bg})`,
              transform: hovered ? "scale(1.07)" : "scale(1)",
            }}
          />

          {/* Dark gradient overlay */}
          <div
            className="dest-overlay"
            style={{
              background: hovered
                ? "linear-gradient(to top, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.3) 60%, rgba(5,5,5,0.06) 100%)"
                : "linear-gradient(to top, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.18) 60%, rgba(5,5,5,0.02) 100%)",
            }}
          />

          {/* Content */}
          <div className="dest-content">
            {/* Hover description */}
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

          </div>
        </Link>
      ) : (
        <>
          {/* Background image with zoom */}
          <div
            className="dest-img"
            style={{
              backgroundImage: `url(${dest.bg})`,
              transform: hovered ? "scale(1.07)" : "scale(1)",
            }}
          />

          {/* Dark gradient overlay */}
          <div
            className="dest-overlay"
            style={{
              background: hovered
                ? "linear-gradient(to top, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.3) 60%, rgba(5,5,5,0.06) 100%)"
                : "linear-gradient(to top, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.18) 60%, rgba(5,5,5,0.02) 100%)",
            }}
          />

          {/* Content */}
          <div className="dest-content">
            {/* Hover description */}
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

          </div>
        </>
      )}
    </div>
  );
}

/* ─── MAIN SECTION ─────────────────────────────────────────────── */
export default function MagicalDestinations() {
  const { ref, inView } = useInView(0.08);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  return (
    <section ref={ref} className="magical-section">

      {/* ── Section Header ── */}
      <div
        className="magical-header"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {/* Teal rule + eyebrow */}
        <div className="magical-eyebrow-row">
          <div className="magical-rule" />
          <span className="magical-eyebrow">Magical destinations</span>
          <div className="magical-rule" />
        </div>

        {/* Main heading */}
        <h2 className="magical-heading">
          Destination base tour <span className="heading-accent">packages with senu</span>
        </h2>

        {/* Sub */}
        <p className="magical-sub">
          Sri Lanka holds wonders at every turn — ancient kingdoms, lush jungles,
          sun-drenched shores and misty highlands, all waiting for you.
        </p>
      </div>

      {/* ── Destination Grid ── */}
      <div className="dest-grid">
        {/* Column 1: tall card */}
        <div className="dest-col">
          <DestCard dest={destinations[0]} index={0} inView={inView} />
        </div>

        {/* Column 2: two stacked */}
        <div className="dest-col">
          <DestCard dest={destinations[1]} index={1} inView={inView} />
          <DestCard dest={destinations[2]} index={2} inView={inView} />
        </div>

        {/* Column 3: tall card */}
        <div className="dest-col">
          <DestCard dest={destinations[3]} index={3} inView={inView} />
        </div>

        {/* Column 4: two stacked */}
        <div className="dest-col">
          <DestCard dest={destinations[4]} index={4} inView={inView} />
          <DestCard dest={destinations[5]} index={5} inView={inView} />
        </div>
      </div>

      {/* ── Second row of smaller cards ── */}
      <div className="dest-grid dest-grid-3"
        style={{
          opacity: inView ? 1 : 0,
          transition: "opacity 0.8s ease 0.5s",
        }}
      >
        <DestCard dest={destinations[6]} index={6} inView={inView} />
        <DestCard dest={destinations[7]} index={7} inView={inView} />
        {/* Promo card */}
        <div
          className="dest-card dest-promo"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(36px)",
            transition: "opacity 0.75s cubic-bezier(.22,.61,0,1) 0.7s, transform 0.75s cubic-bezier(.22,.61,0,1) 0.7s",
          }}
        >
          <div className="promo-inner">
            <span className="promo-eyebrow">Sri Lanka with Senu Tours</span>
            <h3 className="promo-heading">10+ magical<br /><em>destinations</em></h3>
            <p className="promo-sub">Each place tells a story. Let us take you there.</p>
            <ViewMoreButton onClick={() => setShowCallPopup(true)} />
          </div>
        </div>
      </div>

      <CallPopupDialog 
        open={showCallPopup} 
        onClose={() => setShowCallPopup(false)} 
        onCopySuccess={() => setCopySuccess(true)} 
      />

      <Snackbar 
        open={copySuccess} 
        autoHideDuration={3000} 
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
            Number copied to clipboard!
        </Alert>
      </Snackbar>

      {/* ── Styles ── */}
      <style>{`
        /* ── Section ── */
        .magical-section {
          background: #ffffff;
          padding: 80px 5% 80px;
          position: relative;
          overflow: hidden;
        }
        .magical-section::before {
          content: '';
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(13,148,136,0.4), transparent);
        }
        .magical-section::after {
          content: '';
          position: absolute;
          bottom: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(13,148,136,0.3), transparent);
        }

        /* ── Header ── */
        .magical-header {
          text-align: center;
          max-width: 720px;
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

        /* ── Grid ── */
        .dest-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 14px;
        }
        .dest-grid-3 {
          grid-template-columns: repeat(3, 1fr);
          margin-bottom: 0;
        }
        .dest-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* ── Card ── */
        .dest-card {
          position: relative;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          height: 260px;
          background: #e5e7eb;
        }
        .dest-tall {
          height: 534px; /* Two cards + gap */
        }

        /* image */
        .dest-img {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: transform 0.65s cubic-bezier(.4,0,.2,1);
        }

        /* overlay */
        .dest-overlay {
          position: absolute;
          inset: 0;
          transition: background 0.45s ease;
        }

        /* content */
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

        /* ── Promo card ── */
        .dest-promo {
          background: linear-gradient(135deg, #0d9488 0%, #3b82f6 100%);
          cursor: default;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .promo-inner {
          text-align: center;
          padding: 32px 24px;
        }
        .promo-eyebrow {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.75);
          display: block;
          margin-bottom: 14px;
        }
        .promo-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(22px, 2.5vw, 30px);
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
          margin: 0 0 12px;
        }
        .promo-heading em {
          font-style: italic;
        }
        .promo-sub {
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.78);
          line-height: 1.6;
          margin: 0 0 22px;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .dest-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dest-grid-3 {
            grid-template-columns: repeat(2, 1fr);
          }
          .dest-col { flex-direction: row; }
          .dest-tall { height: 300px; }
          .dest-card { height: 300px; }
        }
        @media (max-width: 640px) {
          .magical-section { padding: 60px 4% 60px; }
          .dest-grid, .dest-grid-3 { grid-template-columns: 1fr; }
          .dest-col { flex-direction: column; }
          .dest-tall, .dest-card { height: 260px; }
        }
      `}</style>
    </section>
  );
}

/* ─── VIEW MORE BUTTON ──────────────────────────────────────────── */
function ViewMoreButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "'Montserrat', sans-serif",
        fontSize: "11px",
        fontWeight: 800,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        padding: "14px 32px",
        borderRadius: "50px",
        border: "1.5px solid rgba(255,255,255,0.7)",
        background: hovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.12)",
        color: hovered ? "#0d9488" : "#ffffff",
        cursor: "pointer",
        transition: "all 0.3s ease",
        backdropFilter: "blur(4px)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        width: "100%",
        maxWidth: "320px",
      }}
    >
      <Phone sx={{ fontSize: 18 }} />
      get call and select your package
    </button>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";

const PILLARS = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    stat: "10+",
    label: "Years of Excellence",
    desc: "A decade crafting unforgettable Sri Lankan journeys.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    stat: "5,000+",
    label: "Happy Travellers",
    desc: "Guests from around the world who chose Senu for their journey.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    stat: "25+",
    label: "Destinations Covered",
    desc: "From misty highlands to golden shores — all of Sri Lanka.",
  },
];

export default function HeroDescription() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <style>{`
        /* ── wrapper ── */
        .hd-section {
          background: #ffffff;
          padding: 64px 20px 72px;
          position: relative;
          overflow: hidden;
        }
        .hd-section::before {
          content: '';
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(13,148,136,0.4), transparent);
        }
        .hd-section::after {
          content: '';
          position: absolute;
          bottom: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(13,148,136,0.3), transparent);
        }

        /* ── inner layout ── */
        .hd-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 52px;
        }

        /* ── tagline block ── */
        .hd-tagline {
          text-align: center;
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.75s ease, transform 0.75s ease;
        }
        .hd-tagline.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .hd-eyebrow {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #0d9488;
          margin-bottom: 14px;
        }
        .hd-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.75rem, 4vw, 2.75rem);
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1.15;
          margin: 0 0 14px;
          letter-spacing: -0.01em;
        }
        .hd-headline em {
          font-style: italic;
          color: #0d9488;
        }
        .hd-body {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(0.82rem, 1.4vw, 0.97rem);
          font-weight: 400;
          color: #5a5a72;
          max-width: 600px;
          line-height: 1.75;
          margin: 0 auto;
        }
        .hd-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 22px;
          justify-content: center;
        }
        .hd-divider span {
          display: block;
          height: 1px;
          width: 48px;
          background: linear-gradient(90deg, transparent, #0d9488);
        }
        .hd-divider span:last-child {
          background: linear-gradient(90deg, #0d9488, transparent);
        }
        .hd-divider-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #0d9488;
        }

        /* ── pillars ── */
        .hd-pillars {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          width: 100%;
        }
        .hd-pillar {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 32px 20px;
          border-radius: 16px;
          border: 1px solid rgba(13,148,136,0.15);
          background: #ffffff;
          box-shadow: 0 2px 16px rgba(0,0,0,.004);
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s ease, transform 0.65s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .hd-pillar.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .hd-pillar:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(13,148,136,0.14);
          border-color: rgba(13,148,136,0.4);
        }
        .hd-pillar-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(13,148,136,0.12) 0%, rgba(59,130,246,0.06) 100%);
          border: 1px solid rgba(13,148,136,0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          color: #0d9488;
          transition: background 0.3s ease;
        }
        .hd-pillar:hover .hd-pillar-icon {
          background: linear-gradient(135deg, rgba(13,148,136,0.22) 0%, rgba(59,130,246,0.1) 100%);
        }
        .hd-pillar-icon svg {
          width: 24px; height: 24px;
        }
        .hd-stat {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1;
          margin-bottom: 4px;
          letter-spacing: -0.02em;
        }
        .hd-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #0d9488;
          margin-bottom: 10px;
        }
        .hd-desc {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.8rem;
          font-weight: 400;
          color: #8a8aa0;
          line-height: 1.6;
        }

        /* ── responsive ── */
        @media (max-width: 768px) {
          .hd-pillars {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .hd-section { padding: 48px 16px 56px; }
          .hd-pillar { padding: 24px 16px; }
        }
        @media (min-width: 769px) and (max-width: 1023px) {
          .hd-pillars {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }
      `}</style>

      <section className="hd-section" ref={sectionRef}>
        <div className="hd-inner">

          {/* ── Tagline ── */}
          <div className={`hd-tagline${visible ? " visible" : ""}`}>
            <span className="hd-eyebrow">Welcome to Senu Tours</span>
            <h2 className="hd-headline">
              Sri Lanka, Explored <em>Your Way</em>
            </h2>
            <p className="hd-body">
              From the mist-wrapped highlands of Ella to the sun-drenched shores of Mirissa,
              Senu Tours curates premium, personalised travel experiences that reveal the true soul
              of the island — with comfort, elegance, and a local heart.
            </p>
            <div className="hd-divider">
              <span />
              <div className="hd-divider-dot" />
              <span />
            </div>
          </div>

          {/* ── Pillars ── */}
          <div className="hd-pillars">
            {PILLARS.map((p, i) => (
              <div
                key={i}
                className={`hd-pillar${visible ? " visible" : ""}`}
                style={{ transitionDelay: visible ? `${0.15 + i * 0.12}s` : "0s" }}
              >
                <div className="hd-pillar-icon">{p.icon}</div>
                <div className="hd-stat">{p.stat}</div>
                <div className="hd-label">{p.label}</div>
                <div className="hd-desc">{p.desc}</div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}

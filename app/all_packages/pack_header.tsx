'use client';

import Image from 'next/image';

export default function PackHeader() {
  return (
    <>
      {/* Hero Banner Section */}
      <section className="hero-banner">
        <div className="hero-overlay"></div>
        <Image
          src="/hero/two-individuals-carrying-backpacks-standing-hill-gazing-lake.jpg"
          alt="Two people with backpacks standing on a hill gazing at a lake in Sri Lanka"
          fill
          className="hero-image"
          priority
          style={{ objectFit: 'cover' }}
        />
        <div className="hero-content">
          <div className="container">
            <div className="hero-breadcrumb">
              <span>Home</span>
              <span className="separator">/</span>
              <span>Tours</span>
            </div>
            <h1 className="hero-title">
              Discover Sri Lanka
            </h1>
            <p className="hero-subtitle">
              Your journey: your plan
            </p>
            <p className="hero-description">
              Curated experiences across the pearl of the Indian Ocean
            </p>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Scroll to explore</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </section>

      <style jsx>{`
        /* ============= HERO SECTION ============= */
        .hero-banner {
          height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero-image {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 1;
          animation: slowZoom 20s ease-in-out infinite alternate;
        }

        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%);
          z-index: 2;
        }

        .hero-content {
          position: relative;
          z-index: 3;
          text-align: center;
          color: white;
          animation: fadeInUp 1s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-breadcrumb {
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 300;
        }

        .hero-breadcrumb .separator {
          margin: 0 0.75rem;
          opacity: 0.6;
        }

        .hero-title {
          font-size: clamp(3.5rem, 9vw, 6.5rem);
          font-weight: 300;
          letter-spacing: -2px;
          margin-bottom: 1rem;
          line-height: 1.05;
          font-family: 'Georgia', serif;
        }

        .hero-subtitle {
          font-size: clamp(1.5rem, 4vw, 2.25rem);
          font-weight: 300;
          letter-spacing: 4px;
          margin-bottom: 1.25rem;
          text-transform: uppercase;
        }

        .hero-description {
          font-size: 1.25rem;
          font-weight: 300;
          max-width: 640px;
          margin: 0 auto;
          opacity: 0.95;
          line-height: 1.6;
        }

        .scroll-indicator {
          position: absolute;
          bottom: 50px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          text-align: center;
          color: white;
          font-size: 0.9rem;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          animation: fadeIn 1.8s ease-out 0.6s both;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .scroll-arrow {
          margin-top: 12px;
          font-size: 1.8rem;
          animation: bounce 2.5s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-12px); }
          60% { transform: translateY(-6px); }
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .hero-banner {
            height: 100vh;
          }

          .hero-title {
            font-size: clamp(2.8rem, 10vw, 4.8rem);
          }

          .hero-subtitle {
            font-size: clamp(1.2rem, 5vw, 1.6rem);
          }

          .hero-description {
            font-size: 1.1rem;
            padding: 0 1.5rem;
          }

          .scroll-indicator {
            bottom: 30px;
          }
        }
      `}</style>
    </>
  );
}
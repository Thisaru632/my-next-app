'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Footer from '@/components/footer';
import { Tag, Copy, Check, Users, Briefcase, Wind, Sparkles, ShieldCheck, ArrowRight, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface PromoCardProps {
  id: string;
  name: string;
  category: 'car' | 'van-bus';
  title: string;
  image: string;
  discount: string;
  description: string;
  promoCode: string;
  features: {
    passengers: number;
    bags: number;
    ac: boolean;
  };
  details: string[];
}

const PROMOTIONS: PromoCardProps[] = [
  {
    id: 'wagonr',
    name: 'Wagon R',
    category: 'car',
    title: 'දිගු ගමන් සඳහා විශ්වාසවන්ත සේවාව',
    image: '/wagonr-promo.jpg',
    discount: '15% OFF',
    description: '',
    promoCode: 'SENUWAGON',
    features: {
      passengers: 3,
      bags: 2,
      ac: true
    },
    details: [
      'Applicable on daily rates',
      'Free cancellation within 24h',
      'Plains & city travel covered'
    ]
  },
  {
    id: 'alto',
    name: 'Alto',
    category: 'car',
    title: 'Alto Economy Saver',
    image: '/Vehicle images/Alto/front.png',
    discount: '10% OFF',
    description: 'Redefine budget travel with Sri Lanka\'s most popular compact car. Light, efficient, and easy to park.',
    promoCode: 'SENUALTO',
    features: {
      passengers: 3,
      bags: 1,
      ac: true
    },
    details: [
      'No minimum booking days',
      'Ideal for couples & solo trips',
      'Fuel-efficient matching rates'
    ]
  },
  {
    id: 'kdh',
    name: 'KDH',
    category: 'van-bus',
    title: 'KDH Group Getaway',
    image: '/Vehicle images/KDH High Roof/front.png',
    discount: '15% OFF',
    description: 'Travel in luxury with your whole group. Standard high-roof Toyota KDH Vans with ultimate passenger comfort.',
    promoCode: 'SENUKDH',
    features: {
      passengers: 14,
      bags: 5,
      ac: true
    },
    details: [
      'Valid for high roof & flat roof KDH',
      'Dual AC climate control included',
      'Uniformed professional chauffeur'
    ]
  },
  {
    id: 'bus',
    name: 'Bus',
    category: 'van-bus',
    title: 'Bus Tour Mega Deal',
    image: '/Vehicle images/AC 29 Seater Bus/front.png',
    discount: '20% OFF',
    description: 'Planning a large corporate excursion or wedding event? Get massive discounts on our premium AC coaches.',
    promoCode: 'SENUBUS',
    features: {
      passengers: 32,
      bags: 10,
      ac: true
    },
    details: [
      '29-Seater & 32-Seater options',
      'Perfect for islandwide tours',
      'Chauffeur & luggage porter service'
    ]
  }
];

export default function PromotionPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'car' | 'van-bus'>('all');
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleCopyCode = (code: string, vehicle: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setToastMessage(`Promo code "${code}" copied for ${vehicle}!`);
    setTimeout(() => {
      setCopiedCode(null);
      setToastMessage(null);
    }, 2500);
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const filteredPromos = PROMOTIONS.filter((promo) => {
    if (activeTab === 'all') return true;
    return promo.category === activeTab;
  });

  return (
    <div className="promotion-page-container">
      {/* Background Ornaments */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <Check size={18} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="promo-hero">
        <div className="hero-pattern"></div>
        <div className="hero-content">
          <div className="badge-wrapper">
            <Sparkles size={14} className="sparkle-icon" />
            <span>Exclusive Travel Deals</span>
          </div>
          <h1 className="hero-title">Special Promotions</h1>
          <p className="hero-subtitle">
            Save more on your travels with Senu Tours. Copy any active promotional code below and apply it during your booking process.
          </p>
        </div>
      </section>

      {/* Tab Filter & Main Grid */}
      <main className="promo-main">
        {/* Tab Filters */}
        <div className="filter-tabs">
          <button 
            onClick={() => setActiveTab('all')} 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          >
            All Offers
          </button>
          <button 
            onClick={() => setActiveTab('car')} 
            className={`tab-btn ${activeTab === 'car' ? 'active' : ''}`}
          >
            Budget Cars
          </button>
          <button 
            onClick={() => setActiveTab('van-bus')} 
            className={`tab-btn ${activeTab === 'van-bus' ? 'active' : ''}`}
          >
            Vans & Buses
          </button>
        </div>

        {/* Sliding Promotions Wrapper */}
        <div className="slider-container-outer">
          <button 
            className="slider-arrow arrow-left" 
            onClick={() => scrollSlider('left')} 
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="promo-grid" ref={sliderRef}>
            {filteredPromos.map((promo) => (
              <div key={promo.id} className="promo-card">
                {/* Card Header Image */}
                <div className="card-image-wrapper">
                  <Image 
                    src={promo.image} 
                    alt={promo.title}
                    fill
                    className="card-image"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={promo.id === 'wagonr'}
                  />
                  <div className="discount-tag">
                    <Tag size={12} />
                    <span>{promo.discount}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  <div className="card-header">
                    <span className="vehicle-category">{promo.name} Exclusive</span>
                    <h3 className="card-title">{promo.title}</h3>
                  </div>

                  {promo.description && <p className="card-description">{promo.description}</p>}

                  {/* Specs Row */}
                  <div className="specs-row">
                    <div className="spec-item">
                      <Users size={14} />
                      <span className="spec-label">Seats</span>
                      <span className="spec-value">{promo.features.passengers} Max</span>
                    </div>
                    <div className="spec-item border-x">
                      <Briefcase size={14} />
                      <span className="spec-label">Bags</span>
                      <span className="spec-value">{promo.features.bags} Bags</span>
                    </div>
                    <div className="spec-item">
                      <Wind size={14} />
                      <span className="spec-label">A/C</span>
                      <span className="spec-value">{promo.features.ac ? 'Air Con' : 'No AC'}</span>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="card-action-footer">
                    <a href={`/promotion/${promo.id}`} className="book-now-btn">
                      <span>Explore</span>
                      <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="slider-arrow arrow-right" 
            onClick={() => scrollSlider('right')} 
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        </div>


      </main>

      <Footer />

      {/* Styled JSX for Sliding Cards and Reduced Sizing */}
      <style jsx>{`
        .promotion-page-container {
          min-height: 100vh;
          background-color: #faf8f5;
          position: relative;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          font-family: 'Montserrat', sans-serif;
        }

        /* Abstract Glow Blobs for Depth */
        .bg-blob {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          z-index: 0;
          pointer-events: none;
        }

        .blob-1 {
          background-color: rgba(13, 148, 136, 0.2);
          top: 10%;
          left: -100px;
        }

        .blob-2 {
          background-color: rgba(59, 130, 246, 0.12);
          bottom: 20%;
          right: -100px;
        }

        /* Toast Styling */
        .toast-notification {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background-color: #0f172a;
          color: #ffffff;
          padding: 14px 20px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 9999;
          font-weight: 600;
          font-size: 13.5px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .toast-icon {
          color: #10b981;
          background-color: rgba(16, 185, 129, 0.15);
          padding: 2px;
          border-radius: 50%;
        }

        /* Hero Design */
        .promo-hero {
          position: relative;
          padding: 110px 20px 50px;
          text-align: center;
          background: linear-gradient(135deg, #071d24 0%, #0d2e38 100%);
          color: #ffffff;
          overflow: hidden;
          z-index: 1;
        }

        .hero-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: radial-gradient(#C9A961 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .badge-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 30px;
          background-color: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #34d399;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 16px;
        }

        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 44px;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin-bottom: 12px;
          line-height: 1.15;
          color: #ffffff;
        }

        .hero-subtitle {
          font-size: 14px;
          color: #cbd5e1;
          line-height: 1.5;
          max-width: 550px;
          margin: 0 auto;
          font-weight: 400;
        }

        /* Main Section & Cards Grid */
        .promo-main {
          flex-grow: 1;
          max-width: 1240px;
          width: 100%;
          margin: 0 auto;
          padding: 30px 24px 60px;
          position: relative;
          z-index: 2;
        }

        /* Filter Tabs */
        .filter-tabs {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 30px;
        }

        .tab-btn {
          padding: 8px 20px;
          border-radius: 30px;
          border: 1px solid #e2e8f0;
          background-color: #ffffff;
          font-weight: 600;
          font-size: 13px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .tab-btn:hover {
          border-color: #0d9488;
          color: #0d9488;
        }

        .tab-btn.active {
          background-color: #0d9488;
          border-color: #0d9488;
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(13, 148, 136, 0.2);
        }

        /* Slider Containers */
        .slider-container-outer {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 50px;
          width: 100%;
        }

        /* Slider Navigation Arrows */
        .slider-arrow {
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          z-index: 10;
        }

        .slider-arrow:hover {
          background-color: #0d9488;
          color: #ffffff;
          border-color: #0d9488;
          box-shadow: 0 6px 16px rgba(13, 148, 136, 0.3);
          transform: scale(1.05);
        }

        .slider-arrow:active {
          transform: scale(0.95);
        }

        .arrow-left {
          left: -15px;
        }

        .arrow-right {
          right: -15px;
        }

        /* Sliding Promo Grid (Displays in one row) */
        .promo-grid {
          display: flex;
          width: 100%;
          gap: 20px;
          overflow-x: auto;
          scroll-behavior: smooth;
          scroll-snap-type: x mandatory;
          padding: 10px 4px;
          scrollbar-width: none; /* Hide scrollbar Firefox */
        }

        .promo-grid::-webkit-scrollbar {
          display: none; /* Hide scrollbar Safari & Chrome */
        }

        /* Reduced Card Sizes (Displays exactly 4 on desktop, 3 on laptop, 2 on mobile) */
        .promo-card {
          flex: 0 0 auto;
          scroll-snap-align: start;
          width: calc((100% - 3 * 20px) / 4); /* Exactly 4 cards on desktop */
          background-color: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.025);
          border: 1px solid rgba(0, 0, 0, 0.015);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .promo-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(13, 148, 136, 0.06);
          border-color: rgba(13, 148, 136, 0.12);
        }

        /* Reduced Card Header Image */
        .card-image-wrapper {
          position: relative;
          height: 160px; /* Reduced from 260px */
          width: 100%;
          overflow: hidden;
          background-color: #ffffff;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #f1f5f9;
        }

        .card-image {
          object-fit: contain;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 12px;
        }

        .promo-card:hover .card-image {
          transform: scale(1.04);
        }

        .discount-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 11px;
          padding: 5px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 4px 8px rgba(13, 148, 136, 0.25);
          z-index: 2;
        }

        /* Reduced Card Body Padding */
        .card-body {
          padding: 18px; /* Reduced from 30px */
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .card-header {
          margin-bottom: 8px;
        }

        .vehicle-category {
          font-size: 10px;
          color: #0d9488;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; /* Reduced from 28px */
          font-weight: 700;
          color: #0f172a;
          margin-top: 2px;
          line-height: 1.2;
        }

        .card-description {
          font-size: 12.5px; /* Reduced from 14px */
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 14px; /* Reduced from 22px */
        }

        /* Reduced Specs Row Height & Padding */
        .specs-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          padding: 8px 0; /* Reduced from 14px */
          background-color: #fafbfc;
          border-radius: 10px;
          margin-bottom: 14px;
          border: 1px solid #f1f5f9;
        }

        .spec-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          color: #0d9488;
        }

        .spec-item.border-x {
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
        }

        .spec-label {
          font-size: 8.5px;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 600;
          margin-top: 1px;
        }

        .spec-value {
          font-size: 11.5px;
          color: #334155;
          font-weight: 700;
          margin-top: 1px;
        }

        /* Bullet Points spacing reduced */
        .details-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 18px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #475569;
        }

        .check-icon {
          color: #10b981;
          flex-shrink: 0;
        }

        /* Card Actions Footer Stacked on all responsive resolutions */
        .card-action-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column; /* Stacked for compact card width */
          align-items: stretch;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .promo-code-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 10px;
          border: 2px dashed #cbd5e1;
          background-color: #f8fafc;
          font-family: monospace;
          font-weight: 700;
          font-size: 12px;
          color: #475569;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .promo-code-btn:hover {
          border-color: #0d9488;
          color: #0d9488;
          background-color: rgba(13, 148, 136, 0.02);
        }

        .promo-code-btn.copied {
          border-color: #10b981;
          background-color: #ecfdf5;
          color: #065f46;
          border-style: solid;
        }

        .book-now-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: linear-gradient(135deg, #0d9488 0%, #3b82f6 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 12px;
          padding: 10px 18px;
          border-radius: 10px;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          box-shadow: 0 4px 8px rgba(13, 148, 136, 0.12);
          transition: all 0.3s ease;
        }

        .book-now-btn:hover {
          background: linear-gradient(135deg, #0f766e 0%, #2563eb 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(13, 148, 136, 0.2);
        }

        /* How to Use Section */
        .how-to-use-section {
          background-color: #ffffff;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.015);
          border: 1px solid #f1f5f9;
          margin-top: 10px;
        }

        .how-to-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
        }

        .help-icon {
          color: #0d9488;
        }

        .section-title-alt {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 700;
          color: #1e293b;
        }

        .steps-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .step-card {
          position: relative;
          padding: 20px;
          background-color: #f8fafc;
          border-radius: 14px;
          border: 1px solid #f1f5f9;
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: #0d9488;
          color: #ffffff;
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 12px;
          box-shadow: 0 3px 6px rgba(13, 148, 136, 0.15);
        }

        .step-card h4 {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 6px;
        }

        .step-card p {
          font-size: 12.5px;
          color: #64748b;
          line-height: 1.45;
        }

        /* Animations */
        @keyframes slideInUp {
          from {
            transform: translateY(15px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* RESPONSIVE LAYOUT BREAKPOINTS (EXACT COUNTS REQUESTED BY USER) */
        
        /* 1. Laptop view: Display 4 cards at once and reduce card height */
        @media (max-width: 1199px) {
          .promo-grid {
            gap: 16px;
          }
          .promo-card {
            width: calc((100% - 3 * 16px) / 4); /* Exactly 4 cards on laptop view */
          }
          .card-image-wrapper {
            height: 115px; /* Substantially reduced image container height */
            padding: 8px;
          }
          .card-image {
            padding: 8px;
          }
          .card-body {
            padding: 12px; /* Reduced body padding */
          }
          .card-title {
            font-size: 16px; /* Reduced title size */
          }
          .card-description {
            font-size: 11.5px;
            margin-bottom: 8px;
          }
          .specs-row {
            padding: 6px 0;
            margin-bottom: 10px;
            border-radius: 8px;
          }
          .spec-label {
            font-size: 7.5px;
          }
          .spec-value {
            font-size: 10.5px;
          }
          .details-list {
            display: none; /* Hide details on laptop view to significantly reduce height */
          }
          .card-action-footer {
            padding-top: 8px;
            gap: 6px;
          }
          .promo-code-btn, .book-now-btn {
            padding: 8px;
            font-size: 11px;
            border-radius: 8px;
          }
          .arrow-left {
            left: -10px;
          }
          .arrow-right {
            right: -10px;
          }
        }

        /* 2. Mobile view: Display exactly 2 cards at once */
        @media (max-width: 767px) {
          .bg-blob {
            width: 200px;
            height: 200px;
            filter: blur(80px);
          }

          .promo-hero {
            padding: 95px 16px 36px;
          }

          .hero-title {
            font-size: 32px;
          }

          .hero-subtitle {
            font-size: 13px;
          }

          .promo-main {
            padding: 20px 12px 40px;
          }

          .filter-tabs {
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 6px;
          }

          .tab-btn {
            padding: 6px 14px;
            font-size: 12px;
          }

          .slider-container-outer {
            margin-bottom: 35px;
          }

          /* Grid/Flex wrap columns for mobile to display 2 cards per row, wrapping into multiple rows */
          .promo-grid {
            flex-wrap: wrap;
            overflow-x: visible;
            scroll-snap-type: none;
            gap: 12px; /* Smaller gap on mobile */
          }

          .promo-card {
            border-radius: 16px;
            width: calc((100% - 12px) / 2); /* Exactly 2 cards on mobile */
          }

          .card-image-wrapper {
            height: 100px; /* Reduced card image height on mobile */
            padding: 8px;
          }
          
          .card-image {
            padding: 6px;
          }

          .card-body {
            padding: 12px; /* Super compact body */
          }

          .card-title {
            font-size: 16px; /* Reduced from 20px */
          }
          
          .card-description {
            font-size: 11.5px; /* Reduced from 12.5px */
            margin-bottom: 10px;
          }

          .specs-row {
            padding: 6px 0;
            margin-bottom: 12px;
            border-radius: 8px;
          }

          .spec-label {
            font-size: 7.5px;
          }

          .spec-value {
            font-size: 10.5px;
          }

          .details-list {
            display: none; /* Hide details bullets on mobile to keep vertical height balanced and gorgeous */
          }

          .card-action-footer {
            padding-top: 10px;
            gap: 6px;
          }

          .promo-code-btn {
            padding: 8px;
            font-size: 11px;
            border-radius: 8px;
          }

          .book-now-btn {
            padding: 8px;
            font-size: 11px;
            border-radius: 8px;
          }

          /* Hide slider navigation arrows on mobile as swipes are preferred */
          .slider-arrow {
            display: none;
          }

          /* How to Use on Mobile */
          .how-to-use-section {
            padding: 20px;
          }

          .steps-container {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .step-card {
            padding: 16px;
          }
        }

        /* Extra Small Screen Adaptability */
        @media (max-width: 480px) {
          .hero-title {
            font-size: 28px;
          }
          .card-image-wrapper {
            height: 90px;
          }
          .card-title {
            font-size: 14.5px;
          }
          .card-description {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden; /* Clamp text to keep heights uniform on small screens */
          }
        }
      `}</style>
    </div>
  );
}

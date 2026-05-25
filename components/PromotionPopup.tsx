"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Sparkles, ArrowRight } from 'lucide-react';

export default function PromotionPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Listen for custom event to open the promotion popup
    const handleOpenPromo = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-promo-popup', handleOpenPromo);

    // Check if query parameter ?promo=true exists to open immediately
    const urlParams = new URLSearchParams(window.location.search);
    const hasPromoParam = urlParams.get('promo') === 'true';
    if (hasPromoParam) {
      setIsOpen(true);
      // Clean up the URL parameter without refreshing the page
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    // Default auto-open behavior with a 2-second delay
    // We only auto-open if the promo hasn't been claimed in the current session
    // AND if we didn't just force open it via query param
    const isClaimed = sessionStorage.getItem('promo_claimed') === 'true';
    let timer: any = null;
    
    if (!isClaimed && !hasPromoParam) {
      timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('open-promo-popup', handleOpenPromo);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.removeItem('promo_claimed');
    window.dispatchEvent(new CustomEvent('promo-updated'));
  };

  const handleGetOffer = () => {
    handleClose();
    // Dispatch custom event to apply the senu15 promo code
    window.dispatchEvent(new CustomEvent('apply-senu15'));
    // Scroll to booking section
    const bookingSection = document.getElementById('booking-section');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
          />

          {/* Popup Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '450px',
              background: '#0d1117',
              borderRadius: '28px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header Image/Gradient */}
            <div style={{ 
              height: '180px', 
              position: 'relative', 
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)'
            }}>
              {/* Background Image if available, otherwise nice pattern */}
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                backgroundImage: 'url("/promo_bg.png")', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                opacity: 0.6
              }} />
              
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to bottom, transparent, rgba(13, 17, 23, 1))' 
              }} />

              {/* Close Button */}
              <button 
                onClick={handleClose}
                style={{ 
                  position: 'absolute', 
                  top: '15px', 
                  right: '15px', 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  color: '#fff',
                  backdropFilter: 'blur(4px)',
                  transition: 'background 0.2s',
                  zIndex: 2
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
              >
                <X size={18} />
              </button>

              <div style={{ position: 'absolute', bottom: '15px', left: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#0d9488', borderRadius: '10px', padding: '8px', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)' }}>
                  <Tag color="#fff" size={24} />
                </div>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '0.8rem', color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Limited Time Offer</span>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '30px 40px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Sparkles size={18} color="#0d9488" />
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '1.2rem', color: '#3b82f6' }}>Exclusive Deal</span>
                <Sparkles size={18} color="#0d9488" />
              </div>

              <h2 style={{ 
                fontFamily: "'Cormorant Garamond', serif", 
                fontSize: '3.5rem', 
                fontWeight: 700, 
                color: '#fff', 
                margin: '0 0 10px 0',
                lineHeight: 1
              }}>
                15% OFF
              </h2>

              <p style={{ 
                fontFamily: "'Montserrat', sans-serif", 
                fontSize: '0.95rem', 
                color: '#9ca3af', 
                lineHeight: 1.6,
                margin: '0 0 25px 0'
              }}>
                Book any vehicle from our premium collection today and enjoy a 15% discount on your entire journey.
              </p>

              <button 
                onClick={handleGetOffer}
                style={{ 
                  width: '100%',
                  background: 'linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px 24px',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 10px 20px -5px rgba(13, 148, 136, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(13, 148, 136, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(13, 148, 136, 0.4)';
                }}
              >
                Get Offer <ArrowRight size={18} />
              </button>

              <p style={{ 
                marginTop: '15px', 
                fontSize: '0.7rem', 
                color: '#4b5563', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                fontWeight: 600
              }}>
                * Applicable for all vehicle types
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

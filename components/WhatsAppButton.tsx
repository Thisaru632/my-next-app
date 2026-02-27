"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

/**
 * WhatsApp Button Component
 * Displays a floating WhatsApp button in the bottom right corner of the page.
 */
const WhatsAppButton = () => {
    const pathname = usePathname();

    // Hide if in the staff section
    if (pathname?.startsWith('/staff')) {
        return null;
    }
    // Replace with your actual WhatsApp number (include country code, without + or 00)
    const phoneNumber = "94702787787";
    const message = encodeURIComponent("Hi Senu Tours, I'd like to inquire about a booking.");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                width: '60px',
                height: '60px',
                backgroundColor: '#25D366',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                zIndex: 9999,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textDecoration: 'none',
                WebkitTapHighlightColor: 'transparent',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 211, 102, 0.4)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
            }}
            aria-label="Chat on WhatsApp"
        >
            <svg
                viewBox="0 0 448 512"
                width="32"
                height="32"
                fill="#FFFFFF"
            >
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.4 69.4 26.5 106.3 26.5 122.4 0 222-99.6 222-222 0-59.3-23.1-115.1-65.1-156.5zM223.9 445.5c-33.1 0-65.7-8.9-94.1-25.7l-6.7-4-69.8 18.3L72 365.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-82.7 184.6-184.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.4-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
            </svg>

            {/* Inner Ring Pulse Animation */}
            <span style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '2px solid #25D366',
                animation: 'whatsapp-pulse 2s infinite',
                pointerEvents: 'none',
                zIndex: -1,
            }}></span>

            <style jsx>{`
                @keyframes whatsapp-pulse {
                    0% {
                        transform: scale(1);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(1.6);
                        opacity: 0;
                    }
                }
            `}</style>
        </a>
    );
};

export default WhatsAppButton;

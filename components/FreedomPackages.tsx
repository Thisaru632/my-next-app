"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CallPopupDialog } from './CallPopupDialog';
import { Snackbar, Alert } from '@mui/material';

const PACKAGES = [
    {
        id: 1,
        title: "100KM Freedom",
        limit: "100 KM / 10 Hours",
        description: "Perfect for a quick city tour or a short getaway to nearby attractions.",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop",
        gradient: "linear-gradient(to top, rgba(13, 148, 136, 0.9), transparent)"
    },
    {
        id: 3,
        title: "350KM Discovery",
        limit: "350 KM / 19 Hours",
        description: "The ultimate choice for long-distance travel and deep province exploration.",
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop",
        gradient: "linear-gradient(to top, rgba(236, 72, 153, 0.9), transparent)"
    },
    {
        id: 4,
        title: "500KM Expedition",
        limit: "500 KM / 43 Hours",
        description: "For the serious wanderers who want to cover cross-country distances in comfort.",
        image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop",
        gradient: "linear-gradient(to top, rgba(245, 158, 11, 0.9), transparent)"
    },
    {
        id: 5,
        title: "750KM Odyssey",
        limit: "750 KM / 67 Hours",
        description: "A grand tour across multiple cities with overnight stays and unlimited possibilities.",
        image: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=80&w=2070&auto=format&fit=crop",
        gradient: "linear-gradient(to top, rgba(99, 102, 241, 0.9), transparent)"
    },
    {
        id: 6,
        title: "1000KM Grand Master",
        limit: "1000 KM / 91 Hours",
        description: "Our most extensive package for those who want to see every corner of paradise.",
        image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop",
        gradient: "linear-gradient(to top, rgba(16, 185, 129, 0.9), transparent)"
    }
];

export default function FreedomPackages() {
    const [active, setActive] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showCallPopup, setShowCallPopup] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-slide logic
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setActive((prev) => (prev + 1) % PACKAGES.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [isPaused]);

    const nextSlide = () => {
        setActive((prev) => (prev + 1) % PACKAGES.length);
    };

    const prevSlide = () => {
        setActive((prev) => (prev - 1 + PACKAGES.length) % PACKAGES.length);
    };

    const getPosition = (index: number) => {
        const diff = index - active;

        // Handle wrap around
        if (diff === 0) return 'center';
        if (diff === 1 || (active === PACKAGES.length - 1 && index === 0)) return 'right';
        if (diff === -1 || (active === 0 && index === PACKAGES.length - 1)) return 'left';
        return 'hidden';
    };

    return (
        <section
            className="freedom-section py-20 bg-white overflow-hidden relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="container mx-auto px-4 mb-16 text-center">
                {/* Eyebrow */}
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-12 h-[1px] bg-teal-500/50"></div>
                    <span className="text-teal-500 text-xs font-bold tracking-[0.3em] uppercase">Unrestricted Travel</span>
                    <div className="w-12 h-[1px] bg-teal-500/50"></div>
                </div>

                <h2 className="text-4xl md:text-6xl font-serif text-gray-900 mb-6">
                    The <span className="text-teal-600 italic">Freedom</span> Road
                </h2>

                <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                    We provide the comfort, your choice of vehicle, and the limits; you decide the destination.
                    Experience Sri Lanka your way with our flexible mileage and vehicle selection packages.
                </p>
            </div>

            {/* Carousel Container */}
            <div className="relative h-[550px] md:h-[650px] flex items-center justify-center">
                {/* Navigation Buttons */}
                <button
                    onClick={prevSlide}
                    className="absolute left-2 md:left-10 z-30 p-2 md:p-4 rounded-full bg-white/80 border border-gray-200 text-gray-800 hover:bg-teal-500 hover:border-teal-500 hover:text-white transition-all duration-300 shadow-md backdrop-blur-sm"
                >
                    <ChevronLeft size={20} className="md:w-6 md:h-6" />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-2 md:right-10 z-30 p-2 md:p-4 rounded-full bg-white/80 border border-gray-200 text-gray-800 hover:bg-teal-500 hover:border-teal-500 hover:text-white transition-all duration-300 shadow-md backdrop-blur-sm"
                >
                    <ChevronRight size={20} className="md:w-6 md:h-6" />
                </button>

                {/* Slides */}
                <div className="relative w-full max-w-[1200px] h-full flex items-center justify-center perspective-[1000px]">
                    {PACKAGES.map((pkg, index) => {
                        const pos = getPosition(index);

                        return (
                            <div
                                key={pkg.id}
                                className={`absolute w-[85vw] md:w-[400px] h-[480px] md:h-[600px] transition-all duration-700 ease-out rounded-3xl overflow-hidden cursor-pointer shadow-2xl group
                  ${pos === 'center' ? 'z-20 opacity-100 translate-x-0 scale-100 md:scale-110' : ''}
                  ${pos === 'left' ? 'z-10 opacity-40 md:opacity-65 -translate-x-[70%] md:-translate-x-[80%] scale-80 md:scale-90 blur-[2px] md:blur-[1px]' : ''}
                  ${pos === 'right' ? 'z-10 opacity-40 md:opacity-65 translate-x-[70%] md:translate-x-[80%] scale-80 md:scale-90 blur-[2px] md:blur-[1px]' : ''}
                  ${pos === 'hidden' ? 'opacity-0 scale-50 pointer-events-none' : ''}
                `}
                                onClick={() => pos !== 'center' && setActive(index)}
                            >
                                {/* Image */}
                                <Image
                                    src={pkg.image}
                                    alt={pkg.title}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                />

                                {/* Gradient Overlay */}
                                <div
                                    className="absolute inset-0 z-10"
                                    style={{ background: pkg.gradient }}
                                />

                                {/* Content Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 z-20 flex flex-col items-start translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <span className="text-white/70 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1 md:mb-2">{pkg.limit}</span>
                                    <h3 className="text-white text-2xl md:text-4xl font-serif font-bold mb-2 md:mb-4">{pkg.title}</h3>
                                    <p className="text-white/80 text-xs md:text-base leading-relaxed mb-6 md:mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2 md:line-clamp-3">
                                        {pkg.description}
                                    </p>

                                    <button 
                                        className="px-6 md:px-8 py-2.5 md:py-3 bg-white text-gray-900 rounded-xl font-bold text-xs md:text-sm tracking-wider uppercase hover:bg-teal-600 hover:text-white transition-all duration-300 shadow-xl self-stretch md:self-start"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCallPopup(true);
                                        }}
                                    >
                                        Request Package
                                    </button>
                                </div>

                                {/* Subtle border shine */}
                                <div className="absolute inset-0 border border-white/5 rounded-3xl z-30 pointer-events-none" />
                            </div>
                        );
                    })}
                </div>

                {/* Indicators */}
                <div className="absolute -bottom-16 md:-bottom-10 flex gap-3 z-30">
                    {PACKAGES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            className={`h-2 rounded-full transition-all duration-500 ${active === i ? 'w-10 md:w-12 bg-teal-500' : 'w-2 bg-gray-300'}`}
                        />
                    ))}
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

            <style jsx>{`
        .perspective-[1000px] {
          perspective: 1000px;
        }
      `}</style>
        </section>
    );
}

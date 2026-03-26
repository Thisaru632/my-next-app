"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Ensure some minimum display time for the beautiful loader
        const minTimeTimer = setTimeout(() => {
            if (document.readyState === 'complete') {
                setLoading(false);
            } else {
                window.addEventListener('load', () => setLoading(false));
            }
        }, 1200);

        return () => {
            clearTimeout(minTimeTimer);
            window.removeEventListener('load', () => setLoading(false));
        };
    }, []);

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => setVisible(false), 800);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #071d24 0%, #0a2a33 100%)',
            opacity: loading ? 1 : 0,
            transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: loading ? 'all' : 'none'
        }}>
            <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px'
            }}>
                <div style={{
                    position: 'relative',
                    width: '130px',
                    height: '130px',
                    animation: 'pulseScale 2s infinite ease-in-out'
                }}>
                    <Image 
                        src="/senu tours 3d.png" 
                        alt="Senu Tours Logo" 
                        fill 
                        className="object-contain"
                        priority
                    />
                </div>
                
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '2.2rem',
                            fontWeight: 700,
                            color: '#C9A961',
                            letterSpacing: '6px',
                            margin: 0,
                            textTransform: 'uppercase',
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                        }}>
                            SENU TOURS
                        </h1>
                        <p style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: '0.65rem',
                            color: '#0d9488',
                            letterSpacing: '3px',
                            margin: '4px 0 0 0',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            opacity: 0.8
                        }}>
                            Excellence Redefined
                        </p>
                    </div>

                    <div style={{
                        width: '280px',
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '10px',
                        marginTop: '12px',
                        border: '1px solid rgba(13,148,136,0.2)'
                    }}>
                        <div style={{
                            position: 'absolute',
                            height: '100%',
                            width: '40%',
                            background: 'linear-gradient(90deg, transparent, #C9A961, #0d9488, transparent)',
                            borderRadius: '10px',
                            animation: 'loadingProgress 1.5s infinite linear',
                            boxShadow: '0 0 15px rgba(201, 169, 97, 0.6)'
                        }} />
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulseScale {
                    0%, 100% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scale(1.05); opacity: 1; }
                }
                @keyframes loadingProgress {
                    0% { left: -50%; }
                    100% { left: 110%; }
                }
            `}</style>
        </div>
    );
}

"use client";

import { useEffect, useState, useRef } from "react";
import StarIcon from '@mui/icons-material/Star';
import GoogleIcon from '@mui/icons-material/Google';

const REVIEWS = [
    { name: "Kavindi Perera", rating: 5, text: "Best tour experience in Sri Lanka! The guide was so helpful.", date: "2 days ago" },
    { name: "James Thompson", rating: 5, text: "Excellent service and safe driving. Highly recommended for tourists!", date: "1 week ago" },
    { name: "Duminda Ranaweera", rating: 5, text: "Senu Tours made our family trip truly unforgettable. Thank you!", date: "3 days ago" },
    { name: "Sophie Schmidt", rating: 5, text: "Professional staff and very clean vehicles. Amazing landscape views.", date: "5 days ago" },
    { name: "Tharushi Fernando", rating: 5, text: "Great value for money. The itinerary was perfectly planned.", date: "2 weeks ago" },
];

export default function RatingBar() {
    return (
        <div className="rating-bar-wrapper">
            <style>{`
                .rating-bar-wrapper {
                    height: 170px;
                    background: #ffffff;
                    border-top: 2px solid rgba(13, 148, 136, 0.4);
                    border-bottom: 2px solid rgba(13, 148, 136, 0.4);
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                    position: relative;
                    z-index: 20;
                    box-shadow: inset 0 2px 10px rgba(13, 148, 136, 0.05);
                }

                .rating-bar-static {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 0 55px;
                    border-right: 2px solid rgba(13, 148, 136, 0.45);
                    height: 100%;
                    white-space: nowrap;
                    background: #ffffff;
                    z-index: 10;
                    box-shadow: 15px 0 35px rgba(0,0,0,0.06);
                    position: relative;
                }

                .rating-bar-static::after {
                    content: '';
                    position: absolute;
                    top: 0; right: -2px; bottom: 0;
                    width: 4px;
                    background: linear-gradient(to bottom, transparent, rgba(13, 148, 136, 0.6), transparent);
                }

                .google-logo {
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));
                }

                .rating-text {
                    color: #475569;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-bottom: 6px;
                    opacity: 0.8;
                }

                .stars {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                }

                .rating-value {
                    color: #0d9488;
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 800;
                    font-size: 1.4rem;
                    margin-right: 12px;
                    line-height: 1;
                    letter-spacing: -0.5px;
                }

                .stars-icons {
                    color: #C9A961;
                    display: flex;
                    gap: 1px;
                }

                .slider-container {
                    flex-grow: 1;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    height: 100%;
                    mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                }

                .slider-track {
                    display: flex;
                    gap: 24px;
                    padding-left: 24px;
                    white-space: nowrap;
                    animation: slideReviews 60s linear infinite;
                    height: 100%;
                    align-items: center;
                }

                @keyframes slideReviews {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(-50% - 12px)); }
                }

                .review-card {
                    display: inline-flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 18px 24px;
                    background: #ffffff;
                    border: 1px solid rgba(13, 148, 136, 0.08);
                    border-radius: 20px;
                    box-shadow: 0 10px 25px -5px rgba(13, 148, 136, 0.06);
                    min-width: 340px;
                    max-width: 420px;
                    height: 120px;
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    position: relative;
                    margin: 8px 0;
                }

                .review-card:hover {
                    transform: translateY(-4px) scale(1.02);
                    border-color: rgba(13, 148, 136, 0.25);
                    box-shadow: 0 15px 35px -10px rgba(13, 148, 136, 0.12);
                    z-index: 50;
                }

                .reviewer-name {
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 800;
                    color: #0d9488;
                    font-size: 0.9rem;
                    margin-bottom: 2px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .review-text {
                    font-family: 'Montserrat', sans-serif;
                    font-style: italic;
                    color: #475569;
                    font-size: 0.85rem;
                    margin-bottom: 8px;
                    white-space: normal;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.4;
                    font-weight: 500;
                }

                .card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .card-stars {
                    color: #C9A961;
                    display: flex;
                    gap: 1px;
                }

                /* Mobile overrides */
                @media (max-width: 768px) {
                    .rating-bar-wrapper { 
                        height: 155px; 
                    }
                    .rating-bar-static { 
                        padding: 0 20px; 
                        min-width: 140px;
                        border-right-width: 1.5px;
                    }
                    .rating-bar-static::after {
                        width: 2px;
                        right: -1.5px;
                    }
                    .google-logo { margin-bottom: 8px; }
                    .google-logo svg { width: 22px; height: 22px; }
                    .rating-text { font-size: 0.6rem; letter-spacing: 1px; margin-bottom: 4px; }
                    .rating-value { font-size: 1.15rem; margin-right: 8px; }
                    .stars-icons svg { font-size: 14px !important; }
                    
                    .review-card { 
                        min-width: 280px; 
                        height: 115px; 
                        padding: 16px 20px; 
                    }
                    .reviewer-name { font-size: 0.75rem; }
                    .reviewer-name svg { width: 12px; height: 12px; }
                    .review-text { 
                        font-size: 0.72rem; 
                        -webkit-line-clamp: 2; 
                        line-height: 1.3;
                    }
                    .card-stars svg { font-size: 11px !important; }
                    
                    .slider-track { gap: 16px; padding-left: 16px; }
                }
            `}</style>

            <div className="rating-bar-static">
                <div className="google-logo" style={{ marginBottom: '14px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.09H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.91l3.66-2.8z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.09l3.66 2.82c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                </div>
                <div className="rating-text">GOOGLE RATING</div>
                <div className="stars">
                    <span className="rating-value">4.7/5</span>
                    <div className="stars-icons">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <StarIcon key={i} sx={{ fontSize: 20 }} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="slider-container">
                <div className="slider-track">
                    {[...REVIEWS, ...REVIEWS].map((review, i) => (
                        <div className="review-card" key={i}>
                            <div className="reviewer-name">
                                <svg width="14" height="14" viewBox="0 0 24 24" style={{ marginRight: '4px' }}>
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.09H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.91l3.66-2.8z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.09l3.66 2.82c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                {review.name}
                            </div>
                            <div className="review-text">"{review.text}"</div>
                            <div className="card-footer">
                                <div className="card-stars">
                                    {[1, 2, 3, 4, 5].map((_, starI) => (
                                        <StarIcon key={starI} sx={{ fontSize: 14 }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

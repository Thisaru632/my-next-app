"use client";

import { useEffect, useState, useRef } from "react";
import StarIcon from '@mui/icons-material/Star';
import GoogleIcon from '@mui/icons-material/Google';

const REVIEWS = [
    { name: "John Doe", rating: 5, text: "Best tour experience in Sri Lanka!", date: "2 days ago" },
    { name: "Sarah Smith", rating: 5, text: "Excellent service and safe driving. Highly recommended!", date: "1 week ago" },
    { name: "Michael Chen", rating: 5, text: "Senu Tours made our honeymoon unforgettable.", date: "3 days ago" },
    { name: "Emma Wilson", rating: 5, text: "Professional staff and very clean vehicles.", date: "5 days ago" },
    { name: "David Brown", rating: 5, text: "Great value for money. The itinerary was perfect.", date: "2 weeks ago" },
];

export default function RatingBar() {
    return (
        <div className="rating-bar-wrapper">
            <style>{`
                .rating-bar-wrapper {
                    height: 140px;
                    background: #f8fafc;
                    border-bottom: 1px solid rgba(13, 148, 136, 0.1);
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                    position: relative;
                    z-index: 20;
                }

                .rating-bar-static {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 0 40px;
                    border-right: 1px solid rgba(13, 148, 136, 0.15);
                    height: 100%;
                    white-space: nowrap;
                    background: #ffffff;
                    z-index: 10;
                    box-shadow: 15px 0 35px rgba(0,0,0,0.04);
                }

                .google-logo {
                    color: #4285F4;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .rating-text {
                    color: #1a1a2e;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 0.95rem;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }

                .stars {
                    color: #C9A961;
                    display: flex;
                    gap: 2px;
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
                    padding: 16px 24px;
                    background: #ffffff;
                    border: 1px solid rgba(13, 148, 136, 0.12);
                    border-radius: 16px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    min-width: 320px;
                    max-width: 400px;
                    height: 90px;
                    transition: transform 0.3s ease, border-color 0.3s ease;
                }

                .review-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(13, 148, 136, 0.4);
                }

                .reviewer-name {
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 700;
                    color: #0d9488;
                    font-size: 0.85rem;
                    margin-bottom: 2px;
                }

                .review-text {
                    font-family: 'Montserrat', sans-serif;
                    font-style: italic;
                    color: #5a5a72;
                    font-size: 0.82rem;
                    margin-bottom: 6px;
                    white-space: normal;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.3;
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
                    .rating-bar-wrapper { height: 120px; }
                    .rating-bar-static { padding: 0 20px; }
                    .review-card { min-width: 260px; height: 80px; padding: 12px 18px; }
                    .rating-text { font-size: 0.8rem; }
                    .review-text { font-size: 0.75rem; -webkit-line-clamp: 1; }
                }
            `}</style>

            <div className="rating-bar-static">
                <div className="google-logo">
                    <GoogleIcon sx={{ fontSize: 26, color: '#4285F4' }} />
                </div>
                <div className="rating-text">GOOGLE RATING</div>
                <div className="stars">
                    <span style={{ color: '#0d9488', fontWeight: 800, marginRight: '8px', fontSize: '1rem' }}>4.9/5</span>
                    {[1, 2, 3, 4, 5].map((_, i) => (
                        <StarIcon key={i} sx={{ fontSize: 18 }} />
                    ))}
                </div>
            </div>

            <div className="slider-container">
                <div className="slider-track">
                    {[...REVIEWS, ...REVIEWS].map((review, i) => (
                        <div className="review-card" key={i}>
                            <div className="reviewer-name">{review.name}</div>
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

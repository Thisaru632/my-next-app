'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    quote: "Had a magical trip to Sri Lanka with over 1,000 photos and a fantastic 20-minute film made by our son. Smooth, hassle-free holiday with a perfect guide. Highly recommended!",
    author: "Charlotte",
    location: "United Kingdom"
  },
  {
    id: 2,
    quote: "We thoroughly enjoyed our time in Sri Lanka, appreciating the country's beauty and the warmth of its people. Thank you for your professionalism, making our experience truly memorable.",
    author: "Charles",
    location: "Italy"
  },
  {
    id: 3,
    quote: "Grateful for the excellent 2-week itinerary. Special thanks for thoughtful hotel arrangements. Our guide, Mr. Kumar, was outstanding—warm, knowledgeable and passionate. Your exceptional service guarantees our recommendations to friends and family.",
    author: "Gayathri",
    location: "India"
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="testimonials-section">
      <div className="container">
        {/* Image Gallery Grid */}
        <div className="gallery-grid">
          <div className="gallery-main">
            <Image
              src="/testimonial/1.jpg"
              alt="Couple viewing Sigiriya Rock"
              fill
              className="gallery-image"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="gallery-bottom">
            <div className="gallery-item">
              <Image
                src="/testimonial/2.jpg"
                alt="River adventure"
                fill
                className="gallery-image"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            </div>
            <div className="gallery-item">
              <Image
                src="/testimonial/3.jpg"
                alt="Romantic moment"
                fill
                className="gallery-image"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            </div>
          </div>
        </div>

        {/* Testimonials Content */}
        <div className="testimonials-content">
          <div className="section-label">
            <span className="dot"></span>
            <span className="label-text">The memories they made</span>
          </div>

          <h2 className="section-title">Our guests share their thoughts</h2>
          <p className="section-subtitle">Testimonials</p>

          <div className="testimonial-card">
            <div className="quote-icon">“</div>
            
            <p className="testimonial-text">
              {testimonials[currentIndex].quote}
            </p>

            <div className="testimonial-author">
              <span className="author-name">{testimonials[currentIndex].author}</span>
              <span className="author-location">{testimonials[currentIndex].location}</span>
            </div>

            {/* Navigation Buttons */}
            <div className="navigation-buttons">
              <button 
                onClick={prevTestimonial}
                className="nav-button prev-button"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextTestimonial}
                className="nav-button next-button"
                aria-label="Next testimonial"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="pagination-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`dot-button ${index === currentIndex ? 'active' : ''}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .testimonials-section {
          padding: 80px 0;
          background-color: #faf8f5;
          overflow: hidden;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        /* Gallery Styles */
        .gallery-grid {
          display: grid;
          grid-template-rows: 2fr 1fr;
          gap: 20px;
          height: 600px;
        }

        .gallery-main {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }

        .gallery-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .gallery-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        :global(.gallery-image) {
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .gallery-main:hover :global(.gallery-image),
        .gallery-item:hover :global(.gallery-image) {
          transform: scale(1.05);
        }

        /* Content Styles */
        .testimonials-content {
          padding: 20px;
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .dot {
          width: 8px;
          height: 8px;
          background-color: #c4374a;
          border-radius: 50%;
        }

        .label-text {
          font-size: 14px;
          color: #666;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .section-title {
          font-size: 42px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 10px;
          line-height: 1.2;
          font-family: 'Playfair Display', serif;
        }

        .section-subtitle {
          font-size: 32px;
          color: #1a1a1a;
          margin-bottom: 40px;
          font-family: 'Playfair Display', serif;
          font-weight: 400;
        }

        .testimonial-card {
          position: relative;
          background: white;
          padding: 50px 40px;
          border-radius: 8px;
          box-shadow: 0 5px 30px rgba(0, 0, 0, 0.08);
        }

        .quote-icon {
          font-size: 80px;
          color: #c4374a;
          line-height: 1;
          margin-bottom: 20px;
          font-family: Georgia, serif;
        }

        .testimonial-text {
          font-size: 16px;
          line-height: 1.8;
          color: #444;
          margin-bottom: 30px;
          min-height: 150px;
        }

        .testimonial-author {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .author-name {
          font-size: 16px;
          font-weight: 600;
          color: #c4374a;
        }

        .author-location {
          font-size: 14px;
          color: #666;
        }

        /* Navigation Buttons */
        .navigation-buttons {
          position: absolute;
          bottom: 40px;
          right: 40px;
          display: flex;
          gap: 10px;
        }

        .nav-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          background: white;
          color: #1a1a1a;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .nav-button:hover {
          background: #c4374a;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(196, 55, 74, 0.3);
        }

        .next-button {
          background: #d4b896;
          color: white;
        }

        .next-button:hover {
          background: #c4374a;
        }

        /* Pagination Dots */
        .pagination-dots {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 30px;
        }

        .dot-button {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: none;
          background: #ddd;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }

        .dot-button.active {
          background: #c4374a;
          width: 30px;
          border-radius: 5px;
        }

        .dot-button:hover {
          background: #c4374a;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .container {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .gallery-grid {
            height: 500px;
          }

          .section-title {
            font-size: 36px;
          }

          .section-subtitle {
            font-size: 28px;
          }
        }

        @media (max-width: 768px) {
          .testimonials-section {
            padding: 60px 0;
          }

          .gallery-grid {
            height: 400px;
          }

          .gallery-bottom {
            grid-template-columns: 1fr;
          }

          .section-title {
            font-size: 32px;
          }

          .section-subtitle {
            font-size: 24px;
          }

          .testimonial-card {
            padding: 40px 30px;
          }

          .testimonial-text {
            font-size: 15px;
            min-height: 180px;
          }

          .navigation-buttons {
            position: static;
            justify-content: center;
            margin-top: 20px;
          }
        }

        @media (max-width: 480px) {
          .section-title {
            font-size: 28px;
          }

          .testimonial-card {
            padding: 30px 20px;
          }

          .quote-icon {
            font-size: 60px;
          }
        }
      `}</style>
    </section>
  );
}
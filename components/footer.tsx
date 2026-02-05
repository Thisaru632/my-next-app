'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Newsletter signup:', email);
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <footer className="footer-section">
      {/* Newsletter Section */}
      <div className="newsletter-bar">
        <div className="container-footer">
          <div className="newsletter-inner">
            <div className="newsletter-content">
              <h3>Subscribe to our Newsletter</h3>
              <p>For the latest updates and special offers.</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email here."
                required
                className="newsletter-input"
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="newsletter-btn"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container-footer">
          <div className="footer-grid">
            
            {/* Column 1 - Navigation */}
            <div className="footer-col">
              <h4 className="footer-heading">Navigation</h4>
              <ul className="footer-links">
                <li><a href="">Home</a></li>
                <li><a href="/about">About Us</a></li>
                <li><a href="/destinations">Destinations</a></li>
                <li><a href="/experiences">Experiences</a></li>
                <li><a href="/tours">Tours</a></li>
                <li><a href="/events">Events Calendar</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/contact">Contact Us</a></li>
              </ul>
            </div>

            {/* Column 2 - Quick Links */}
            <div className="footer-col">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms &amp; Conditions</a></li>
                <li><a href="/brochure">E – Brochure</a></li>
                <li><a href="/faq">FAQ</a></li>
              </ul>
            </div>

            {/* Column 3 - Partner Brands */}
            <div className="footer-col">
              <h4 className="footer-heading">Partner Brands</h4>
              <ul className="footer-links">
                <li><a href="#" target="_blank" rel="noopener">Brand Hotels</a></li>
                <li><a href="#" target="_blank" rel="noopener">Tailor-Made Travel</a></li>
                <li><a href="#" target="_blank" rel="noopener">Eco Holidays</a></li>
                <li><a href="#" target="_blank" rel="noopener">Events &amp; Weddings</a></li>
                <li><a href="#" target="_blank" rel="noopener">Air Charter</a></li>
                <li><a href="#" target="_blank" rel="noopener">Adventures</a></li>
              </ul>
            </div>

            {/* Column 4 - Contact Info */}
            <div className="footer-col">
              <h4 className="footer-heading">Hotline</h4>
              <a href="tel:+94777265746" className="footer-phone">
                +94 77 726 5746
              </a>
              <p className="footer-phone-note">(24/7) Only for international inquiries</p>

              <div className="footer-address">
                <h5>Travel Company</h5>
                <p>
                  46/26, Navam Mawatha,<br />
                  Colombo 02,<br />
                  SRI LANKA.
                </p>
              </div>

              <div className="footer-email">
                <p>General:</p>
                <a href="mailto:info@travelcompany.com">info@travelcompany.com</a>
              </div>

              <div className="footer-hours">
                <h5>Opening Hours</h5>
                <p>Mon - Fri: 9 am to 5 pm</p>
              </div>

              <div className="footer-social">
                <h5>Stay Connected:</h5>
                <div className="social-icons">
                  <a href="#" aria-label="Facebook" target="_blank" rel="noopener">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="#" aria-label="Instagram" target="_blank" rel="noopener">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="#" aria-label="Twitter" target="_blank" rel="noopener">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="#" aria-label="LinkedIn" target="_blank" rel="noopener">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Bar - Logo, Awards, Copyright */}
      <div className="footer-bottom">
        <div className="container-footer">
          <div className="footer-bottom-grid">
            
            {/* Logo */}
            <div className="footer-logo">
              <Image 
                src="/images/logo.png" 
                alt="Company Logo" 
                width={160} 
                height={45}
                priority
              />
            </div>

            {/* Awards */}
            <div className="footer-awards">
              <div className="award-badge">
                <Image src="/images/awards/award-1.png" alt="Award 1" width={60} height={60} />
              </div>
              <div className="award-badge">
                <Image src="/images/awards/award-2.png" alt="Award 2" width={60} height={60} />
              </div>
              <div className="award-badge">
                <Image src="/images/awards/award-3.png" alt="Award 3" width={60} height={60} />
              </div>
              <div className="award-badge">
                <Image src="/images/awards/award-4.png" alt="Award 4" width={60} height={60} />
              </div>
              <div className="award-badge">
                <Image src="/images/awards/award-5.png" alt="Award 5" width={60} height={60} />
              </div>
            </div>

            {/* Copyright */}
            <div className="footer-copyright">
              <p>© {new Date().getFullYear()} Travel Company, All Rights Reserved</p>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Raleway:wght@300;400;500;600&display=swap');

        /* ═══════════════════════════════════════════════════════════ */
        /*  FOOTER SECTION — Luxury Heritage Aesthetic                */
        /* ═══════════════════════════════════════════════════════════ */

        .footer-section {
          background: linear-gradient(to bottom, #1a1a2e 0%, #0f0f1a 100%);
          color: #e4e6eb;
          font-family: 'Raleway', sans-serif;
        }

        .container-footer {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ─────────────────────────────────────────────────────────── */
        /*  Newsletter Bar                                             */
        /* ─────────────────────────────────────────────────────────── */

        .newsletter-bar {
          background: linear-gradient(135deg, #2a2a40 0%, #1e1e30 100%);
          border-bottom: 1px solid rgba(201, 169, 110, 0.15);
          padding: 56px 0;
        }

        .newsletter-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 48px;
          flex-wrap: wrap;
        }

        .newsletter-content h3 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(22px, 3vw, 28px);
          font-weight: 600;
          color: #c9a96e;
          margin: 0 0 6px 0;
          letter-spacing: 0.5px;
        }

        .newsletter-content p {
          font-size: 14px;
          color: #9ca3af;
          margin: 0;
          font-weight: 300;
        }

        .newsletter-form {
          display: flex;
          gap: 0;
          flex: 1;
          max-width: 460px;
        }

        .newsletter-input {
          flex: 1;
          padding: 14px 20px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(201, 169, 110, 0.25);
          border-right: none;
          border-radius: 8px 0 0 8px;
          color: #fff;
          font-size: 14px;
          font-family: 'Raleway', sans-serif;
          transition: all 0.3s ease;
        }

        .newsletter-input::placeholder {
          color: #6b7280;
        }

        .newsletter-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.12);
          border-color: #c9a96e;
        }

        .newsletter-btn {
          padding: 14px 32px;
          background: linear-gradient(135deg, #c9a96e 0%, #b8935a 100%);
          border: none;
          border-radius: 0 8px 8px 0;
          color: #1a1a2e;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Raleway', sans-serif;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.35s ease;
          white-space: nowrap;
        }

        .newsletter-btn:hover {
          background: linear-gradient(135deg, #d4b176 0%, #c9a96e 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(201, 169, 110, 0.3);
        }

        .newsletter-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ─────────────────────────────────────────────────────────── */
        /*  Main Footer Grid                                           */
        /* ─────────────────────────────────────────────────────────── */

        .footer-main {
          padding: 72px 0 60px;
          border-bottom: 1px solid rgba(201, 169, 110, 0.12);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 48px;
        }

        .footer-col h4.footer-heading {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 600;
          color: #c9a96e;
          margin: 0 0 22px 0;
          letter-spacing: 0.8px;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 12px;
        }

        .footer-links a {
          color: #9ca3af;
          font-size: 14px;
          font-weight: 400;
          text-decoration: none;
          transition: color 0.25s ease, transform 0.25s ease;
          display: inline-block;
        }

        .footer-links a:hover {
          color: #c9a96e;
          transform: translateX(3px);
        }

        /* Contact Column */
        .footer-phone {
          display: block;
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 600;
          color: #fff;
          text-decoration: none;
          margin-bottom: 6px;
          transition: color 0.3s ease;
        }

        .footer-phone:hover {
          color: #c9a96e;
        }

        .footer-phone-note {
          font-size: 12px;
          color: #6b7280;
          margin: 0 0 28px 0;
          font-weight: 300;
        }

        .footer-address,
        .footer-email,
        .footer-hours,
        .footer-social {
          margin-bottom: 24px;
        }

        .footer-address h5,
        .footer-hours h5,
        .footer-social h5 {
          font-family: 'Raleway', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #c9a96e;
          margin: 0 0 10px 0;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .footer-address p,
        .footer-hours p {
          font-size: 14px;
          color: #9ca3af;
          line-height: 1.7;
          margin: 0;
        }

        .footer-email p {
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 4px 0;
        }

        .footer-email a {
          font-size: 14px;
          color: #c9a96e;
          text-decoration: none;
          transition: color 0.25s ease;
        }

        .footer-email a:hover {
          color: #d4b176;
        }

        /* Social Icons */
        .social-icons {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }

        .social-icons a {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(201, 169, 110, 0.1);
          border: 1px solid rgba(201, 169, 110, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a96e;
          transition: all 0.3s ease;
        }

        .social-icons a:hover {
          background: #c9a96e;
          color: #1a1a2e;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(201, 169, 110, 0.3);
        }

        /* ─────────────────────────────────────────────────────────── */
        /*  Footer Bottom — Logo, Awards, Copyright                    */
        /* ─────────────────────────────────────────────────────────── */

        .footer-bottom {
          padding: 40px 0;
          background: rgba(0, 0, 0, 0.2);
        }

        .footer-bottom-grid {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
        }

        .footer-logo {
          opacity: 0.9;
          transition: opacity 0.3s ease;
        }

        .footer-logo:hover {
          opacity: 1;
        }

        .footer-awards {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .award-badge {
          opacity: 0.7;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .award-badge:hover {
          opacity: 1;
          transform: scale(1.05);
        }

        .footer-copyright {
          text-align: right;
          flex: 1;
          min-width: 200px;
        }

        .footer-copyright p {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
          font-weight: 300;
        }

        /* ─────────────────────────────────────────────────────────── */
        /*  Responsive Breakpoints                                     */
        /* ─────────────────────────────────────────────────────────── */

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .newsletter-inner {
            flex-direction: column;
            gap: 24px;
            text-align: center;
          }

          .newsletter-form {
            max-width: 100%;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }

          .footer-bottom-grid {
            flex-direction: column;
            text-align: center;
          }

          .footer-copyright {
            text-align: center;
          }

          .footer-awards {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .newsletter-bar {
            padding: 40px 0;
          }

          .newsletter-form {
            flex-direction: column;
          }

          .newsletter-input {
            border-radius: 8px;
            border-right: 1px solid rgba(201, 169, 110, 0.25);
          }

          .newsletter-btn {
            border-radius: 8px;
          }

          .footer-main {
            padding: 52px 0 44px;
          }

          .social-icons {
            justify-content: flex-start;
          }
        }
      `}</style>
    </footer>
  );
}
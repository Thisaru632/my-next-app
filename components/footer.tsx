// components/Footer.jsx
"use client";
import Link from 'next/link';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaFacebook, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Your App Name';

  return (
    <footer className="bg-dark text-white">
      <div className="container py-5">
        <div className="row g-4">
          {/* About Us Section */}
          <div className="col-lg-4 col-md-6">
            <h5 className="text-uppercase fw-bold mb-3 position-relative d-inline-block">
              About Us
              <span className="position-absolute bottom-0 start-0 w-50 border-bottom border-3 border-primary"></span>
            </h5>
            <p className="text-white-50 pe-lg-3 lh-lg">
              We prioritize safety, empower teams, deliver excellence, serve with heart, drive profits, and act responsibly.
            </p>
            {/* Social Media Icons */}
            <div className="d-flex gap-3 mt-4">
              <a 
                href="https://wa.me/94112787787" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover-primary transition-all"
                style={{ transition: 'all 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#25D366'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
              >
                <FaWhatsapp size={28} />
              </a>
              
              <a 
                href="https://facebook.com/yourpage" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white transition-all"
                style={{ transition: 'all 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1877F2'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
              >
                <FaFacebook size={28} />
              </a>
              
              <a 
                href="https://youtube.com/yourchannel" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white transition-all"
                style={{ transition: 'all 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FF0000'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
              >
                <FaYoutube size={28} />
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="col-lg-4 col-md-6">
            <h5 className="text-uppercase fw-bold mb-3 position-relative d-inline-block">
              Quick Links
              <span className="position-absolute bottom-0 start-0 w-50 border-bottom border-3 border-primary"></span>
            </h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link 
                  href="/" 
                  className="text-white-50 text-decoration-none d-inline-block position-relative footer-link"
                  style={{ transition: 'all 0.3s' }}
                >
                  <span className="hover-slide">→</span> Home
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  href="/#planTrip" 
                  className="text-white-50 text-decoration-none d-inline-block position-relative footer-link"
                  style={{ transition: 'all 0.3s' }}
                >
                  <span className="hover-slide">→</span> Plan A Tour
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  href="/our-services" 
                  className="text-white-50 text-decoration-none d-inline-block position-relative footer-link"
                  style={{ transition: 'all 0.3s' }}
                >
                  <span className="hover-slide">→</span> Our Services
                </Link>
              </li>
              <li className="mb-2">
                <Link 
                  href="/site-contact-us" 
                  className="text-white-50 text-decoration-none d-inline-block position-relative footer-link"
                  style={{ transition: 'all 0.3s' }}
                >
                  <span className="hover-slide">→</span> Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div className="col-lg-4 col-md-12">
            <h5 className="text-uppercase fw-bold mb-3 position-relative d-inline-block">
              Contact Us
              <span className="position-absolute bottom-0 start-0 w-50 border-bottom border-3 border-primary"></span>
            </h5>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-start">
                <FaPhone className="me-3 mt-1 text-primary flex-shrink-0" />
                <span className="text-white-50">94 112 787 787 (Call)</span>
              </li>
              <li className="mb-3 d-flex align-items-start">
                <FaEnvelope className="me-3 mt-1 text-primary flex-shrink-0" />
                <a 
                  href="mailto:senucabs@gmail.com" 
                  className="text-white-50 text-decoration-none"
                  style={{ transition: 'color 0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                >
                  senucabs@gmail.com
                </a>
              </li>
              <li className="mb-3 d-flex align-items-start">
                <FaMapMarkerAlt className="me-3 mt-1 text-primary flex-shrink-0" />
                <span className="text-white-50">370/C, New Kandy Road, Malabe.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-top border-secondary">
        <div className="container py-3">
          <div className="row align-items-center">
            <div className="col-md-12 text-center">
              <p className="mb-0 text-white-50 small">
                © {currentYear} {appName}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-link:hover {
          color: white !important;
          padding-left: 8px;
        }
        
        .hover-slide {
          display: inline-block;
          margin-right: 8px;
          transition: transform 0.3s;
        }
        
        .footer-link:hover .hover-slide {
          transform: translateX(4px);
        }
      `}</style>
    </footer>
  );
}
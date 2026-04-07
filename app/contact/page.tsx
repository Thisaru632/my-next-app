'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, Send, Facebook, MessageCircle } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import PhoneInput from '@/components/PhoneInput';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    travelDates: '',
    guests: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [contactId, setContactId] = useState<string | null>(null);
  const [isPartialCaptured, setIsPartialCaptured] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^(?:\+94|0)?[0-9]{9,10}$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'email') {
      if (value && !EMAIL_REGEX.test(value)) {
        setEmailError('Invalid email format');
      } else {
        setEmailError('');
      }
    }
    if (name === 'phone') {
      if (value && !PHONE_REGEX.test(value)) {
        setPhoneError('Invalid phone format');
      } else {
        setPhoneError('');
      }
    }

    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };

      // Clear travel dates and guests when complaint is selected
      if (name === 'destination' && value === 'Complaint') {
        newData.travelDates = '';
        newData.guests = '';
      }

      return newData;
    });
  };

  const handleEmailFocus = async () => {
    // Only capture if name and phone are provided and we haven't already captured for this session
    if (formData.name && formData.phone && !isPartialCaptured) {
      if (phoneError) return; // Don't capture if phone is invalid

      try {
        const response = await fetch(API_ENDPOINTS.CONTACTS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: formData.name,
            phoneNumber: formData.phone,
            // Provide empty defaults for required logic if any
            email: '',
            message: '',
            reason: 'General Inquiry'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.contact && data.contact._id) {
            setContactId(data.contact._id);
            setIsPartialCaptured(true);
            console.log('Partial lead captured:', data.contact._id);
          }
        }
      } catch (error) {
        console.error('Error capturing partial lead:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (emailError || phoneError) {
      alert('Please fix the errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      const url = contactId
        ? `${API_ENDPOINTS.CONTACTS}/${contactId}`
        : API_ENDPOINTS.CONTACTS;

      const method = contactId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          phoneNumber: formData.phone,
          reason: formData.destination || 'General Inquiry',
          preferredTravelDates: formData.travelDates,
          numberOfGuests: formData.guests || 1,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          destination: '',
          travelDates: '',
          guests: '',
          message: ''
        });
        setContactId(null);
        setIsPartialCaptured(false);
        setEmailError('');
        setPhoneError('');

        // Clear success message after 5 seconds
        setTimeout(() => setSubmitStatus(''), 5000);
      } else {
        setSubmitStatus('error');
        let errorMessage = 'Failed to send message. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Response was not JSON (e.g. 404 HTML page)
          console.error('Error parsing error response:', e);
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      alert('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-section">
      <div className="container">
        {/* Image Gallery Grid */}
        <div className="gallery-grid">
          <div className="gallery-main">
            <Image
              src="/testimonial/1.jpg"
              alt="Beautiful Sri Lanka landscape"
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
                alt="Sri Lanka adventure"
                fill
                className="gallery-image"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            </div>
            <div className="gallery-item">
              <Image
                src="/testimonial/3.jpg"
                alt="Travel moments"
                fill
                className="gallery-image"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            </div>
          </div>
        </div>

        {/* Contact Content */}
        <div className="contact-content">
          <div className="section-label">
            <span className="dot"></span>
            <span className="label-text">Get in touch</span>
          </div>

          <h2 className="section-title">Lets plan your dream journey</h2>
          <p className="section-subtitle">Contact Us</p>

          {/* Contact Information Cards */}
          <div className="contact-info-cards">


            <div className="info-card">
              <div className="icon-wrapper">
                <Phone size={24} />
              </div>
              <div className="info-content">
                <h4>Call Us</h4>
                <a href="tel:+94702787787">0702787787</a>
              </div>
            </div>

            <div className="info-card">
              <div className="icon-wrapper">
                <MapPin size={24} />
              </div>
              <div className="info-content">
                <h4>Visit Us</h4>
                <p>167/2/C,<br />Hokandara North,<br />Hokandara, SRI LANKA.</p>
              </div>
            </div>
          </div>

          {/* Social Media Cards */}
          <div className="social-cards">
            <a href="https://www.facebook.com/Senucabs/" target="_blank" rel="noopener noreferrer" className="social-card facebook">
              <div className="social-icon-wrapper">
                <Facebook size={24} />
              </div>
              <div className="social-content">
                <h4>Facebook</h4>
                <p>Follow us on Facebook</p>
              </div>
            </a>

            <a href="https://wa.me/94702787787" target="_blank" rel="noopener noreferrer" className="social-card whatsapp">
              <div className="social-icon-wrapper">
                <MessageCircle size={24} />
              </div>
              <div className="social-content">
                <h4>WhatsApp</h4>
                <p>Chat with us now</p>
              </div>
            </a>
          </div>

          {/* Contact Form */}
          <div className="contact-card">
            <h3 className="form-title">Send us a message</h3>

            {submitStatus === 'success' && (
              <div className="success-message">
                <p>Thank you! Well get back to you within 24 hours.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(val) => {
                      setFormData(prev => ({ ...prev, phone: val }));
                      if (val && !PHONE_REGEX.test(val)) {
                        setPhoneError('Invalid phone format (e.g. 07XXXXXXXX)');
                      } else {
                        setPhoneError('');
                      }
                    }}
                    label="Phone Number"
                    error={!!phoneError}
                    helperText={phoneError}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={handleEmailFocus}
                    required
                    placeholder="john@example.com"
                  />
                  {emailError && <span className="error-text">{emailError}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="destination">Reason</label>
                  <select
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                  >
                    <option value="">Select a reason</option>
                    <option value="Booking Question">Custom Tour / Booking</option>
                    <option value="Complaint">Complaint</option>
                    <option value="Feedback">Feedback</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="travelDates">Preferred Travel Dates</label>
                  <input
                    type="text"
                    id="travelDates"
                    name="travelDates"
                    value={formData.travelDates}
                    onChange={handleChange}
                    placeholder="e.g., March 2025"
                    disabled={formData.destination === 'Complaint'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="guests">Number of Guests</label>
                  <input
                    type="number"
                    id="guests"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    min="1"
                    placeholder="2"
                    disabled={formData.destination === 'Complaint'}
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="type your message here..."
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-section {
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
          align-items: start;
        }

        /* Gallery Styles */
        .gallery-grid {
          display: grid;
          grid-template-rows: 2fr 1fr;
          gap: 20px;
          height: 600px;
          position: sticky;
          top: 100px;
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
        .contact-content {
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
          background-color: #0d9488;
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
          margin-bottom: 30px;
          font-family: 'Playfair Display', serif;
          font-weight: 400;
        }

        /* Contact Info Cards */
        .contact-info-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .info-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .icon-wrapper {
          width: 50px;
          height: 50px;
          background: #0d9488;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;
          min-width: 0;
        }

        .info-card h4 {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 5px;
        }

        .info-card a,
        .info-card p {
          font-size: 14px;
          color: #666;
          text-decoration: none;
          margin: 0;
          word-break: break-word;
        }

        .info-card a:hover {
          color: #0d9488;
        }

        /* Social Media Cards */
        .social-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }

        .social-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-decoration: none;
          cursor: pointer;
        }

        .social-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .social-icon-wrapper {
          width: 50px;
          height: 50px;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .social-card.facebook .social-icon-wrapper {
          background: #1877f2;
        }

        .social-card.whatsapp .social-icon-wrapper {
          background: #25d366;
        }

        .social-content {
          flex: 1;
        }

        .social-card h4 {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 5px;
        }

        .social-card p {
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        /* Contact Card/Form */
        .contact-card {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 5px 30px rgba(0, 0, 0, 0.08);
        }

        .error-text {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
          font-weight: 500;
        }

        .form-title {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 25px;
          font-family: 'Playfair Display', serif;
        }

        .success-message {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .success-message p {
          margin: 0;
          font-size: 14px;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }

        .form-group input:disabled,
        .form-group select:disabled {
          background-color: #f5f5f5;
          color: #999;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .form-group textarea {
          resize: vertical;
        }

        .submit-button {
          background: #0d9488;
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
          margin-top: 10px;
        }

        .submit-button:hover:not(:disabled) {
          background: #0f766e;
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(13, 148, 136, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .container {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .gallery-grid {
            height: 500px;
            position: static;
          }

          .section-title {
            font-size: 36px;
          }

          .section-subtitle {
            font-size: 28px;
          }

          .contact-info-cards {
            grid-template-columns: 1fr;
          }

          .social-cards {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .contact-section {
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

          .contact-card {
            padding: 30px 25px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-title {
            font-size: 22px;
          }
        }

        @media (max-width: 480px) {
          .section-title {
            font-size: 28px;
          }

          .contact-card {
            padding: 25px 20px;
          }

          .info-card {
            flex-direction: column;
            text-align: center;
          }

          .social-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
}
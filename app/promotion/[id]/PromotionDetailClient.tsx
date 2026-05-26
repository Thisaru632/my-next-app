'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Footer from '@/components/footer';
import { 
  Tag, 
  Users, 
  Briefcase, 
  Wind, 
  ShieldCheck, 
  TrendingUp,
  X,
  CheckCircle2
} from 'lucide-react';
import { Snackbar, Alert, Dialog, DialogContent, TextField, Button, Box, Typography, IconButton } from '@mui/material';
import { PolicyDialog } from '@/components/PolicyDialog';
import { API_ENDPOINTS } from '@/config/api';

interface PromotionDetail {
  id: string;
  name: string;
  title: string;
  image: string;
  discount: string;
  description: string;
  promoCode: string;
  passengers: number;
  bags: number;
  ac: boolean;
  conditions: string[];
  specs: { label: string; value: string }[];
}

interface PromotionDetailClientProps {
  promo: PromotionDetail;
}

export default function PromotionDetailClient({ promo }: PromotionDetailClientProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Custom Booking Dialog State
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasError = false;
    
    if (!bookingName.trim()) {
      setNameError('Name is required');
      hasError = true;
    }
    
    const phoneTrimmed = bookingPhone.trim();
    const cleanPhone = phoneTrimmed.replace(/[\s\-()]/g, '');
    if (!phoneTrimmed) {
      setPhoneError('Phone number is required');
      hasError = true;
    } else if (!/^(?:\+94|0)?[0-9]{9,10}$/.test(cleanPhone)) {
      setPhoneError('Please enter a valid Sri Lankan phone number (e.g. 07XXXXXXXX)');
      hasError = true;
    }
    
    if (hasError) return;
    
    setIsSubmitting(true);
    
    // Construct booking request payload
    let customerEmail = 'promotion@senutours.lk';
    if (typeof window !== 'undefined') {
      const customerStr = localStorage.getItem('customerUser');
      if (customerStr) {
        try {
          const customer = JSON.parse(customerStr);
          if (customer && customer.email) {
            customerEmail = customer.email;
          }
        } catch (e) {
          console.error('Error parsing customer user:', e);
        }
      }
    }

    const vehicleTypeMap: Record<string, string> = {
      wagonr: 'Car',
      alto: 'Car',
      kdh: 'Van',
      bus: 'Bus'
    };

    const payload = {
      vehicleType: vehicleTypeMap[promo.id] || 'Car',
      vehicleName: promo.name,
      tripType: 'Return',
      pickupLocation: 'Western Province',
      dropoffLocation: 'Colombo',
      destinations: [],
      dateTime: new Date().toISOString(),
      numberOfDays: 1,
      maxPersons: promo.passengers || 3,
      maxBags: promo.bags || 2,
      name: bookingName.trim(),
      telephone: cleanPhone,
      additionalPhones: [],
      email: customerEmail,
      remark: 'Promotion Booking Request',
      promoCode: promo.promoCode,
      discount: 0,
      totalPrice: 0,
      discountPercentage: parseInt(promo.discount) || 15
    };

    try {
      const response = await fetch(API_ENDPOINTS.BOOKINGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setBookingSubmitted(true);
      } else {
        const errData = await response.json();
        setPhoneError(errData.message || 'Failed to submit booking request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting booking request:', error);
      setPhoneError('Connection error. Please check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="promo-detail-container">
      {/* Background Blobs */}
      <div className="bg-blob blob-left"></div>
      <div className="bg-blob blob-right"></div>

      {/* Main Content Area */}
      <main className="detail-main">
        {/* Detail Card Wrapper */}
        <div className="detail-card">
          <div className="detail-grid">
            
            {/* Left Column: Image & Badges */}
            <div className="image-column">
              <div className={`image-wrapper ${promo.id === 'wagonr' ? 'is-banner-wrapper' : ''}`}>
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className={`promo-image ${promo.id === 'wagonr' ? 'is-banner' : ''}`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                
                <div className="discount-badge">
                  <Tag size={14} />
                  <span>{promo.discount}</span>
                </div>
              </div>

              {/* Specs Row */}
              <div className="specs-grid">
                <div className="spec-tile">
                  <Users size={16} />
                  <span className="spec-label">Capacity</span>
                  <span className="spec-val">{promo.passengers} Seats</span>
                </div>
                <div className="spec-tile">
                  <Briefcase size={16} />
                  <span className="spec-label">Luggage</span>
                  <span className="spec-val">{promo.bags} Bags</span>
                </div>
                <div className="spec-tile">
                  <Wind size={16} />
                  <span className="spec-label">Climate</span>
                  <span className="spec-val">{promo.ac ? 'A/C On' : 'No A/C'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Title, Description, Conditions, CTA */}
            <div className="content-column">
              <span className="category-tag">{promo.name} Promotion</span>
              <h1 className="vehicle-title">{promo.title}</h1>
              {promo.description && <p className="promotion-desc">{promo.description}</p>}

              {/* Facilities Section */}
              <div className="section-block">
                <h3 className="section-title">පහසුකම්</h3>
                <ul className="conditions-list">
                  {[
                    'ගමනට පෙර අත්තිකාරම් ගෙවීමක් අවශ්ය නැත.',
                    'වෙන්කිරීම අවලංගු කළ හැක - අමතර ගාස්තුවක් නැත.',
                    'ඉක්මන් වෙන්කිරීමේ සහාය - ගමනට අවශ්ය උපදෙස් ඉක්මනින්.',
                    'ගමනට පෙර රියදුරු හා වාහන තොරතුරු ලබා දේ'
                  ].map((facility, i) => (
                    <li key={i} className="condition-item">
                      <ShieldCheck style={{ width: '16px', height: '16px', minWidth: '16px', minHeight: '16px', flexShrink: 0, color: '#0d9488' }} className="condition-icon" />
                      <span className="condition-text">{facility}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Conditions Checklist */}
              <div className="section-block">
                <h3 className="section-title">අදාළ කොන්දේසි</h3>
                <ul className="conditions-list">
                  {promo.conditions.map((condition, i) => (
                    <li key={i} className="condition-item">
                      <ShieldCheck style={{ width: '16px', height: '16px', minWidth: '16px', minHeight: '16px', flexShrink: 0, color: '#0d9488' }} className="condition-icon" />
                      <span className="condition-text">{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Booking Button */}
              <div className="booking-action-wrapper">
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <a 
                    onClick={() => setPolicyOpen(true)} 
                    style={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '13px', 
                      color: '#64748b', 
                      textDecoration: 'underline', 
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#0d9488')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                  >
                    Privacy Policies & Terms and Conditions
                  </a>
                </div>
                <button 
                  onClick={() => {
                    setBookingName('');
                    setBookingPhone('');
                    setBookingSubmitted(false);
                    setNameError(null);
                    setPhoneError(null);
                    setBookingDialogOpen(true);
                  }}
                  className="book-now-btn"
                >
                  <TrendingUp size={16} />
                  <span>Request Booking Now</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* Custom Booking Request Dialog Modal */}
      <Dialog 
        open={bookingDialogOpen} 
        onClose={() => setBookingDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            width: '100%',
            maxWidth: '440px',
            p: 0,
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.15)'
          }
        }}
      >
        <Box sx={{ 
          height: '8px', 
          background: 'linear-gradient(90deg, #0d9488 0%, #3b82f6 100%)' 
        }} />
        
        {/* Close Button */}
        <IconButton
          aria-label="close"
          onClick={() => setBookingDialogOpen(false)}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: '#94a3b8',
            '&:hover': { color: '#475569' }
          }}
        >
          <X size={20} />
        </IconButton>

        {!bookingSubmitted ? (
          <DialogContent sx={{ p: 4, pt: 5 }}>
            <Typography sx={{ 
              fontFamily: "'Playfair Display', serif", 
              fontWeight: 700,
              fontSize: '1.75rem',
              color: '#0f172a',
              mb: 1.5,
              textAlign: 'center'
            }}>
              Request Booking
            </Typography>
            
            <Typography sx={{ 
              fontFamily: "'Montserrat', sans-serif", 
              fontSize: '0.875rem', 
              color: '#64748b',
              mb: 4,
              lineHeight: 1.6,
              textAlign: 'center'
            }}>
              Fill in your details below. Our team will get in touch with you shortly to finalize your Senu Tours {promo.name} booking.
            </Typography>

            <Box component="form" onSubmit={handleBookingSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                value={bookingName}
                onChange={(e) => {
                  setBookingName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                error={!!nameError}
                helperText={nameError}
                placeholder="Enter your full name"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&.Mui-focused fieldset': {
                      borderColor: '#0d9488',
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0d9488',
                  }
                }}
              />

              <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
                value={bookingPhone}
                onChange={(e) => {
                  setBookingPhone(e.target.value);
                  if (phoneError) setPhoneError(null);
                }}
                error={!!phoneError}
                helperText={phoneError}
                placeholder="Enter your phone number"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&.Mui-focused fieldset': {
                      borderColor: '#0d9488',
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0d9488',
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  mt: 1.5,
                  background: 'linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)',
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  borderRadius: '12px',
                  py: 1.8,
                  boxShadow: '0 8px 20px rgba(13, 148, 136, 0.2)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #0f766e 0%, #2563eb 100%)',
                    boxShadow: '0 12px 25px rgba(13, 148, 136, 0.3)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </Box>
          </DialogContent>
        ) : (
          <DialogContent sx={{ p: 4, pt: 6, pb: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#10b981',
              mb: 3,
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15)'
            }}>
              <CheckCircle2 size={44} />
            </Box>

            <Typography sx={{ 
              fontFamily: "'Playfair Display', serif", 
              fontWeight: 700,
              fontSize: '1.75rem',
              color: '#0f172a',
              mb: 1.5
            }}>
              Requested Successfully!
            </Typography>
            
            <Typography sx={{ 
              fontFamily: "'Montserrat', sans-serif", 
              fontSize: '0.9rem', 
              color: '#64748b',
              mb: 4,
              lineHeight: 1.6,
              px: 1
            }}>
              Thank you for choosing Senu Tours! Your Senu Tours {promo.name} promotion request has been received. Our team will contact you shortly to confirm your booking.
            </Typography>

            <Button
              fullWidth
              variant="contained"
              component="a"
              href="tel:0702787787"
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.875rem',
                fontWeight: 800,
                borderRadius: '12px',
                py: 1.8,
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 12px 25px rgba(16, 185, 129, 0.35)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Call Now
            </Button>
          </DialogContent>
        )}
      </Dialog>

      {/* Snackbar notification */}
      <Snackbar 
        open={!!toastMessage} 
        autoHideDuration={3000} 
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>

      {/* Policy Dialog */}
      <PolicyDialog open={policyOpen} onClose={() => setPolicyOpen(false)} />

      {/* Styles */}
      <style jsx>{`
        .promo-detail-container {
          min-height: 100vh;
          background-color: #faf8f5;
          position: relative;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          font-family: 'Montserrat', sans-serif;
        }

        /* Ambient glow blobs */
        .bg-blob {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          pointer-events: none;
          z-index: 0;
        }

        .blob-left {
          background-color: #0d9488;
          top: 15%;
          left: -200px;
        }

        .blob-right {
          background-color: #3b82f6;
          bottom: 25%;
          right: -200px;
        }

        .detail-main {
          flex-grow: 1;
          max-width: 1100px;
          width: 100%;
          margin: 0 auto;
          padding: 120px 24px 80px;
          position: relative;
          z-index: 1;
        }

        .detail-card {
          background-color: #ffffff;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.02);
          overflow: hidden;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          min-height: 600px;
        }

        /* Left Column */
        .image-column {
          background-color: #ffffff;
          border-right: 1px solid #f1f5f9;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 30px;
          justify-content: center;
        }

        .image-wrapper {
          position: relative;
          aspect-ratio: 16/10;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background-color: #fafbfc;
          border: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .image-wrapper.is-banner-wrapper {
          flex-grow: 1;
          aspect-ratio: auto;
          min-height: 280px;
        }

        .promo-image {
          object-fit: contain;
          padding: 24px;
        }

        .promo-image.is-banner {
          object-fit: cover !important;
          padding: 0 !important;
        }

        .discount-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 12px;
          padding: 6px 14px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .spec-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background-color: #fafbfc;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
          color: #0d9488;
          text-align: center;
        }

        .spec-label {
          font-size: 9.5px;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 600;
          margin-top: 6px;
          letter-spacing: 0.05em;
        }

        .spec-val {
          font-size: 13px;
          color: #1e293b;
          font-weight: 700;
          margin-top: 2px;
        }

        /* Right Column */
        .content-column {
          padding: 40px;
          display: flex;
          flex-direction: column;
        }

        .category-tag {
          font-size: 10.5px;
          color: #0d9488;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 8px;
        }

        .vehicle-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 38px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.15;
          margin: 0;
        }

        .promotion-subtitle {
          font-size: 16px;
          color: #64748b;
          font-weight: 500;
          margin-top: 4px;
          margin-bottom: 20px;
        }

        .promotion-desc {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        /* Blocks */
        .section-block {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
          font-weight: 700;
          margin-bottom: 12px;
          padding-bottom: 4px;
          border-bottom: 1px solid #f1f5f9;
        }

        .specs-table {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px 24px;
        }

        .table-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding: 2px 0;
        }

        .table-label {
          color: #64748b;
          font-weight: 500;
        }

        .table-value {
          color: #1e293b;
          font-weight: 700;
        }

        .conditions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .condition-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        :global(.condition-icon) {
          color: #0d9488 !important;
          width: 16px !important;
          height: 16px !important;
          min-width: 16px !important;
          min-height: 16px !important;
          flex-shrink: 0 !important;
          margin-top: 1px !important;
        }

        .condition-text {
          font-size: 12.5px;
          color: #475569;
          line-height: 1.5;
        }

        /* Action button */
        .booking-action-wrapper {
          margin-top: auto;
          padding-top: 20px;
        }

        .book-now-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #0d9488 0%, #3b82f6 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 13.5px;
          padding: 14px 28px;
          border-radius: 12px;
          border: none;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          box-shadow: 0 6px 20px rgba(13, 148, 136, 0.25);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
        }

        .book-now-btn:hover {
          background: linear-gradient(135deg, #0f766e 0%, #2563eb 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(13, 148, 136, 0.35);
        }

        .book-now-btn:active {
          transform: translateY(0);
        }

        /* RESPONSIVE LAYOUT */
        @media (max-width: 1024px) {
          .detail-main {
            padding: 110px 16px 60px;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .image-column {
            border-right: none;
            border-bottom: 1px solid #f1f5f9;
            padding: 30px;
          }

          .content-column {
            padding: 30px;
          }

          .vehicle-title {
            font-size: 32px;
          }
        }

        @media (max-width: 640px) {
          .image-column {
            padding: 20px;
            gap: 20px;
          }

          .content-column {
            padding: 20px;
          }

          .vehicle-title {
            font-size: 26px;
          }

          .specs-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }

          .spec-tile {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 12px 6px;
            text-align: center;
          }

          .spec-label {
            margin-top: 4px;
            font-size: 8px;
          }

          .spec-val {
            margin-top: 2px;
            font-size: 11px;
          }

          .specs-table {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}

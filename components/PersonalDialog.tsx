import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Phone from '@mui/icons-material/Phone';
import Email from '@mui/icons-material/Email';
import AddCircle from '@mui/icons-material/AddCircle';
import RemoveCircle from '@mui/icons-material/RemoveCircle';
import Call from '@mui/icons-material/Call';
import { Download } from 'lucide-react';
import PhoneInput from './PhoneInput';

interface PersonalDialogProps {
  open: boolean;
  onClose: () => void;
  requestSent: boolean;
  bookingRefNo: string | null;
  downloadTripSummary: () => void;
  setShowCallPopup: (val: boolean) => void;
  setOpenPolicyDialog: (val: boolean) => void;
  formData: {
    name: string;
    telephone: string;
    additionalPhones: string[];
    email: string;
    remark: string;
    [key: string]: any;
  };
  handleChange: (field: string, value: any) => void;
  phoneError: string;
  additionalPhoneErrors: string[];
  emailError: string;
  handleAddPhone: () => void;
  updateAdditionalPhone: (index: number, val: string) => void;
  handleRemovePhone: (index: number) => void;
  showRemark: boolean;
  setShowRemark: (val: boolean) => void;
  handleSendRequest: () => void;
}

export const PersonalDialog: React.FC<PersonalDialogProps> = ({
  open,
  onClose,
  requestSent,
  bookingRefNo,
  downloadTripSummary,
  setShowCallPopup,
  setOpenPolicyDialog,
  formData,
  handleChange,
  phoneError,
  additionalPhoneErrors,
  emailError,
  handleAddPhone,
  updateAdditionalPhone,
  handleRemovePhone,
  showRemark,
  setShowRemark,
  handleSendRequest
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '95%',
          maxWidth: 400,
          m: 2,
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
          border: '1px solid rgba(13,148,136,0.1)'
        }
      }}
    >
      <DialogTitle sx={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '1.65rem',
        fontWeight: 700,
        color: '#2D231B',
        pb: 1,
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        Almost There
        <IconButton
          onClick={onClose}
          sx={{ color: 'rgba(0,0,0,0.4)', '&:hover': { color: '#ef4444' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {requestSent ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '1rem 0.75rem',
            gap: '0.8rem'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(13, 148, 136, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0d9488',
              marginBottom: '0.2rem'
            }}>
              <CheckCircle style={{ fontSize: '2.5rem' }} />
            </div>

            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.6rem',
              fontWeight: 700,
              color: '#111827',
              margin: 0
            }}>
              Thank You!
            </h3>

            <p style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "0.85rem",
              color: "#4b5563",
              lineHeight: 1.5,
              margin: 0
            }}>
              Your journey request has been sent successfully. We will contact you shortly to finalize your booking.
            </p>

            {bookingRefNo && (
              <div style={{
                background: 'rgba(13, 148, 136, 0.05)',
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1.5px dashed #0d9488',
                marginTop: '0.5rem'
              }}>
                <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
                  Quotation Reference
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d9488', fontFamily: "'Montserrat', sans-serif", letterSpacing: '1px' }}>
                  {bookingRefNo}
                </div>
              </div>
            )}

            <button
              onClick={downloadTripSummary}
              style={{
                marginTop: '0.4rem',
                padding: '0.75rem 1.5rem',
                background: '#0d9488',
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                fontWeight: 700,
                fontFamily: "'Montserrat', sans-serif",
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px rgba(13, 148, 136, 0.25)',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(13, 148, 136, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(13, 148, 136, 0.25)";
              }}
            >
              <Download size={20} />
              Download Trip Summary
            </button>

            <button
              onClick={() => setShowCallPopup(true)}
              style={{
                marginTop: '0.2rem',
                padding: '0.75rem 1.5rem',
                background: '#fff',
                color: '#0d9488',
                border: '2px solid #0d9488',
                borderRadius: '16px',
                fontWeight: 700,
                fontFamily: "'Montserrat', sans-serif",
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(13, 148, 136, 0.05)';
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Call sx={{ fontSize: 20 }} />
              Get a Call
            </button>

            <button
              onClick={() => setOpenPolicyDialog(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.75rem',
                fontFamily: "'Montserrat', sans-serif",
                cursor: 'pointer',
                textDecoration: 'underline',
                marginTop: '0.5rem'
              }}
            >
              View Policies & Conditions
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <AccountCircle style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#0d9488', zIndex: 1 }} />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  background: 'rgba(0,0,0,0.02)',
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0d9488';
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                  e.target.style.background = 'rgba(0,0,0,0.02)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <PhoneInput
                label="Primary Telephone"
                value={formData.telephone}
                onChange={(val) => handleChange('telephone', val)}
                error={!!phoneError}
                helperText={phoneError}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    bgcolor: 'rgba(0,0,0,0.02)',
                    '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
                    '&:hover fieldset': { borderColor: '#0d9488' },
                    '&.Mui-focused fieldset': { borderColor: '#0d9488' }
                  }
                }}
              />
              {formData.additionalPhones.length < 1 && (
                <IconButton
                  onClick={handleAddPhone}
                  sx={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    color: '#0d9488',
                    zIndex: 2,
                    '&:hover': { color: '#0891b2' }
                  }}
                >
                  <AddCircle />
                </IconButton>
              )}
            </div>

            {/* Additional Phones */}
            {formData.additionalPhones.map((phoneVal, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <PhoneInput
                  label={`Additional Phone ${idx + 1}`}
                  value={phoneVal}
                  onChange={(val) => updateAdditionalPhone(idx, val)}
                  error={!!(additionalPhoneErrors && additionalPhoneErrors[idx])}
                  helperText={additionalPhoneErrors ? additionalPhoneErrors[idx] : ''}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: 'rgba(0,0,0,0.02)',
                      '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
                      '&:hover fieldset': { borderColor: '#0d9488' },
                      '&.Mui-focused fieldset': { borderColor: '#0d9488' }
                     }
                  }}
                />
                <IconButton
                  onClick={() => handleRemovePhone(idx)}
                  sx={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    color: '#ef4444',
                    zIndex: 2,
                    '&:hover': { color: '#dc2626' }
                  }}
                >
                  <RemoveCircle />
                </IconButton>
              </div>
            ))}
            <div style={{ position: 'relative' }}>
              <Email style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#0d9488', zIndex: 1, fontSize: '1.2rem' }} />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  background: 'rgba(0,0,0,0.02)',
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0d9488';
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                  e.target.style.background = 'rgba(0,0,0,0.02)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {emailError && (
                <div style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '4px', marginLeft: '4px', fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}>
                  {emailError}
                </div>
              )}
            </div>

            {!showRemark ? (
              <button
                onClick={() => setShowRemark(true)}
                style={{
                  alignSelf: 'flex-start',
                  background: 'none',
                  border: 'none',
                  color: '#0d9488',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  fontFamily: "'Montserrat', sans-serif",
                  marginTop: '-0.25rem'
                }}
              >
                + Add a Remark
              </button>
            ) : (
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <textarea
                  placeholder="Enter your remark or special requirements..."
                  value={formData.remark}
                  onChange={(e) => handleChange('remark', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    paddingRight: '2.5rem',
                    borderRadius: '14px',
                    border: '1.5px solid rgba(0,0,0,0.08)',
                    background: 'rgba(0,0,0,0.02)',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0d9488';
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                    e.target.style.background = 'rgba(0,0,0,0.02)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <IconButton
                  onClick={() => {
                    setShowRemark(false);
                    handleChange('remark', '');
                  }}
                  sx={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    color: '#9ca3af',
                    '&:hover': { color: '#ef4444', backgroundColor: '#fee2e2' }
                  }}
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            )}

            <button
              onClick={() => {
                if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
                  (window as any).fbq('track', 'Lead');
                }
                handleSendRequest();
              }}
              style={{
                padding: '1.1rem',
                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 600,
                fontSize: '1rem',
                fontFamily: "'Montserrat', sans-serif",
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 20px rgba(13, 148, 136, 0.2)',
                marginTop: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(13, 148, 136, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(13, 148, 136, 0.2)';
              }}
            >
              Send Request
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

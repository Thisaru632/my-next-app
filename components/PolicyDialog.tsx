import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface PolicyDialogProps {
  open: boolean;
  onClose: () => void;
}

export const PolicyDialog: React.FC<PolicyDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
          border: '1px solid rgba(13,148,136,0.1)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '1.75rem',
        fontWeight: 700,
        color: '#2D231B',
        background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 2,
        px: 4
      }}>
        Privacy Policy & Terms
        <IconButton
          onClick={onClose}
          sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 4, mt: 1 }}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ 
            fontFamily: "'Montserrat', sans-serif", 
            fontWeight: 800, 
            color: '#0d9488', 
            mb: 3, 
            fontSize: '1.3rem',
            borderBottom: '2px solid rgba(13,148,136,0.1)',
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Privacy Policy
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>1. Introduction</Typography>
              <Typography variant="body2" sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                This Privacy Policy explains how we collect, use, and protect your personal information when you use our cab booking platform. By using our service, you agree to the terms outlined in this policy.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>2. Information We Collect</Typography>
              <Box component="ul" sx={{ m: 0, pl: 2, color: '#4b5563', '& li': { mb: 0.5 } }}>
                <li><Typography variant="body2">Name and Contact details (Phone, Email)</Typography></li>
                <li><Typography variant="body2">Pickup and Drop-off locations</Typography></li>
                <li><Typography variant="body2">Trip details and booking history</Typography></li>
                <li><Typography variant="body2">Payment-related information (if applicable)</Typography></li>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>3. How We Use Your Information</Typography>
              <Typography variant="body2" sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                Your information is used to process and manage bookings, assign drivers and vehicles, communicate trip updates, and ensure safety and fraud prevention. we also use it to improve our service offerings.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>4. Sharing of Information</Typography>
              <Typography variant="body2" sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                We share your information with assigned drivers for trip fulfillment and with necessary service providers (payment, communication tools). We do not sell your personal data to third parties.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>5. User Rights & Data Retention</Typography>
              <Typography variant="body2" sx={{ color: '#4b5563', lineHeight: 1.7 }}>
                You have the right to request access to, correction of, or deletion of your data. We retain your information only as long as necessary for operational and legal purposes.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ 
            fontFamily: "'Montserrat', sans-serif", 
            fontWeight: 800, 
            color: '#0d9488', 
            mb: 3, 
            fontSize: '1.3rem',
            borderBottom: '2px solid rgba(13,148,136,0.1)',
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Terms & Conditions
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>1. General & Booking Rules</Typography>
              <Box component="ul" sx={{ m: 0, pl: 2, color: '#4b5563', '& li': { mb: 1.2 } }}>
                <li><Typography variant="body2">By using this platform, you agree to comply with these terms.</Typography></li>
                <li><Typography variant="body2">The price specified in any package is the <strong>minimum charge</strong> for the service.</Typography></li>
                <li><Typography variant="body2">Hire prices are subject to change in the event of an <strong>increase in fuel prices</strong>.</Typography></li>
                <li><Typography variant="body2">Highway tolls and parking fees are <strong>not included</strong> and must be paid by the customer.</Typography></li>
              </Box>
            </Box>

            <Box sx={{ p: 2, bgcolor: '#f0fdfa', borderRadius: '16px', border: '1px dashed #0d9488' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0d9488', mb: 1.5 }}>2. Overnight Trips Policy</Typography>
              <Typography variant="body2" sx={{ color: '#134e4a', lineHeight: 1.7, mb: 1 }}>
                For overnight trips, the customer must provide the driver with suitable accommodation and daily meals.
              </Typography>
              <Typography variant="body2" sx={{ color: '#0d9488', fontWeight: 700 }}>
                ● If NOT provided: Customer must pay the driver a daily allowance of LKR 3,500.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>3. Responsibilities & Liability</Typography>
              <Box component="ul" sx={{ m: 0, pl: 2, color: '#4b5563', '& li': { mb: 0.8 } }}>
                <li><Typography variant="body2">Customers are responsible for accurate booking details and their belongings.</Typography></li>
                <li><Typography variant="body2">Illegal activities or interfering with the driver are strictly prohibited.</Typography></li>
                <li><Typography variant="body2">The company is not liable for delays due to traffic, weather, or unforeseen circumstances.</Typography></li>
              </Box>
            </Box>

            <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 2, textAlign: 'center' }}>Official Support Channels</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Call</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>0702787787</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>WhatsApp</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>0702787787</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Email</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>senucabs@gmail.com</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <Box sx={{ p: 3, pt: 1, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{
            background: '#0d9488',
            borderRadius: '12px',
            px: 4,
            py: 1.2,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(13,148,136,0.25)',
            '&:hover': { background: '#0f766e', boxShadow: '0 6px 16px rgba(13,148,136,0.35)' }
          }}
        >
          I Understand
        </Button>
      </Box>
    </Dialog>
  );
};

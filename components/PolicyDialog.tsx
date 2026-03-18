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
      maxWidth="sm"
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
        pb: 2
      }}>
        Policies & Conditions
        <IconButton
          onClick={onClose}
          sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 4, mt: 1 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ 
            fontFamily: "'Montserrat', sans-serif", 
            fontWeight: 700, 
            color: '#0d9488', 
            mb: 2, 
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Privacy Policy
          </Typography>
          <Typography sx={{ 
            fontFamily: "'Montserrat', sans-serif", 
            fontSize: '0.9rem', 
            color: '#4b5563', 
            lineHeight: 1.7 
          }}>
            At Senu Tours, we prioritize your privacy. The information we collect (name, email, phone number, and location) is used exclusively for facilitating your bookings and providing personalized travel recommendations. We implement industry-standard security measures to protect your personal data and do not share it with third parties unless required for service fulfillment.
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ 
            fontFamily: "'Montserrat', sans-serif", 
            fontWeight: 700, 
            color: '#0d9488', 
            mb: 2, 
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Terms & Conditions
          </Typography>
          <Box component="ul" sx={{ 
            m: 0, 
            p: 0, 
            listStyle: 'none',
            '& li': {
              position: 'relative',
              pl: 3,
              mb: 1.5,
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.88rem',
              color: '#4b5563',
              lineHeight: 1.6,
              '&::before': {
                content: '"•"',
                position: 'absolute',
                left: 0,
                color: '#0d9488',
                fontWeight: 'bold'
              }
            }
          }}>
            <li>All bookings are subject to vehicle availability and confirmation by our team.</li>
            <li>Calculated price estimates are based on standard routes; deviations may result in additional charges.</li>
            <li>Wait time charges apply if the delay exceeds 30 minutes from the scheduled pickup time.</li>
            <li>Cancellations made less than 2 hours before the scheduled pickup may incur a nominal fee.</li>
            <li>Passengers must adhere to the specified luggage and seating capacity for each vehicle type.</li>
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

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Button
} from '@mui/material';
import Call from '@mui/icons-material/Call';
import ContentCopy from '@mui/icons-material/ContentCopy';

interface CallPopupDialogProps {
  open: boolean;
  onClose: () => void;
  onCopySuccess: () => void;
}

export const CallPopupDialog: React.FC<CallPopupDialogProps> = ({ open, onClose, onCopySuccess }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          width: '100%',
          maxWidth: '400px',
          p: 0,
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.2)'
        }
      }}
    >
      <Box sx={{ 
        height: '10px', 
        background: 'linear-gradient(90deg, #0d9488 0%, #C9A961 100%)' 
      }} />
      
      <DialogTitle sx={{ 
        textAlign: 'center', 
        fontFamily: "'Playfair Display', serif", 
        fontWeight: 700,
        fontSize: '1.6rem',
        pt: 4,
        pb: 1,
        color: '#111827'
      }}>
        Contact our team and request your package
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', px: 4, pb: 5 }}>
        <Typography sx={{ 
          fontFamily: "'Montserrat', sans-serif", 
          fontSize: '0.9rem', 
          color: '#6b7280',
          mb: 3,
          lineHeight: 1.6
        }}>
          Simply dial our hotline or copy the number below to request your booking details.
        </Typography>

        <Typography sx={{ 
          fontFamily: "'Montserrat', sans-serif", 
          fontSize: '1.8rem', 
          fontWeight: 800, 
          color: '#0d9488',
          letterSpacing: '0.02em',
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5
        }}>
          <Call sx={{ fontSize: 28, color: '#C9A961' }} />
          +94 70 278 7787
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Call />}
            component="a"
            href="tel:+94702787787"
            sx={{
              display: { xs: 'flex', sm: 'flex' },
              bgcolor: '#0d9488',
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.85rem',
              fontWeight: 800,
              borderRadius: '14px',
              py: 2,
              boxShadow: '0 10px 20px rgba(13, 148, 136, 0.2)',
              '&:hover': { 
                bgcolor: '#0f766e',
                boxShadow: '0 15px 25px rgba(13, 148, 136, 0.3)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Call Now
          </Button>

          <Button
            fullWidth
            variant="text"
            startIcon={<ContentCopy />}
            onClick={() => {
              navigator.clipboard.writeText('+94702787787');
              onCopySuccess();
            }}
            sx={{
              color: '#4b5563',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              borderRadius: '14px',
              py: 1.5,
              '&:hover': { bgcolor: '#f9fafb' }
            }}
          >
            Copy Number
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

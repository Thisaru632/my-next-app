import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';

interface LoginRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LoginRequiredDialog: React.FC<LoginRequiredDialogProps> = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          padding: '10px',
          textAlign: 'center',
          maxWidth: '320px'
        }
      }}
    >
      <DialogContent>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'rgba(13,148,136,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AccountCircle sx={{ color: '#0d9488', fontSize: '30px' }} />
          </div>
        </Box>
        <Typography sx={{ mb: 2, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", color: '#111827' }}>
          Login Required
        </Typography>
        <Typography sx={{ mb: 3, color: '#6b7280', fontSize: '0.9rem', fontFamily: "'Montserrat', sans-serif", lineHeight: 1.5 }}>
          Login to the Senu Tours to use promo code
        </Typography>
        <Button
          fullWidth
          variant="contained"
          onClick={onConfirm}
          sx={{
            bgcolor: '#0d9488',
            borderRadius: '12px',
            '&:hover': { bgcolor: '#0f766e' },
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            py: 1.2,
            boxShadow: '0 4px 12px rgba(13,148,136,0.3)'
          }}
        >
          OK
        </Button>
      </DialogContent>
    </Dialog>
  );
};

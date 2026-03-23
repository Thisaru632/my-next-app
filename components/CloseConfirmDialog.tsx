import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button
} from '@mui/material';

interface CloseConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export const CloseConfirmDialog: React.FC<CloseConfirmDialogProps> = ({ open, onClose, onConfirm, title, message }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '90%',
          maxWidth: 360,
          borderRadius: '24px',
          p: 1,
          textAlign: 'center'
        }
      }}
      BackdropProps={{ sx: { backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.2)' } }}
    >
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '2rem'
        }}>
          ⚠️
        </div>
        <Typography sx={{ 
          fontFamily: "'Montserrat', sans-serif", 
          fontWeight: 700, 
          fontSize: '1.2rem', 
          color: '#111827', 
          mb: 1 
        }}>
          {title || "Are you sure?"}
        </Typography>
        <Typography sx={{ 
          fontFamily: "'Montserrat', sans-serif", 
          fontSize: '0.875rem', 
          color: '#6b7280', 
          lineHeight: 1.6 
        }}>
          {message || "Your entered contact information will be kept, but you will leave this step."}
        </Typography>
      </DialogContent>
      <Box sx={{ p: 2, display: 'flex', gap: 1.5 }}>
        <Button 
          fullWidth
          onClick={onClose}
          sx={{
            borderRadius: '14px',
            py: 1.2,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            color: '#6b7280',
            textTransform: 'none',
            '&:hover': { background: 'rgba(0,0,0,0.04)' }
          }}
        >
          Cancel
        </Button>
        <Button 
          fullWidth
          variant="contained"
          onClick={onConfirm}
          sx={{
            borderRadius: '14px',
            py: 1.2,
            background: '#ef4444',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
            '&:hover': { background: '#dc2626', boxShadow: '0 6px 16px rgba(239, 68, 68, 0.3)' }
          }}
        >
          Yes, Go Back
        </Button>
      </Box>
    </Dialog>
  );
};

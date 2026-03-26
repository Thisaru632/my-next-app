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
          borderRadius: '20px',
          width: '90%',
          maxWidth: '320px',
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        fontFamily: "'Montserrat', sans-serif", 
        fontWeight: 700,
        fontSize: '1.1rem',
        pb: 1
      }}>
        Contact Support
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
        <Typography sx={{ 
          fontFamily: "'Montserrat', sans-serif", 
          fontSize: '1.4rem', 
          fontWeight: 800, 
          color: '#111827',
          mb: 3
        }}>
          +94 70 278 7787
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ContentCopy />}
            onClick={() => {
              navigator.clipboard.writeText('+94702787787');
              onCopySuccess();
            }}
            sx={{
              bgcolor: '#f3f4f6',
              color: '#4b5563',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '12px',
              py: 1.2,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#e5e7eb', boxShadow: 'none' }
            }}
          >
            Copy Number
          </Button>
          
          <Button
            fullWidth
            variant="contained"
            startIcon={<Call />}
            component="a"
            href="tel:+94702787787"
            sx={{
              display: { xs: 'flex', sm: 'none' }, // Dial pad only on mobile View
              bgcolor: '#0d9488',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '12px',
              py: 1.2,
              '&:hover': { bgcolor: '#0f766e' }
            }}
          >
            Call Now
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

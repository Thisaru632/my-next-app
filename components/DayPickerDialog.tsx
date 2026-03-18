import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircle from '@mui/icons-material/AddCircle';
import RemoveCircle from '@mui/icons-material/RemoveCircle';

interface DayPickerDialogProps {
  open: boolean;
  onClose: () => void;
  tempDays: number;
  setTempDays: React.Dispatch<React.SetStateAction<number>>;
  handleChange: (field: string, value: any) => void;
  routeDistance: number | null;
  acknowledgedDropHireSuggestion: boolean;
  setShowDropHireSuggestion: (val: boolean) => void;
}

export const DayPickerDialog: React.FC<DayPickerDialogProps> = ({
  open,
  onClose,
  tempDays,
  setTempDays,
  handleChange,
  routeDistance,
  acknowledgedDropHireSuggestion,
  setShowDropHireSuggestion,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '95%',
          maxWidth: 350,
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
          border: '1px solid rgba(13,148,136,0.1)',
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{
        p: 3,
        background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)',
        borderBottom: '1px solid rgba(13,148,136,0.12)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography sx={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#111827'
        }}>
          Select Days
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 4, textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            background: 'rgba(13,148,136,0.05)',
            padding: '1.5rem',
            borderRadius: '20px',
            border: '1px solid rgba(13,148,136,0.1)',
            width: '100%'
          }}>
            <IconButton 
              onClick={() => setTempDays(prev => Math.max(1, prev - 1))}
              sx={{ 
                color: '#0d9488', 
                background: 'white', 
                '&:hover': { background: '#f0fdfa' },
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <RemoveCircle />
            </IconButton>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ 
                fontSize: '2.5rem', 
                fontWeight: 800, 
                color: '#0d9488',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                {tempDays}
              </span>
              <span style={{ 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                {tempDays === 1 ? 'Day' : 'Days'}
              </span>
            </div>

            <IconButton 
              onClick={() => setTempDays(prev => Math.min(30, prev + 1))}
              sx={{ 
                color: '#0d9488', 
                background: 'white', 
                '&:hover': { background: '#f0fdfa' },
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <AddCircle />
            </IconButton>
          </div>

          <button
            onClick={() => {
              handleChange('numberOfDays', tempDays);
              onClose();
              
              // Immediate suggestion if distance is already known to be < 100km
              const distanceInKm = routeDistance ? (routeDistance / 1000) : 0;
              if (tempDays > 1 && distanceInKm > 0 && distanceInKm < 100 && !acknowledgedDropHireSuggestion) {
                setTimeout(() => setShowDropHireSuggestion(true), 300);
              }
            }}
            style={{
              width: '100%',
              padding: '1.1rem',
              background: '#0d9488',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(13,148,136,0.2)',
              transition: 'all 0.3s'
            }}
          >
            Confirm Selection
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

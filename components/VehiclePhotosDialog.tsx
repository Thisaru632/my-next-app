import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface VehiclePhotosDialogProps {
  open: boolean;
  onClose: () => void;
  photosVehicle: string;
  getVehicleFolderName: (modelName: string) => string;
}

export const VehiclePhotosDialog: React.FC<VehiclePhotosDialogProps> = ({
  open,
  onClose,
  photosVehicle,
  getVehicleFolderName,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '28px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
          border: '1px solid rgba(255,255,255,0.4)',
          overflow: 'hidden',
        }
      }}
      BackdropProps={{
        sx: { backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.4)' }
      }}
    >
      <Box sx={{
        px: 4, py: 3,
        background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)',
        borderBottom: '1px solid rgba(13,148,136,0.12)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Box>
          <Typography sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '2rem', fontWeight: 700,
            color: '#111827',
            letterSpacing: '-0.02em',
          }}>
            {photosVehicle}
          </Typography>
          <Typography sx={{
            fontSize: '0.78rem',
            color: '#0d9488',
            fontFamily: "'Montserrat', sans-serif",
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}>
            Experience the Comfort
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#9ca3af',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            '&:hover': { color: '#ef4444', background: '#fff0f0', borderColor: '#fecaca' },
          }}
        >
          <CloseIcon sx={{ fontSize: 22 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 3,
        }}>
          {['front.png', 'side.png', 'back.png', 'inside.png'].map((img) => (
            <Box
              key={img}
              sx={{
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                aspectRatio: '16/10',
                background: '#f3f4f6',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                },
              }}
            >
              <img
                src={`/Vehicle images/${getVehicleFolderName(photosVehicle)}/${img}`}
                alt={`${photosVehicle} ${img.replace('.png', '')}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Not+Available';
                }}
              />
              <Box sx={{
                position: 'absolute', bottom: 12, left: 12,
                px: 1.5, py: 0.5,
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {img.replace('.png', '')} View
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

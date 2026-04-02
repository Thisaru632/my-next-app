import React from 'react';
import { Dialog, DialogContent, Box, Typography, IconButton, CircularProgress } from '@mui/material';
import { Close as CloseIcon, CheckCircle, DirectionsCar, Group, Work, TrendingFlat, Loop, AirportShuttle, DirectionsBus, Call } from '@mui/icons-material';

interface VehicleModel {
  name: string;
  description: string;
  maxPersons: number;
  maxBags: number;
}

interface VehicleModelDialogProps {
  open: boolean;
  onClose: () => void;
  vehicleType: string;
  vehicleName: string;
  models: VehicleModel[];
  onSelect: (modelName: string) => void;
  vehiclePricesMap: Record<string, number>;
  vehicleDiscountsMap: Record<string, string | null>;
  showPrices: boolean;
}

export const VehicleModelDialog: React.FC<VehicleModelDialogProps> = ({ open, onClose, vehicleType, vehicleName, models, onSelect, vehiclePricesMap, vehicleDiscountsMap, showPrices }) => (
  <Dialog open={open} onClose={onClose}
    PaperProps={{ sx: { width: '95%', maxWidth: 480, m: 2, borderRadius: '24px', background: '#ffffff', border: '1px solid rgba(13,148,136,0.15)', boxShadow: '0 24px 64px rgba(0,0,0,0.12)', overflow: 'hidden' } }}
    BackdropProps={{ sx: { backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.35)' } }}
  >
    <Box sx={{ px: 3, pt: 3, pb: 2, background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)', borderBottom: '1px solid rgba(13,148,136,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', fontWeight: 700, color: '#2D231B', letterSpacing: '-0.01em' }}>Select Model</Typography>
        <Typography sx={{ fontSize: '0.72rem', color: '#0d9488', fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', mt: 0.25, fontWeight: 700 }}>{vehicleType} Collection</Typography>
      </Box>
      <IconButton onClick={onClose} sx={{ color: '#9ca3af', background: '#f8f9fa', border: '1px solid #e9ecef', width: 36, height: 36, '&:hover': { color: '#ef4444', background: '#fff0f0', borderColor: '#fecaca' } }}>
        <CloseIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
    <DialogContent sx={{ p: 2.5, background: '#f8f9fa' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        {models.map((model) => {
          const isSelected = vehicleName === model.name;
          const VehicleIcon = () => {
            if (vehicleType === 'Van') return <AirportShuttle sx={{ fontSize: 28 }} />;
            if (vehicleType === 'Bus') return <DirectionsBus sx={{ fontSize: 28 }} />;
            if (vehicleType === 'SUV') return <DirectionsCar sx={{ fontSize: 28 }} />;
            return <DirectionsCar sx={{ fontSize: 28 }} />;
          };
          
          return (
            <Box key={model.name} onClick={() => onSelect(model.name)}
              sx={{ position: 'relative', p: 2, borderRadius: '16px', border: '1.5px solid', borderColor: isSelected ? '#c9a96e' : '#e9ecef', background: isSelected ? 'linear-gradient(135deg, #fffbf0 0%, #fff8e6 100%)' : '#ffffff', cursor: 'pointer', transition: 'all 0.22s ease', boxShadow: isSelected ? '0 4px 16px rgba(13,148,136,0.15)' : '0 1px 4px rgba(0,0,0,0.05)', '&:hover': { borderColor: '#0d9488', background: 'rgba(13,148,136,0.02)', transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(13,148,136,0.12)' } }}
            >
              {isSelected && <Box sx={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle sx={{ fontSize: 14, color: '#fff' }} /></Box>}
              <Box sx={{ mb: 1.5, color: isSelected ? '#0d9488' : '#94a3b8' }}><VehicleIcon /></Box>
              <Typography sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#0d9488' : '#1e293b', mb: 0.4 }}>{model.name}</Typography>
              
              {(showPrices && vehicleType !== 'SUV') && (
                <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ p: '4px 8px', borderRadius: '8px', background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)' }}>
                    <Typography sx={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 800, fontFamily: "'Montserrat', sans-serif" }}>
                      {vehiclePricesMap[model.name] > 0 ? `LKR ${vehiclePricesMap[model.name].toLocaleString()}` : 'Price on Request'}
                    </Typography>
                  </Box>
                  {vehicleDiscountsMap[model.name] && (
                    <Box sx={{ p: '2px 6px', borderRadius: '4px', background: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <Typography sx={{ fontSize: '0.6rem', color: '#fff', fontWeight: 900, fontFamily: "'Montserrat', sans-serif" }}>
                        {vehicleDiscountsMap[model.name]} OFF
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              <Typography sx={{ fontSize: '0.68rem', color: '#64748b', fontFamily: "'Montserrat', sans-serif", mb: 1 }}>{model.description}</Typography>

              <Box sx={{ display: 'flex', gap: 0.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, px: 0.75, py: 0.25, borderRadius: '8px', background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.15)' }}>
                  <Group sx={{ fontSize: 11, color: '#0d9488' }} /><Typography sx={{ fontSize: '0.65rem', color: '#0d9488', fontWeight: 600 }}>{model.maxPersons}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, px: 0.75, py: 0.25, borderRadius: '8px', background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.15)' }}>
                  <Work sx={{ fontSize: 11, color: '#0d9488' }} /><Typography sx={{ fontSize: '0.65rem', color: '#0d9488', fontWeight: 600 }}>{model.maxBags}</Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </DialogContent>
  </Dialog>
);

interface TripType { name: string; description: string; icon: React.ReactNode; }

interface TripTypeDialogProps {
  open: boolean;
  onClose: () => void;
  tripType: string;
  tripTypes: TripType[];
  onSelect: (name: string) => void;
  onWarn: () => void;
}

export const TripTypeDialog: React.FC<TripTypeDialogProps> = ({ open, onClose, tripType, tripTypes, onSelect, onWarn }) => {
  const handleClose = () => { if (tripType) onClose(); else onWarn(); };
  return (
    <Dialog open={open} onClose={handleClose}
      PaperProps={{ sx: { width: '95%', maxWidth: 380, m: 2, borderRadius: '24px', background: '#ffffff', border: '1px solid rgba(13,148,136,0.15)', boxShadow: '0 24px 64px rgba(0,0,0,0.12)', overflow: 'hidden' } }}
      BackdropProps={{ sx: { backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.35)' } }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 2, background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)', borderBottom: '1px solid rgba(13,148,136,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', fontWeight: 700, color: '#2D231B', letterSpacing: '-0.01em' }}>Trip Type</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#0d9488', fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', mt: 0.25, fontWeight: 700 }}>Choose your journey style</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: '#9ca3af', background: '#f8f9fa', border: '1px solid #e9ecef', width: 36, height: 36, '&:hover': { color: '#ef4444', background: '#fff0f0', borderColor: '#fecaca' } }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 2.5, background: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {tripTypes.map((type) => {
            const isSelected = tripType === type.name;
            return (
              <Box key={type.name} onClick={() => onSelect(type.name)}
                sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 2, p: 2.5, borderRadius: '16px', border: '1.5px solid', borderColor: isSelected ? '#c9a96e' : '#e9ecef', background: isSelected ? 'linear-gradient(135deg, #fffbf0 0%, #fff8e6 100%)' : '#ffffff', cursor: 'pointer', transition: 'all 0.22s ease', overflow: 'hidden', boxShadow: isSelected ? '0 4px 16px rgba(13,148,136,0.15)' : '0 1px 4px rgba(0,0,0,0.05)', '&:hover': { borderColor: '#0d9488', background: 'rgba(13,148,136,0.02)', transform: 'translateX(4px)', boxShadow: '0 6px 20px rgba(13,148,136,0.12)' } }}
              >
                {isSelected && <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#0d9488', borderRadius: '0 2px 2px 0' }} />}
                <Box sx={{ width: 52, height: 52, borderRadius: '14px', flexShrink: 0, background: isSelected ? 'rgba(13,148,136,0.1)' : 'rgba(13,148,136,0.05)', border: '1px solid', borderColor: isSelected ? 'rgba(13,148,136,0.3)' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? '#0d9488' : '#94a3b8', fontSize: 26 }}>
                  {type.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '0.98rem', color: isSelected ? '#0d9488' : '#1e293b', mb: 0.3 }}>{type.name}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontFamily: "'Montserrat', sans-serif" }}>{type.description}</Typography>
                </Box>
                {isSelected && <Box sx={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle sx={{ fontSize: 16, color: '#fff' }} /></Box>}
              </Box>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

interface PromoDialogProps {
  open: boolean;
  onClose: () => void;
  hasPromoOption: boolean | null;
  setHasPromoOption: (v: boolean | null) => void;
  promoCodeInput: string;
  setPromoCodeInput: (v: string) => void;
  isPromoLoading: boolean;
  onSubmit: () => void;
}

export const PromoDialog: React.FC<PromoDialogProps> = ({ open, onClose, hasPromoOption, setHasPromoOption, promoCodeInput, setPromoCodeInput, isPromoLoading, onSubmit }) => (
  <Dialog open={open} onClose={onClose}
    PaperProps={{ sx: { width: '95%', maxWidth: 400, borderRadius: '24px', p: 3, textAlign: 'center', background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(20px)', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', border: '1px solid rgba(13,148,136,0.1)' } }}
  >
    <div style={{ padding: '8px 0' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎁</div>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>Do you have any promo code?</h3>
      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', color: '#6b7280', marginBottom: '2rem' }}>Enter a promo code to unlock exclusive discounts on your journey.</p>
      {hasPromoOption === null ? (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#4b5563', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>No, thanks</button>
          <button onClick={() => setHasPromoOption(true)} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: '#0d9488', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(13,148,136,0.2)' }}>Yes, I have</button>
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <input type="text" placeholder="Enter Promo Code" value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value)} autoFocus
            style={{ width: '100%', padding: '0.9rem 1.25rem', borderRadius: '14px', border: '1.5px solid rgba(13,148,136,0.3)', background: 'rgba(13,148,136,0.05)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.95rem', outline: 'none', marginBottom: '1rem' }}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => { setHasPromoOption(null); setPromoCodeInput(''); }} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: '#fff', color: '#4b5563', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Back</button>
            <button onClick={onSubmit} disabled={!promoCodeInput.trim() || isPromoLoading}
              style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: promoCodeInput.trim() && !isPromoLoading ? '#0d9488' : '#9ca3af', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: promoCodeInput.trim() && !isPromoLoading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isPromoLoading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Apply'}
            </button>
          </div>
        </div>
      )}
    </div>
  </Dialog>
);

interface ProvinceBlockDialogProps {
  open: boolean;
  onClose: () => void;
  onCall?: () => void;
  provinceName: string;
}

export const ProvinceBlockDialog: React.FC<ProvinceBlockDialogProps> = ({ open, onClose, onCall, provinceName }) => (
  <Dialog 
    open={open} 
    onClose={onClose}
    PaperProps={{ 
      sx: { 
        width: '95%', 
        maxWidth: 420, 
        borderRadius: '28px', 
        p: 0, 
        textAlign: 'center', 
        overflow: 'hidden',
        boxShadow: '0 32px 64px -12px rgba(0,0,0,0.14)',
        border: '1px solid rgba(13,148,136,0.1)'
      } 
    }}
  >
    <Box sx={{ 
      p: 4, 
      background: 'linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Box sx={{ 
        width: 80, 
        height: 80, 
        borderRadius: '50%', 
        bgcolor: 'rgba(13, 148, 136, 0.1)', 
        color: '#0d9488', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        mb: 3,
        animation: 'pulse 2s infinite'
      }}>
        <Call sx={{ fontSize: 40 }} />
      </Box>
      
      <Typography variant="h5" sx={{ 
        fontFamily: "'Cormorant Garamond', serif", 
        fontWeight: 800, 
        color: '#1e293b', 
        mb: 2,
        lineHeight: 1.2
      }}>
        Limited Availability in {provinceName}
      </Typography>
      
      <Typography variant="body2" sx={{ 
        fontFamily: "'Montserrat', sans-serif", 
        color: '#4b5563', 
        mb: 4, 
        lineHeight: 1.6,
        px: 1
      }}>
        Vehicle availability is currently limited in your selected pickup area. But don’t worry — if you’d like to book a ride or get an estimate, just give us a call!<br/><br/>
        Our team is ready to arrange a flexible and comfortable solution that fits your travel needs perfectly.
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
        <button 
          onClick={onCall}
          style={{ 
            width: '100%',
            padding: '1rem', 
            borderRadius: '16px', 
            border: 'none', 
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)', 
            color: '#fff', 
            fontWeight: 700, 
            fontSize: '1rem', 
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 20px rgba(13, 148, 136, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 15px 30px rgba(13, 148, 136, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(13, 148, 136, 0.2)';
          }}
        >
          <Call sx={{ fontSize: 20 }} />
          Call Us Now
        </button>

        <button 
          onClick={onClose}
          style={{ 
            width: '100%',
            padding: '0.85rem', 
            borderRadius: '16px', 
            border: '1.5px solid #e2e8f0', 
            background: '#fff', 
            color: '#64748b', 
            fontWeight: 600, 
            fontSize: '0.9rem', 
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Understood
        </button>
      </Box>
    </Box>
    <style>{`
      @keyframes pulse {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.4); }
        70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(13, 148, 136, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(13, 148, 136, 0); }
      }
    `}</style>
  </Dialog>
);

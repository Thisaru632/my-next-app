import React from 'react';
import {
  Dialog
} from '@mui/material';

interface DropHireSuggestionDialogProps {
  open: boolean;
  onClose: () => void;
  onReconsider: () => void;
  onConfirm: () => void;
}

export const DropHireSuggestionDialog: React.FC<DropHireSuggestionDialogProps> = ({
  open,
  onClose,
  onReconsider,
  onConfirm
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '95%',
          maxWidth: 450,
          borderRadius: '24px',
          p: 4,
          textAlign: 'center',
          background: '#ffffff',
          boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
          border: '1px solid rgba(13,148,136,0.1)'
        }
      }}
    >
      <div style={{ padding: '8px 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1.2rem' }}>💡</div>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.8rem',
          fontWeight: 700,
          color: '#111827',
          marginBottom: '1rem',
          lineHeight: 1.2
        }}>
          Smart Choice Suggestion
        </h3>
        <div style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '0.95rem',
          color: '#4b5563',
          marginBottom: '2.5rem',
          lineHeight: 1.6,
          textAlign: 'center'
        }}>
          You have selected a multi-day trip for a short distance (under 100km). 
          <br /><strong>Are you sure about this?</strong> 
          <br /><br />
          Since the distance is short, you can get <strong>two separate Drop hires</strong> for this low rate which might be more cost-effective than a Return rate with waiting charges.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={onReconsider}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              border: '1.5px solid #0d9488',
              background: '#fff',
              color: '#0d9488',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Reconsider (Change Trip Type)
          </button>
          <button
            onClick={onConfirm}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              border: 'none',
              background: '#0d9488',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(13,148,136,0.2)'
            }}
          >
            Yes, I'm sure (Continue Booking)
          </button>
        </div>
      </div>
    </Dialog>
  );
};

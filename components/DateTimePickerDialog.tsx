import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { getHolidayName, isPoyaDay } from '@/config/holidays';

// CustomCalendar is imported from hero's local definition via a prop
interface CustomCalendarProps {
  selectedDate: string;
  minDate: string;
  onSelect: (date: string) => void;
}

interface DateTimePickerDialogProps {
  open: boolean;
  onClose: () => void;
  pickerStep: number;
  setPickerStep: (step: number) => void;
  tempDate: string;
  setTempDate: (date: string) => void;
  tempHour: string;
  setTempHour: (h: string) => void;
  tempMin: string;
  setTempMin: (m: string) => void;
  tempAmPm: string;
  setTempAmPm: (ap: string) => void;
  minDateTime: string;
  handleChange: (field: string, value: any) => void;
  CalendarComponent: React.ComponentType<CustomCalendarProps>;
}

export const DateTimePickerDialog: React.FC<DateTimePickerDialogProps> = ({
  open,
  onClose,
  pickerStep,
  setPickerStep,
  tempDate,
  setTempDate,
  tempHour,
  setTempHour,
  tempMin,
  setTempMin,
  tempAmPm,
  setTempAmPm,
  minDateTime,
  handleChange,
  CalendarComponent,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '95%',
          maxWidth: 400,
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
          {pickerStep === 0 ? 'Select Date' : 'Select Time'}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
        {pickerStep === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CalendarComponent
              selectedDate={tempDate}
              minDate={minDateTime}
              onSelect={(date) => {
                setTempDate(date);
              }}
            />
            {tempDate && getHolidayName(tempDate) && (
              <div style={{
                marginTop: '12px',
                padding: '10px 14px',
                background: isPoyaDay(tempDate) ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                borderRadius: '12px',
                border: `1px solid ${isPoyaDay(tempDate) ? 'rgba(234, 179, 8, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                color: isPoyaDay(tempDate) ? '#854d0e' : '#991b1b',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                <span style={{ fontSize: '1.1rem' }}>{isPoyaDay(tempDate) ? '🌕' : '🗓️'}</span>
                <span>{getHolidayName(tempDate)}</span>
              </div>
            )}
            <button
              onClick={() => {
                if (tempDate) {
                  handleChange('dateTime', tempDate);
                  setPickerStep(1);
                }
              }}
              disabled={!tempDate}
              style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '1.1rem',
                background: tempDate ? '#0d9488' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: tempDate ? 'pointer' : 'not-allowed',
                boxShadow: tempDate ? '0 8px 20px rgba(13,148,136,0.2)' : 'none',
                transition: 'all 0.3s'
              }}
            >
              Set Date & Continue
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(13,148,136,0.05)',
              padding: '1.2rem',
              borderRadius: '20px',
              width: '100%',
              border: '1px solid rgba(13,148,136,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Type Your Time
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* Hour Control */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <IconButton
                    onClick={() => {
                      let h = parseInt(tempHour || "12");
                      h = h >= 12 ? 1 : h + 1;
                      setTempHour(String(h));
                    }}
                    size="small"
                    sx={{ color: '#0d9488', p: 0.5 }}
                  >
                    <KeyboardArrowUp />
                  </IconButton>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={tempHour}
                    onChange={(e) => {
                      let v = e.target.value;
                      if (v.length > 2) v = v.slice(0, 2);
                      const n = parseInt(v);
                      if (v === "" || (n >= 1 && n <= 12)) setTempHour(v);
                    }}
                    placeholder="12"
                    style={{
                      width: '60px',
                      padding: '0.6rem',
                      borderRadius: '10px',
                      border: '2px solid #0d9488',
                      background: 'white',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      fontFamily: "'Montserrat', sans-serif",
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                  <IconButton
                    onClick={() => {
                      let h = parseInt(tempHour || "1");
                      h = h <= 1 ? 12 : h - 1;
                      setTempHour(String(h));
                    }}
                    size="small"
                    sx={{ color: '#0d9488', p: 0.5 }}
                  >
                    <KeyboardArrowDown />
                  </IconButton>
                </div>

                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0d9488', marginTop: '0px' }}>:</span>

                {/* Minute Control */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <IconButton
                    onClick={() => {
                      let m = parseInt(tempMin || "0");
                      m = m >= 59 ? 0 : m + 1;
                      setTempMin(String(m).padStart(2, '0'));
                    }}
                    size="small"
                    sx={{ color: '#0d9488', p: 0.5 }}
                  >
                    <KeyboardArrowUp />
                  </IconButton>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={tempMin}
                    onChange={(e) => {
                      let v = e.target.value;
                      if (v.length > 2) v = v.slice(0, 2);
                      const n = parseInt(v);
                      if (v === "" || (n >= 0 && n <= 59)) setTempMin(v);
                    }}
                    placeholder="00"
                    style={{
                      width: '60px',
                      padding: '0.6rem',
                      borderRadius: '10px',
                      border: '2px solid #0d9488',
                      background: 'white',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      fontFamily: "'Montserrat', sans-serif",
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                  <IconButton
                    onClick={() => {
                      let m = parseInt(tempMin || "0");
                      m = m <= 0 ? 59 : m - 1;
                      setTempMin(String(m).padStart(2, '0'));
                    }}
                    size="small"
                    sx={{ color: '#0d9488', p: 0.5 }}
                  >
                    <KeyboardArrowDown />
                  </IconButton>
                </div>

                {/* AM/PM Control */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  marginLeft: '8px'
                }}>
                  {['AM', 'PM'].map(p => (
                    <button
                      key={p}
                      onClick={() => setTempAmPm(p)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(13,148,136,0.2)',
                        background: tempAmPm === p ? '#0d9488' : 'white',
                        color: tempAmPm === p ? 'white' : '#0d9488',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: tempAmPm === p ? '0 4px 10px rgba(13,148,136,0.2)' : 'none'
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '0.5rem' }}>
              <button
                onClick={() => {
                  if (tempDate && tempHour && tempMin) {
                    let hh = parseInt(tempHour);
                    if (tempAmPm === 'PM' && hh < 12) hh += 12;
                    if (tempAmPm === 'AM' && hh === 12) hh = 0;
                    const formattedTime = `${String(hh).padStart(2, '0')}:${tempMin.padStart(2, '0')}`;
                    handleChange('dateTime', `${tempDate}T${formattedTime}`);
                    onClose();
                  }
                }}
                disabled={!tempHour || !tempMin}
                style={{
                  padding: '0.75rem 2.5rem',
                  background: (tempHour && tempMin) ? '#0d9488' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: (tempHour && tempMin) ? 'pointer' : 'not-allowed',
                  boxShadow: (tempHour && tempMin) ? '0 8px 16px rgba(13,148,136,0.15)' : 'none',
                  transition: 'all 0.3s'
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

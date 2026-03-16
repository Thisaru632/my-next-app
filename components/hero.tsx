"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  Box,
  Typography,
  CircularProgress,
  Tooltip,
  Zoom,
} from '@mui/material';
import {
  DirectionsBus,
  Close as CloseIcon,
  DriveEta,
  CheckCircle,
  AirportShuttle,
  LocalTaxi,
  Person,
  Work,
  Phone,
  Email,
  AccountCircle,
  Group,
  DirectionsCar,
  TrendingFlat,
  Loop,
  Visibility,
  AddCircle,
  RemoveCircle,
  MyLocation as MyLocationIcon,
  Redeem as GiftIcon,
  CalendarMonth,
  AccessTime,
  ChevronLeft,
  ChevronRight,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Map as MapIcon,
} from '@mui/icons-material';
import MapPicker from './MapPicker';
import Image from 'next/image';
import AuthModal from './AuthModal';
import RouteViewer from './RouteViewer';
import { API_ENDPOINTS } from '@/config/api';
import { useUser } from '@/context/UserContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
import { getHolidayName, isPoyaDay, isWeekend } from '@/config/holidays';
interface PromoCode {
  _id: string;
  code: string;
  discountType: 'Percentage' | 'Fixed Amount';
  discountValue: number;
  applicableVehicle: string;
  status: string;
  validFrom: string | null;
  validTo: string | null;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const SLIDES = [
  { src: "/hero/beautiful-woman-dress-by-waterfall.jpg", alt: "Woman by waterfall" },
  { src: "/service/island.jpg", alt: "Tropical Island" },
  { src: "/hero/promodhya-abeysekara-gjd-7_3Ek_w-unsplash.jpg", alt: "Beach view" },
];

const INTERVAL_MS = 6000;

// ---------------------------------------------------------------------------
// CustomCalendar — Premium Mobile-first Date Picker
// ---------------------------------------------------------------------------
function CustomCalendar({
  selectedDate,
  minDate,
  onSelect
}: {
  selectedDate: string;
  minDate: string;
  onSelect: (date: string) => void;
}) {
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) return new Date(selectedDate);
    return new Date();
  });
  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const renderDays = () => {
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const numDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);
    const days = [];

    // Empty slots for start of month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ width: '100%', aspectRatio: '1/1' }} />);
    }

    const minDateObj = new Date(minDate.split('T')[0]);
    const selectedDateObj = selectedDate ? new Date(selectedDate) : null;

    for (let d = 1; d <= numDays; d++) {
      const current = new Date(year, month, d);
      const isToday = new Date().toDateString() === current.toDateString();
      const isSelected = selectedDateObj && current.toDateString() === selectedDateObj.toDateString();
      const isDisabled = current < minDateObj;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const holidayName = getHolidayName(dateStr);
      const isPoya = isPoyaDay(dateStr);
      const isHoliday = !!holidayName;
      const isSatSun = isWeekend(current);

      const dayLabel = holidayName || (isSatSun ? (current.getDay() === 0 ? 'Sunday' : 'Saturday') : '');

      days.push(
        <Tooltip 
          key={d} 
          title={dayLabel} 
          arrow 
          TransitionComponent={Zoom}
          enterTouchDelay={0}
          placement="top"
        >
          <button
            disabled={isDisabled}
            onClick={() => {
              const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              onSelect(formatted);
            }}
            style={{
              width: '100%',
              aspectRatio: '1/1',
              borderRadius: '10px',
              border: 'none',
              outline: 'none',
              background: isSelected 
                ? '#0d9488' 
                : isToday 
                  ? 'rgba(13,148,136,0.1)' 
                  : isPoya 
                    ? 'rgba(234, 179, 8, 0.1)' 
                    : isHoliday 
                      ? 'rgba(239, 68, 68, 0.05)'
                      : isSatSun 
                        ? 'rgba(0,0,0,0.03)' 
                        : 'transparent',
              color: isSelected 
                ? 'white' 
                : isDisabled 
                  ? '#d1d5db' 
                  : isPoya 
                    ? '#ca8a04' 
                    : isHoliday 
                      ? '#dc2626' 
                      : isSatSun 
                        ? '#6b7280' 
                        : isToday 
                          ? '#0d9488' 
                          : '#374151',
              fontWeight: isSelected || isToday || isPoya || isHoliday ? 700 : 500,
              fontSize: '0.8rem',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative'
            }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>{d}</span>
            
            <div style={{ display: 'flex', gap: '2px', position: 'absolute', bottom: '15%' }}>
              {isToday && !isSelected && (
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0d9488' }} />
              )}
              {isPoya && !isSelected && (
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#eab308' }} />
              )}
              {isHoliday && !isPoya && !isSelected && (
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444' }} />
              )}
            </div>

            {/* Special indicator for Poya and major holidays */}
            {(isPoya || isHoliday) && !isSelected && (
               <div style={{
                 position: 'absolute',
                 top: '4px',
                 right: '4px',
                 width: '5px',
                 height: '5px',
                 borderRadius: '50%',
                 background: isPoya ? '#eab308' : '#ef4444'
               }} />
            )}
          </button>
        </Tooltip>
      );
    }
    return days;
  };

  return (
    <div style={{ width: '100%', userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'rgba(13,148,136,0.04)', padding: '6px', borderRadius: '12px' }}>
        <IconButton onClick={handlePrevMonth} size="small" sx={{ color: '#0d9488' }}>
          <ChevronLeft />
        </IconButton>
        <Typography sx={{ fontWeight: 700, fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', color: '#111827' }}>
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </Typography>
        <IconButton onClick={handleNextMonth} size="small" sx={{ color: '#0d9488' }}>
          <ChevronRight />
        </IconButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
        {weekDays.map(day => (
          <div key={day} style={{ textAlign: 'center', fontSize: '0.6rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', paddingBottom: '4px' }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {renderDays()}
      </div>

      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginTop: '16px', 
        paddingTop: '12px',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        fontSize: '0.65rem', 
        color: '#6b7280', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0d9488' }} /> Today
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#eab308' }} /> Poya
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} /> Holiday
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px' }} /> Weekend
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LocationInput — Google Places Autocomplete
// ---------------------------------------------------------------------------
interface GooglePlaceSuggestion {
  description: string;
  place_id: string;
}

function LocationInput({
  value,
  onChange,
  onSelect,
  onManualType,
  placeholder,
  inputStyle,
  onFocusStyle,
  onBlurStyle,
  showMyLocation,
  onMyLocationUsed,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (lat: string, lon: string) => void;
  onManualType?: () => void;
  placeholder: string;
  inputStyle: React.CSSProperties;
  onFocusStyle: React.CSSProperties;
  onBlurStyle: React.CSSProperties;
  showMyLocation?: boolean;
  onMyLocationUsed?: () => void;
  disabled?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<GooglePlaceSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coordsConfirmed, setCoordsConfirmed] = useState(false);
  const [activeStyle, setActiveStyle] = useState<React.CSSProperties>(inputStyle);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const coordsSetRef = useRef(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`/api/google-geocode?latlng=${latitude},${longitude}`);
          const data = await res.json();
          if (data.results && data.results[0]) {
            const address = data.results[0].formatted_address;
            onChange(address);
            onSelect?.(latitude.toString(), longitude.toString());
            coordsSetRef.current = true;
            setCoordsConfirmed(true);
            onMyLocationUsed?.();
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
        } finally {
          setLoading(false);
          setShowDropdown(false);
        }
      },
      (error) => {
        setLoading(false);
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location. Please check your browser permissions.");
      }
    );
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 1) { setSuggestions([]); setShowDropdown(false); return; }
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const url = `/api/google-geocode?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`Google HTTP ${res.status}`);
      const data = await res.json();
      setSuggestions(data.predictions || []);
      setShowDropdown((data.predictions || []).length > 0);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    coordsSetRef.current = false;
    setCoordsConfirmed(false);
    onManualType?.();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 220);
  };

  const handleSelect = async (suggestion: GooglePlaceSuggestion) => {
    onChange(suggestion.description);
    setLoading(true);
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?place_id=${suggestion.place_id}&key=AIzaSyD-hNAm1fnevgihbvtPVY8O0SuzOzK_Msc`);
      const data = await res.json();
      if (data.results && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        onSelect?.(lat.toString(), lng.toString());
        coordsSetRef.current = true;
        setCoordsConfirmed(true);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setLoading(false);
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1 }}>
      <input
        type="text"
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        style={{ 
          ...inputStyle, 
          ...activeStyle, 
          width: '100%', 
          boxSizing: 'border-box', 
          paddingRight: (coordsConfirmed || loading) ? '60px' : '40px',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.8 : 1
        }}
        onFocus={() => {
          if (disabled) return;
          setActiveStyle(onFocusStyle);
          setShowDropdown(true);
        }}
        onClick={() => {
          if (disabled) return;
          setShowDropdown(true);
        }}
        onBlur={() => {
          setActiveStyle(onBlurStyle);
          setTimeout(() => setShowDropdown(false), 200);
        }}
      />
      {showDropdown && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#ffffff', border: '1.5px solid rgba(13,148,136,0.25)',
          borderRadius: '10px', boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
          zIndex: 9999, margin: 0, padding: '4px 0', listStyle: 'none',
          maxHeight: '260px', overflowY: 'auto',
        }}>
          {showMyLocation && (
            <li
              onMouseDown={(e) => {
                e.preventDefault();
                handleMyLocation();
              }}
              style={{
                padding: '10px 14px', cursor: 'pointer', fontSize: '0.85rem',
                fontFamily: "'Montserrat', sans-serif", color: '#0d9488', lineHeight: 1.4,
                borderBottom: '2px solid rgba(13,148,136,0.1)',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontWeight: 600,
                background: 'rgba(13,148,136,0.04)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(13,148,136,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(13,148,136,0.04)')}
            >
              <MyLocationIcon style={{ fontSize: '18px' }} />
              Select my location
            </li>
          )}
          <li
            onMouseDown={(e) => {
              e.preventDefault();
              setShowMapPicker(true);
            }}
            style={{
              padding: '10px 14px', cursor: 'pointer', fontSize: '0.85rem',
              fontFamily: "'Montserrat', sans-serif", color: '#0d9488', lineHeight: 1.4,
              borderBottom: '2px solid rgba(13,148,136,0.1)',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontWeight: 600,
              background: 'rgba(13,148,136,0.04)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(13,148,136,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(13,148,136,0.04)')}
          >
            <MapIcon style={{ fontSize: '18px' }} />
            Select on map
          </li>
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onMouseDown={() => handleSelect(s)}
              style={{
                padding: '9px 14px', cursor: 'pointer', fontSize: '0.78rem',
                fontFamily: "'Montserrat', sans-serif", color: '#1a1a1a', lineHeight: 1.4,
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(13,148,136,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ color: '#0d9488', fontWeight: 600 }}>
                {s.description}
              </span>
            </li>
          ))}
        </ul>
      )}
      {!disabled && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setShowMapPicker(true);
          }}
          size="small"
          sx={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#0d9488',
            opacity: 0.7,
            '&:hover': { opacity: 1, color: '#3b82f6' },
            zIndex: 10
          }}
          title="Select on map"
        >
          <MapIcon sx={{ fontSize: '20px' }} />
        </IconButton>
      )}

      {coordsConfirmed && (
        <div style={{
          position: 'absolute', right: '35px', top: '50%', transform: 'translateY(-50%)',
          color: '#22c55e', fontSize: '14px', fontWeight: 700, lineHeight: 1,
          pointerEvents: 'none',
          zIndex: 5
        }}>✓</div>
      )}
      {loading && (
        <div style={{
          position: 'absolute', right: '35px', top: '50%', transform: 'translateY(-50%)',
          width: '14px', height: '14px', border: '2px solid rgba(13,148,136,0.3)',
          borderTop: '2px solid #0d9488', borderRadius: '50%',
          animation: 'loc-spin 0.7s linear infinite',
          zIndex: 5
        }} />
      )}

      <style>{`
        @keyframes loc-spin { to { transform: translateY(-50%) rotate(360deg); } }
      `}</style>
      <MapPicker 
        open={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        apiKey="AIzaSyD-hNAm1fnevgihbvtPVY8O0SuzOzK_Msc"
        onSelect={(addr, lat, lng) => {
          onChange(addr);
          onSelect?.(lat.toString(), lng.toString());
          setCoordsConfirmed(true);
          setShowDropdown(false);
        }}
      />
    </div>
  );
}

const vehicleTypes = [
  {
    name: 'Car',
    icon: '/car.png',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#667eea'
  },
  {
    name: 'Van',
    icon: '/van.png',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f093fb'
  },
  {
    name: 'Bus',
    icon: '/school-bus (1).png',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#4facfe'
  },
  {
    name: 'SUV',
    icon: '/suv.png',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: '#43e97b'
  },
];

const tripTypes = [
  {
    name: 'Drop',
    description: 'Single destination trip',
    icon: <TrendingFlat />
  },
  {
    name: 'Return',
    description: 'Return to starting point',
    icon: <Loop />
  },
];

const sampleVehicles = {
  Car: {
    models: [
      { name: 'Alto', description: 'Compact & Efficient', maxPersons: 3, maxBags: 2 },
      { name: 'Wagon R', description: 'Spacious Interior', maxPersons: 3, maxBags: 2 },
      { name: 'Aqua', description: 'Hybrid Technology', maxPersons: 4, maxBags: 2 },
      { name: 'Axio', description: 'Premium Comfort', maxPersons: 4, maxBags: 2 },
    ]
  },
  Van: {
    models: [
      { name: 'KDH High Roof', description: 'Extra headroom', maxPersons: 14, maxBags: 5 },
      { name: 'KDH Flat Roof', description: 'Classic style', maxPersons: 9, maxBags: 4 },
      { name: 'Mini Van', description: 'Compact & comfortable', maxPersons: 6, maxBags: 3 },
      { name: 'Dual AC Van', description: 'Dual climate control', maxPersons: 9, maxBags: 4 },
      { name: 'NON AC VAN', description: 'Budget friendly', maxPersons: 14, maxBags: 4 },
    ]
  },
  Bus: {
    models: [
      { name: 'AC 29 Seater', description: 'Air conditioned comfort', maxPersons: 29, maxBags: 8 },
      { name: 'Non AC 29 Seater', description: 'Economical choice', maxPersons: 29, maxBags: 8 },
    ]
  },
  SUV: {
    models: [
      { name: 'Vezel', description: 'Modern Crossover', maxPersons: 4, maxBags: 3 },
    ]
  }
};

interface LatLon { lat: string; lon: string; }

interface RateCard {
  _id: string;
  type: string;
  vehicle: string;
  days: number;
  km: number;
  hrs: number;
  ratePercent: string;
  rateAmount: number;
  extraKMRate: number;
  extraHrRate1: number;
  extraHrRate2: number;
  status: string;
}

interface RateAdjustment {
  _id: string;
  vehicle: string;
  type: string;
  percentage: number;
  validFrom: string | null;
  validTo: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function HeroSection() {
  const { user } = useUser();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [kenKey, setKenKey] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleName: '',
    tripType: '',
    pickupLocation: '',
    dropoffLocation: '',
    dateTime: '',
    numberOfDays: '' as any,
    name: '',
    telephone: '',
    additionalPhones: [] as string[],
    email: '',
    remark: '',
    maxPersons: 0,
    maxBags: 0,
  });

  // Effect to pre-fill formData when user logs in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        telephone: user.phone || '',
        email: user.email
      }));
    }
  }, [user]);

  const [minDateTime, setMinDateTime] = useState("");

  useEffect(() => {
    // Calculate once on mount to avoid hydration mismatch
    const calculateMinDateTime = () => {
      const minDate = new Date(new Date().getTime() + (2 * 60 * 60 * 1000) - (new Date().getTimezoneOffset() * 60000));
      return minDate.toISOString().slice(0, 16);
    };
    setMinDateTime(calculateMinDateTime());
  }, []);

  const [openPromoDialog, setOpenPromoDialog] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [hasPromoOption, setHasPromoOption] = useState<boolean | null>(null);
  const [isPromoLoading, setIsPromoLoading] = useState(false);

  const [requestSent, setRequestSent] = useState(false);
  const [showRemark, setShowRemark] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [openRouteViewer, setOpenRouteViewer] = useState(false);
  const [openPolicyDialog, setOpenPolicyDialog] = useState(false);
  const [submittedBookingData, setSubmittedBookingData] = useState<any>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);


  // Intermediate destinations state
  const [destinations, setDestinations] = useState<string[]>([]);

  // Date Time Picker Modal State
  const [openDateTimePicker, setOpenDateTimePicker] = useState(false);
  const [pickerStep, setPickerStep] = useState(0); // 0: Date, 1: Time
  const [tempDate, setTempDate] = useState("");
  const [tempTime, setTempTime] = useState("");
  const [tempHour, setTempHour] = useState("12");
  const [tempMin, setTempMin] = useState("00");
  const [tempAmPm, setTempAmPm] = useState("AM");

  // Day Picker Modal State
  const [openDayPicker, setOpenDayPicker] = useState(false);
  const [tempDays, setTempDays] = useState(1);

  // Coordinate state for route calculation
  const [pickupCoords, setPickupCoords] = useState<LatLon | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<LatLon | null>(null);
  const [stopCoords, setStopCoords] = useState<(LatLon | null)[]>([]);

  // Route distance state
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Rate Cards state
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [adjustments, setAdjustments] = useState<RateAdjustment[]>([]);

  // Fetch Rate Cards
  useEffect(() => {
    const fetchRateData = async () => {
      try {
        const [rcRes, adjRes] = await Promise.all([
          fetch(`${API_ENDPOINTS.RATE_CARDS}?status=Approved`),
          fetch(`${API_ENDPOINTS.RATE_CARDS}/adjust`)
        ]);

        if (rcRes.ok) setRateCards(await rcRes.json());
        if (adjRes.ok) setAdjustments(await adjRes.json());
      } catch (error) {
        console.error('Error fetching rate data:', error);
      }
    };
    fetchRateData();
  }, []);

  const addDestination = () => {
    setDestinations((prev) => [...prev, '']);
    setStopCoords((prev) => [...prev, null]);
  };

  const removeDestination = (index: number) => {
    setDestinations((prev) => prev.filter((_, i) => i !== index));
    setStopCoords((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDestination = (index: number, value: string) => {
    setDestinations((prev) => prev.map((d, i) => (i === index ? value : d)));
    // Clear coord for this stop when text changes manually
    setStopCoords((prev) => prev.map((c, i) => (i === index ? null : c)));
  };

  /* ── Google Maps route calculation ── */
  useEffect(() => {
    if (!formData.pickupLocation || !formData.dropoffLocation) {
      setRouteDistance(null);
      setRouteDuration(null);
      return;
    }

    let cancelled = false;
    setRouteLoading(true);

    const fetchRoute = async () => {
      try {
        const validStops = destinations.filter(d => d.trim() !== "");
        const waypointsParam = validStops.length > 0
          ? `&waypoints=${encodeURIComponent(validStops.join('|'))}`
          : "";

        const url = `/api/google-distance?origin=${encodeURIComponent(formData.pickupLocation)}&destination=${encodeURIComponent(formData.dropoffLocation)}${waypointsParam}`;
        const r = await fetch(url);
        if (!r.ok) throw new Error(`Google HTTP ${r.status}`);
        const data = await r.json();

        if (cancelled) return;

        if (data.rows && data.rows[0]?.elements[0]?.status === "OK") {
          const element = data.rows[0].elements[0];
          setRouteDistance(element.distance.value); // metres
          setRouteDuration(element.duration.value); // seconds
        } else {
          console.warn('[Route] Google returned no route status:', data.rows?.[0]?.elements?.[0]?.status);
          setRouteDistance(null);
          setRouteDuration(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[Route] Google Distance error:', err);
          setRouteDistance(null);
        }
      } finally {
        if (!cancelled) setRouteLoading(false);
      }
    };

    fetchRoute();

    return () => { cancelled = true; };
  }, [formData.pickupLocation, formData.dropoffLocation, destinations]);

  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [openTripTypeDialog, setOpenTripTypeDialog] = useState(false);
  const [openPersonalDialog, setOpenPersonalDialog] = useState(false);
  const [showExtraPrices, setShowExtraPrices] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const [openPhotosDialog, setOpenPhotosDialog] = useState(false);
  const [photosVehicle, setPhotosVehicle] = useState('');

  const getVehicleFolderName = (modelName: string) => {
    const mapping: { [key: string]: string } = {
      'Aqua': 'Toyota Aqua',
      'Axio': 'Toyota Axio',
      'KDH Flat Roof': 'KDH Flat Roof  9 Seats',
      'Dual AC Van': 'Dual Ac 9 Seater',
      'NON AC VAN': 'NON AC Van',
      'AC 29 Seater': 'AC 29 Seater Bus',
      'Non AC 29 Seater': 'Non AC 29 seater bus',
    };
    return mapping[modelName] || modelName;
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // -----------------------------------------------------------------------
  // No manual preloading needed - Next/Image with priority handled this better
  useEffect(() => {
    setImagesLoaded(true);
  }, []);

  // -----------------------------------------------------------------------
  // Auto-advance
  // -----------------------------------------------------------------------
  const next = useCallback(() => {
    setCurrent((prev) => {
      const n = (prev + 1) % SLIDES.length;
      setKenKey((k) => k + 1);
      return n;
    });
  }, []);

  useEffect(() => {
    if (paused || !imagesLoaded) return;
    const id = setInterval(next, INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, next, imagesLoaded]);

  const goTo = (i: number) => {
    setCurrent(i);
    setKenKey((k) => k + 1);
  };

  // -----------------------------------------------------------------------
  // Form handlers
  // -----------------------------------------------------------------------
  const handleChange = (field: string, value: string | any) => {
    if (field === 'dateTime' && value) {
      const selectedTime = new Date(value).getTime();
      const minLeadTime = new Date().getTime() + (2 * 60 * 60 * 1000);

      if (selectedTime < minLeadTime) {
        setSnackbarMessage('Bookings must be made at least 2 hours in advance.');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);

        // Auto-set to minimum valid time
        const minDate = new Date(minLeadTime - (new Date().getTimezoneOffset() * 60000));
        value = minDate.toISOString().slice(0, 16);
      }
    }

    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // If Return trip, keep dropoff synced with pickup
      if (field === 'pickupLocation' && prev.tripType === 'Return') {
        updated.dropoffLocation = value;
      }

      // Trigger promo popup removed from here, now triggered by dropoff selection
      if (!appliedPromo && !openPromoDialog) {
        // Triggers moved to specific selection handlers
      }

      return updated;
    });
  };

  const handlePromoSubmit = async () => {
    if (!promoCodeInput.trim()) return;

    setIsPromoLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.PROMO_CODES);
      if (!res.ok) throw new Error('Failed to fetch promo codes');

      const codes: PromoCode[] = await res.json();
      const code = codes.find(c => c.code.toUpperCase() === promoCodeInput.trim().toUpperCase());

      if (!code) {
        setSnackbarMessage('Invalid promo code.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      if (code.status !== 'Active') {
        setSnackbarMessage('This promo code is no longer active.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      // Date check
      const now = new Date();
      if (code.validFrom && new Date(code.validFrom) > now) {
        setSnackbarMessage('This promo code is not yet valid.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      if (code.validTo && new Date(code.validTo) < now) {
        setSnackbarMessage('This promo code has expired.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      // Vehicle check - allow applying even if no vehicle selected yet, but warn
      if (code.applicableVehicle !== 'All' && formData.vehicleName && code.applicableVehicle !== formData.vehicleName) {
        setSnackbarMessage(`This code is only valid for ${code.applicableVehicle}.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      setAppliedPromo(code);
      setOpenPromoDialog(false);
      const discText = code.discountType === 'Percentage' ? `${code.discountValue}%` : `LKR ${code.discountValue.toLocaleString()}`;

      let successMsg = `Promo code applied! ${discText} discount added.`;
      if (code.applicableVehicle !== 'All' && !formData.vehicleName) {
        successMsg = `Promo code for ${code.applicableVehicle} applied! Note: Discount will only count when you select this vehicle.`;
      }

      setSnackbarMessage(successMsg);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Error validating promo code.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsPromoLoading(false);
    }
  };

  const handleViewDirections = () => {
    if (!formData.pickupLocation || !formData.dropoffLocation) return;
    setOpenRouteViewer(true);
  };

  const handleAddPhone = () => {
    if (formData.additionalPhones.length >= 1) return;
    setFormData(prev => ({
      ...prev,
      additionalPhones: [...prev.additionalPhones, '']
    }));
  };

  const handleRemovePhone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalPhones: prev.additionalPhones.filter((_, i) => i !== index)
    }));
  };

  const updateAdditionalPhone = (index: number, value: string) => {
    setFormData(prev => {
      const newPhones = [...prev.additionalPhones];
      newPhones[index] = value;
      return { ...prev, additionalPhones: newPhones };
    });
  };

  const handleVehicleCardClick = (type: string) => {
    setSelectedCategory(type);
    setOpenVehicleDialog(true);
  };

  const handleVehicleSelect = (modelName: string) => {
    // Find the selected vehicle model to get maxPersons and maxBags
    const categoryVehicles = sampleVehicles[selectedCategory as keyof typeof sampleVehicles];
    const selectedModel = categoryVehicles.models.find(model => model.name === modelName);

    setFormData((prev) => ({
      ...prev,
      vehicleType: selectedCategory,
      vehicleName: modelName,
      maxPersons: selectedModel?.maxPersons || 0,
      maxBags: selectedModel?.maxBags || 0,
    }));

    // Re-validate applied promo for the new vehicle
    if (appliedPromo && appliedPromo.applicableVehicle !== 'All' && appliedPromo.applicableVehicle !== modelName) {
      setAppliedPromo(null);
      setSnackbarMessage(`Promo code removed: only valid for ${appliedPromo.applicableVehicle}.`);
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    }

    setOpenVehicleDialog(false);
    setOpenTripTypeDialog(true);
  };

  const handleTripTypeSelect = (tripTypeName: string) => {
    if (tripTypeName === 'Return') {
      const currentPickup = formData.pickupLocation;
      const currentDropoff = formData.dropoffLocation;
      const currentDropoffCoords = dropoffCoords;

      setFormData((prev) => ({
        ...prev,
        tripType: tripTypeName,
        dropoffLocation: currentPickup || prev.dropoffLocation,
        numberOfDays: prev.numberOfDays || '',
      }));

      if (currentPickup) {
        setDropoffCoords(pickupCoords);
      }

      // Ensure at least one stop exists for Return trip
      setDestinations(prev => {
        // If we have a valid destination that isn't the pickup, move it to stops
        if (currentDropoff && currentDropoff.trim() !== "" && currentDropoff !== currentPickup) {
          if (prev[0] !== currentDropoff) {
            setStopCoords(oldCoords => [currentDropoffCoords, ...oldCoords]);
            return [currentDropoff, ...prev];
          }
          return prev;
        }
        
        // If no stops exist yet (or we just cleared the destination), add an empty Stop 1
        if (prev.length === 0) {
          setStopCoords([null]);
          return [''];
        }
        return prev;
      });
    } else {
      // Switching from Return to Drop or others
      if (formData.tripType === 'Return') {
        setFormData((prev) => ({
          ...prev,
          tripType: tripTypeName,
          dropoffLocation: '', // Clear dropoff
          numberOfDays: tripTypeName === 'Drop' ? 0 : (prev.numberOfDays || ''),
        }));
        setDropoffCoords(null); // Clear dropoff coords
        setDestinations([]); // Clear all stops
        setStopCoords([]); // Clear stop coords
      } else {
        setFormData((prev) => ({
          ...prev,
          tripType: tripTypeName,
          numberOfDays: tripTypeName === 'Drop' ? 0 : (prev.numberOfDays || ''),
        }));
      }
    }
    setOpenTripTypeDialog(false);
  };

  const handleRequestBooking = () => {
    if (!formData.vehicleName || !formData.tripType || !formData.pickupLocation || !formData.dropoffLocation || !formData.dateTime) {
      alert('Please fill all required fields');
      return;
    }

    // Final time check
    const selectedTime = new Date(formData.dateTime).getTime();
    const minLeadTime = new Date().getTime() + (2 * 60 * 60 * 1000);
    if (selectedTime < minLeadTime) {
      alert('Sorry, your selected time is too soon. Please select a time at least 2 hours from now.');
      return;
    }

    setOpenPersonalDialog(true);
  };

  const handleClosePersonalDialog = () => {
    // If request was already sent, just close and reset
    if (requestSent) {
      setOpenPersonalDialog(false);
      setTimeout(() => {
        setRequestSent(false);
        setSubmittedBookingData(null);
      }, 300);
      return;
    }

    // Check if user has entered any info
    const hasEnteredInfo = formData.name?.trim() || formData.telephone?.trim() || formData.email?.trim() || formData.remark?.trim() || formData.additionalPhones.some(p => p.trim());

    if (hasEnteredInfo) {
      setShowCloseConfirm(true);
    } else {
      setOpenPersonalDialog(false);
    }
  };

  const downloadTripSummary = () => {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [13, 148, 136]; // #0d9488

    // --- Header ---
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("SENU TOURS", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Your Home, Your Journey, Your Hospitality Haven", 105, 30, { align: 'center' });

    // --- Trip Title ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Booking Quote Summary", 14, 55);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(14, 60, 60, 60);

    // --- Trip Details Table ---
    const data = submittedBookingData || {
      formData,
      destinations,
      totalPrice,
      rawTotalPrice,
      appliedPromo
    };

    const tableData = [
      ["Vehicle Type", data.formData.vehicleType],
      ["Vehicle Name", data.formData.vehicleName || "Not Selected"],
      ["Trip Type", data.formData.tripType],
      ["Pickup Date", data.formData.dateTime ? new Date(data.formData.dateTime).toLocaleDateString() : 'N/A'],
      ["Pickup Time", data.formData.dateTime ? new Date(data.formData.dateTime).toLocaleTimeString() : 'N/A'],
      ["Duration", data.formData.numberOfDays ? `${data.formData.numberOfDays} ${data.formData.numberOfDays === 1 ? 'Day' : 'Days'}` : '0 days'],
      ["Pickup Location", data.formData.pickupLocation],
      ["Drop-off Location", data.formData.dropoffLocation]
    ];

    if (data.destinations.length > 0) {
      data.destinations.filter((d: string) => d.trim() !== "").forEach((stop: string, i: number) => {
        tableData.push([`Stop ${i + 1}`, stop]);
      });
    }

    autoTable(doc, {
      startY: 65,
      head: [['Field', 'Details']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255 },
      styles: { font: 'helvetica', fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    });

    // --- Pricing Section ---
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Estimated Price", 14, finalY);

    const priceData = [
      ["Base Price", `LKR ${data.rawTotalPrice.toLocaleString()}`]
    ];

    if (data.appliedPromo) {
      const disc = data.appliedPromo.discountType === 'Percentage' ? `${data.appliedPromo.discountValue}%` : `LKR ${data.appliedPromo.discountValue.toLocaleString()}`;
      priceData.push([`Promo Discount (${data.appliedPromo.code})`, `- ${disc}`]);
    }

    priceData.push(["Total Estimate", `LKR ${data.totalPrice.toLocaleString()}`]);

    autoTable(doc, {
      startY: finalY + 5,
      body: priceData,
      theme: 'plain',
      styles: { fontSize: 11 },
      columnStyles: { 
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { halign: 'right', textColor: primaryColor, fontStyle: 'bold' }
      }
    });

    // --- Footer ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("This is an estimated quote generated by Senu Tours website. Actual prices may vary.", 105, 285, { align: 'center' });
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }

    doc.save(`Senu_Tours_Trip_Summary_${new Date().getTime()}.pdf`);
    
    // Also trigger the final reset
    handleClosePersonalDialog();
  };

  const handleSendRequest = async () => {
    try {
      const payload = {
        ...formData,
        destinations: destinations.filter((d) => d.trim() !== ''),
        matchedPackage: matchedPackage,
        promoCode: appliedPromo?.code || '',
        discount: discountAmount,
      };

      console.log('[BOOKING] Sending payload:', payload);

      const response = await fetch(API_ENDPOINTS.BOOKINGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Capture summary data BEFORE clearing form
        setSubmittedBookingData({
          formData: { ...formData },
          destinations: [...destinations],
          totalPrice,
          rawTotalPrice,
          appliedPromo
        });

        setRequestSent(true);
        // setSnackbarMessage('Thank you for sending request. We will contact you shortly!');
        // setSnackbarSeverity('success');
        // setSnackbarOpen(true);
        // We handle closing in the success view now
        setFormData({
          vehicleType: '',
          vehicleName: '',
          tripType: '',
          pickupLocation: '',
          dropoffLocation: '',
          dateTime: '',
          numberOfDays: '' as any,
          name: '',
          telephone: '',
          additionalPhones: [],
          email: '',
          remark: '',
          maxPersons: 0,
          maxBags: 0,
        });
        setAppliedPromo(null);
        setPromoCodeInput('');
        setHasPromoOption(null);
        setShowRemark(false);
        setDestinations([]);
        setPickupCoords(null);
        setDropoffCoords(null);
        setStopCoords([]);
        setRouteDistance(null);
        setRouteDuration(null);
      } else {
        const errorData = await response.json();
        setSnackbarMessage(errorData.message || 'Failed to send booking request.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      setSnackbarMessage('An error occurred. Please try again later.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const currentCategoryVehicles = sampleVehicles[selectedCategory as keyof typeof sampleVehicles] || { models: [] };

  // --- Dynamic Pricing Logic from Rate Card ---
  const distanceInKm = routeDistance ? (routeDistance / 1000) : 0;

  const matchedPackage = (() => {
    if (!formData.vehicleType || !formData.tripType) return null;

    // Use 1 day as minimum for matching since DB stores Drop trips as 1 day
    const targetDays = Number(formData.numberOfDays) === 0 ? 1 : Number(formData.numberOfDays);
    const cleanFormVehName = formData.vehicleName.toLowerCase().replace(/\s+/g, '').trim();
    const cleanFormVehType = formData.vehicleType.toLowerCase().replace(/\s+/g, '').trim();

    // 1. Filter by vehicle name and category, type, and days
    const potentialCards = rateCards.filter(card => {
      const cleanCardVeh = card.vehicle.toLowerCase().replace(/\s+/g, '').trim();

      const vehicleMatch =
        cleanCardVeh === cleanFormVehName ||
        cleanCardVeh === cleanFormVehType ||
        cleanFormVehName.includes(cleanCardVeh) ||
        cleanCardVeh.includes(cleanFormVehName);

      const cleanCardType = card.type.toLowerCase().trim();
      const cleanFormType = formData.tripType.toLowerCase().trim();

      const typeMatch =
        cleanCardType === cleanFormType ||
        (cleanFormType === 'drop' && (cleanCardType === 'oneway' || cleanCardType === 'one way')) ||
        (cleanFormType === 'return' && (cleanCardType === 'roundtrip' || cleanCardType === 'round trip' || cleanCardType === 'bothway'));

      const dayMatch = Number(card.days) === targetDays;

      // Ignore rejected rate cards
      const isActive = card.status === 'Approved';

      return vehicleMatch && typeMatch && dayMatch && isActive;
    });

    if (potentialCards.length === 0) {
      console.log('[Pricing] No matching rate cards found for:', {
        vehicle: formData.vehicleName,
        category: formData.vehicleType,
        type: formData.tripType,
        days: targetDays
      });
      return null;
    }

    // 2. Prioritize specific vehicle name match over generic category match
    const specificMatches = potentialCards.filter(card => {
      const cleanCardVeh = card.vehicle.toLowerCase().replace(/\s+/g, '').trim();
      return cleanCardVeh === cleanFormVehName || cleanCardVeh.includes(cleanFormVehName) || cleanFormVehName.includes(cleanCardVeh);
    });

    const finalPotential = specificMatches.length > 0 ? specificMatches : potentialCards;

    // 3. Sort by KM ascending, and then by Hours ascending to find the best fit
    const sortedCards = finalPotential.sort((a, b) => {
      if (a.km !== b.km) return a.km - b.km;
      return a.hrs - b.hrs; // Priority: smaller hours among same KM
    });

    // 4. If we have distance, find the base package
    if (routeDistance !== null) {
      // Pick the base package (the one with the highest KM limit that is still <= distance, or the first package)
      // Find the highest KM limit that is still <= current distance
      const possibleKms = sortedCards.filter(card => card.km <= distanceInKm).map(card => card.km);
      const maxKMBelow = possibleKms.length > 0 ? Math.max(...possibleKms) : null;
      
      // Since sortedCards is (KM asc, Hours asc), the first card matching maxKMBelow
      // will automatically be the one with minimum hours.
      const bestMatch = maxKMBelow !== null 
        ? sortedCards.find(card => card.km === maxKMBelow) 
        : sortedCards[0];

      console.log('[Pricing] Successfully matched base package (Min Hours):', bestMatch);
      return bestMatch || sortedCards[0];
    }

    // Default to first package if distance not yet available
    return sortedCards[0];
  })();

  const minKmRequired = (() => {
    if (!formData.vehicleType || !formData.tripType || rateCards.length === 0) return 0;

    const targetDays = Number(formData.numberOfDays) === 0 ? 1 : Number(formData.numberOfDays);
    const cleanFormVehName = formData.vehicleName.toLowerCase().replace(/\s+/g, '').trim();
    const cleanFormVehType = formData.vehicleType.toLowerCase().replace(/\s+/g, '').trim();

    const potentialCards = rateCards.filter(card => {
      const cleanCardVeh = card.vehicle.toLowerCase().replace(/\s+/g, '').trim();

      const vehicleMatch = cleanCardVeh === cleanFormVehName || cleanCardVeh === cleanFormVehType ||
        cleanFormVehName.includes(cleanCardVeh) || cleanCardVeh.includes(cleanFormVehName);

      const cleanCardType = card.type.toLowerCase().trim();
      const cleanFormType = formData.tripType.toLowerCase().trim();
      const typeMatch = cleanCardType === cleanFormType ||
        (cleanFormType === 'drop' && (cleanCardType === 'oneway' || cleanCardType === 'one way')) ||
        (cleanFormType === 'return' && (cleanCardType === 'roundtrip' || cleanCardType === 'round trip' || cleanCardType === 'bothway'));

      const dayMatch = Number(card.days) === targetDays;

      // Ignore rejected rate cards
      const isActive = card.status === 'Approved';

      return vehicleMatch && typeMatch && dayMatch && isActive;
    });

    if (potentialCards.length === 0) return 0;

    // Prioritize specific match even for minKm
    const specificMatches = potentialCards.filter(card => {
      const cleanCardVeh = card.vehicle.toLowerCase().replace(/\s+/g, '').trim();
      return cleanCardVeh === cleanFormVehName || cleanCardVeh.includes(cleanFormVehName) || cleanFormVehName.includes(cleanCardVeh);
    });

    const finalPotential = specificMatches.length > 0 ? specificMatches : potentialCards;
    return Math.min(...finalPotential.map(c => c.km));
  })();

  const basePricePerDay =
    formData.vehicleType === 'Car' ? 15000 :
      formData.vehicleType === 'Van' ? 18000 :
        formData.vehicleType === 'Bus' ? 35000 :
          formData.vehicleType === 'SUV' ? 25000 : 0;

  const ratePerKm =
    formData.vehicleType === 'Car' ? 110 :
      formData.vehicleType === 'Van' ? 160 :
        formData.vehicleType === 'Bus' ? 450 :
          formData.vehicleType === 'SUV' ? 250 : 0;

  const estimatedRoutePrice = distanceInKm * ratePerKm;

  // Apply Prioritized Adjustment Logic (Specific match over 'All')
  const activeAdjustment = (() => {
    if (!formData.vehicleType || adjustments.length === 0) return null;

    const cleanFormVehName = formData.vehicleName.toLowerCase().replace(/\s+/g, '').trim();
    const cleanFormVehType = formData.vehicleType.toLowerCase().trim();
    const cleanFormType = formData.tripType.toLowerCase().trim();

    // Find all potential matches
    const matches = adjustments.filter(adj => {
      const cleanAdjVeh = adj.vehicle.toLowerCase().replace(/\s+/g, '').trim();
      const vehicleMatch =
        cleanAdjVeh === 'all' ||
        cleanAdjVeh === cleanFormVehName ||
        cleanAdjVeh === cleanFormVehType ||
        cleanFormVehName.includes(cleanAdjVeh) ||
        cleanAdjVeh.includes(cleanFormVehName);

      const cleanAdjType = adj.type.toLowerCase().trim();
      const typeMatch = cleanAdjType === 'all' || cleanAdjType === cleanFormType;

      // Date Validity Check
      const now = new Date();
      const vFrom = adj.validFrom ? new Date(adj.validFrom) : null;
      const vTo = adj.validTo ? new Date(adj.validTo) : null;
      const isDateValid = (!vFrom || now >= vFrom) && (!vTo || now <= vTo);

      return vehicleMatch && typeMatch && isDateValid;
    });

    if (matches.length === 0) return null;

    // Pick the MOST specific one:
    // Priority 1: Exact model name match
    // Priority 2: Vehicle category (Car/Van/etc) match
    // Priority 3: 'All' match
    return matches.sort((a, b) => {
      const aLow = a.vehicle.toLowerCase();
      const bLow = b.vehicle.toLowerCase();

      // Exact name match score
      const aScoreVeh = (aLow === cleanFormVehName) ? 200 : (aLow === cleanFormVehType ? 100 : (aLow === 'all' ? 0 : 50));
      const bScoreVeh = (bLow === cleanFormVehName) ? 200 : (bLow === cleanFormVehType ? 100 : (bLow === 'all' ? 0 : 50));

      if (aScoreVeh !== bScoreVeh) return bScoreVeh - aScoreVeh;

      const aTypeAll = a.type.toLowerCase() === 'all';
      const bTypeAll = b.type.toLowerCase() === 'all';
      if (aTypeAll !== bTypeAll) return aTypeAll ? 1 : -1;

      return 0;
    })[0];
  })();

  const adjustmentMultiplier = 1 + ((activeAdjustment?.percentage ?? 0) / 100);

  // Final Price Selection
  // Use matched package rate if available, otherwise fall back to old logic
  const basePriceBeforeAdjustment = (() => {
    if (!matchedPackage) {
      return (routeDistance !== null ? estimatedRoutePrice : (basePricePerDay * formData.numberOfDays));
    }

    let price = matchedPackage.rateAmount;

    // Add extra KM if distance exceeds package limit (Universal logic)
    if (distanceInKm > matchedPackage.km) {
      const extraKm = Math.ceil(distanceInKm - matchedPackage.km);
      price += extraKm * matchedPackage.extraKMRate;
    }
    
    return price;
  })();

  const extraKmDetail = (() => {
    if (!matchedPackage || distanceInKm <= matchedPackage.km) return null;
    
    const extraKm = Math.ceil(distanceInKm - matchedPackage.km);
    return {
      km: extraKm,
      cost: extraKm * matchedPackage.extraKMRate
    };
  })();

  const displayPrice = basePriceBeforeAdjustment * adjustmentMultiplier;

  const rawTotalPrice = Math.round(displayPrice);

  const discountAmount = (() => {
    if (!appliedPromo) return 0;

    // Strict vehicle check
    if (appliedPromo.applicableVehicle !== 'All' && appliedPromo.applicableVehicle !== formData.vehicleName) {
      return 0;
    }

    if (appliedPromo.discountType === 'Percentage') {
      return Math.round(rawTotalPrice * (appliedPromo.discountValue / 100));
    } else {
      return appliedPromo.discountValue;
    }
  })();

  const totalPrice = Math.max(0, rawTotalPrice - discountAmount);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <section
      className="relative w-full overflow-hidden transition-all duration-500 ease-in-out"
      style={{
        minHeight: "850px",
        height: "auto",
        display: "flex",
        flexDirection: "column",
        background: "#071d24", // Dark background matching site theme
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* SLIDE STACK */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            zIndex: i === current ? 1 : 0,
            opacity: i === current ? 1 : 0,
            pointerEvents: i === current ? "auto" : "none"
          }}
          aria-hidden={i !== current}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            className="object-cover"
            style={{
              animation: i === current ? "kenBurns 8s ease-out forwards" : "none",
            }}
            onLoadingComplete={() => {
              if (i === 0) setFirstImageLoaded(true);
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(45,35,25,0.5) 50%, rgba(45,35,25,0.75) 100%)",
            }}
          />
        </div>
      ))}

      {/* HERO CONTENT */}
      <div
        className="relative flex-grow flex flex-col items-center justify-center px-4 pt-28 pb-40 text-center transition-opacity duration-500"
        style={{ zIndex: 10, opacity: firstImageLoaded ? 1 : 0 }}
      >
        <div className="w-full max-w-4xl">

          {/* Headline */}
          <div className="mb-2 sm:mb-4 px-2" style={{ animation: "fadeInUp 1s ease-out" }}>
            <h1
              className="text-white font-semibold tracking-tight mb-1 sm:mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 6vw, 5rem)",
                lineHeight: 1,
                textShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            >
              SENU TOURS
            </h1>

            <p
              className="text-white uppercase leading-relaxed"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 300,
                letterSpacing: "0.05em",
                fontSize: "clamp(0.65rem, 2vw, 1rem)",
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                opacity: 0.95,
              }}
            >
              Your Home, Your Journey, Your Hospitality Haven
            </p>
          </div>

          {/* Container for form and summary side-by-side */}
          <div
            className="flex flex-col lg:flex-row justify-center items-start gap-6 mt-1 sm:mt-2 mb-2 sm:mb-4 w-full"
            style={{ animation: "fadeInUp 1s ease-out 0.3s both" }}
          >
            {/* Booking Form Card */}
            <div
              className="booking-form-card w-full max-w-lg rounded-xl px-4 sm:px-5 py-4 sm:py-8 text-left"
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.45)",
                boxShadow: "0 8px 40px 0 rgba(31, 38, 135, 0.14)",
                flexShrink: 0,
              }}
            >
              {/* Header */}
              <div className="text-center mb-3 sm:mb-4">
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontSize: "1.25rem",
                    color: "#000000",
                  }}
                >
                  Request a Quote For Your Journey
                </h3>
                <p
                  className="hidden sm:block"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 300,
                    fontSize: "0.75rem",
                    lineHeight: 1.4,
                    color: "#000000",
                  }}
                >
                  Choose vehicle & plan your Sri Lankan trip
                </p>
              </div>

              {/* Vehicle Selection */}
              <div className="mb-4">
                <label
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    color: "#000000",
                    display: "block",
                    marginBottom: "0.6rem",
                    letterSpacing: "0.04em",
                  }}
                >
                  SELECT VEHICLE
                </label>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {vehicleTypes.map((vehicle) => (
                    <button
                      key={vehicle.name}
                      onClick={() => handleVehicleCardClick(vehicle.name)}
                      style={{
                        background: formData.vehicleType === vehicle.name
                          ? "rgba(255,255,255,0.28)"
                          : "rgba(255,255,255,0.14)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: formData.vehicleType === vehicle.name
                          ? "2px solid #0d9488"
                          : "1.5px solid rgba(255,255,255,0.42)",
                        borderRadius: "10px",
                        padding: "0.7rem 0.4rem",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget;
                        el.style.background = "rgba(255,255,255,0.34)";
                        el.style.transform = "translateY(-3px)";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        el.style.background = formData.vehicleType === vehicle.name
                          ? "rgba(255,255,255,0.28)"
                          : "rgba(255,255,255,0.14)";
                        el.style.transform = "translateY(0)";
                      }}
                    >
                      <div style={{
                        width: "40px",
                        height: "40px",
                        marginBottom: "0.3rem",
                        position: "relative",
                        filter: "brightness(0) invert(0)", // black icons
                      }}>
                        <Image
                          src={vehicle.icon}
                          alt={vehicle.name}
                          fill
                          style={{ objectFit: "contain" }}
                          sizes="40px"
                        />
                      </div>
                      <div
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          color: "#000000",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {vehicle.name}
                      </div>
                      {formData.vehicleType === vehicle.name && (
                        <div
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            color: "#0d9488",
                            fontSize: "0.9rem",
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>

              </div>



              {/* Pickup + Destinations + Dropoff Timeline */}
              <div className="mb-4">
                <label
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    color: "#000000",
                    display: "block",
                    marginBottom: "0.6rem",
                    letterSpacing: "0.04em",
                  }}
                >
                  ROUTE
                </label>

                {/* Timeline container */}
                <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 0 }}>

                  {/* Vertical line */}
                  <div style={{
                    position: "absolute",
                    left: "11px",
                    top: "18px",
                    bottom: "18px",
                    width: "2px",
                    background: "linear-gradient(to bottom, #0d9488, #3b82f6, #0d9488)",
                    borderRadius: "2px",
                    zIndex: 0,
                  }} />

                  {/* PICKUP */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", position: "relative", zIndex: 50 }}>
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#22c55e",
                      border: "2.5px solid rgba(255,255,255,0.8)",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "white" }} />
                    </div>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <LocationInput
                        value={formData.pickupLocation}
                        onChange={(val) => handleChange('pickupLocation', val)}
                        onSelect={(lat, lon) => { 
                          console.log('[Pickup] coords:', lat, lon); 
                          const coords = { lat, lon };
                          setPickupCoords(coords); 
                          if (formData.tripType === 'Return') {
                            setDropoffCoords(coords);
                          }
                        }}
                        onManualType={() => { 
                          setPickupCoords(null); 
                          if (formData.tripType === 'Return') {
                            setDropoffCoords(null);
                          }
                          setRouteDistance(null); 
                        }}
                        placeholder="Pickup location"
                        inputStyle={{
                          flex: 1,
                          padding: "0.6rem 0.85rem",
                          background: "rgba(34,197,94,0.1)",
                          backdropFilter: "blur(12px)",
                          border: "1.5px solid rgba(34,197,94,0.4)",
                          borderRadius: "8px",
                          color: "#000000",
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "0.82rem",
                          outline: "none",
                        }}
                        onFocusStyle={{ background: "rgba(34,197,94,0.18)", borderColor: "#22c55e" }}
                        onBlurStyle={{ background: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.4)" }}
                        showMyLocation={true}
                      />
                      {/* RELOCATED SMALL ADD DESTINATION BUTTON INSIDE FIELD */}
                      <button
                        onClick={addDestination}
                        title="Add Stop"
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '26px',
                          height: '26px',
                          borderRadius: '8px',
                          background: 'rgba(13,148,136,1)',
                          border: 'none',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          zIndex: 10,
                          transition: 'all 0.2s ease',
                          padding: 0,
                          lineHeight: 1,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#0f766e';
                          e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#0d9488';
                          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* INTERMEDIATE DESTINATIONS */}
                  {destinations.map((dest, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", position: "relative", zIndex: 40 - index }}>
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "#0d9488",
                        border: "2.5px solid rgba(255,255,255,0.8)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.6rem",
                        color: "white",
                        fontWeight: 700,
                        fontFamily: "'Montserrat', sans-serif",
                      }}>
                        {index + 1}
                      </div>
                      <LocationInput
                        value={dest}
                        onChange={(val) => updateDestination(index, val)}
                        onSelect={(lat, lon) => setStopCoords((prev) => prev.map((c, i) => i === index ? { lat, lon } : c))}
                        placeholder={`Stop ${index + 1}`}
                        inputStyle={{
                          flex: 1,
                          padding: "0.6rem 0.85rem",
                          background: "rgba(13,148,136,0.08)",
                          backdropFilter: "blur(12px)",
                          border: "1.5px solid rgba(13,148,136,0.3)",
                          borderRadius: "8px",
                          color: "#000000",
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: "0.82rem",
                          outline: "none",
                        }}
                        onFocusStyle={{ background: "rgba(13,148,136,0.15)", borderColor: "#0d9488" }}
                        onBlurStyle={{ background: "rgba(13,148,136,0.08)", borderColor: "rgba(13,148,136,0.3)" }}
                        showMyLocation={true}
                      />
                      <button
                        onClick={() => removeDestination(index)}
                        style={{
                          flexShrink: 0,
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          border: "1.5px solid rgba(239,68,68,0.4)",
                          background: "rgba(239,68,68,0.1)",
                          color: "#ef4444",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          transition: "all 0.2s ease",
                          padding: 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(239,68,68,0.25)";
                          e.currentTarget.style.borderColor = "#ef4444";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                          e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}


                  {/* DROPOFF */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", position: "relative", zIndex: 1 }}>
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#ef4444",
                      border: "2.5px solid rgba(255,255,255,0.8)",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "white" }} />
                    </div>
                    <LocationInput
                      value={formData.tripType === 'Return' ? 'Same as Pickup Location' : formData.dropoffLocation}
                      onChange={(val) => handleChange('dropoffLocation', val)}
                      onSelect={(lat, lon) => {
                        console.log('[Dropoff] coords:', lat, lon);
                        setDropoffCoords({ lat, lon });
                      }}
                      onManualType={() => { setDropoffCoords(null); setRouteDistance(null); }}
                      placeholder="Drop-off location"
                      disabled={formData.tripType === 'Return'}
                      inputStyle={{
                        flex: 1,
                        padding: "0.6rem 0.85rem",
                        background: formData.tripType === 'Return' ? "rgba(224,224,224,0.15)" : "rgba(239,68,68,0.08)",
                        backdropFilter: "blur(12px)",
                        border: formData.tripType === 'Return' ? "1.5px solid rgba(0,0,0,0.1)" : "1.5px solid rgba(239,68,68,0.35)",
                        borderRadius: "8px",
                        color: formData.tripType === 'Return' ? "#666666" : "#000000",
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "0.82rem",
                        outline: "none",
                        fontWeight: formData.tripType === 'Return' ? 600 : 400,
                      }}
                      onFocusStyle={{ background: "rgba(239,68,68,0.15)", borderColor: "#ef4444" }}
                      onBlurStyle={{ background: formData.tripType === 'Return' ? "rgba(224,224,224,0.15)" : "rgba(239,68,68,0.08)", borderColor: formData.tripType === 'Return' ? "rgba(0,0,0,0.1)" : "rgba(239,68,68,0.35)" }}
                      showMyLocation={formData.tripType !== 'Return'}
                    />
                  </div>{/* end of dropoff row */}

                </div>{/* end of timeline container */}
              </div>{/* end of mb-4 route section */}

              {/* Date and Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      color: "#000000",
                      display: "block",
                      letterSpacing: "0.04em",
                    }}
                  >
                    PICKUP DATE & TIME
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CalendarMonth style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '1.2rem',
                      color: '#0d9488',
                      pointerEvents: 'none',
                      zIndex: 1
                    }} />
                    <div
                      onClick={() => {
                        // Initialize temp states from formData
                        if (formData.dateTime) {
                          const parts = formData.dateTime.split('T');
                          setTempDate(parts[0]);
                          setTempTime(parts[1] || "");
                        } else {
                          setTempDate("");
                          setTempTime("");
                        }
                        setPickerStep(0);
                        setOpenDateTimePicker(true);
                      }}
                      style={{
                        width: "100%",
                        padding: "0.8rem 1rem 0.8rem 2.8rem",
                        background: "rgba(255,255,255,0.16)",
                        backdropFilter: "blur(12px)",
                        border: "1.5px solid rgba(255,255,255,0.45)",
                        borderRadius: "10px",
                        color: formData.dateTime ? "#000000" : "rgba(0,0,0,0.45)",
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "0.85rem",
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        minHeight: '44px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {formData.dateTime ? (() => {
                        const hasTime = formData.dateTime.includes('T');
                        const dt = new Date(formData.dateTime);
                        const datePart = dt.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        });

                        if (!hasTime) return datePart;

                        return datePart + ' - ' + dt.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      })() : 'Select Date & Time'}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      color: "#000000",
                      display: "block",
                      marginBottom: "0.4rem",
                      letterSpacing: "0.04em",
                    }}
                  >
                    DAYS
                  </label>
                  <div 
                    onClick={() => {
                      if (formData.tripType !== 'Drop') {
                        setTempDays(formData.numberOfDays || 1);
                        setOpenDayPicker(true);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "0.8rem 1rem",
                      background: formData.tripType === 'Drop' ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.16)",
                      backdropFilter: "blur(12px)",
                      border: "1.5px solid rgba(255,255,255,0.45)",
                      borderRadius: "10px",
                      color: formData.tripType === 'Drop' ? "rgba(0,0,0,0.4)" : "#000000",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.85rem",
                      cursor: formData.tripType === 'Drop' ? "not-allowed" : "pointer",
                      opacity: formData.tripType === 'Drop' ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: '44px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {formData.tripType === 'Drop' ? '0 Days' : (formData.numberOfDays ? `${formData.numberOfDays} ${formData.numberOfDays === 1 ? 'Day' : 'Days'}` : 'Select Days')}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "4px", marginBottom: "12px" }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      setShowLoginAlert(true);
                    } else {
                      setOpenPromoDialog(true);
                    }
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#0d9488",
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    borderRadius: "20px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(13,148,136,0.08)";
                    e.currentTarget.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <GiftIcon style={{ fontSize: '20px' }} />
                  Add promo code
                </button>
              </div>

              {/* View Summary Button (Mobile Only) - Only visible when form is complete */}
              {formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime && (
                <div className="flex lg:hidden justify-center" style={{ marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('booking-summary-rate-area');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    style={{
                      background: "rgba(13,148,136,0.1)",
                      border: "1.5px solid rgba(13,148,136,0.5)",
                      color: "#0d9488",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: "10px 24px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.25s ease",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                    </svg>
                    View Summary
                  </button>
                </div>
              )}



            </div>

            {/* ═══ UNIFIED TRIP SUMMARY CARD (External) ═══ */}
            {(formData.vehicleName || formData.tripType || routeDistance !== null || routeLoading) && (
              <div
                className="w-full lg:max-w-xs xl:max-w-sm rounded-xl p-6"
                style={{
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.45)",
                  boxShadow: "0 8px 40px 0 rgba(31, 38, 135, 0.14)",
                  alignSelf: "flex-start",
                  textAlign: "left",
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0d9488, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.85rem', fontWeight: 700, color: '#0d9488',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>Trip Summary</span>
                </div>

                {/* Vertical list of summary items for the side panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Trip Type */}
                  {formData.tripType && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }}>🗺️</span>
                      <div>
                        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem', color: '#4b5563', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>Trip Type and Payment Method</div>
                        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>{formData.tripType} — Cash</div>
                      </div>
                    </div>
                  )}

                  {/* Duration (Number of Days) */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }}>📅</span>
                    <div>
                      <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem', color: '#4b5563', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>Duration</div>
                      <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>
                        {formData.tripType === 'Drop'
                          ? '0 Waiting Time'
                          : (matchedPackage ? `${matchedPackage?.hrs} Hours ` : `${formData.numberOfDays} ${formData.numberOfDays === 1 ? 'Day' : 'Days'} `) +
                          `(${formData.numberOfDays === 1 ? 'for one day trip' : `for ${formData.numberOfDays} days`})`}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle */}
                  {formData.vehicleName && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }}>🚗</span>
                      <div>
                        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem', color: '#4b5563', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>Selected Vehicle</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>{formData.vehicleType} — {formData.vehicleName}</div>
                          <button
                            onClick={() => {
                              setPhotosVehicle(formData.vehicleName);
                              setOpenPhotosDialog(true);
                            }}
                            className="group flex items-center gap-1.5"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.68rem',
                              background: 'rgba(13,148,136,0.08)',
                              border: '1.5px solid rgba(13,148,136,0.35)',
                              borderRadius: '8px',
                              color: '#0d9488',
                              cursor: 'pointer',
                              fontFamily: "'Montserrat', sans-serif",
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#0d9488';
                              e.currentTarget.style.color = '#fff';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(13,148,136,0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(13,148,136,0.08)';
                              e.currentTarget.style.color = '#0d9488';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <Visibility sx={{ fontSize: '0.9rem' }} />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Passengers & Luggage (grouped) */}
                  {(formData.maxPersons > 0 || formData.maxBags > 0) && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }}>👥</span>
                      <div>
                        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem', color: '#4b5563', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>Capacity Details</div>
                        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>
                          {formData.maxPersons > 0 ? `Max ${formData.maxPersons} Persons` : ''}
                          {formData.maxPersons > 0 && formData.maxBags > 0 && ' • '}
                          {formData.maxBags > 0 && `Max ${formData.maxBags} Bags`}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Extra Rates Info (if package matched) */}
                  {matchedPackage && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }}>💳</span>
                      <div style={{ width: '100%' }}>
                        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem', color: '#4b5563', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>Package Allowances</div>
                        <div style={{
                          padding: '10px',
                          background: 'rgba(255,255,255,0.7)',
                          borderRadius: '8px',
                          border: '1px solid rgba(13,148,136,0.2)',
                          fontSize: '0.75rem',
                          color: '#111827',
                          fontFamily: "'Montserrat', sans-serif"
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#4b5563' }}>Extra KM Rate:</span>
                            <span style={{ fontWeight: 700 }}>LKR {matchedPackage?.extraKMRate || 0}</span>
                          </div>
                          {formData.tripType !== 'Drop' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#4b5563' }}>Extra Hour Rate:</span>
                              <span style={{ fontWeight: 700 }}>LKR {matchedPackage?.extraHrRate1 || 0}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Route & Distance */}
                  {(routeLoading || routeDistance !== null) && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }}>📍</span>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem', color: '#4b5563', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>
                          Route Distance
                        </div>
                        {routeLoading ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <div style={{ width: '12px', height: '12px', border: '2px solid rgba(13,148,136,0.25)', borderTop: '2px solid #0d9488', borderRadius: '50%', animation: 'loc-spin 0.7s linear infinite' }} />
                            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', color: '#0d9488', fontWeight: 600 }}>Calculating...</span>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
                                {(routeDistance! / 1000).toFixed(1)} km
                              </div>
                              <button
                                onClick={handleViewDirections}
                                className="group flex items-center gap-1.5"
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.68rem',
                                  background: 'rgba(13,148,136,0.08)',
                                  border: '1.5px solid rgba(13,148,136,0.35)',
                                  borderRadius: '8px',
                                  color: '#0d9488',
                                  cursor: 'pointer',
                                  fontFamily: "'Montserrat', sans-serif",
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#0d9488';
                                  e.currentTarget.style.color = '#fff';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(13,148,136,0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(13,148,136,0.08)';
                                  e.currentTarget.style.color = '#0d9488';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                <MapIcon sx={{ fontSize: '0.9rem' }} />
                                View
                              </button>
                            </div>
                            {routeDuration !== null && (
                              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', color: '#4b5563', marginTop: '2px' }}>
                                Estimated Drive: {(() => {
                                  const d = routeDuration;
                                  return d >= 3600
                                    ? `${Math.floor(d / 3600)}h ${Math.round((d % 3600) / 60)}m`
                                    : `${Math.round(d / 60)} min`;
                                })()}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price Estimate (Highlighted) */}
                  {formData.pickupLocation && formData.dropoffLocation && (formData.vehicleType === 'SUV' || formData.tripType) && (
                    <div 
                      id="booking-summary-rate-area"
                      style={{
                      marginTop: '8px',
                      padding: '16px',
                      background: 'rgba(13,148,136,0.06)',
                      borderRadius: '12px',
                      border: '1px solid rgba(13,148,136,0.15)',
                    }}>
                      <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', color: '#0d9488', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {formData.vehicleType === 'SUV' ? 'Booking Request' : 'Total Estimate'}
                      </div>

                      {formData.vehicleType === 'SUV' ? (
                        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#0d9488', margin: '4px 0' }}>
                          Price on Request
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {/* Original Rate before Adjustment ONLY if it is a DISCOUNT (negative percentage) */}
                            {activeAdjustment && activeAdjustment.percentage < 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textDecoration: 'line-through' }}>
                                  LKR {Math.round(basePriceBeforeAdjustment).toLocaleString()}
                                </span>
                                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '1px 5px', borderRadius: '4px' }}>
                                  {activeAdjustment.percentage}% Discount
                                </span>
                              </div>
                            )}

                            {appliedPromo ? (
                              <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.9rem', fontWeight: 600, color: '#6b7280', textDecoration: 'line-through' }}>
                                    LKR {rawTotalPrice.toLocaleString()}
                                  </span>
                                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {appliedPromo.discountType === 'Percentage' ? `-${appliedPromo.discountValue}%` : `- LKR ${appliedPromo.discountValue.toLocaleString()}`} OFF
                                  </span>
                                </div>
                                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.45rem', fontWeight: 800, color: '#0d9488' }}>
                                  LKR {totalPrice.toLocaleString()}
                                </span>
                                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
                                  Promo applied: {appliedPromo.code} (Saved LKR {discountAmount.toLocaleString()})
                                </div>
                              </>
                            ) : (
                              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.4rem', fontWeight: 800, color: '#0d9488' }}>
                                LKR {totalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Extra KM Charge Breakdown (Internal) */}
                          {extraKmDetail && (
                            <div style={{
                              marginTop: '4px',
                              padding: '6px 10px',
                              background: 'rgba(13,148,136,0.06)',
                              borderRadius: '6px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: '#4b5563', fontWeight: 600 }}>
                                Extra KM: {extraKmDetail.km} km @ LKR {matchedPackage?.extraKMRate}/km
                              </span>
                              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: '#0d9488', fontWeight: 700 }}>
                                + LKR {extraKmDetail.cost.toLocaleString()}
                              </span>
                            </div>
                          )}
                          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: '#6b7280', marginTop: '4px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            {matchedPackage && formData.tripType !== 'Drop' && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '0.85rem' }}>ℹ️</span>
                                <span style={{ fontWeight: 600 }}>{matchedPackage.hrs} Free Hours.</span>
                              </div>
                            )}
                            <span>*Actual price may vary based on route changes.</span>
                          </div>
                        </>
                      )}

                      {/* Informational Message - Policy Notice OR Booking Confirmation */}
                      {routeDistance !== null && (
                        minKmRequired > distanceInKm ? (
                          <div style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: '0.68rem',
                            color: '#0f766e',
                            marginTop: '12px',
                            lineHeight: 1.5,
                            padding: '10px 12px',
                            background: 'rgba(13,148,136,0.05)',
                            borderRadius: '8px',
                            border: '1px solid rgba(13,148,136,0.2)',
                          }}>
                            <div style={{ fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.9rem' }}>ℹ️</span> Package Policy Notice
                            </div>
                            For a {formData.numberOfDays}-day reservation with this vehicle, the minimum applicable package starts from <strong>{minKmRequired} km</strong>.
                            <div style={{ marginTop: '8px', color: '#4b5563', fontWeight: 500, fontSize: '0.64rem' }}>
                              Should you require a customized plan or wish to negotiate specific terms, please submit your request and our representatives will contact you shortly.
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: '0.68rem',
                            color: '#3b82f6',
                            marginTop: '12px',
                            lineHeight: 1.5,
                            padding: '10px 12px',
                            background: 'rgba(59,130,246,0.05)',
                            borderRadius: '8px',
                            border: '1px solid rgba(59,130,246,0.2)',
                          }}>
                            <div style={{ fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.9rem' }}>✅</span> Next Steps
                            </div>
                            Please submit your request. Our dedicated team will contact you shortly to confirm your booking and finalize all arrangements.
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Policy and Conditions Link */}
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => setOpenPolicyDialog(true)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        fontSize: '0.72rem',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 500,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px',
                        letterSpacing: '0.02em',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#0d9488'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                    >
                      Privacy Policies & Terms and Conditions
                    </button>
                  </div>

                  {/* CTA button (RELOCATED TO SUMMARY CARD) */}
                  <div style={{ marginTop: "1rem" }}>
                    <button
                      onClick={handleRequestBooking}
                      disabled={!formData.vehicleName || !formData.tripType || !formData.pickupLocation || !formData.dropoffLocation || !formData.dateTime}
                      className="inline-flex items-center justify-center text-white uppercase w-full"
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        letterSpacing: "0.04em",
                        border: "1.8px solid #0d9488",
                        borderRadius: "12px",
                        padding: "0.85rem 1.6rem",
                        background: formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime
                          ? "linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)"
                          : "rgba(13,148,136,0.35)",
                        backdropFilter: formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime
                          ? "none"
                          : "blur(10px)",
                        color: "#ffffff",
                        transition: "all 0.3s ease",
                        cursor: formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime
                          ? "pointer"
                          : "not-allowed",
                        boxShadow: formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime
                          ? "0 4px 14px 0 rgba(13,148,136,0.39)"
                          : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime) {
                          const el = e.currentTarget;
                          el.style.background = "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)";
                          el.style.transform = "translateY(-2px)";
                          el.style.boxShadow = "0 10px 30px rgba(13,148,136,0.35)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formData.vehicleName && formData.tripType && formData.pickupLocation && formData.dropoffLocation && formData.dateTime) {
                          const el = e.currentTarget;
                          el.style.background = "linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)";
                          el.style.transform = "translateY(0)";
                          el.style.boxShadow = "0 4px 14px 0 rgba(13,148,136,0.39)";
                        }
                      }}
                    >
                      Request Booking
                      <span className="ml-2 inline-block" style={{ transition: "transform 0.3s ease" }}>
                        →
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SLIDE INDICATOR DOTS */}
      <div
        className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex items-center justify-center gap-3"
        style={{ zIndex: 15 }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="transition-all duration-300 ease-in-out"
            style={{
              width: i === current ? "30px" : "10px",
              height: "10px",
              borderRadius: i === current ? "5px" : "50%",
              background: i === current ? "#C9A961" : "rgba(255,255,255,0.4)",
              border: `1px solid ${i === current ? "#C9A961" : "rgba(255,255,255,0.6)"}`,
              padding: 0,
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/* SCROLL INDICATOR */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-4 hidden sm:block"
        style={{ zIndex: 10, animation: "fadeIn 1s ease-out 1s both" }}
      >
        <div className="flex flex-col items-center">
          <span
            className="text-white block mb-2"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "0.75rem",
              fontWeight: 400,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            Scroll
          </span>
          <div
            className="mx-auto"
            style={{
              width: "1px",
              height: "50px",
              background: "linear-gradient(to bottom, #C9A961, transparent)",
              animation: "scrollLineMove 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* ─── VEHICLE MODEL DIALOG ─── */}
      <Dialog
        open={openVehicleDialog}
        onClose={() => setOpenVehicleDialog(false)}
        PaperProps={{
          sx: {
            width: '95%',
            maxWidth: 480,
            m: 2,
            borderRadius: '24px',
            background: '#ffffff',
            border: '1px solid rgba(13,148,136,0.15)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(13,148,136,0.08)',
            overflow: 'hidden',
          }
        }}
        BackdropProps={{ sx: { backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.35)' } }}
      >
        {/* Header */}
        <Box sx={{
          px: 3, pt: 3, pb: 2,
          background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)',
          borderBottom: '1px solid rgba(13,148,136,0.12)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Box>
            <Typography sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.75rem', fontWeight: 700,
              color: '#2D231B',
              letterSpacing: '-0.01em',
            }}>
              Select Model
            </Typography>
            <Typography sx={{
              fontSize: '0.72rem',
              color: '#0d9488',
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              mt: 0.25,
              fontWeight: 700,
            }}>
              {formData.vehicleType} Collection
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpenVehicleDialog(false)}
            sx={{
              color: '#9ca3af',
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              width: 36, height: 36,
              '&:hover': { color: '#ef4444', background: '#fff0f0', borderColor: '#fecaca' },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Model Cards Grid */}
        <DialogContent sx={{ p: 2.5, background: '#f8f9fa' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {currentCategoryVehicles.models.map((model) => {
              const isSelected = formData.vehicleName === model.name;
              return (
                <Box
                  key={model.name}
                  onClick={() => handleVehicleSelect(model.name)}
                  sx={{
                    position: 'relative',
                    p: 2,
                    borderRadius: '16px',
                    border: '1.5px solid',
                    borderColor: isSelected ? '#c9a96e' : '#e9ecef',
                    background: isSelected
                      ? 'linear-gradient(135deg, #fffbf0 0%, #fff8e6 100%)'
                      : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    boxShadow: isSelected
                      ? '0 4px 16px rgba(13,148,136,0.15)'
                      : '0 1px 4px rgba(0,0,0,0.05)',
                    '&:hover': {
                      borderColor: '#0d9488',
                      background: 'rgba(13,148,136,0.02)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 24px rgba(13,148,136,0.12)',
                    },
                  }}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <Box sx={{
                      position: 'absolute', top: 10, right: 10,
                      width: 20, height: 20, borderRadius: '50%',
                      background: '#0d9488',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle sx={{ fontSize: 14, color: '#fff' }} />
                    </Box>
                  )}

                  {/* Vehicle icon */}
                  <Box sx={{ mb: 1.5, color: isSelected ? '#0d9488' : '#94a3b8' }}>
                    <DirectionsCar sx={{ fontSize: 28 }} />
                  </Box>

                  {/* Model name */}
                  <Typography sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: isSelected ? '#0d9488' : '#1e293b',
                    mb: 0.4,
                  }}>
                    {model.name}
                  </Typography>

                  {/* Description */}
                  <Typography sx={{
                    fontSize: '0.68rem',
                    color: '#64748b',
                    fontFamily: "'Montserrat', sans-serif",
                    mb: 1.5,
                  }}>
                    {model.description}
                  </Typography>

                  {/* Stats badges */}
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 0.4,
                      px: 0.75, py: 0.25,
                      borderRadius: '8px',
                      background: 'rgba(13,148,136,0.06)',
                      border: '1px solid rgba(13,148,136,0.15)',
                    }}>
                      <Group sx={{ fontSize: 11, color: '#0d9488' }} />
                      <Typography sx={{ fontSize: '0.65rem', color: '#0d9488', fontWeight: 600 }}>{model.maxPersons}</Typography>
                    </Box>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 0.4,
                      px: 0.75, py: 0.25,
                      borderRadius: '8px',
                      background: 'rgba(13,148,136,0.06)',
                      border: '1px solid rgba(13,148,136,0.15)',
                    }}>
                      <Work sx={{ fontSize: 11, color: '#0d9488' }} />
                      <Typography sx={{ fontSize: '0.65rem', color: '#0d9488', fontWeight: 600 }}>{model.maxBags}</Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>

      {/* ─── TRIP TYPE DIALOG ─── */}
      <Dialog
        open={openTripTypeDialog}
        onClose={() => setOpenTripTypeDialog(false)}
        PaperProps={{
          sx: {
            width: '95%',
            maxWidth: 380,
            m: 2,
            borderRadius: '24px',
            background: '#ffffff',
            border: '1px solid rgba(13,148,136,0.15)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(13,148,136,0.08)',
            overflow: 'hidden',
          }
        }}
        BackdropProps={{ sx: { backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.35)' } }}
      >
        {/* Header */}
        <Box sx={{
          px: 3, pt: 3, pb: 2,
          background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)',
          borderBottom: '1px solid rgba(13,148,136,0.12)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Box>
            <Typography sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.75rem', fontWeight: 700,
              color: '#2D231B',
              letterSpacing: '-0.01em',
            }}>
              Trip Type and Payment Method
            </Typography>
            <Typography sx={{
              fontSize: '0.72rem',
              color: '#0d9488',
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              mt: 0.25,
              fontWeight: 700,
            }}>
              Choose your journey style
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpenTripTypeDialog(false)}
            sx={{
              color: '#9ca3af',
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              width: 36, height: 36,
              '&:hover': { color: '#ef4444', background: '#fff0f0', borderColor: '#fecaca' },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Trip Type Cards */}
        <DialogContent sx={{ p: 2.5, background: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {tripTypes.map((type) => {
              const isSelected = formData.tripType === type.name;
              return (
                <Box
                  key={type.name}
                  onClick={() => handleTripTypeSelect(type.name)}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2.5,
                    borderRadius: '16px',
                    border: '1.5px solid',
                    borderColor: isSelected ? '#c9a96e' : '#e9ecef',
                    background: isSelected
                      ? 'linear-gradient(135deg, #fffbf0 0%, #fff8e6 100%)'
                      : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    overflow: 'hidden',
                    boxShadow: isSelected
                      ? '0 4px 16px rgba(13,148,136,0.15)'
                      : '0 1px 4px rgba(0,0,0,0.05)',
                    '&:hover': {
                      borderColor: '#0d9488',
                      background: 'rgba(13,148,136,0.02)',
                      transform: 'translateX(4px)',
                      boxShadow: '0 6px 20px rgba(13,148,136,0.12)',
                    },
                  }}
                >
                  {/* Left accent bar */}
                  {isSelected && (
                    <Box sx={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: '3px',
                      background: '#0d9488',
                      borderRadius: '0 2px 2px 0',
                    }} />
                  )}

                  {/* Icon */}
                  <Box sx={{
                    width: 52, height: 52, borderRadius: '14px', flexShrink: 0,
                    background: isSelected
                      ? 'rgba(13,148,136,0.1)'
                      : 'rgba(13,148,136,0.05)',
                    border: '1px solid',
                    borderColor: isSelected ? 'rgba(13,148,136,0.3)' : '#e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isSelected ? '#0d9488' : '#94a3b8',
                    fontSize: 26,
                    transition: 'all 0.22s ease',
                  }}>
                    {type.icon}
                  </Box>

                  {/* Text */}
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.98rem',
                      color: isSelected ? '#0d9488' : '#1e293b',
                      mb: 0.3,
                      transition: 'color 0.22s ease',
                    }}>
                      {type.name} — Cash
                    </Typography>
                    <Typography sx={{
                      fontSize: '0.72rem',
                      color: '#64748b',
                      fontFamily: "'Montserrat', sans-serif",
                    }}>
                      {type.description}
                    </Typography>
                  </Box>

                  {/* Selected indicator */}
                  {isSelected && (
                    <Box sx={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: '#0d9488',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle sx={{ fontSize: 16, color: '#fff' }} />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openPromoDialog}
        onClose={() => setOpenPromoDialog(false)}
        PaperProps={{
          sx: {
            width: '95%',
            maxWidth: 400,
            borderRadius: '24px',
            p: 3,
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
            border: '1px solid rgba(13,148,136,0.1)'
          }
        }}
      >
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎁</div>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.6rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '0.75rem'
          }}>
            Do you have any promo code?
          </h3>
          <p style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '0.85rem',
            color: '#6b7280',
            marginBottom: '2rem'
          }}>
            Enter a promo code to unlock exclusive discounts on your journey.
          </p>

          {hasPromoOption === null ? (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setOpenPromoDialog(false)}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  borderRadius: '12px',
                  border: '1.5px solid #e5e7eb',
                  background: '#fff',
                  color: '#4b5563',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                No, thanks
              </button>
              <button
                onClick={() => setHasPromoOption(true)}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#0d9488',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(13,148,136,0.2)'
                }}
              >
                Yes, I have
              </button>
            </div>
          ) : (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <input
                type="text"
                placeholder="Enter Promo Code"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.9rem 1.25rem',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(13,148,136,0.3)',
                  background: 'rgba(13,148,136,0.05)',
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '0.95rem',
                  outline: 'none',
                  marginBottom: '1rem'
                }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => { setHasPromoOption(null); setPromoCodeInput(''); }}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    borderRadius: '12px',
                    border: '1.5px solid #e5e7eb',
                    background: '#fff',
                    color: '#4b5563',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handlePromoSubmit}
                  disabled={!promoCodeInput.trim() || isPromoLoading}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: promoCodeInput.trim() && !isPromoLoading ? '#0d9488' : '#9ca3af',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: promoCodeInput.trim() && !isPromoLoading ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isPromoLoading ? (
                    <CircularProgress size={16} sx={{ color: '#fff' }} />
                  ) : 'Apply'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      <Dialog
        open={openPersonalDialog}
        onClose={handleClosePersonalDialog}
        PaperProps={{
          sx: {
            width: '95%',
            maxWidth: 400,
            m: 2,
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
            border: '1px solid rgba(13,148,136,0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.65rem',
          fontWeight: 700,
          color: '#2D231B',
          pb: 1,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Almost There
          <IconButton
            onClick={handleClosePersonalDialog}
            sx={{ color: 'rgba(0,0,0,0.4)', '&:hover': { color: '#ef4444' } }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {requestSent ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '2rem 1rem',
              gap: '1.5rem'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(13, 148, 136, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0d9488',
                marginBottom: '0.5rem'
              }}>
                <CheckCircle style={{ fontSize: '3.5rem' }} />
              </div>

              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.8rem',
                fontWeight: 700,
                color: '#111827',
                margin: 0
              }}>
                Thank You!
              </h3>

              <p style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '0.95rem',
                color: '#4b5563',
                lineHeight: 1.6,
                margin: 0
              }}>
                Your journey request has been sent successfully. We will contact you shortly to finalize your booking.
              </p>

              <button
                onClick={downloadTripSummary}
                style={{
                  marginTop: '1rem',
                  padding: '1rem 2rem',
                  background: '#0d9488',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontFamily: "'Montserrat', sans-serif",
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(13, 148, 136, 0.25)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(13, 148, 136, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(13, 148, 136, 0.25)";
                }}
              >
                <Download size={20} />
                Download Trip Summary
              </button>

              <button
                onClick={() => setOpenPolicyDialog(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontFamily: "'Montserrat', sans-serif",
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  marginTop: '0.5rem'
                }}
              >
                View Policies & Conditions
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              <div style={{ position: 'relative' }}>
                <AccountCircle style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#0d9488', zIndex: 1 }} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3rem',
                    borderRadius: '14px',
                    border: '1.5px solid rgba(0,0,0,0.08)',
                    background: 'rgba(0,0,0,0.02)',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0d9488';
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                    e.target.style.background = 'rgba(0,0,0,0.02)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Phone style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#0d9488', zIndex: 1, fontSize: '1.2rem' }} />
                  <input
                    type="tel"
                    placeholder="Primary Telephone"
                    value={formData.telephone}
                    onChange={(e) => handleChange('telephone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem 3rem 1rem 3rem',
                      borderRadius: '14px',
                      border: '1.5px solid rgba(0,0,0,0.08)',
                      background: 'rgba(0,0,0,0.02)',
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0d9488';
                      e.target.style.background = '#fff';
                      e.target.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                      e.target.style.background = 'rgba(0,0,0,0.02)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {formData.additionalPhones.length < 1 && (
                    <IconButton
                      onClick={handleAddPhone}
                      sx={{
                        position: 'absolute',
                        right: '0.5rem',
                        color: '#0d9488',
                        '&:hover': { color: '#0891b2' }
                      }}
                    >
                      <AddCircle />
                    </IconButton>
                  )}
                </div>

                {/* Additional Phones */}
                {formData.additionalPhones.map((phoneVal, idx) => (
                  <div key={idx} style={{ position: 'relative', marginTop: '0.75rem', display: 'flex', alignItems: 'center' }}>
                    <Phone style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#0d9488', zIndex: 1, fontSize: '1.2rem' }} />
                    <input
                      type="tel"
                      placeholder={`Additional Phone ${idx + 1}`}
                      value={phoneVal}
                      onChange={(e) => updateAdditionalPhone(idx, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem 3rem 1rem 3rem',
                        borderRadius: '14px',
                        border: '1.5px solid rgba(0,0,0,0.08)',
                        background: 'rgba(0,0,0,0.02)',
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: '0.95rem',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0d9488';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                        e.target.style.background = 'rgba(0,0,0,0.02)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <IconButton
                      onClick={() => handleRemovePhone(idx)}
                      sx={{
                        position: 'absolute',
                        right: '0.5rem',
                        color: '#ef4444',
                        '&:hover': { color: '#dc2626' }
                      }}
                    >
                      <RemoveCircle />
                    </IconButton>
                  </div>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <Email style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#0d9488', zIndex: 1, fontSize: '1.2rem' }} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3rem',
                    borderRadius: '14px',
                    border: '1.5px solid rgba(0,0,0,0.08)',
                    background: 'rgba(0,0,0,0.02)',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0d9488';
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                    e.target.style.background = 'rgba(0,0,0,0.02)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {!showRemark ? (
                <button
                  onClick={() => setShowRemark(true)}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'none',
                    border: 'none',
                    color: '#0d9488',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    fontFamily: "'Montserrat', sans-serif",
                    marginTop: '-0.25rem'
                  }}
                >
                  + Add a Remark
                </button>
              ) : (
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                  <textarea
                    placeholder="Enter your remark or special requirements..."
                    value={formData.remark}
                    onChange={(e) => handleChange('remark', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      paddingRight: '2.5rem',
                      borderRadius: '14px',
                      border: '1.5px solid rgba(0,0,0,0.08)',
                      background: 'rgba(0,0,0,0.02)',
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0d9488';
                      e.target.style.background = '#fff';
                      e.target.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                      e.target.style.background = 'rgba(0,0,0,0.02)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <IconButton
                    onClick={() => {
                      setShowRemark(false);
                      handleChange('remark', '');
                    }}
                    sx={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      color: '#9ca3af',
                      '&:hover': { color: '#ef4444', backgroundColor: '#fee2e2' }
                    }}
                    size="small"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>
              )}

              <button
                onClick={handleSendRequest}
                style={{
                  padding: '1.1rem',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  fontFamily: "'Montserrat', sans-serif",
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 10px 20px rgba(13, 148, 136, 0.2)',
                  marginTop: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(13, 148, 136, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(13, 148, 136, 0.2)';
                }}
              >
                Send Request
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* ─── VEHICLE PHOTOS DIALOG ─── */}
      <Dialog
        open={openPhotosDialog}
        onClose={() => setOpenPhotosDialog(false)}
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
            onClick={() => setOpenPhotosDialog(false)}
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

      {/* ─── DATE TIME PICKER DIALOG ─── */}
      <Dialog
        open={openDateTimePicker}
        onClose={() => setOpenDateTimePicker(false)}
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
          <IconButton onClick={() => setOpenDateTimePicker(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
          {pickerStep === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CustomCalendar
                selectedDate={tempDate}
                minDate={minDateTime}
                onSelect={(date) => {
                  setTempDate(date);
                  // Optional: Automatically move to time step after date selection
                  // Or let user click button. User requested "arrange mobile properly", 
                  // adding automatic transition for better UX.
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
                      setOpenDateTimePicker(false);
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

      {/* ─── DAY PICKER DIALOG ─── */}
      <Dialog
        open={openDayPicker}
        onClose={() => setOpenDayPicker(false)}
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
          <IconButton onClick={() => setOpenDayPicker(false)}>
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
                setOpenDayPicker(false);
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

      {/* KEYFRAMES */}
      <style>{`

        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }

        @keyframes kenBurns {
          0%   { transform: scale(1); }
          100% { transform: scale(1.1); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes scrollLineMove {
          0%, 100% { height: 30px; opacity: 0.5; }
          50%      { height: 50px; opacity: 1; }
        }

        input::placeholder {
          color: rgba(0, 0, 0, 0.45);
        }

        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(0);
          cursor: pointer;
        }

        .booking-form-card {
          position: relative;
          isolation: isolate;
        }
        
        .booking-form-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>
      {/* ─── LOGIN REQUIREMENT ALERT ─── */}
      <Dialog
        open={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
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
            onClick={() => {
              setShowLoginAlert(false);
              setOpenAuthModal(true);
            }}
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

      {/* ─── AUTH MODAL ─── */}
      <AuthModal 
        open={openAuthModal} 
        onClose={() => setOpenAuthModal(false)} 
      />

      {/* ─── ROUTE VIEWER ─── */}
      <RouteViewer
        open={openRouteViewer}
        onClose={() => setOpenRouteViewer(false)}
        origin={formData.pickupLocation}
        destination={formData.dropoffLocation}
        waypoints={destinations}
        apiKey="AIzaSyD-hNAm1fnevgihbvtPVY8O0SuzOzK_Msc"
      />

      {/* ─── POLICY DIALOG ─── */}
      <Dialog
        open={openPolicyDialog}
        onClose={() => setOpenPolicyDialog(false)}
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
            onClick={() => setOpenPolicyDialog(false)}
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
            onClick={() => setOpenPolicyDialog(false)}
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
      
      {/* ─── CLOSE CONFIRMATION DIALOG ─── */}
      <Dialog
        open={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
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
            Are you sure?
          </Typography>
          <Typography sx={{ 
            fontFamily: "'Montserrat', sans-serif", 
            fontSize: '0.875rem', 
            color: '#6b7280', 
            lineHeight: 1.6 
          }}>
            Your entered contact information will be kept, but you will leave this step.
          </Typography>
        </DialogContent>
        <Box sx={{ p: 2, display: 'flex', gap: 1.5 }}>
          <Button 
            fullWidth
            onClick={() => setShowCloseConfirm(false)}
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
            onClick={() => {
              setShowCloseConfirm(false);
              setOpenPersonalDialog(false);
            }}
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


    </section >
  );
}
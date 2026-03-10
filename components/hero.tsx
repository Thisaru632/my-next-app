"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  Box,
  Typography,
  CircularProgress,
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
} from '@mui/icons-material';
import Image from 'next/image';
import { API_ENDPOINTS } from '@/config/api';
import { useUser } from '@/context/UserContext';
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
// LocationInput — Nominatim Autocomplete
// ---------------------------------------------------------------------------
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  class: string;   // e.g. "place", "boundary", "amenity", "shop", …
  type: string;    // e.g. "city", "town", "village", "hamlet", …
}

/* Filter Nominatim results to show ONLY cities, villages, waterfalls, and temples.
   Strictly excludes roads and highways to prevent compound names like 'Rathnapura-Matara Road'. */
const isRelevantResult = (r: NominatimResult) => {
  if (!r) return false;

  const type = r.type.toLowerCase();
  const cls = r.class.toLowerCase();
  const displayName = r.display_name.toLowerCase();
  const primaryName = r.display_name.split(',')[0].toLowerCase();

  // 1. Specific Target: Transport Hubs (Bus Stands, Stations, Airports)
  const isTransport =
    ['bus_station', 'bus_stop', 'railway_station', 'aerodrome', 'airport'].includes(type) ||
    displayName.includes('bus stand') ||
    displayName.includes('bus station');

  // 2. HARD BLOCK: No general roads, information points, shops, or offices
  if (!isTransport) {
    if (
      cls === 'highway' ||
      cls === 'shop' ||
      cls === 'office' ||
      cls === 'industrial' ||
      type === 'information' || // Excludes "Rathnapura-Matara" type route signs
      type === 'map' ||
      type.includes('road') ||
      displayName.includes(' road')
    ) {
      return false;
    }

    // Additional check for compound road names like "Rathnapura-Matara"
    if (primaryName.includes('-') && !['city', 'town', 'village'].includes(type)) {
      return false;
    }
  }

  // 3. Settlement Check: Cities, Villages, Suburbs
  const settlementTypes = ['city', 'town', 'village', 'hamlet', 'suburb', 'neighbourhood', 'municipality', 'administrative'];
  const isSettlement = settlementTypes.includes(type) || cls === 'place';

  // 4. Landmark Check: Waterfalls, Temples, Tourism points
  const isWaterfall = type === 'waterfall' || displayName.includes('waterfall') || (cls === 'natural' && type === 'waterfall');
  const isTemple = type === 'place_of_worship' || type.includes('temple') || displayName.includes(' temple');
  const isTourism = (cls === 'tourism' && type !== 'information') || ['attraction', 'viewpoint', 'museum', 'hotel'].includes(type);

  // Exclude very high-level entities (Country/State)
  if (['country', 'state', 'province', 'continent', 'region'].includes(type)) return false;

  return isSettlement || isWaterfall || isTemple || isTourism || isTransport;
};

function LocationInput({
  value,
  onChange,
  onSelect,
  onManualType,
  placeholder,
  inputStyle,
  onFocusStyle,
  onBlurStyle,
}: {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (lat: string, lon: string) => void;
  onManualType?: () => void;  // fired ONLY when user types, not when suggestion clicked
  placeholder: string;
  inputStyle: React.CSSProperties;
  onFocusStyle: React.CSSProperties;
  onBlurStyle: React.CSSProperties;
}) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coordsConfirmed, setCoordsConfirmed] = useState(false);
  const [activeStyle, setActiveStyle] = useState<React.CSSProperties>(inputStyle);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const coordsSetRef = useRef(false); // tracks if onSelect has been called

  /* Close dropdown when clicking outside */
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
      /* Use our own Next.js proxy to avoid CORS with Nominatim */
      const url = `/api/geocode?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`Geocode HTTP ${res.status}`);
      const raw: NominatimResult[] = await res.json();
      /* Filter out junk but keep most relevant geocoded items */
      const data = raw.filter(isRelevantResult).slice(0, 8);
      setSuggestions(data);
      setShowDropdown(data.length > 0);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    coordsSetRef.current = false; // user is typing again — coords no longer valid
    setCoordsConfirmed(false);
    onManualType?.();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 220);
  };

  const handleSelect = (result: NominatimResult) => {
    const clean = result.display_name.split(',')[0].trim();
    onChange(clean);
    onSelect?.(result.lat, result.lon); // pass coords to parent
    coordsSetRef.current = true;
    setCoordsConfirmed(true);
    setSuggestions([]);
    setShowDropdown(false);
  };

  /* Auto-resolve: when user leaves the field without clicking a suggestion,
     silently geocode the typed text and pick the top result */
  const handleBlur = async () => {
    setActiveStyle(onBlurStyle);
    setShowDropdown(false);
    if (coordsSetRef.current || !value.trim()) return; // already resolved
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(value.trim())}`);
      if (!res.ok) return;
      const raw: NominatimResult[] = await res.json();
      /* Pick the best match even if spelling was slightly off */
      const top = raw.find(isRelevantResult);
      if (top) {
        console.log('[AutoCorrect] Resolving:', top.display_name);
        // Automatically correct the text to the official name
        const officialName = top.display_name.split(',')[0].trim();
        onChange(officialName);
        onSelect?.(top.lat, top.lon);
        coordsSetRef.current = true;
        setCoordsConfirmed(true);
      }
    } catch { /* silently ignore */ }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1 }}>
      <input
        type="text"
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        autoComplete="off"
        style={{ ...inputStyle, ...activeStyle, width: '100%', boxSizing: 'border-box', paddingRight: coordsConfirmed ? '32px' : undefined }}
        onFocus={() => {
          setActiveStyle(onFocusStyle);
          if (value.trim().length >= 1) setShowDropdown(suggestions.length > 0);
        }}
        onBlur={handleBlur}
      />
      {/* Green tick when coords confirmed */}
      {coordsConfirmed && (
        <div style={{
          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
          color: '#22c55e', fontSize: '14px', fontWeight: 700, lineHeight: 1,
          pointerEvents: 'none',
        }}>✓</div>
      )}
      {/* Loading indicator */}
      {loading && (
        <div style={{
          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
          width: '14px', height: '14px', border: '2px solid rgba(13,148,136,0.3)',
          borderTop: '2px solid #0d9488', borderRadius: '50%',
          animation: 'loc-spin 0.7s linear infinite',
        }} />
      )}
      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#ffffff', border: '1.5px solid rgba(13,148,136,0.25)',
          borderRadius: '10px', boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
          zIndex: 9999, margin: 0, padding: '4px 0', listStyle: 'none',
          maxHeight: '210px', overflowY: 'auto',
        }}>
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
                {s.display_name.split(',')[0].trim()}
              </span>
              <span style={{ color: '#9ca3af', marginLeft: '6px', fontSize: '0.71rem' }}>
                {s.display_name.split(',').slice(1, 3).join(',').trim()}
              </span>
            </li>
          ))}
        </ul>
      )}
      <style>{`
        @keyframes loc-spin { to { transform: translateY(-50%) rotate(360deg); } }
      `}</style>
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
      { name: 'Non-AC Van', description: 'Budget friendly', maxPersons: 14, maxBags: 4 },
    ]
  },
  Bus: {
    models: [
      { name: 'AC 29 Seater', description: 'Air conditioned comfort', maxPersons: 29, maxBags: 8 },
      { name: 'Non-AC 29 Seater', description: 'Economical choice', maxPersons: 29, maxBags: 8 },
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
    numberOfDays: 0,
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

  // Intermediate destinations state
  const [destinations, setDestinations] = useState<string[]>([]);

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

  /* ── OSRM route calculation ── */
  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) {
      setRouteDistance(null);
      setRouteDuration(null);
      return;
    }
    // Build waypoints array: pickup → intermediate stops with coords → dropoff
    const waypoints: LatLon[] = [
      pickupCoords,
      ...stopCoords.filter((c): c is LatLon => c !== null),
      dropoffCoords,
    ];
    // OSRM expects: lon,lat;lon,lat;...
    const coordStr = waypoints.map((w) => `${w.lon},${w.lat}`).join(';');
    /* Use our Next.js proxy to avoid CORS with OSRM */
    const osrmUrl = `/api/osrm?coords=${encodeURIComponent(coordStr)}`;
    console.log('[Route] Fetching OSRM via proxy:', osrmUrl);

    let cancelled = false;
    setRouteLoading(true);
    fetch(osrmUrl, { headers: { 'Accept': 'application/json' } })
      .then((r) => {
        if (!r.ok) throw new Error(`OSRM HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        console.log('[Route] OSRM response:', data);
        if (data.code === 'Ok' && data.routes?.length > 0) {
          setRouteDistance(data.routes[0].distance); // metres
          setRouteDuration(data.routes[0].duration); // seconds
        } else {
          console.warn('[Route] OSRM returned no route:', data.code);
          setRouteDistance(null);
          setRouteDuration(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[Route] OSRM error:', err);
          setRouteDistance(null);
        }
      })
      .finally(() => { if (!cancelled) setRouteLoading(false); });

    return () => { cancelled = true; };
  }, [pickupCoords, dropoffCoords, stopCoords]);

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
      'Non-AC Van': 'NON AC Van',
      'AC 29 Seater': 'AC 29 Seater Bus',
      'Non-AC 29 Seater': 'Non AC 29 seater bus',
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

  const handleAddPhone = () => {
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
    setFormData((prev) => ({
      ...prev,
      tripType: tripTypeName,
      // If trip type is 'Drop', we default to 0 day (per user request for 0 default)
      numberOfDays: tripTypeName === 'Drop' ? 0 : prev.numberOfDays,
    }));
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
          numberOfDays: 0,
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
  const distanceInKm = routeDistance ? ((routeDistance / 1000) * (formData.tripType === 'Return' ? 2 : 1)) : 0;

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

    // 4. If we have distance, find the package that covers it (next recent package)
    if (routeDistance !== null) {
      const coverMatch = sortedCards.find(card => card.km >= distanceInKm);
      const bestMatch = coverMatch || sortedCards[sortedCards.length - 1];
      console.log('[Pricing] Successfully matched rate card:', bestMatch);
      return bestMatch;
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
  const basePriceBeforeAdjustment = (matchedPackage
    ? matchedPackage.rateAmount
    : (routeDistance !== null ? estimatedRoutePrice : (basePricePerDay * formData.numberOfDays)));

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
                        onSelect={(lat, lon) => { console.log('[Pickup] coords:', lat, lon); setPickupCoords({ lat, lon }); }}
                        onManualType={() => { setPickupCoords(null); setRouteDistance(null); }}
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
                      value={formData.dropoffLocation}
                      onChange={(val) => handleChange('dropoffLocation', val)}
                      onSelect={(lat, lon) => {
                        console.log('[Dropoff] coords:', lat, lon);
                        setDropoffCoords({ lat, lon });
                        if (!appliedPromo && !openPromoDialog) {
                          setOpenPromoDialog(true);
                        }
                      }}
                      onManualType={() => { setDropoffCoords(null); setRouteDistance(null); }}
                      placeholder="Drop-off location"
                      inputStyle={{
                        flex: 1,
                        padding: "0.6rem 0.85rem",
                        background: "rgba(239,68,68,0.08)",
                        backdropFilter: "blur(12px)",
                        border: "1.5px solid rgba(239,68,68,0.35)",
                        borderRadius: "8px",
                        color: "#000000",
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "0.82rem",
                        outline: "none",
                      }}
                      onFocusStyle={{ background: "rgba(239,68,68,0.15)", borderColor: "#ef4444" }}
                      onBlurStyle={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.35)" }}
                    />
                  </div>{/* end of dropoff row */}

                </div>{/* end of timeline container */}
              </div>{/* end of mb-4 route section */}

              {/* Date and Days */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
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
                    START DATE & TIME
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dateTime}
                    min={minDateTime}
                    onChange={(e) => handleChange('dateTime', e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.9rem",
                      background: "rgba(255,255,255,0.16)",
                      backdropFilter: "blur(12px)",
                      border: "1.5px solid rgba(255,255,255,0.45)",
                      borderRadius: "7px",
                      color: "#000000",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.88rem",
                      outline: "none",
                      colorScheme: "light",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = "rgba(13,148,136,0.1)";
                      e.currentTarget.style.borderColor = "#0d9488";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.16)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
                    }}
                  />
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
                  <input
                    type="number"
                    min="0"
                    disabled={formData.tripType === 'Drop'}
                    value={formData.numberOfDays}
                    onChange={(e) => handleChange('numberOfDays', Math.max(0, parseInt(e.target.value) || 0))}
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.9rem",
                      background: formData.tripType === 'Drop' ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.16)",
                      backdropFilter: "blur(12px)",
                      border: "1.5px solid rgba(255,255,255,0.45)",
                      borderRadius: "7px",
                      color: formData.tripType === 'Drop' ? "rgba(0,0,0,0.4)" : "#000000",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "0.88rem",
                      outline: "none",
                      cursor: formData.tripType === 'Drop' ? "not-allowed" : "text",
                      opacity: formData.tripType === 'Drop' ? 0.6 : 1,
                    }}
                    onFocus={(e) => {
                      if (formData.tripType !== 'Drop') {
                        e.currentTarget.style.background = "rgba(13,148,136,0.1)";
                        e.currentTarget.style.borderColor = "#0d9488";
                      }
                    }}
                    onBlur={(e) => {
                      if (formData.tripType !== 'Drop') {
                        e.currentTarget.style.background = "rgba(255,255,255,0.16)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
                      }
                    }}
                  />
                </div>
              </div>



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
                          : (matchedPackage ? `${matchedPackage.hrs} Hours ` : `${formData.numberOfDays} ${formData.numberOfDays === 1 ? 'Day' : 'Days'} `) +
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

                  {/* Route & Distance */}
                  {(routeLoading || routeDistance !== null) && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }}>📍</span>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem', color: '#4b5563', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '2px' }}>
                          Route Distance{formData.tripType === 'Return' ? ' (×2 return)' : ''}
                        </div>
                        {routeLoading ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <div style={{ width: '12px', height: '12px', border: '2px solid rgba(13,148,136,0.25)', borderTop: '2px solid #0d9488', borderRadius: '50%', animation: 'loc-spin 0.7s linear infinite' }} />
                            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', color: '#0d9488', fontWeight: 600 }}>Calculating...</span>
                          </div>
                        ) : (
                          <>
                            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
                              {((routeDistance! / 1000) * (formData.tripType === 'Return' ? 2 : 1)).toFixed(1)} km
                            </div>
                            {routeDuration !== null && (
                              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', color: '#4b5563', marginTop: '2px' }}>
                                Estimated Drive: {(() => {
                                  const mult = formData.tripType === 'Return' ? 2 : 1;
                                  const d = routeDuration * mult;
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
                    <div style={{
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
                          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: '#6b7280', marginTop: '4px' }}>
                            {matchedPackage ? (
                              formData.tripType === 'Drop'
                                ? `*Price for ${matchedPackage.km} km package. `
                                : `*Price for ${matchedPackage.km} km & ${matchedPackage.hrs} hrs package. `
                            ) : ''}*Actual price may vary based on route changes.
                          </div>

                          {matchedPackage && (
                            <div style={{ marginTop: '8px' }}>
                              <button
                                onClick={() => setShowExtraPrices(!showExtraPrices)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  color: '#0d9488',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  fontFamily: "'Montserrat', sans-serif"
                                }}
                              >
                                {showExtraPrices ? 'See less' : 'See more'}
                              </button>

                              {showExtraPrices && (
                                <div style={{
                                  marginTop: '8px',
                                  padding: '8px',
                                  background: 'rgba(255,255,255,0.5)',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  color: '#374151',
                                  fontFamily: "'Montserrat', sans-serif"
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span>Extra KM Rate:</span>
                                    <span style={{ fontWeight: 700 }}>LKR {matchedPackage.extraKMRate || 0}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Extra Hour Rate:</span>
                                    <span style={{ fontWeight: 700 }}>LKR {matchedPackage.extraHrRate1 || 0}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
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
        onClose={() => setOpenPersonalDialog(false)}
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
            onClick={() => setOpenPersonalDialog(false)}
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
                onClick={() => {
                  setOpenPersonalDialog(false);
                  setTimeout(() => setRequestSent(false), 500);
                }}
                style={{
                  marginTop: '1rem',
                  padding: '0.8rem 2rem',
                  background: '#0d9488',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontFamily: "'Montserrat', sans-serif",
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Close
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
                <div style={{ position: 'relative' }}>
                  <textarea
                    placeholder="Enter your remark or special requirements..."
                    value={formData.remark}
                    onChange={(e) => handleChange('remark', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem',
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

      {/* KEYFRAMES */}
      <style>{`

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
    </section >
  );
}
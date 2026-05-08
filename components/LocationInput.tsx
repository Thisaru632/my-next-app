"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { IconButton } from '@mui/material';
import { MyLocation as MyLocationIcon, Map as MapIcon, History as HistoryIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import MapPicker from './MapPicker';
import { useUser } from '@/context/UserContext';
import { API_ENDPOINTS } from '@/config/api';
import { useJsApiLoader } from '@react-google-maps/api';

interface GooglePlaceSuggestion {
  description: string;
  place_id: string;
}

export function LocationInput({
  value, onChange, onSelect, onManualType, placeholder,
  inputStyle, onFocusStyle, onBlurStyle, showMyLocation, onMyLocationUsed, disabled, showMapIcon = true,
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
  showMapIcon?: boolean;
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
  const [dropdownPos, setDropdownPos] = useState<'top' | 'bottom'>('bottom');
  const { user } = useUser();
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: "AIzaSyD-hNAm1fnevgihbvtPVY8O0SuzOzK_Msc", libraries: ["places", "geometry"] });
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  const filteredHistory = searchHistory.filter(h => 
    !value || h.address.toLowerCase().startsWith(value.toLowerCase())
  );

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('customerToken');
      const res = await fetch(`${API_ENDPOINTS.CUSTOMERS}/search-history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSearchHistory(data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, [user]);

  const saveToHistory = async (address: string, lat: string, lon: string) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('customerToken');
      await fetch(`${API_ENDPOINTS.CUSTOMERS}/search-history`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address, lat, lon })
      });
      fetchHistory(); // Refresh history
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  };

  useEffect(() => {
    if (user) fetchHistory();
  }, [user, fetchHistory]);

  const handleMyLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation is not supported by your browser"); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          if (!geocoder.current) geocoder.current = new google.maps.Geocoder();
          geocoder.current.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              const address = results[0].formatted_address;
              onChange(address);
              onSelect?.(latitude.toString(), longitude.toString());
              coordsSetRef.current = true;
              setCoordsConfirmed(true);
              onMyLocationUsed?.();
            }
          });
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

  // Dropdown persistence logic: 
  // If field has text, keep it open (prevents accidental closing on mobile/mis-clicks).
  // If field is empty, allow it to close on outside click.
  // Keep a ref of coordsConfirmed to use in the event listener without re-adding it
  const confirmedRef = useRef(coordsConfirmed);
  useEffect(() => { confirmedRef.current = coordsConfirmed; }, [coordsConfirmed]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Close if the input is empty OR if coordinates are confirmed (tick mark visible)
        // Using confirmedRef here keeps the dependency array below constant []
        const input = containerRef.current.querySelector('input');
        if (!input?.value.trim() || confirmedRef.current) {
          setShowDropdown(false);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []); // Constant dependency array size to avoid React Hook errors during HMR

  const updateDropdownPosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const isMobile = window.innerWidth < 640;
      // On mobile, if space below is less than 280px, show above
      if (spaceBelow < (isMobile ? 280 : 300) && rect.top > 250) {
        setDropdownPos('top');
      } else {
        setDropdownPos('bottom');
      }
    }
  }, []);

  useEffect(() => {
    if (showDropdown) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition);
      window.addEventListener('resize', updateDropdownPosition);
    }
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [showDropdown, updateDropdownPosition]);

  const fetchSuggestions = useCallback((query: string) => {
    if (query.trim().length < 1 || !isLoaded) { setSuggestions([]); return; }
    setLoading(true);
    try {
      if (!autocompleteService.current) autocompleteService.current = new google.maps.places.AutocompleteService();
      autocompleteService.current.getPlacePredictions(
        { input: query, componentRestrictions: { country: 'lk' } },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const formatted = predictions.map(p => ({
              description: p.description,
              place_id: p.place_id
            }));
            setSuggestions(formatted);
            setShowDropdown(true);
          } else {
            setSuggestions([]);
          }
          setLoading(false);
        }
      );
    } catch (err: unknown) {
      setSuggestions([]);
      setLoading(false);
    }
  }, [isLoaded]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    coordsSetRef.current = false;
    setCoordsConfirmed(false);
    onManualType?.();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 450);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (disabled) return;
    setActiveStyle(onFocusStyle);
    setShowDropdown(true);
    if (user) fetchHistory();
    
    // Improved mobile experience: scroll input to top to ensure room for keyboard and suggestions
    if (window.innerWidth < 640) {
      setTimeout(() => {
        // Adjust for potential headers/navbars, scroll slightly above the element
        const yOffset = -80; 
        const element = e.target;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 350);
    }
  };

  const handleSelect = async (suggestion: GooglePlaceSuggestion) => {
    onChange(suggestion.description);
    setLoading(true);
    try {
      if (!geocoder.current) geocoder.current = new google.maps.Geocoder();
      geocoder.current.geocode({ placeId: suggestion.place_id }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const { lat, lng } = results[0].geometry.location;
          const latStr = lat().toString();
          const lonStr = lng().toString();
          onSelect?.(latStr, lonStr);
          coordsSetRef.current = true;
          setCoordsConfirmed(true);
          saveToHistory(suggestion.description, latStr, lonStr);
          setLoading(false);
          setSuggestions([]);
          setShowDropdown(false);
        } else {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error("Geocoding error:", error);
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1 }}>
      <input
        type="text" value={value} onChange={handleInput} placeholder={placeholder}
        autoComplete="off" disabled={disabled}
        style={{ ...inputStyle, ...activeStyle, width: '100%', boxSizing: 'border-box', paddingRight: (coordsConfirmed || loading) ? '60px' : '40px', cursor: disabled ? 'not-allowed' : 'text', opacity: disabled ? 0.8 : 1 }}
        onFocus={handleFocus}
        onClick={() => { if (disabled) return; setShowDropdown(true); if (user) fetchHistory(); if (window.innerWidth < 640) handleFocus({ target: containerRef.current?.querySelector('input') } as any); }}
        onBlur={() => { 
          setActiveStyle(onBlurStyle); 
          // Close on blur if empty or already confirmed
          if (!value.trim() || coordsConfirmed) {
            setTimeout(() => setShowDropdown(false), 200);
          }
        }}
      />
      {showDropdown && (
        <ul style={{ 
          position: 'absolute', 
          ...(dropdownPos === 'bottom' ? { top: 'calc(100% + 4px)' } : { bottom: 'calc(100% + 4px)' }),
          left: 0, 
          right: 0, 
          background: '#ffffff', 
          border: '1.5px solid rgba(13,148,136,0.25)', 
          borderRadius: '10px', 
          boxShadow: dropdownPos === 'bottom' ? '0 8px 28px rgba(0,0,0,0.14)' : '0 -8px 28px rgba(0,0,0,0.14)', 
          zIndex: 9999, 
          margin: 0, 
          padding: '4px 0', 
          listStyle: 'none', 
          maxHeight: window.innerWidth < 640 ? '180px' : '260px', 
          overflowY: 'auto',
          animation: dropdownPos === 'bottom' ? 'slideDown 0.2s ease-out' : 'slideUp 0.2s ease-out'
        }}>
          {showMyLocation && (
            <li onMouseDown={(e) => { e.preventDefault(); handleMyLocation(); }}
              style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'Montserrat', sans-serif", color: '#0d9488', lineHeight: 1.4, borderBottom: '2px solid rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, background: 'rgba(13,148,136,0.04)', transition: 'background 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(13,148,136,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(13,148,136,0.04)')}
            >
              <MyLocationIcon style={{ fontSize: '18px' }} /> use current location
            </li>
          )}
          <li onMouseDown={(e) => { e.preventDefault(); setShowMapPicker(true); }}
            style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'Montserrat', sans-serif", color: '#0d9488', lineHeight: 1.4, borderBottom: '2px solid rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, background: 'rgba(13,148,136,0.04)', transition: 'background 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(13,148,136,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(13,148,136,0.04)')}
          >
            <MapIcon style={{ fontSize: '18px' }} /> Select on map
          </li>
          
          {user && filteredHistory.length > 0 && (
            <>
              <li style={{ padding: '8px 14px', fontSize: '0.7rem', fontWeight: 700, color: '#666', background: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <HistoryIcon style={{ fontSize: '14px' }} /> {value ? 'Matching History' : 'Recent History'}
              </li>
              {filteredHistory.map((h, i) => (
                <li key={`hist-${i}`} onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(h.address);
                  onSelect?.(h.lat, h.lon);
                  setCoordsConfirmed(true);
                  setShowDropdown(false);
                  saveToHistory(h.address, h.lat, h.lon);
                }}
                  style={{ padding: '9px 14px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: "'Montserrat', sans-serif", color: '#1a1a1a', lineHeight: 1.4, borderBottom: '1px solid rgba(13,148,136,0.05)', transition: 'background 0.15s', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(13,148,136,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LocationIcon style={{ fontSize: '14px', color: '#999' }} />
                  <span style={{ color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.address}</span>
                </li>
              ))}
              {suggestions.length > 0 && (
                <li style={{ padding: '8px 14px', fontSize: '0.7rem', fontWeight: 700, color: '#666', background: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', borderTop: '2px solid rgba(13,148,136,0.1)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  Search Results
                </li>
              )}
            </>
          )}

          {suggestions.map((s) => (
            <li key={s.place_id} onMouseDown={() => handleSelect(s)}
              style={{ padding: '9px 14px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: "'Montserrat', sans-serif", color: '#1a1a1a', lineHeight: 1.4, borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'background 0.15s', display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(13,148,136,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <LocationIcon style={{ fontSize: '14px', color: '#666' }} />
              <span style={{ color: '#0d9488', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</span>
            </li>
          ))}
        </ul>
      )}
      {!disabled && showMapIcon && (
        <IconButton onClick={(e) => { e.stopPropagation(); setShowMapPicker(true); }} size="small"
          sx={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#0d9488', opacity: 0.7, '&:hover': { opacity: 1, color: '#3b82f6' }, zIndex: 10 }} title="Select on map">
          <MapIcon sx={{ fontSize: '20px' }} />
        </IconButton>
      )}
      {coordsConfirmed && (
        <div style={{ position: 'absolute', right: '35px', top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontSize: '14px', fontWeight: 700, lineHeight: 1, pointerEvents: 'none', zIndex: 5 }}>✓</div>
      )}
      {loading && (
        <div style={{ position: 'absolute', right: '35px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', border: '2px solid rgba(13,148,136,0.3)', borderTop: '2px solid #0d9488', borderRadius: '50%', animation: 'loc-spin 0.7s linear infinite', zIndex: 5 }} />
      )}
      <style>{`
        @keyframes loc-spin { to { transform: translateY(-50%) rotate(360deg); } }
        @keyframes slideDown { 
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <MapPicker open={showMapPicker} onClose={() => setShowMapPicker(false)} apiKey="AIzaSyD-hNAm1fnevgihbvtPVY8O0SuzOzK_Msc"
        onSelect={(addr, lat, lng) => {
          onChange(addr);
          onSelect?.(lat.toString(), lng.toString());
          setCoordsConfirmed(true);
          setShowDropdown(false);
          saveToHistory(addr, lat.toString(), lng.toString());
        }}
      />
    </div>
  );
}

"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { IconButton } from '@mui/material';
import { MyLocation as MyLocationIcon, Map as MapIcon, History as HistoryIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import MapPicker from './MapPicker';
import { useUser } from '@/context/UserContext';
import { API_ENDPOINTS } from '@/config/api';

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
  const { user } = useUser();
  const [searchHistory, setSearchHistory] = useState<any[]>([]);

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
          const key = "AIzaSyD-hNAm1fnevgihbvtPVY8O0SuzOzK_Msc";
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${key}`);
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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 1) { setSuggestions([]); return; }
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const key = "AIzaSyD-hNAm1fnevgihbvtPVY8O0SuzOzK_Msc";
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${key}&components=country:lk`;
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`Google HTTP ${res.status}`);
      const data = await res.json();
      setSuggestions(data.predictions || []);
      setShowDropdown(true);
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
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 450);
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
        saveToHistory(suggestion.description, lat.toString(), lng.toString());
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
        type="text" value={value} onChange={handleInput} placeholder={placeholder}
        autoComplete="off" disabled={disabled}
        style={{ ...inputStyle, ...activeStyle, width: '100%', boxSizing: 'border-box', paddingRight: (coordsConfirmed || loading) ? '60px' : '40px', cursor: disabled ? 'not-allowed' : 'text', opacity: disabled ? 0.8 : 1 }}
        onFocus={() => { if (disabled) return; setActiveStyle(onFocusStyle); setShowDropdown(true); if (user) fetchHistory(); }}
        onClick={() => { if (disabled) return; setShowDropdown(true); if (user) fetchHistory(); }}
        onBlur={() => { setActiveStyle(onBlurStyle); setTimeout(() => setShowDropdown(false), 200); }}
      />
      {showDropdown && (
        <ul style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#ffffff', border: '1.5px solid rgba(13,148,136,0.25)', borderRadius: '10px', boxShadow: '0 8px 28px rgba(0,0,0,0.14)', zIndex: 9999, margin: 0, padding: '4px 0', listStyle: 'none', maxHeight: '260px', overflowY: 'auto' }}>
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
      <style>{`@keyframes loc-spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
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

"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Close as CloseIcon, Map as MapIcon, LocationOn } from '@mui/icons-material';

interface MapPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (address: string, lat: number, lng: number) => void;
  apiKey: string;
  initialLocation?: { lat: number; lng: number };
}

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: 7.8731, // Sri Lanka center
  lng: 80.7718
};

const MapPicker: React.FC<MapPickerProps> = ({ open, onClose, onSelect, apiKey, initialLocation }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places', 'geometry']
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral>(initialLocation || defaultCenter);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && !initialLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setMarkerPosition(newPos);
        reverseGeocode(newPos.lat, newPos.lng);
      });
    }
  }, [open, initialLocation]);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPosition(newPos);
      reverseGeocode(newPos.lat, newPos.lng);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
      const data = await response.json();
      if (data.results && data.results[0]) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress('Unknown location');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setAddress('Error finding address');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onSelect(address, markerPosition.lat, markerPosition.lng);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{
      '& .MuiDialog-paper': {
        borderRadius: '16px',
        overflow: 'hidden'
      }
    }}>
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)',
        color: 'white',
        py: 1.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MapIcon />
          <Typography variant="h6" sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>
            Select Location on Map
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {isLoaded ? (
          <>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={markerPosition}
              zoom={10}
              onClick={handleMapClick}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              <Marker 
                position={markerPosition} 
                draggable={true}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    setMarkerPosition(newPos);
                    reverseGeocode(newPos.lat, newPos.lng);
                  }
                }}
              />
            </GoogleMap>
            <Box sx={{ 
              position: 'absolute', 
              bottom: 16, 
              left: 16, 
              right: 16, 
              background: 'rgba(255,255,255,0.95)', 
              p: 2, 
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              zIndex: 1
            }}>
              <LocationOn sx={{ color: '#0d9488' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>
                  Selected Address
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', minHeight: '1.2em' }}>
                  {loading ? 'Fetching address...' : address || 'Click on map or drag marker'}
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress sx={{ color: '#0d9488' }} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <Button onClick={onClose} sx={{ 
          color: '#4b5563', 
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 600
        }}>
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          disabled={!address || loading}
          variant="contained" 
          sx={{ 
            background: 'linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)',
            borderRadius: '8px',
            px: 3,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            '&:hover': {
              background: 'linear-gradient(135deg, #0f766e 0%, #2563eb 100%)',
            }
          }}
        >
          Confirm Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MapPicker;

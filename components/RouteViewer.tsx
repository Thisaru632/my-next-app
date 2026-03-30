"use client";

import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, DirectionsService, Marker } from '@react-google-maps/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Button
} from '@mui/material';
import { Close as CloseIcon, Map as MapIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';

interface RouteViewerProps {
  open: boolean;
  onClose: () => void;
  origin: string;
  destination: string;
  waypoints?: string[];
  pickupCoords?: { lat: string; lon: string } | null;
  dropoffCoords?: { lat: string; lon: string } | null;
  stopCoords?: (({ lat: string; lon: string } | null)[]) | null;
  apiKey: string;
  initialResponse?: google.maps.DirectionsResult | null;
}

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: 7.8731, // Sri Lanka center
  lng: 80.7718
};

const RouteViewer: React.FC<RouteViewerProps> = ({ 
  open, 
  onClose, 
  origin, 
  destination, 
  waypoints = [], 
  pickupCoords,
  dropoffCoords,
  stopCoords,
  apiKey,
  initialResponse
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places', 'geometry']
  });

  const [response, setResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialResponse) {
        setResponse(initialResponse);
        setLoading(false);
      } else {
        setLoading(true);
      }
    } else {
      setResponse(null);
      setError(null);
    }
  }, [open, initialResponse]);

  const directionsCallback = (
    result: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === 'OK' && result !== null && result.routes && result.routes.length > 0) {
      console.log(`[DEBUG-VIEWER] Finding shortest among ${result.routes.length} routes`);
      // Pick route with minimum total distance
      const shortestRoute = result.routes.reduce((min, curr, idx) => {
        const minDistance = min.legs.reduce((acc, leg) => acc + (leg.distance?.value || 0), 0);
        const currDistance = curr.legs.reduce((acc, leg) => acc + (leg.distance?.value || 0), 0);
        console.log(`Route ${idx}: ${currDistance/1000}km`);
        return currDistance < minDistance ? curr : min;
      });

      setResponse({ ...result, routes: [shortestRoute] });
      setLoading(false);
    } else if (status !== 'OK') {
      // Silence expected typing errors, otherwise they clutter the console
      if (status !== 'NOT_FOUND' && status !== 'ZERO_RESULTS') {
        console.error('Directions request failed with status:', status);
      }
      
      const msg = status === 'NOT_FOUND' 
        ? 'One or more locations could not be found. Please check your addresses.' 
        : status === 'ZERO_RESULTS'
          ? 'No driving route exists between these locations.'
          : 'Could not calculate route. Please check your locations.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleCopyPickupCode = () => {
    if (response) {
      const loc = response.routes[0].legs[0].start_location;
      const code = `${loc.lat().toFixed(6)},${loc.lng().toFixed(6)}`;
      navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth 
      PaperProps={{
        sx: {
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)',
        color: 'white',
        py: 2,
        px: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MapIcon />
          <Typography variant="h6" sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>
            Planned Route
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, position: 'relative', bgcolor: '#f8fafc' }}>
        {isLoaded ? (
          <Box sx={{ position: 'relative' }}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={defaultCenter}
              zoom={7}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              {origin && destination && !response && !initialResponse && (
                <DirectionsService
                  options={{
                    origin: pickupCoords ? { lat: parseFloat(pickupCoords.lat), lng: parseFloat(pickupCoords.lon) } : origin,
                    destination: dropoffCoords ? { lat: parseFloat(dropoffCoords.lat), lng: parseFloat(dropoffCoords.lon) } : destination,
                    waypoints: (waypoints || [])
                      .filter(wp => wp.trim() !== '')
                      .map((wp, i) => {
                        if (stopCoords && stopCoords[i]) {
                          return { location: { lat: parseFloat(stopCoords[i]!.lat), lng: parseFloat(stopCoords[i]!.lon) }, stopover: true };
                        }
                        return { location: wp, stopover: true };
                      }),
                    travelMode: google.maps.TravelMode.DRIVING,
                    provideRouteAlternatives: true
                  }}
                  callback={directionsCallback}
                />
              )}

              {response && (
                <>
                  <DirectionsRenderer
                    options={{
                      directions: response,
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: '#0d9488',
                        strokeWeight: 5,
                        strokeOpacity: 0.8
                      }
                    }}
                  />
                  {/* Origin Marker */}
                  <Marker 
                    position={response.routes[0].legs[0].start_location}
                    label={{ text: "Pickup", color: "white", fontWeight: "bold", fontSize: "12px" }}
                  />
                  
                  {/* Intermediate Stops */}
                  {response.routes[0].legs.slice(0, -1).map((leg, index) => {
                    if (index === 0) return null; // Already handled start in leg 0
                    return (
                      <Marker 
                        key={`stop-${index}`}
                        position={leg.start_location}
                        label={{ text: `Stop ${index}`, color: "white", fontWeight: "bold", fontSize: "12px" }}
                      />
                    );
                  })}

                  {/* Handle final leg's start (last stop) */}
                  {response.routes[0].legs.length > 1 && (
                    <Marker 
                      position={response.routes[0].legs[response.routes[0].legs.length - 1].start_location}
                      label={{ 
                        text: `Stop ${response.routes[0].legs.length - 1}`, 
                        color: "white", 
                        fontWeight: "bold", 
                        fontSize: "12px" 
                      }}
                    />
                  )}

                  {/* Destination Marker */}
                  <Marker 
                    position={response.routes[0].legs[response.routes[0].legs.length - 1].end_location}
                    label={{ text: "Drop-off", color: "white", fontWeight: "bold", fontSize: "12px" }}
                  />
                </>
              )}
            </GoogleMap>

            {loading && !error && (
              <Box sx={{ 
                position: 'absolute', 
                inset: 0, 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                bgcolor: 'rgba(255,255,255,0.7)',
                zIndex: 10
              }}>
                <CircularProgress sx={{ color: '#0d9488', mb: 2 }} />
                <Typography sx={{ fontWeight: 600, color: '#0d9488' }}>Calculating route...</Typography>
              </Box>
            )}

            {error && (
              <Box sx={{ 
                position: 'absolute', 
                inset: 0, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                bgcolor: 'rgba(255,255,255,0.9)',
                zIndex: 10,
                p: 4,
                textAlign: 'center'
              }}>
                <Typography color="error" sx={{ fontWeight: 600 }}>{error}</Typography>
              </Box>
            )}

            {response && (
              <Box sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'rgba(255,255,255,0.95)',
                p: 2,
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                maxWidth: '250px',
                zIndex: 5
              }}>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, display: 'block', mb: 1 }}>TRIP INFO</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#4b5563', fontSize: '0.75rem' }}>Total Distance</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#111827' }}>
                      {response.routes[0].legs.reduce((acc, leg) => acc + (leg.distance?.value || 0), 0) / 1000} km
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#4b5563', fontSize: '0.75rem' }}>Estimated Time</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#111827' }}>
                      {Math.ceil(response.routes[0].legs.reduce((acc, leg) => acc + (leg.duration?.value || 0), 0) / 60)} mins
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<ContentCopyIcon sx={{ fontSize: '1rem !important' }} />}
                      onClick={handleCopyPickupCode}
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        borderRadius: '8px',
                        textTransform: 'uppercase',
                        borderColor: copySuccess ? '#22c55e' : 'primary.main',
                        color: copySuccess ? '#22c55e' : 'primary.main',
                        '&:hover': {
                          borderColor: copySuccess ? '#16a34a' : 'primary.dark',
                          bgcolor: 'transparent'
                        }
                      }}
                    >
                      {copySuccess ? 'Copied Lat/Lng!' : 'Copy Pickup Code'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
            <CircularProgress sx={{ color: '#0d9488' }} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RouteViewer;

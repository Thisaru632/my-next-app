"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, DirectionsService, Marker, InfoWindow } from '@react-google-maps/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Button,
  Chip,
  Stack
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Map as MapIcon, 
  Place, 
  TempleHindu, 
  Pool, 
  Info,
  Star
} from '@mui/icons-material';

interface NearbyViewerProps {
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
  lat: 7.8731, 
  lng: 80.7718
};

const categories = [
  { id: 'attraction', label: 'Attractions', icon: <Star fontSize="small" />, query: 'tourist attraction' },
  { id: 'temple', label: 'Temples', icon: <TempleHindu fontSize="small" />, query: 'temple' },
  { id: 'bathing', label: 'Bathing Places', icon: <Pool fontSize="small" />, query: 'waterfall bathing beach' },
  { id: 'restaurant', label: 'Restaurants', icon: <Place fontSize="small" />, query: 'restaurant' },
];

const NearbyViewer: React.FC<NearbyViewerProps> = ({ 
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

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [response, setResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [places, setPlaces] = useState<google.maps.places.PlaceResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [loading, setLoading] = useState(true);
  const [fetchingPlaces, setFetchingPlaces] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);

  useEffect(() => {
    if (open) {
      if (initialResponse) {
        setResponse(initialResponse);
        setLoading(false);
        // Only trigger search if map is ready, otherwise map's onLoad handles it
        if (map) searchNearbyAlongRoute(initialResponse, selectedCategory);
      } else {
        setLoading(true);
      }
    } else {
      setResponse(null);
      setPlaces([]);
      setSelectedPlace(null);
    }
  }, [open, initialResponse, map]);

  useEffect(() => {
    // Re-trigger search when category changes
    if (open && response && map) {
      searchNearbyAlongRoute(response, selectedCategory);
    }
  }, [selectedCategory, map]);

  const directionsCallback = (
    result: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === 'OK' && result !== null) {
      setResponse(result);
      // Search for places along the entire route
      searchNearbyAlongRoute(result, selectedCategory);
    } else {
      // Silence expected typing errors
      if (status !== 'NOT_FOUND' && status !== 'ZERO_RESULTS') {
        console.error('[NearbyViewer] Directions error:', status);
      }
    }
    setLoading(false);
  };

  const searchNearbyAlongRoute = useCallback((result: google.maps.DirectionsResult, categoryId: string) => {
    if (!map) return;

    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    setFetchingPlaces(true);
    // Note: We don't clear places here so user sees old results until new ones load for a smoother feel
    
    const service = new google.maps.places.PlacesService(map);
    const route = result.routes[0];
    const path = route.overview_path;
    
    const seenPlaceIds = new Set<string>();
    const allResults: google.maps.places.PlaceResult[] = [];

    // OPTIMIZATION: Reduce sampling points. 
    // To cover a route with a 4km radius search, we only need a search point every ~7-8km.
    // Instead of sampling 10-15 points, we'll calculate based on the total distance.
    const pathLengthMeters = route.legs.reduce((acc, leg) => acc + (leg.distance?.value || 0), 0);
    const numPoints = Math.max(3, Math.ceil(pathLengthMeters / 8000)); // One point every 8km
    
    const pointsToSearch: google.maps.LatLng[] = [];
    for (let i = 0; i < numPoints; i++) {
        // Calculate the index in the path array corresponding to this fraction of the route
        const index = Math.floor((i / (numPoints - 1)) * (path.length - 1));
        pointsToSearch.push(path[index]);
    }

    let completedSearches = 0;

    pointsToSearch.forEach((location) => {
      service.nearbySearch({
        location: location,
        radius: 4000, 
        keyword: category.query
      }, (results, status) => {
        completedSearches++;

        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          results.forEach(place => {
            if (place.place_id && !seenPlaceIds.has(place.place_id)) {
                seenPlaceIds.add(place.place_id);
                allResults.push(place);
            }
          });
        }

        if (completedSearches === pointsToSearch.length) {
            setPlaces(allResults);
            setFetchingPlaces(false);
        }
      });
    });
  }, [map]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
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
        flexDirection: 'column',
        gap: 1.5,
        background: 'linear-gradient(135deg, #3b82f6 0%, #0d9488 100%)',
        color: 'white',
        py: 2,
        px: 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Place />
            <Typography variant="h6" sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>
              Nearby Attractions
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              icon={cat.icon}
              onClick={() => handleCategoryChange(cat.id)}
              sx={{
                bgcolor: selectedCategory === cat.id ? 'white' : 'rgba(255,255,255,0.15)',
                color: selectedCategory === cat.id ? '#0d9488' : 'white',
                fontWeight: 700,
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '0.75rem',
                '&:hover': { bgcolor: selectedCategory === cat.id ? 'white' : 'rgba(255,255,255,0.25)' },
                '& .MuiChip-icon': { color: 'inherit' }
              }}
            />
          ))}
        </Stack>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, position: 'relative', bgcolor: '#f8fafc' }}>
        {isLoaded ? (
          <Box sx={{ position: 'relative' }}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={defaultCenter}
              zoom={13}
              onLoad={setMap}
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
                    travelMode: google.maps.TravelMode.DRIVING
                  }}
                  callback={directionsCallback}
                />
              )}

              {response && (
                <DirectionsRenderer
                  options={{
                    directions: response,
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: '#0d9488',
                      strokeWeight: 4,
                      strokeOpacity: 0.6
                    }
                  }}
                />
              )}

              {/* Destination Marker */}
              {response && (
                <Marker 
                   position={response.routes[0].legs[response.routes[0].legs.length - 1].end_location}
                   icon={{
                     url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                   }}
                />
              )}

              {/* POI Markers */}
              {places.map((place, idx) => (
                <Marker
                  key={`${place.place_id}-${idx}`}
                  position={place.geometry?.location!}
                  onClick={() => setSelectedPlace(place)}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                  }}
                />
              ))}

              {selectedPlace && (
                <InfoWindow
                  position={selectedPlace.geometry?.location!}
                  onCloseClick={() => setSelectedPlace(null)}
                >
                  <Box sx={{ p: 1, maxWidth: 200 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedPlace.name}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.7rem', color: '#6b7280' }}>{selectedPlace.vicinity}</Typography>
                    {selectedPlace.rating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Star sx={{ fontSize: 14, color: '#f59e0b' }} />
                        <Typography variant="caption" sx={{ mt: 0.2 }}>{selectedPlace.rating}</Typography>
                      </Box>
                    )}
                  </Box>
                </InfoWindow>
              )}
            </GoogleMap>

            {(loading || fetchingPlaces) && (
              <Box sx={{ 
                position: 'absolute', 
                inset: 0, 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                bgcolor: 'rgba(255,255,255,0.4)',
                zIndex: 10
              }}>
                <CircularProgress size={30} sx={{ color: '#0d9488', mb: 1 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0d9488' }}>
                  {loading ? 'Routing...' : 'Finding Nearby Places...'}
                </Typography>
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

export default NearbyViewer;

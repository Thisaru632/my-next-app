'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Stack,
    Divider,
} from '@mui/material';
import {
    LocationCity as LocationCityIcon,
    Map as MapIcon,
    ErrorOutline as ErrorOutlineIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { AppBar, Toolbar, Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { API_ENDPOINTS } from '@/config/api';


import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    Percent as PercentIcon,
    Forest as ForestIcon,
    Terrain as TerrainIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Gesture as GestureIcon,
    AddLocation as AddLocationIcon,
    CheckCircle as CheckCircleIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import { GoogleMap, useJsApiLoader, Circle, Polygon, Autocomplete, Marker, Polyline } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = "AIzaSyD-hNAm1fnevgihbvtPVY8O0SuzOzK_Msc";
const LIBRARIES: ("places" | "geometry" | "visualization")[] = ["places", "geometry"];

const SRI_LANKA_PROVINCES = [
    'Western', 'Central', 'Southern', 'North Western', 
    'Sabaragamuwa', 'North Central', 'Uva', 'Eastern', 'Northern'
];

const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '24px'
};

const defaultCenter = {
    lat: 7.8731, // Sri Lanka center
    lng: 80.7718
};

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ProvinceManagePage = () => {
    const [blockedProvinces, setBlockedProvinces] = useState<string[]>([]);
    const [provinceAdjustments, setProvinceAdjustments] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [updatingSettings, setUpdatingSettings] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Adjustment Dialog state
    const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
    const [selectedProvinceForAdjust, setSelectedProvinceForAdjust] = useState<string>('');
    const [tempAdjustValue, setTempAdjustValue] = useState<string>('');

    const [classifiedAreas, setClassifiedAreas] = useState<any[]>([]);
    const [areaTypeDialogOpen, setAreaTypeDialogOpen] = useState(false);
    const [newArea, setNewArea] = useState<any>(null);
    const [searchRadius, setSearchRadius] = useState<number>(10000); // Default 10km
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [isMapFullScreen, setIsMapFullScreen] = useState(false);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [drawingPoints, setDrawingPoints] = useState<google.maps.LatLngLiteral[]>([]);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
        version: '3.64'
    });

    useEffect(() => {
        fetchGlobalSettings();
    }, []);

    const fetchGlobalSettings = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/settings`);
            if (response.ok) {
                const data = await response.json();
                if (data.blockedProvinces !== undefined) {
                    setBlockedProvinces(data.blockedProvinces || []);
                }
                if (data.provinceAdjustments !== undefined) {
                    setProvinceAdjustments(data.provinceAdjustments || {});
                }
                if (data.classifiedAreas !== undefined) {
                    setClassifiedAreas(data.classifiedAreas || []);
                }
            } else {
                setError('Failed to fetch global settings');
            }
        } catch (err) {
            setError('An error occurred while fetching settings');
        } finally {
            setLoading(false);
        }
    };

    const getPolygonCentroid = (paths: {lat: number, lng: number}[]) => {
        if (!paths || paths.length === 0) return defaultCenter;
        const lat = paths.reduce((sum, p) => sum + p.lat, 0) / paths.length;
        const lng = paths.reduce((sum, p) => sum + p.lng, 0) / paths.length;
        return { lat, lng };
    };


    const handlePolygonComplete = (polygon: google.maps.Polygon) => {
        const path = polygon.getPath();
        const paths = path.getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
        if (paths.length > 0) {
            setNewArea({
                type: 'polygon',
                paths: paths
            });
        }
        // Remove the temporary drawing from the map as we will re-render it from state
        polygon.setMap(null);
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (isDrawingMode && e.latLng) {
            const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            setDrawingPoints(prev => [...prev, newPoint]);
        }
    };

    const deleteDrawingPoint = (index: number) => {
        setDrawingPoints(prev => prev.filter((_, i) => i !== index));
    };

    const deleteAreaPoint = (index: number) => {
        if (!newArea || !newArea.paths) return;
        const newPaths = newArea.paths.filter((_: any, i: number) => i !== index);
        if (newPaths.length < 3) {
            setDrawingPoints(newPaths);
            setNewArea(null);
            setIsDrawingMode(true);
            setError("Area need at least 3 points. Returning to drawing mode.");
            setTimeout(() => setError(null), 3000);
        } else {
            setNewArea({ ...newArea, paths: newPaths });
        }
    };

    const finishManualDrawing = () => {
        if (drawingPoints.length < 3) {
            alert('Please mark at least 3 points to form an area.');
            return;
        }
        setNewArea({
            type: 'polygon',
            paths: drawingPoints
        });
        setIsDrawingMode(false);
        // We keep drawingPoints for now or rely on newArea.paths
    };


    const saveClassifiedArea = async (type: 'Mountain' | 'Plain', id?: string) => {
        setUpdatingSettings(true);
        const areaToSave = { 
            id: id || Math.random().toString(36).substr(2, 9),
            type,
            shapeType: 'polygon',
            paths: newArea.paths
        };
        const newAreas = id 
            ? classifiedAreas.map(a => a.id === id ? areaToSave : a)
            : [...classifiedAreas, areaToSave];

        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'classifiedAreas',
                    value: newAreas,
                    description: 'List of geographical areas classified as Mountain or Plain'
                }),
            });

            if (response.ok) {
                setClassifiedAreas(newAreas);
                setSuccess(`Area classified as ${type} saved successfully`);
                setNewArea(null);
                setDrawingPoints([]);
            } else {
                setError('Failed to save area classification');
            }
        } catch (err) {
            setError('An error occurred during area save');
        } finally {
            setUpdatingSettings(false);
            setTimeout(() => { setSuccess(null); setError(null); }, 3000);
        }
    };

    const deleteClassifiedArea = async (id: string) => {
        setUpdatingSettings(true);
        const newAreas = classifiedAreas.filter(a => a.id !== id);

        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'classifiedAreas',
                    value: newAreas,
                }),
            });

            if (response.ok) {
                setClassifiedAreas(newAreas);
                setSuccess(`Area removed successfully`);
            } else {
                setError('Failed to remove area');
            }
        } catch (err) {
            setError('An error occurred during area deletion');
        } finally {
            setUpdatingSettings(false);
            setTimeout(() => { setSuccess(null); setError(null); }, 3000);
        }
    };

    const toggleProvince = async (province: string) => {
        setUpdatingSettings(true);
        const isCurrentlyBlocked = blockedProvinces.includes(province);
        const newBlockedProvinces = isCurrentlyBlocked
            ? blockedProvinces.filter(p => p !== province)
            : [...blockedProvinces, province];

        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'blockedProvinces',
                    value: newBlockedProvinces,
                    description: 'List of blocked provinces for starting locations'
                }),
            });

            if (response.ok) {
                setBlockedProvinces(newBlockedProvinces);
                setSuccess(`${province} Province pickup access ${isCurrentlyBlocked ? 'activated' : 'deactivated'} successfully`);
            } else {
                setError('Failed to update province settings');
            }
        } catch (err) {
            setError('An error occurred during update');
        } finally {
            setUpdatingSettings(false);
            // Clear messages after 3 seconds
            setTimeout(() => { setSuccess(null); setError(null); }, 3000);
        }
    };

    const openAdjustmentDialog = (province: string) => {
        setSelectedProvinceForAdjust(province);
        setTempAdjustValue(String(provinceAdjustments[province] || 0));
        setAdjustDialogOpen(true);
    };

    const handleSaveAdjustment = async () => {
        const val = parseFloat(tempAdjustValue);
        if (isNaN(val)) { setError('Please enter a valid number'); return; }

        setUpdatingSettings(true);
        const newAdjustments = { ...provinceAdjustments, [selectedProvinceForAdjust]: val };

        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'provinceAdjustments',
                    value: newAdjustments,
                    description: 'Rate adjustments per province'
                }),
            });

            if (response.ok) {
                setProvinceAdjustments(newAdjustments);
                setSuccess(`Rate adjustment for ${selectedProvinceForAdjust} saved successfully`);
                setAdjustDialogOpen(false);
            } else {
                setError('Failed to save adjustment');
            }
        } catch (err) {
            setError('An error occurred during adjustment save');
        } finally {
            setUpdatingSettings(false);
            setTimeout(() => { setSuccess(null); setError(null); }, 3000);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <React.Fragment>
            <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                {/* Header Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 1, color: 'text.primary' }}>
                        Province & Area Access Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Control vehicle availability and classify terrain regions (Mountain/Plain) across Sri Lanka
                    </Typography>
                </Box>

                {/* Error/Success Alerts */}
                {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 4, borderRadius: '16px' }}>{error}</Alert>}
                {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 4, borderRadius: '16px' }}>{success}</Alert>}

                {/* Unified Control Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: '24px',
                        border: '1px solid',
                        borderColor: 'divider',
                        background: (theme) => theme.palette.mode === 'dark' 
                            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)' 
                            : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%)',
                        backdropFilter: 'blur(10px)',
                        mb: 4
                    }}
                >
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '350px 1fr' }, gap: 4 }}>
                        {/* Left Side: Province List */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                                    <LocationCityIcon />
                                </Box>
                                <Typography variant="h6" fontWeight="800">Vehicle Access</Typography>
                            </Box>
                            
                            <Stack spacing={1.5} sx={{ maxHeight: '650px', overflowY: 'auto', pr: 1 }}>
                                {SRI_LANKA_PROVINCES.map((province) => {
                                    const isBlocked = blockedProvinces.includes(province);
                                    return (
                                        <Paper
                                            key={province}
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                borderRadius: '16px',
                                                border: '1px solid',
                                                borderColor: isBlocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                background: isBlocked ? 'rgba(239, 68, 68, 0.02)' : 'rgba(16, 185, 129, 0.02)',
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="700">{province}</Typography>
                                                    <Typography variant="caption" sx={{ color: isBlocked ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                                                        {isBlocked ? 'DEACTIVATED' : 'ACTIVE'}
                                                    </Typography>
                                                </Box>
                                                <Stack direction="row" spacing={0.5}>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        onClick={() => toggleProvince(province)}
                                                        sx={{ 
                                                            minWidth: 'auto', 
                                                            px: 1.5, 
                                                            borderRadius: '8px',
                                                            bgcolor: isBlocked ? '#10b981' : '#ef4444',
                                                            '&:hover': { bgcolor: isBlocked ? '#059669' : '#dc2626' }
                                                        }}
                                                    >
                                                        {isBlocked ? 'On' : 'Off'}
                                                    </Button>
                                                    <IconButton size="small" onClick={() => openAdjustmentDialog(province)}>
                                                        <TrendingUpIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </Box>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        </Box>

                        {/* Right Side: Area Classification Map */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(59, 130, 246, 0.1)', color: 'primary.main' }}>
                                        <TerrainIcon />
                                    </Box>
                                    <Typography variant="h6" fontWeight="800">Terrain Classification</Typography>
                                </Box>
                                
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8b5cf6', display: 'inline-block' }} /> Mountain
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e', display: 'inline-block' }} /> Plain
                                    </Typography>

                                    <Button
                                        size="small"
                                        variant={isDrawingMode ? "contained" : "outlined"}
                                        color={isDrawingMode ? "primary" : "inherit"}
                                        startIcon={isDrawingMode ? <CheckCircleIcon /> : <GestureIcon />}
                                        onClick={() => {
                                            if (isDrawingMode) {
                                                finishManualDrawing();
                                            } else {
                                                setIsDrawingMode(true);
                                                setDrawingPoints([]);
                                                setNewArea(null);
                                            }
                                        }}
                                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, ml: 2 }}
                                    >
                                        {isDrawingMode ? 'Finish Area' : 'Manual Tool'}
                                    </Button>

                                    {isDrawingMode && (
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<ClearIcon />}
                                            onClick={() => {
                                                setIsDrawingMode(false);
                                                setDrawingPoints([]);
                                            }}
                                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, ml: 1 }}
                                        >
                                            Cancel
                                        </Button>
                                    )}

                                    <Button
                                        size="small"
                                        startIcon={<FullscreenIcon />}
                                        onClick={() => setIsMapFullScreen(true)}
                                        sx={{ 
                                            borderRadius: '8px',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            ml: 2
                                        }}
                                    >
                                        Full Screen
                                    </Button>
                                </Stack>
                            </Box>

                            {isLoaded ? (
                                <Box sx={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        center={defaultCenter}
                                        zoom={8}
                                        onLoad={(map) => setMap(map)}
                                        onClick={handleMapClick}
                                        options={{
                                            styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
                                            disableDefaultUI: false,
                                            mapTypeControl: true,
                                            streetViewControl: false,
                                            fullscreenControl: true,
                                        }}
                                    >
                                        {/* SINGLE Drawing manager for freehand marking REMOVED */}

                                        {/* Manual Drawing Points & Lines */}
                                        {isDrawingMode && drawingPoints.map((point, index) => (
                                            <Marker 
                                                key={`draw-${index}`} 
                                                position={point} 
                                                label={{ 
                                                    text: `${index + 1}`, 
                                                    color: 'white', 
                                                    fontWeight: '800', 
                                                    fontSize: '14px' 
                                                }}
                                                onClick={() => deleteDrawingPoint(index)}
                                            />
                                        ))}
                                        {isDrawingMode && drawingPoints.length > 1 && (
                                            <Polyline 
                                                path={drawingPoints} 
                                                options={{ 
                                                    strokeColor: '#3b82f6', 
                                                    strokeWeight: 3,
                                                    strokeOpacity: 0.8,
                                                    geodesic: true
                                                }} 
                                            />
                                        )}
                                        
                                        {/* Temporary polygon being edited */}
                                        {newArea && newArea.type === 'polygon' && (
                                            <React.Fragment>
                                                <Polygon
                                                    paths={newArea.paths}
                                                    options={{
                                                        fillColor: 'rgba(59, 130, 246, 0.2)',
                                                        strokeColor: '#3b82f6',
                                                        strokeWeight: 2,
                                                        zIndex: 10
                                                    }}
                                                />
                                                {newArea.paths.map((point: any, index: number) => (
                                                    <Marker 
                                                        key={`edit-${index}`} 
                                                        position={point} 
                                                        label={{ 
                                                            text: '✕', 
                                                            color: 'white', 
                                                            fontWeight: 'bold', 
                                                            fontSize: '16px' 
                                                        }}
                                                        title="Click to remove point"
                                                        onClick={() => deleteAreaPoint(index)}
                                                        zIndex={20}
                                                    />
                                                ))}
                                            </React.Fragment>
                                        )}
                                        {classifiedAreas.map((area) => (
                                            <React.Fragment key={area.id}>
                                                {(!area.shapeType || area.shapeType === 'circle') ? (
                                                    <Circle
                                                        center={area.center}
                                                        radius={area.radius}
                                                        options={{
                                                            fillColor: area.type === 'Mountain' ? '#8b5cf6' : '#22c55e',
                                                            fillOpacity: 0.35,
                                                            strokeColor: area.type === 'Mountain' ? '#8b5cf6' : '#22c55e',
                                                            strokeWeight: 2,
                                                            clickable: true,
                                                        }}
                                                        onClick={() => {
                                                            if (window.confirm(`Delete this ${area.type} area?`)) {
                                                                deleteClassifiedArea(area.id);
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Polygon
                                                        paths={area.paths}
                                                        options={{
                                                            fillColor: area.type === 'Mountain' ? '#8b5cf6' : '#22c55e',
                                                            fillOpacity: 0.35,
                                                            strokeColor: area.type === 'Mountain' ? '#8b5cf6' : '#22c55e',
                                                            strokeWeight: 2,
                                                            clickable: true,
                                                        }}
                                                        onClick={() => {
                                                            if (window.confirm(`Delete this ${area.type} area?`)) {
                                                                deleteClassifiedArea(area.id);
                                                            }
                                                        }}
                                                    />
                                                )}
                                                {/* Label Marker for Saved Areas */}
                                                <Marker 
                                                    position={(!area.shapeType || area.shapeType === 'circle') ? area.center : getPolygonCentroid(area.paths)}
                                                    label={{
                                                        text: area.type,
                                                        color: area.type === 'Mountain' ? '#8b5cf6' : '#22c55e',
                                                        fontWeight: 'bold',
                                                        fontSize: '12px'
                                                    }}
                                                    options={{
                                                        icon: {
                                                            path: google.maps.SymbolPath.CIRCLE,
                                                            scale: 0 // Hide the icon, show only label
                                                        }
                                                    }}
                                                />
                                            </React.Fragment>
                                        ))}
                                    </GoogleMap>
                                </Box>
                            ) : (
                                <Box sx={{ height: 500, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'action.hover', borderRadius: '24px' }}>
                                    <CircularProgress />
                                </Box>
                            )}

                            {/* Classification Popup (appears after drawing an area) */}
                            <Dialog
                                open={!!newArea}
                                onClose={() => {
                                    setNewArea(null);
                                    setDrawingPoints([]);
                                }}
                                PaperProps={{
                                    sx: {
                                        borderRadius: '24px',
                                        maxWidth: '450px',
                                        width: '100%',
                                        p: 1,
                                        boxShadow: '0 24px 48px rgba(0,0,0,0.15)'
                                    }
                                }}
                            >
                                <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pb: 0, pt: 3 }}>
                                    Classify Custom Area
                                </DialogTitle>
                                <DialogContent sx={{ textAlign: 'center', pt: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        Pin this newly marked region as a Mountain terrain or a Plain terrain.
                                    </Typography>

                                    <Stack direction="column" spacing={2} sx={{ mb: 1 }}>
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            startIcon={<TerrainIcon />}
                                            onClick={() => saveClassifiedArea('Mountain')}
                                            sx={{ 
                                                py: 1.5, 
                                                borderRadius: '16px', 
                                                border: '2px solid',
                                                borderColor: 'rgba(139, 92, 246, 0.2)',
                                                color: '#8b5cf6',
                                                fontWeight: 800,
                                                '&:hover': { borderColor: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.05)' }
                                            }}
                                        >
                                            Mountain Area
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            startIcon={<ForestIcon />}
                                            onClick={() => saveClassifiedArea('Plain')}
                                            sx={{ 
                                                py: 1.5, 
                                                borderRadius: '16px', 
                                                border: '2px solid',
                                                borderColor: 'rgba(34, 197, 94, 0.2)',
                                                color: '#22c55e',
                                                fontWeight: 800,
                                                '&:hover': { borderColor: '#22c55e', bgcolor: 'rgba(34, 197, 94, 0.05)' }
                                            }}
                                        >
                                            Plain Area
                                        </Button>
                                    </Stack>
                                </DialogContent>
                                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                                    <Button 
                                        onClick={() => {
                                            setNewArea(null);
                                            setDrawingPoints([]);
                                        }} 
                                        color="inherit" 
                                        sx={{ textTransform: 'none', fontWeight: 600, opacity: 0.6 }}
                                    >
                                        Discard Drawing
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            {/* Active Areas List */}
                            {classifiedAreas.length > 0 && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Active Classifications ({classifiedAreas.length})
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                        {classifiedAreas.map((area) => (
                                            <Paper
                                                key={area.id}
                                                elevation={0}
                                                sx={{
                                                    px: 2,
                                                    py: 1,
                                                    borderRadius: '12px',
                                                    border: '1px solid',
                                                    borderColor: area.type === 'Mountain' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                                                    bgcolor: area.type === 'Mountain' ? 'rgba(139, 92, 246, 0.05)' : 'rgba(34, 197, 94, 0.05)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}
                                            >
                                                {area.type === 'Mountain' ? <TerrainIcon sx={{ fontSize: '1rem', color: '#8b5cf6' }} /> : <ForestIcon sx={{ fontSize: '1rem', color: '#22c55e' }} />}
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: area.type === 'Mountain' ? '#8b5cf6' : '#22c55e' }}>
                                                    {area.type} {area.shapeType === 'circle' ? `(Radius: ${Math.round(area.radius / 1000)}km)` : '(Custom)'}
                                                </Typography>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => deleteClassifiedArea(area.id)}
                                                    sx={{ ml: 0.5, p: 0.5, '&:hover': { color: 'error.main' } }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: '1rem' }} />
                                                </IconButton>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Paper>

                <Divider sx={{ my: 4 }} />
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        * Changes made here will affect customer booking experience in real-time.
                    </Typography>
                </Box>
            </Box>

            {/* Rate Adjustment Dialog */}
            <Dialog 
                open={adjustDialogOpen} 
                onClose={() => !updatingSettings && setAdjustDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        p: 1,
                        maxWidth: '400px',
                        width: '100%',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                        p: 1, 
                        borderRadius: '12px', 
                        bgcolor: 'rgba(59, 130, 246, 0.1)', 
                        color: 'primary.main',
                        display: 'flex'
                    }}>
                        <TrendingUpIcon />
                    </Box>
                    Rate Adjustment: {selectedProvinceForAdjust}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 3 }}>
                        Set a percentage adjustment for all trips starting from {selectedProvinceForAdjust} Province.
                    </DialogContentText>
                    
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                            ADJUSTMENT PERCENTAGE
                        </Typography>
                        <TextField
                            fullWidth
                            type="number"
                            value={tempAdjustValue}
                            onChange={(e) => setTempAdjustValue(e.target.value)}
                            disabled={updatingSettings}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PercentIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px',
                                }
                            }}
                        />
                    </Box>
                    
                    <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ErrorOutlineIcon sx={{ fontSize: '0.9rem' }} />
                        Use positive values to increase price, negative to decrease.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button 
                        onClick={() => setAdjustDialogOpen(false)}
                        disabled={updatingSettings}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={handleSaveAdjustment}
                        disabled={updatingSettings}
                        sx={{ 
                            borderRadius: '12px', 
                            textTransform: 'none', 
                            fontWeight: 700,
                            px: 3,
                            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)'
                        }}
                    >
                        {updatingSettings ? <CircularProgress size={20} color="inherit" /> : 'Save Adjustment'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* FULL SCREEN MAP DIALOG */}
            <Dialog
                fullScreen
                open={isMapFullScreen}
                onClose={() => setIsMapFullScreen(false)}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: 'relative', background: '#1e293b' }}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => setIsMapFullScreen(false)}>
                            <FullscreenExitIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
                            Area Classification - Full Screen View
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'white' }}>
                                <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#8b5cf6', display: 'inline-block' }} /> Mountain
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'white' }}>
                                <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e', display: 'inline-block' }} /> Plain
                            </Typography>
                            <IconButton color="inherit" onClick={() => setIsMapFullScreen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ ml: 4 }}>
                            <Button
                                variant={isDrawingMode ? "contained" : "outlined"}
                                color={isDrawingMode ? "success" : "inherit"}
                                startIcon={isDrawingMode ? <CheckCircleIcon /> : <GestureIcon />}
                                onClick={() => {
                                    if (isDrawingMode) {
                                        finishManualDrawing();
                                    } else {
                                        setIsDrawingMode(true);
                                        setDrawingPoints([]);
                                        setNewArea(null);
                                    }
                                }}
                                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, bgcolor: isDrawingMode ? 'white' : 'transparent', color: isDrawingMode ? 'success.main' : 'inherit', '&:hover': { bgcolor: isDrawingMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)' } }}
                            >
                                {isDrawingMode ? 'Finish & Classify' : 'Manual Drawing Tool'}
                            </Button>
                            {isDrawingMode && (
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    startIcon={<ClearIcon />}
                                    onClick={() => {
                                        setIsDrawingMode(false);
                                        setDrawingPoints([]);
                                    }}
                                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </Stack>
                    </Toolbar>
                </AppBar>
                <Box sx={{ flex: 1, height: 'calc(100vh - 64px)', position: 'relative', bgcolor: 'background.paper' }}>
                    {/* Error/Success Alerts in Full Screen */}
                    {(error || success) && (
                        <Box sx={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1100, width: '80%', maxWidth: 500 }}>
                            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: '16px', boxShadow: 4 }}>{error}</Alert>}
                            {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ borderRadius: '16px', boxShadow: 4 }}>{success}</Alert>}
                        </Box>
                    )}

                    {isLoaded && (
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={defaultCenter}
                            zoom={8}
                            onLoad={(map) => setMap(map)}
                            onClick={handleMapClick}
                            options={{
                                styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
                                disableDefaultUI: false,
                                mapTypeControl: true,
                                streetViewControl: true,
                                fullscreenControl: true,
                            }}
                        >


                            {/* Manual Drawing Points & Lines (Full Screen) */}
                            {isDrawingMode && drawingPoints.map((point, index) => (
                                <Marker 
                                    key={`draw-fs-${index}`} 
                                    position={point} 
                                    label={{ 
                                        text: `${index + 1}`, 
                                        color: 'white', 
                                        fontWeight: '800', 
                                        fontSize: '14px' 
                                    }}
                                    onClick={() => deleteDrawingPoint(index)}
                                />
                            ))}
                            {isDrawingMode && drawingPoints.length > 1 && (
                                <Polyline 
                                    path={drawingPoints} 
                                    options={{ 
                                        strokeColor: '#3b82f6', 
                                        strokeWeight: 3,
                                        strokeOpacity: 0.8,
                                        geodesic: true
                                    }} 
                                />
                            )}
                            {/* Temporary polygon being edited (Full Screen) */}
                            {newArea && newArea.type === 'polygon' && (
                                <React.Fragment>
                                    <Polygon
                                        paths={newArea.paths}
                                        options={{
                                            fillColor: 'rgba(59, 130, 246, 0.2)',
                                            strokeColor: '#3b82f6',
                                            strokeWeight: 2,
                                            zIndex: 10
                                        }}
                                    />
                                    {newArea.paths.map((point: any, index: number) => (
                                        <Marker 
                                            key={`edit-fs-${index}`} 
                                            position={point} 
                                            label={{ 
                                                text: '✕', 
                                                color: 'white', 
                                                fontWeight: 'bold', 
                                                fontSize: '16px' 
                                            }}
                                            title="Click to remove point"
                                            onClick={() => deleteAreaPoint(index)}
                                            zIndex={20}
                                        />
                                    ))}
                                </React.Fragment>
                            )}
                            {classifiedAreas.map((area) => (
                                <React.Fragment key={area.id}>
                                    {(!area.shapeType || area.shapeType === 'circle') ? (
                                        <Circle
                                            center={area.center}
                                            radius={area.radius}
                                            options={{
                                                fillColor: area.type === 'Mountain' ? '#8b5cf6' : '#22c55e',
                                                fillOpacity: 0.35,
                                                strokeColor: area.type === 'Mountain' ? '#8b5cf6' : '#22c55e',
                                                strokeWeight: 2,
                                                clickable: true,
                                            }}
                                            onClick={() => {
                                                if (window.confirm(`Delete this ${area.type} area?`)) {
                                                    deleteClassifiedArea(area.id);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <Polygon
                                            paths={area.paths}
                                            options={{
                                                fillColor: area.type === 'Mountain' ? '#8b5cf6' : '#22c55e',
                                                fillOpacity: 0.35,
                                                strokeColor: area.type === 'Mountain' ? '#8b5cf6' : '#22c55e',
                                                strokeWeight: 2,
                                                clickable: true,
                                            }}
                                            onClick={() => {
                                                if (window.confirm(`Delete this ${area.type} area?`)) {
                                                    deleteClassifiedArea(area.id);
                                                }
                                            }}
                                        />
                                    )}
                                    {/* Label Marker for Saved Areas (Full Screen) */}
                                    <Marker 
                                        position={(!area.shapeType || area.shapeType === 'circle') ? area.center : getPolygonCentroid(area.paths)}
                                        label={{
                                            text: area.type,
                                            color: area.type === 'Mountain' ? '#8b5cf6' : '#22c55e',
                                            fontWeight: 'bold',
                                            fontSize: '12px'
                                        }}
                                        options={{
                                            icon: {
                                                path: google.maps.SymbolPath.CIRCLE,
                                                scale: 0 // Hide the icon, show only label
                                            }
                                        }}
                                    />
                                </React.Fragment>
                            ))}
                        </GoogleMap>
                    )}

                </Box>
            </Dialog>
        </React.Fragment>
    );
};

export default ProvinceManagePage;

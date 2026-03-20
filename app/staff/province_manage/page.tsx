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
} from '@mui/icons-material';
import { API_ENDPOINTS } from '@/config/api';

const SRI_LANKA_PROVINCES = [
    'Western', 'Central', 'Southern', 'North Western', 
    'Sabaragamuwa', 'North Central', 'Uva', 'Eastern', 'Northern'
];

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    InputAdornment,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    Percent as PercentIcon,
} from '@mui/icons-material';

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
                    setBlockedProvinces(data.blockedProvinces);
                }
                if (data.provinceAdjustments !== undefined) {
                    setProvinceAdjustments(data.provinceAdjustments);
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
        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
            {/* Header Section */}
            <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 1, color: 'text.primary' }}>
                        Province Access Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Control vehicle availability and starting location access across Sri Lanka
                    </Typography>
                </Box>
            </Box>

            {/* Error/Success Alerts */}
            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 4, borderRadius: '16px' }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 4, borderRadius: '16px' }}>{success}</Alert>}

            {/* Main Content Section */}
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
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '16px', 
                        bgcolor: 'rgba(139, 92, 246, 0.1)', 
                        color: '#8b5cf6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.1)'
                    }}>
                        <LocationCityIcon fontSize="large" />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.02em', color: 'text.primary' }}>
                            Province-Based Starting Point Access
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" color="text.secondary">Activate or deactivate pickup locations province-wise</Typography>
                            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                            <Typography variant="body2" color="#8b5cf6" fontWeight="600">Sri Lanka All Provinces</Typography>
                        </Stack>
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: 2.5,
                    }}
                >
                    {SRI_LANKA_PROVINCES.map((province) => {
                        const isBlocked = blockedProvinces.includes(province);
                        return (
                            <Paper
                                key={province}
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    borderRadius: '18px',
                                    border: '1px solid',
                                    borderColor: isBlocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                    background: isBlocked 
                                        ? 'rgba(239, 68, 68, 0.02)' 
                                        : 'rgba(16, 185, 129, 0.02)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: isBlocked 
                                            ? '0 8px 16px rgba(239, 68, 68, 0.08)' 
                                            : '0 8px 16px rgba(16, 185, 129, 0.08)',
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="800" color="text.primary">{province} Province</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            <Box sx={{ 
                                                width: 8, 
                                                height: 8, 
                                                borderRadius: '50%', 
                                                bgcolor: isBlocked ? '#ef4444' : '#10b981',
                                                boxShadow: `0 0 8px ${isBlocked ? '#ef4444' : '#10b981'}`
                                            }} />
                                            <Typography variant="caption" sx={{ color: isBlocked ? '#ef4444' : '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {isBlocked ? 'Deactivated' : 'Activated'}
                                            </Typography>
                                            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled', mx: 0.5 }} />
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: (provinceAdjustments[province] || 0) > 0 ? '#ef4444' : (provinceAdjustments[province] || 0) < 0 ? '#10b981' : 'text.disabled' }}>
                                                {(provinceAdjustments[province] || 0) > 0 ? `+${provinceAdjustments[province]}%` : `${provinceAdjustments[province] || 0}%`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <MapIcon sx={{ color: isBlocked ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)', fontSize: '2rem' }} />
                                </Box>

                                <Stack direction="row" spacing={1.5}>
                                    <Button
                                        variant={isBlocked ? "outlined" : "contained"}
                                        color={isBlocked ? "primary" : "success"}
                                        size="small"
                                        onClick={() => toggleProvince(province)}
                                        disabled={updatingSettings}
                                        sx={{ 
                                            borderRadius: '12px', 
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            flex: 1,
                                            py: 1,
                                            bgcolor: isBlocked ? 'transparent' : '#10b981',
                                            color: isBlocked ? 'primary.main' : '#fff',
                                            borderColor: isBlocked ? 'primary.main' : 'transparent',
                                            '&:hover': {
                                                bgcolor: isBlocked ? 'rgba(59, 130, 246, 0.05)' : '#059669',
                                            }
                                        }}
                                    >
                                        {isBlocked ? 'Activate' : 'Deactivate'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="info"
                                        size="small"
                                        onClick={() => openAdjustmentDialog(province)}
                                        disabled={updatingSettings}
                                        sx={{ 
                                            borderRadius: '12px', 
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            px: 2,
                                            minWidth: 'auto',
                                            borderColor: 'rgba(92, 139, 246, 0.3)',
                                            '&:hover': {
                                                borderColor: '#3b82f6',
                                                bgcolor: 'rgba(59, 130, 246, 0.05)'
                                            }
                                        }}
                                        title="Adjust Rate"
                                    >
                                        <TrendingUpIcon />
                                    </Button>
                                </Stack>
                                
                                {isBlocked && (
                                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <ErrorOutlineIcon sx={{ fontSize: '0.9rem', color: '#64748b' }} />
                                        <Typography variant="caption" color="text.secondary">Low vehicle availability</Typography>
                                    </Box>
                                )}
                            </Paper>
                        );
                    })}
                </Box>
            </Paper>
            <Divider sx={{ my: 4 }} />
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    * Changes made here will affect customer booking experience in real-time.
                </Typography>
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
        </Box>
    );
};

export default ProvinceManagePage;

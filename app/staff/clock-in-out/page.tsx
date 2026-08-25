'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Container,
    Alert,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Lock, Eye, EyeOff, UserCheck, Clock, CheckCircle, MapPin, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '@/config/api';

export default function ClockInOutPage() {
    const [eNo, setENo] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [locationStatus, setLocationStatus] = useState('');
    const [isAlreadyClockedIn, setIsAlreadyClockedIn] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [clockStatus, setClockStatus] = useState<{ isClockedIn: boolean; time: string | null }>({
        isClockedIn: false,
        time: null,
    });

    // Helper to request device GPS coordinates via HTML5 Geolocation
    const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser. Please use a modern browser.'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (err) => {
                    let msg = 'Failed to retrieve location.';
                    if (err.code === err.PERMISSION_DENIED) {
                        msg = 'Location permission denied! You must grant browser location access to Clock In / Out at the office.';
                    } else if (err.code === err.POSITION_UNAVAILABLE) {
                        msg = 'GPS location unavailable. Please make sure location services are turned on.';
                    } else if (err.code === err.TIMEOUT) {
                        msg = 'Location request timed out. Please try again.';
                    }
                    reject(new Error(msg));
                },
                { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
            );
        });
    };

    // Auto-fill logged-in user eNo if available in localStorage
    useEffect(() => {
        try {
            const userStr = localStorage.getItem('staffUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.eNo) setENo(user.eNo);
            }
            const savedClockStatus = localStorage.getItem('staff_clock_status');
            if (savedClockStatus) {
                const parsed = JSON.parse(savedClockStatus);
                setClockStatus(parsed);
                if (parsed.isClockedIn) setIsAlreadyClockedIn(true);
            }
        } catch (e) {
            console.error('Error reading saved clock status:', e);
        }
    }, []);

    // Check status dynamically when E NO is entered
    useEffect(() => {
        if (!eNo.trim()) {
            setIsAlreadyClockedIn(false);
            return;
        }

        const checkStatus = async () => {
            try {
                const res = await fetch(`${API_ENDPOINTS.AUTH}/clock-status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eNo: eNo.trim() }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setIsAlreadyClockedIn(data.isClockedIn);
                }
            } catch (e) { }
        };

        const timer = setTimeout(checkStatus, 300);
        return () => clearTimeout(timer);
    }, [eNo]);

    const handleClockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLocationStatus('');

        if (!eNo.trim()) {
            setError('Please enter your E NO');
            return;
        }

        if (!password) {
            setError('Please enter your password');
            return;
        }

        setLoading(true);
        setLocationStatus('📍 Verifying office location...');

        try {
            // Get GPS coordinates from browser
            const coords = await getCurrentLocation();

            const endpoint = isAlreadyClockedIn ? `${API_ENDPOINTS.AUTH}/clock-out` : `${API_ENDPOINTS.AUTH}/clock-in`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eNo: eNo.trim(),
                    password,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Action failed');
            }

            const nextClockedIn = !isAlreadyClockedIn;
            setIsAlreadyClockedIn(nextClockedIn);

            const newStatus = {
                isClockedIn: nextClockedIn,
                time: data.record?.clockInTime || data.record?.clockOutTime || new Date().toLocaleTimeString()
            };
            localStorage.setItem('staff_clock_status', JSON.stringify(newStatus));
            setClockStatus(newStatus);
            setSuccessMessage(data.message || (nextClockedIn ? `Successfully Clocked In as ${data.record?.name}!` : `Successfully Clocked Out as ${data.record?.name}!`));
            setPassword('');
        } catch (err: any) {
            setError(err.message || 'Action failed');
        } finally {
            setLoading(false);
            setLocationStatus('');
        }
    };

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 70px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                padding: 3,
            }}
        >
            <Container maxWidth="sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, sm: 5 },
                            borderRadius: 4,
                            bgcolor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
                            color: '#1e293b',
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    background: isAlreadyClockedIn
                                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    mb: 2,
                                    boxShadow: isAlreadyClockedIn
                                        ? '0 10px 15px -3px rgba(239, 68, 68, 0.3)'
                                        : '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <Clock color="#ffffff" size={32} />
                            </Box>
                            <Typography variant="h4" fontWeight="800" sx={{ color: '#1e293b', letterSpacing: '-0.02em' }} gutterBottom>
                                Clock in /out
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 1.5 }}>
                                {isAlreadyClockedIn
                                    ? 'You are currently clocked in. Enter password to clock out.'
                                    : 'Welcome back! Please enter your details.'}
                            </Typography>
                            
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: 3, bgcolor: '#e0f2fe', border: '1px solid #bae6fd' }}>
                                <MapPin size={16} color="#0284c7" />
                                <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 700, fontSize: '0.78rem' }}>
                                    Office Location Verification Active
                                </Typography>
                            </Box>
                        </Box>

                        {locationStatus && (
                            <Alert severity="info" icon={<MapPin size={20} />} sx={{ mb: 3, borderRadius: 2 }}>
                                {locationStatus}
                            </Alert>
                        )}

                        {successMessage && (
                            <Alert
                                severity="success"
                                icon={<CheckCircle size={20} />}
                                sx={{ mb: 3, borderRadius: 2 }}
                                onClose={() => setSuccessMessage('')}
                            >
                                {successMessage}
                            </Alert>
                        )}

                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {clockStatus.isClockedIn && (
                            <Box
                                sx={{
                                    mb: 3,
                                    p: 2,
                                    borderRadius: 2,
                                    backgroundColor: '#ecfdf5',
                                    border: '1px solid #a7f3d0',
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ color: '#047857', fontWeight: 600 }}>
                                    Active Session: Clocked In at {clockStatus.time}
                                </Typography>
                            </Box>
                        )}

                        <form onSubmit={handleClockSubmit}>
                            <TextField
                                fullWidth
                                label="E NO"
                                variant="outlined"
                                margin="normal"
                                value={eNo}
                                onChange={(e) => setENo(e.target.value)}
                                required
                                placeholder="Enter E NO (e.g. E150)"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <UserCheck size={20} color="#64748b" />
                                        </InputAdornment>
                                    ),
                                    sx: { color: '#1e293b', backgroundColor: '#f8fafc', borderRadius: 2 },
                                }}
                                InputLabelProps={{ sx: { color: '#475569', fontWeight: 500 } }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#cbd5e1' },
                                        '&:hover fieldset': { borderColor: '#94a3b8' },
                                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                    },
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                margin="normal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock size={20} color="#64748b" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ color: '#64748b' }}
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { color: '#1e293b', backgroundColor: '#f8fafc', borderRadius: 2 },
                                }}
                                InputLabelProps={{ sx: { color: '#475569', fontWeight: 500 } }}
                                sx={{
                                    mb: 3.5,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#cbd5e1' },
                                        '&:hover fieldset': { borderColor: '#94a3b8' },
                                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                    },
                                }}
                            />

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 2.5,
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    background: isAlreadyClockedIn
                                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    color: '#ffffff',
                                    boxShadow: isAlreadyClockedIn
                                        ? '0 4px 14px 0 rgba(239, 68, 68, 0.39)'
                                        : '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
                                    '&:hover': {
                                        background: isAlreadyClockedIn
                                            ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                                            : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                    },
                                }}
                            >
                                {isAlreadyClockedIn ? 'Clock Out' : 'Clock In'}
                            </Button>
                        </form>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
}

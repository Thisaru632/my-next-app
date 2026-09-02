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
import { Lock, Eye, EyeOff, UserCheck, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '@/config/api';

const getDeviceLocation = (): Promise<{ success: boolean; location: string; error?: string }> => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            resolve({
                success: false,
                location: '',
                error: 'Location services are not supported by your browser.',
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        const address = data.display_name || data.address?.suburb || data.address?.city || data.address?.town || '';
                        if (address) {
                            const shortAddress = address.split(',').slice(0, 3).join(',').trim();
                            resolve({
                                success: true,
                                location: `${shortAddress} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
                            });
                            return;
                        }
                    }
                } catch (e) {
                    console.warn('Reverse geocoding failed:', e);
                }
                resolve({
                    success: true,
                    location: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`,
                });
            },
            (error) => {
                console.warn('Geolocation error:', error);
                let msg = 'Location access is required. Please turn on location services on your device to clock in or out.';
                if (error.code === error.PERMISSION_DENIED) {
                    msg = 'Location permission denied. Please allow location access in your browser settings to clock in or out.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    msg = 'Position unavailable. Please turn on GPS / location services on your device to clock in or out.';
                } else if (error.code === error.TIMEOUT) {
                    msg = 'Location request timed out. Please make sure location is turned on and try again.';
                }
                resolve({
                    success: false,
                    location: '',
                    error: msg,
                });
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
    });
};

export default function ClockInOutPage() {
    const [eNo, setENo] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAlreadyClockedIn, setIsAlreadyClockedIn] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [clockStatus, setClockStatus] = useState<{ isClockedIn: boolean; time: string | null }>({
        isClockedIn: false,
        time: null,
    });

    // Request location prompt on mount when entering page
    useEffect(() => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => {},
                (err) => {
                    if (err.code === err.PERMISSION_DENIED) {
                        setError('Location permission denied. Please enable location access to clock in or clock out.');
                    }
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }
    }, []);

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
                    if (data.isClockedIn && data.record) {
                        const rec = data.record;
                        const dateStr = rec.date ? ` (${rec.date})` : '';
                        const activeTime = rec.clockInTime ? `${rec.clockInTime}${dateStr}` : null;
                        const newStatus = { isClockedIn: true, time: activeTime };
                        setClockStatus(newStatus);
                        localStorage.setItem('staff_clock_status', JSON.stringify(newStatus));
                    } else if (!data.isClockedIn) {
                        const newStatus = { isClockedIn: false, time: null };
                        setClockStatus(newStatus);
                        localStorage.setItem('staff_clock_status', JSON.stringify(newStatus));
                    }
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

        if (!eNo.trim()) {
            setError('Please enter your E NO');
            return;
        }

        if (!password) {
            setError('Please enter your password');
            return;
        }

        setLoading(true);

        // Request & verify user location
        const locResult = await getDeviceLocation();
        if (!locResult.success) {
            setError(locResult.error || 'Location access is required. Please enable location on your device to clock in or out.');
            setLoading(false);
            return;
        }

        const location = locResult.location;

        const endpoint = isAlreadyClockedIn ? `${API_ENDPOINTS.AUTH}/clock-out` : `${API_ENDPOINTS.AUTH}/clock-in`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ eNo: eNo.trim(), password, location }),
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
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                {isAlreadyClockedIn
                                    ? 'You are currently clocked in. Enter password to clock out.'
                                    : 'Welcome back! Please enter your details.'}
                            </Typography>
                        </Box>

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

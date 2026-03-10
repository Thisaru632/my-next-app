'use client';

import React, { useState } from 'react';
import {
    Dialog,
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Link
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, User, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '@/config/api';
import { useUser } from '@/context/UserContext';

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'signup';
}

export default function AuthModal({ open, onClose, initialMode = 'login' }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useUser();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });

    // When the dialog opens/closes, reset state if needed
    React.useEffect(() => {
        if (open) {
            setMode(initialMode);
            setError('');
            setFormData({ name: '', email: '', password: '', phone: '' });
        }
    }, [open, initialMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = mode === 'login'
            ? `${API_ENDPOINTS.CUSTOMERS}/login`
            : `${API_ENDPOINTS.CUSTOMERS}/signup`;

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                // For signup we also get token, so we can just log them in
                login(data);
                onClose();
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    overflow: 'visible'
                }
            }}
            BackdropProps={{ sx: { backdropFilter: 'blur(5px)', background: 'rgba(0,0,0,0.4)' } }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
            >
                <Box
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        bgcolor: 'rgba(30, 41, 59, 1)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <IconButton
                        onClick={onClose}
                        sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}
                    >
                        <X size={20} />
                    </IconButton>

                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                bgcolor: '#0d9488',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto',
                                mb: 2,
                                boxShadow: '0 0 20px rgba(13, 148, 136, 0.5)'
                            }}
                        >
                            {mode === 'login' ? <LogIn color="white" size={28} /> : <UserPlus color="white" size={28} />}
                        </Box>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            {mode === 'login'
                                ? 'Log in to your account to request a booking.'
                                : 'Sign up for an account to manage your bookings and get special offers.'}
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        {mode === 'signup' && (
                            <AnimatePresence>
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <TextField
                                        fullWidth
                                        label="Name"
                                        name="name"
                                        variant="outlined"
                                        margin="normal"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <User size={20} color="rgba(255, 255, 255, 0.6)" />
                                                </InputAdornment>
                                            ),
                                            sx: { color: 'white' }
                                        }}
                                        InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.6)' } }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                                            }
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        name="phone"
                                        variant="outlined"
                                        margin="normal"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Phone size={20} color="rgba(255, 255, 255, 0.6)" />
                                                </InputAdornment>
                                            ),
                                            sx: { color: 'white' }
                                        }}
                                        InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.6)' } }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                                            }
                                        }}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        )}

                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            variant="outlined"
                            margin="normal"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Mail size={20} color="rgba(255, 255, 255, 0.6)" />
                                    </InputAdornment>
                                ),
                                sx: { color: 'white' }
                            }}
                            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.6)' } }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            margin="normal"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock size={20} color="rgba(255, 255, 255, 0.6)" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: { color: 'white' }
                            }}
                            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.6)' } }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                                }
                            }}
                        />

                        {mode === 'login' && (
                            <Box sx={{ textAlign: 'right', mt: 1 }}>
                                <Link
                                    href="/forgot-password"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        textDecoration: 'none',
                                        fontSize: '0.85rem',
                                        '&:hover': { color: 'rgba(255, 255, 255, 0.9)', textDecoration: 'underline' }
                                    }}
                                >
                                    Forgot Password?
                                </Link>
                            </Box>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 'bold',
                                textTransform: 'none',
                                fontSize: '1.05rem',
                                bgcolor: '#0d9488',
                                boxShadow: '0 4px 14px 0 rgba(13, 148, 136, 0.39)',
                                '&:hover': { bgcolor: '#0f766e' }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : (mode === 'login' ? 'Log In' : 'Sign Up')}
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                                <Link
                                    component="button"
                                    type="button"
                                    variant="body2"
                                    fontWeight="bold"
                                    onClick={() => {
                                        setMode(mode === 'login' ? 'signup' : 'login');
                                        setError('');
                                    }}
                                    sx={{ color: '#0d9488', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                >
                                    {mode === 'login' ? 'Sign Up' : 'Log In'}
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </Box>
            </motion.div>
        </Dialog>
    );
}

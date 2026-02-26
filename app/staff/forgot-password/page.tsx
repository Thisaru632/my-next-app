'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Container,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Link,
    Breadcrumbs
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, Key, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '@/config/api';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(`${API_ENDPOINTS.AUTH}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            setMessage(data.message);
            setStep(2);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_ENDPOINTS.AUTH}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            setStep(3);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                padding: 2
            }}
        >
            <Container maxWidth="sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper
                        elevation={24}
                        sx={{
                            p: { xs: 3, sm: 5 },
                            borderRadius: 4,
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white'
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                                        <Box sx={{
                                            width: 60, height: 60, bgcolor: 'primary.main', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 2,
                                            boxShadow: '0 0 20px rgba(37, 99, 235, 0.5)'
                                        }}>
                                            <Mail color="white" size={30} />
                                        </Box>
                                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                                            Forgot Password
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                            Enter your email address and we'll send you an OTP to reset your password.
                                        </Typography>
                                    </Box>

                                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                                    <form onSubmit={handleSendOTP}>
                                        <TextField
                                            fullWidth
                                            label="Email Address"
                                            variant="outlined"
                                            margin="normal"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
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
                                        <Button
                                            fullWidth
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={loading}
                                            sx={{ mt: 3, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                                        >
                                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
                                        </Button>
                                    </form>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <Box sx={{ mb: 4 }}>
                                        <IconButton onClick={() => setStep(1)} sx={{ color: 'white', mb: 2 }}>
                                            <ArrowLeft />
                                        </IconButton>
                                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                                            Reset Password
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                            We've sent an OTP to <strong>{email}</strong>. Please enter it below along with your new password.
                                        </Typography>
                                    </Box>

                                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
                                    {message && <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}

                                    <form onSubmit={handleResetPassword}>
                                        <TextField
                                            fullWidth
                                            label="OTP Code"
                                            variant="outlined"
                                            margin="normal"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            placeholder="6-digit code"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Key size={20} color="rgba(255, 255, 255, 0.6)" />
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
                                            label="New Password"
                                            type={showPassword ? 'text' : 'password'}
                                            variant="outlined"
                                            margin="normal"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Lock size={20} color="rgba(255, 255, 255, 0.6)" />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                            sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                                                        >
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
                                        <TextField
                                            fullWidth
                                            label="Confirm New Password"
                                            type={showPassword ? 'text' : 'password'}
                                            variant="outlined"
                                            margin="normal"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Lock size={20} color="rgba(255, 255, 255, 0.6)" />
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
                                        <Button
                                            fullWidth
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={loading}
                                            sx={{ mt: 3, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                                        >
                                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                                        </Button>
                                    </form>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Box sx={{
                                            width: 80, height: 80, bgcolor: 'success.main', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 3,
                                            boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)'
                                        }}>
                                            <CheckCircle2 color="white" size={40} />
                                        </Box>
                                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                                            Success!
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 4 }}>
                                            Your password has been reset successfully. You can now log in with your new password.
                                        </Typography>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            onClick={() => router.push('/staff/login')}
                                            sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                                        >
                                            Back to Login
                                        </Button>
                                    </Box>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {step !== 3 && (
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                    Remembered your password?{' '}
                                    <Link
                                        href="/staff/login"
                                        sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }}
                                    >
                                        Sign In
                                    </Link>
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
}

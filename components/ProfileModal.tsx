"use client";

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
    Tabs,
    Tab,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Alert,
    CircularProgress,
    Avatar,
    Divider,
    Fade,
    Grow
} from '@mui/material';
import {
    Close as CloseIcon,
    Person as PersonIcon,
    History as HistoryIcon,
    Save as SaveIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    DirectionsCar as CarIcon,
    Edit as EditIcon,
    Verified as VerifiedIcon,
    NoAccounts as NoAccountsIcon,
    CalendarToday as DateIcon,
    Logout as LogoutIcon,
    Lock as LockIcon,
    Security as SecurityIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { API_ENDPOINTS } from '@/config/api';
import { useUser } from '@/context/UserContext';

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
}

interface Booking {
    _id: string;
    customId: string;
    vehicleName: string;
    tripType: string;
    pickupLocation: string;
    dropoffLocation: string;
    dateTime: string;
    status: string;
    totalPrice?: number;
}

export default function ProfileModal({ open, onClose }: ProfileModalProps) {
    const { user, updateUser, logout } = useUser();
    const [tabValue, setTabValue] = useState(0);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [profileData, setProfileData] = useState({
        name: '',
        phone: ''
    });

    // Password Update Logic
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    useEffect(() => {
        if (open && tabValue === 1) {
            fetchBookings();
        }
    }, [open, tabValue]);

    const fetchBookings = async () => {
        const token = localStorage.getItem('customerToken');
        if (!token) return;

        setBookingsLoading(true);
        try {
            const res = await fetch(`${API_ENDPOINTS.BOOKINGS}/my-bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setBookingsLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const token = localStorage.getItem('customerToken');
        if (!token) {
            setError('Auth token expired. Log in again.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_ENDPOINTS.CUSTOMERS}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess('Your profile updated successfully!');
                updateUser({ name: data.name, phone: data.phone });
                setEditing(false);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message || 'Verification Error');
            }
        } catch (err) {
            setError('Service error. Try later.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('The new passwords do not match.');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('customerToken');
        try {
            const res = await fetch(`${API_ENDPOINTS.CUSTOMERS}/update-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (res.ok) {
                setSuccess('Password changed successfully.');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setSuccess(''), 4000);
            } else {
                const data = await res.json();
                setError(data.message || 'Operation failed.');
            }
        } catch (err) {
            setError('Connection failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        onClose();
    };

    const getStatusStyles = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'confirmed' || s === 'completed') return { bg: '#e6fffa', color: '#047481', border: '#b2f5ea' };
        if (s === 'pending' || s === 'sent inquiry') return { bg: '#fffaf0', color: '#9c4221', border: '#feebc8' };
        if (s === 'cancelled' || s === 'rejected') return { bg: '#fff5f5', color: '#9b2c2c', border: '#feb2b2' };
        return { bg: '#f7fafc', color: '#4a5568', border: '#e2e8f0' };
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            TransitionComponent={Grow}
            PaperProps={{
                sx: { 
                    borderRadius: '24px', 
                    background: '#071d24',
                    border: '1px solid rgba(201, 169, 97, 0.3)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden'
                }
            }}
        >
            <Box sx={{ position: 'relative', height: '140px', background: 'linear-gradient(135deg, #071d24 0%, #0c3541 100%)', borderBottom: '1px solid rgba(201,169,97,0.2)' }}>
                <IconButton 
                    onClick={onClose} 
                    sx={{ position: 'absolute', top: 16, right: 16, color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                >
                    <CloseIcon />
                </IconButton>
                <Box sx={{ position: 'absolute', bottom: -40, left: 32, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                    <Avatar 
                        sx={{ 
                            width: 100, 
                            height: 100, 
                            border: '4px solid #071d24', 
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                            bgcolor: '#C9A961',
                            fontSize: '2.5rem',
                            fontWeight: 800,
                            fontFamily: "'Cormorant Garamond', serif"
                        }}
                    >
                        {user?.name?.charAt(0).toUpperCase() || <PersonIcon />}
                    </Avatar>
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="h5" fontWeight="800" sx={{ color: 'white', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                            {user?.name}
                        </Typography>
                        <Chip 
                            icon={<VerifiedIcon style={{ fontSize: '14px', color: '#C9A961' }} />}
                            label="Platinum Guest" 
                            size="small"
                            sx={{ bgcolor: 'rgba(201,169,97,0.15)', color: '#C9A961', fontWeight: 700, fontSize: '0.65rem', border: '1px solid rgba(201,169,97,0.3)' }}
                        />
                    </Box>
                </Box>
            </Box>

            <DialogContent sx={{ p: 0, mt: 6, bgcolor: '#071d24' }}>
                <Box sx={{ px: 4, pt: 2 }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={(_, v) => { setTabValue(v); setEditing(false); setError(''); setSuccess(''); }} 
                        sx={{ 
                            '& .MuiTabs-indicator': { bgcolor: '#C9A961' },
                            '& .MuiTab-root': { color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'none', minWidth: 'auto', px: { xs: 2, sm: 4 }, '&.Mui-selected': { color: '#C9A961' } }
                        }}
                    >
                        <Tab label="Personal Pool" />
                        <Tab label="Journey Archives" />
                        <Tab label="Security Hive" />
                    </Tabs>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                <Box sx={{ p: 4, minHeight: '400px' }}>
                    {tabValue === 0 && (
                        <Fade in={tabValue === 0}>
                            <Box component="form" onSubmit={handleUpdateProfile}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 4, mb: 4 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#C9A961', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block', letterSpacing: '1px' }}>Preferred Name</Typography>
                                        <TextField
                                            fullWidth
                                            variant="standard"
                                            disabled={!editing}
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            InputProps={{ 
                                                disableUnderline: !editing,
                                                sx: { color: 'white', fontSize: '1.2rem', fontWeight: 600, pb: 0.5, '& .MuiInput-input.Mui-disabled': { WebkitTextFillColor: 'white' } } 
                                            }}
                                            sx={{ '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.1)' } }}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#C9A961', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block', letterSpacing: '1px' }}>Member Email</Typography>
                                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, mt: 1 }}>{user?.email}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#C9A961', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block', letterSpacing: '1px' }}>Direct Line</Typography>
                                        <TextField
                                            fullWidth
                                            variant="standard"
                                            disabled={!editing}
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            InputProps={{ 
                                                disableUnderline: !editing,
                                                sx: { color: 'white', fontSize: '1.2rem', fontWeight: 600, pb: 0.5, '& .MuiInput-input.Mui-disabled': { WebkitTextFillColor: 'white' } } 
                                            }}
                                            sx={{ '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.1)' } }}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#C9A961', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block', letterSpacing: '1px' }}>Guest Rating</Typography>
                                        <Typography variant="body1" sx={{ color: '#C9A961', fontWeight: 700, mt: 1, letterSpacing: '2px' }}>★★★★★</Typography>
                                    </Box>
                                </Box>

                                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)', fontWeight: 600 }}>{error}</Alert>}
                                {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 600 }}>{success}</Alert>}

                                <Box sx={{ mt: 2, pt: 3, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Button
                                        onClick={handleLogout}
                                        startIcon={<LogoutIcon />}
                                        variant="text"
                                        sx={{ color: '#f43f5e', textTransform: 'none', fontWeight: 700 }}
                                    >
                                        Terminate Session
                                    </Button>

                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        {!editing ? (
                                            <Button
                                                variant="outlined"
                                                onClick={() => setEditing(true)}
                                                startIcon={<EditIcon />}
                                                sx={{ borderRadius: '12px', textTransform: 'none', borderColor: '#C9A961', color: '#C9A961', px: 4, py: 1, fontWeight: 700, '&:hover': { bgcolor: 'rgba(201,169,97,0.05)', borderColor: '#b19455' } }}
                                            >
                                                Modify Pool
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    onClick={() => { setEditing(false); setProfileData({ name: user?.name || '', phone: user?.phone || '' }); }}
                                                    sx={{ color: 'white', textTransform: 'none', fontWeight: 700 }}
                                                >
                                                    Discard
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    disabled={loading}
                                                    sx={{ borderRadius: '12px', textTransform: 'none', bgcolor: '#C9A961', color: '#071d24', fontWeight: 800, px: 5, py: 1, '&:hover': { bgcolor: '#b19455' } }}
                                                >
                                                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Lock Changes'}
                                                </Button>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Fade>
                    )}

                    {tabValue === 1 && (
                        <Fade in={tabValue === 1}>
                            <Box>
                                {bookingsLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                                        <CircularProgress sx={{ color: '#C9A961' }} />
                                    </Box>
                                ) : bookings.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 12, bgcolor: 'rgba(255,255,255,0.01)', borderRadius: '24px', border: '2px dashed rgba(255,255,255,0.05)' }}>
                                        <CarIcon sx={{ fontSize: 72, color: 'rgba(255,255,255,0.1)', mb: 3 }} />
                                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontFamily: "'Montserrat', sans-serif" }}>Your travel log is currently pristine.</Typography>
                                        <Button variant="contained" onClick={onClose} sx={{ mt: 4, bgcolor: '#C9A961', color: '#071d24', fontWeight: 800, px: 5, borderRadius: '12px' }}>Start Journey</Button>
                                    </Box>
                                ) : (
                                    <TableContainer sx={{ maxHeight: '440px', '&::-webkit-scrollbar': { width: '5px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '10px' } }}>
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow sx={{ '& th': { bgcolor: '#071d24', color: '#C9A961', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.65rem' } }}>
                                                    <TableCell>Reference</TableCell>
                                                    <TableCell>Details</TableCell>
                                                    <TableCell>Timeline</TableCell>
                                                    <TableCell align="right">Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {bookings.map((booking) => {
                                                    const styles = getStatusStyles(booking.status);
                                                    return (
                                                        <TableRow key={booking._id} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.03)', py: 2 } }}>
                                                            <TableCell sx={{ color: 'white', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '1px' }}>{booking.customId}</TableCell>
                                                            <TableCell>
                                                                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{booking.vehicleName}</Typography>
                                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{booking.pickupLocation} → {booking.dropoffLocation}</Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500, fontSize: '0.8rem' }}>{new Date(booking.dateTime).toLocaleDateString('en-GB')}</Typography>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Chip label={booking.status} size="small" sx={{ bgcolor: styles.bg, color: styles.color, fontWeight: 900, borderRadius: '4px', fontSize: '0.6rem', border: `1px solid ${styles.border}` }} />
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Box>
                        </Fade>
                    )}

                    {tabValue === 2 && (
                        <Fade in={tabValue === 2}>
                            <Box component="form" onSubmit={handleUpdatePassword} sx={{ maxWidth: '400px', mx: 'auto' }}>
                                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <SecurityIcon sx={{ color: '#C9A961', fontSize: '2.5rem' }} />
                                    <Typography variant="h6" fontWeight="800" sx={{ color: 'white', fontFamily: "'Cormorant Garamond', serif" }}>Member Authentication Logic</Typography>
                                </Box>

                                <Box sx={{ display: 'grid', gap: 3 }}>
                                    <TextField
                                        label="Current Secret Code"
                                        type={showPassword.current ? 'text' : 'password'}
                                        fullWidth
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })} sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                                    {showPassword.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            ),
                                            sx: { color: 'white', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }
                                        }}
                                        InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
                                        required
                                    />
                                    <TextField
                                        label="New Authentication Key"
                                        type={showPassword.new ? 'text' : 'password'}
                                        fullWidth
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })} sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                                    {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            ),
                                            sx: { color: 'white', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }
                                        }}
                                        InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
                                        required
                                    />
                                    <TextField
                                        label="Verify Authentication Key"
                                        type={showPassword.confirm ? 'text' : 'password'}
                                        fullWidth
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })} sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                                    {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            ),
                                            sx: { color: 'white', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }
                                        }}
                                        InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
                                        required
                                    />
                                </Box>

                                {error && <Alert severity="error" sx={{ mt: 3, borderRadius: '12px', bgcolor: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)', fontWeight: 600 }}>{error}</Alert>}
                                {success && <Alert severity="success" sx={{ mt: 3, borderRadius: '12px', bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 600 }}>{success}</Alert>}

                                <Box sx={{ mt: 4 }}>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        disabled={loading}
                                        sx={{ bgcolor: '#C9A961', color: '#071d24', fontWeight: 800, py: 1.5, borderRadius: '12px', fontSize: '1rem', '&:hover': { bgcolor: '#b19455' } }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Cycle Key'}
                                    </Button>
                                </Box>
                            </Box>
                        </Fade>
                    )}
                </Box>
            </DialogContent>
            
            <Box sx={{ p: 2.5, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '4px', fontStyle: 'italic' }}>
                    SENU TOURS — EXCELLENCE REDEFINED
                </Typography>
            </Box>
        </Dialog>
    );
}

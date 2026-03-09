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
    Avatar
} from '@mui/material';
import {
    Close as CloseIcon,
    Person,
    History,
    Save,
    Phone,
    Email,
    DirectionsCar
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
    const { user, updateUser } = useUser();
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
            setError('Authentication token missing. Please log in again.');
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
                setSuccess('Profile updated successfully!');
                updateUser({ name: data.name, phone: data.phone });
                setEditing(false);
            } else {
                setError(data.message || 'Update failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled':
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: '16px' } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
                <Typography variant="h5" fontWeight="700" color="primary">My Profile</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
                    <Tab icon={<Person />} label="Personal Details" iconPosition="start" />
                    <Tab icon={<History />} label="Booking History" iconPosition="start" />
                </Tabs>

                {tabValue === 0 && (
                    <Box component="form" onSubmit={handleUpdateProfile}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mb: 2 }}>
                                {user?.name?.charAt(0) || <Person />}
                            </Avatar>
                            <Typography variant="h6">{user?.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField
                                label="Full Name"
                                fullWidth
                                disabled={!editing}
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                InputProps={{ startAdornment: <Person color="action" sx={{ mr: 1 }} /> }}
                            />
                            <TextField
                                label="Phone Number"
                                fullWidth
                                disabled={!editing}
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                InputProps={{ startAdornment: <Phone color="action" sx={{ mr: 1 }} /> }}
                            />
                            <TextField
                                label="Email Address"
                                fullWidth
                                disabled
                                value={user?.email || ''}
                                InputProps={{ startAdornment: <Email color="action" sx={{ mr: 1 }} /> }}
                                helperText="Email cannot be changed."
                            />
                        </Box>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            {!editing ? (
                                <Button
                                    variant="outlined"
                                    onClick={() => setEditing(true)}
                                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                                >
                                    Edit Details
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="text"
                                        onClick={() => { setEditing(false); setProfileData({ name: user?.name || '', phone: user?.phone || '' }); }}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                                        sx={{ borderRadius: '8px', textTransform: 'none', px: 4 }}
                                    >
                                        Save Changes
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                )}

                {tabValue === 1 && (
                    <Box>
                        {bookingsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <CircularProgress />
                            </Box>
                        ) : bookings.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <DirectionsCar sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                <Typography color="text.secondary">No bookings found yet.</Typography>
                                <Button
                                    variant="contained"
                                    onClick={onClose}
                                    sx={{ mt: 2, borderRadius: '8px' }}
                                >
                                    Book Now
                                </Button>
                            </Box>
                        ) : (
                            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', borderRadius: '12px' }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f9fafb' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Vehicle</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Pickup</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bookings.map((booking) => (
                                            <TableRow key={booking._id} hover>
                                                <TableCell>{booking.customId || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="600">{booking.vehicleName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{booking.tripType}</Typography>
                                                </TableCell>
                                                <TableCell>{booking.pickupLocation}</TableCell>
                                                <TableCell>
                                                    {new Date(booking.dateTime).toLocaleDateString()}
                                                    <br />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={booking.status}
                                                        size="small"
                                                        color={getStatusColor(booking.status) as any}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

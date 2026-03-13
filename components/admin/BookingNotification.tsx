'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Snackbar, Alert, Button, Typography, Box } from '@mui/material';
import { API_ENDPOINTS } from '@/config/api';
import { useRouter } from 'next/navigation';
import { BookOnline as BookIcon } from '@mui/icons-material';

const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export default function BookingNotification() {
    const [open, setOpen] = useState(false);
    const [newBooking, setNewBooking] = useState<any>(null);
    const knownBookingIds = useRef<Set<string>>(new Set());
    const isFirstLoad = useRef(true);
    const [hasInteracted, setHasInteracted] = useState(false);
    const router = useRouter();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const handleInteraction = () => {
            setHasInteracted(true);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        // Initialize audio
        audioRef.current = new Audio(NOTIFICATION_SOUND_URL);

        const checkNewBookings = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.BOOKINGS);
                if (response.ok) {
                    const bookings = await response.json();

                    if (isFirstLoad.current) {
                        // On first load, just record existing IDs
                        bookings.forEach((b: any) => knownBookingIds.current.add(b._id));
                        isFirstLoad.current = false;
                    } else {
                        // Find any ID not in our set
                        const freshBookings = bookings.filter((b: any) => !knownBookingIds.current.has(b._id));

                        if (freshBookings.length > 0) {
                            const latest = freshBookings[0];
                            setNewBooking(latest);
                            setOpen(true);

                            // Play sound only if user has interacted
                            if (audioRef.current && hasInteracted) {
                                audioRef.current.play().catch(e => {
                                    if (e.name !== 'NotAllowedError') {
                                        console.error("Audio play failed:", e);
                                    }
                                });
                            }

                            // Add all fresh ones to known set
                            freshBookings.forEach((b: any) => knownBookingIds.current.add(b._id));
                        }
                    }
                }
            } catch (error) {
                // Silence "Failed to fetch" to avoid console noise when server is down
                if (error instanceof TypeError && error.message === 'Failed to fetch') return;
                console.error('Error checking for new bookings:', error);
            }
        };

        // Check every 30 seconds
        const interval = setInterval(checkNewBookings, 30000);

        // Initial check
        checkNewBookings();

        return () => {
            clearInterval(interval);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, [hasInteracted]);

    const handleClose = () => {
        setOpen(false);
    };

    const handleViewLeads = () => {
        router.push('/staff/leads');
        setOpen(false);
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={10000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Alert
                onClose={handleClose}
                severity="info"
                icon={<BookIcon />}
                sx={{
                    width: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    backgroundColor: '#ffffff',
                    color: '#1e293b',
                    border: '1px solid #e2e8f0',
                    '& .MuiAlert-icon': {
                        color: '#3b82f6',
                    },
                    '& .MuiAlert-message': {
                        width: '100%'
                    }
                }}
            >
                <Box sx={{ pr: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                        New Booking Lead!
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1.5, color: '#64748b' }}>
                        {newBooking?.name} has just requested a booking.
                    </Typography>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={handleViewLeads}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        }}
                    >
                        View Details
                    </Button>
                </Box>
            </Alert>
        </Snackbar>
    );
}

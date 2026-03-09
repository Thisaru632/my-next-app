"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import AuthModal from '@/components/AuthModal';

export default function SignupPage() {
    const [open, setOpen] = useState(true);
    const router = useRouter();

    const handleClose = () => {
        setOpen(false);
        router.push('/');
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0d9488 0%, #065f46 100%)'
        }}>
            <AuthModal open={open} onClose={handleClose} initialMode="signup" />
        </Box>
    );
}

"use client";

import React, { useState } from 'react';
import { Box, MenuItem, Select, TextField, InputAdornment, Typography } from '@mui/material';

const countryCodes = [
    { code: '+94', label: 'LK', name: 'Sri Lanka' },
    { code: '+91', label: 'IN', name: 'India' },
    { code: '+44', label: 'GB', name: 'United Kingdom' },
    { code: '+61', label: 'AU', name: 'Australia' },
    { code: '+971', label: 'AE', name: 'UAE' },
    { code: '+974', label: 'QA', name: 'Qatar' },
    { code: '+966', label: 'SA', name: 'Saudi Arabia' },
    { code: '+1', label: 'US', name: 'USA/Canada' },
    { code: '+49', label: 'DE', name: 'Germany' },
    { code: '+33', label: 'FR', name: 'France' },
    { code: '+960', label: 'MV', name: 'Maldives' },
    { code: '+7', label: 'RU', name: 'Russia' },
    { code: '+86', label: 'CN', name: 'China' },
    { code: '+65', label: 'SG', name: 'Singapore' },
    { code: '+60', label: 'MY', name: 'Malaysia' },
    { code: '+81', label: 'JP', name: 'Japan' },
    { code: '+39', label: 'IT', name: 'Italy' },
    { code: '+31', label: 'NL', name: 'Netherlands' },
    { code: '+41', label: 'CH', name: 'Switzerland' },
];

interface PhoneInputProps {
    value: string;
    onChange: (fullValue: string) => void;
    label?: string;
    error?: boolean;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    sx?: any;
    placeholder?: string;
    variant?: 'outlined' | 'standard' | 'filled';
    colorMode?: 'light' | 'dark';
}

export default function PhoneInput({
    value,
    onChange,
    label = "Phone Number",
    error,
    helperText,
    required,
    disabled,
    sx,
    placeholder = "Mobile Number",
    variant = "outlined",
    colorMode = 'light'
}: PhoneInputProps) {
    // Extract country code and actual number
    // We assume the first 2-5 characters might be the country code if it starts with +
    const [selectedCode, setSelectedCode] = useState(() => {
        if (value.startsWith('+')) {
            const found = countryCodes.find(c => value.startsWith(c.code));
            return found ? found.code : '+94';
        }
        return '+94';
    });

    const numberValue = value.startsWith(selectedCode) ? value.slice(selectedCode.length) : value;

    const handleCodeChange = (newCode: string) => {
        setSelectedCode(newCode);
        onChange(newCode + numberValue);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, ''); // Only numbers
        onChange(selectedCode + val);
    };

    const isDark = colorMode === 'dark';

    return (
        <TextField
            fullWidth
            label={label}
            variant={variant}
            required={required}
            disabled={disabled}
            error={error}
            helperText={helperText}
            value={numberValue}
            onChange={handleNumberChange}
            placeholder={placeholder}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Select
                            value={selectedCode}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            variant="standard"
                            disableUnderline
                            sx={{
                                mr: 1,
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: isDark ? 'white' : 'inherit',
                                '& .MuiSelect-select': {
                                    py: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                },
                                '& .MuiSvgIcon-root': {
                                    color: isDark ? 'rgba(255,255,255,0.7)' : 'inherit'
                                }
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        maxHeight: 300,
                                        bgcolor: isDark ? '#1a2a33' : 'white',
                                        color: isDark ? 'white' : 'inherit',
                                        '& .MuiMenuItem-root:hover': {
                                            bgcolor: isDark ? 'rgba(13,148,136,0.2)' : 'rgba(0,0,0,0.04)'
                                        }
                                    }
                                }
                            }}
                        >
                            {countryCodes.map((c) => (
                                <MenuItem key={c.code} value={c.code} sx={{ fontSize: '0.85rem' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" fontWeight={700} sx={{ minWidth: '35px' }}>{c.code}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.7 }}>({c.label})</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </InputAdornment>
                ),
                sx: { 
                    fontFamily: "'Montserrat', sans-serif", 
                    fontSize: '0.95rem',
                    color: isDark ? 'white' : 'inherit',
                    '& .MuiInputBase-input::placeholder': {
                        color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
                    }
                }
            }}
            InputLabelProps={{ 
                shrink: true,
                sx: { color: isDark ? 'rgba(255,255,255,0.6)' : 'inherit' } 
            }}
            sx={{
                ...sx,
                // Handle different variants if needed
            }}
        />
    );
}

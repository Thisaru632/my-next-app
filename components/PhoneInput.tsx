"use client";

import React, { useState } from 'react';
import { Box, MenuItem, TextField, InputAdornment, Typography, Autocomplete } from '@mui/material';

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
        const val = e.target.value.replace(/[^0-9]/g, '');
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
                        <Autocomplete
                            freeSolo
                            disableClearable
                            options={countryCodes}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') return option;
                                return `${option.code} ${option.label}`;
                            }}
                            value={selectedCode}
                            onInputChange={(event, newValue) => {
                                const cleanValue = newValue.split(' ')[0];
                                handleCodeChange(cleanValue.startsWith('+') ? cleanValue : '+' + cleanValue.replace(/[^0-9]/g, ''));
                            }}
                            onChange={(event, newValue) => {
                                if (typeof newValue !== 'string' && newValue?.code) {
                                    handleCodeChange(newValue.code);
                                } else if (typeof newValue === 'string') {
                                    const codeOnly = newValue.split(' ')[0];
                                    handleCodeChange(codeOnly);
                                }
                            }}
                            renderOption={(props, option) => (
                                <MenuItem {...props} component="li">
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                                        <Typography variant="body2" fontWeight={800} sx={{ minWidth: '48px', color: '#0d9488' }}>{option.code}</Typography>
                                        <Typography variant="body2" fontWeight={800} sx={{ minWidth: '35px', color: '#1e293b' }}>{option.label}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 500, ml: 1 }}>— {option.name}</Typography>
                                    </Box>
                                </MenuItem>
                            )}
                            renderInput={(params) => {
                                const found = countryCodes.find(c => c.code === selectedCode);
                                const displayValue = found ? `${found.code} ${found.label}` : selectedCode;
                                
                                return (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        placeholder="+94"
                                        inputProps={{
                                            ...params.inputProps,
                                            value: displayValue
                                        }}
                                        InputProps={{
                                            ...params.InputProps,
                                            disableUnderline: true,
                                            sx: {
                                                width: found ? 115 : 95,
                                                height: '40px',
                                                fontSize: '0.95rem',
                                                fontWeight: 700,
                                                color: isDark ? 'white' : '#0d9488',
                                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(13,148,136,0.03)',
                                                borderRadius: '8px 0 0 8px',
                                                pl: 1.5,
                                                mr: 1.5,
                                                borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,148,136,0.1)'}`,
                                                '& input': {
                                                    padding: '0 !important',
                                                },
                                                '& .MuiAutocomplete-endAdornment': {
                                                    right: 0,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    '& .MuiIconButton-root': {
                                                        padding: '2px',
                                                        color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(13,148,136,0.5)'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                );
                            }}
                            sx={{
                                '& .MuiAutocomplete-inputRoot': {
                                    paddingRight: '24px !important'
                                }
                            }}
                            ListboxProps={{
                                sx: {
                                    maxHeight: 300,
                                    minWidth: 340, // Wider for the labels
                                    bgcolor: isDark ? '#1a2a33' : 'white',
                                    color: isDark ? 'white' : 'inherit',
                                    p: 1,
                                    '& .MuiAutocomplete-option': {
                                        borderRadius: '8px',
                                        mb: 0.5
                                    },
                                    '& .MuiAutocomplete-option[aria-selected="true"]': {
                                        bgcolor: isDark ? 'rgba(13,148,136,0.3) !important' : 'rgba(13,148,136,0.1) !important'
                                    },
                                    '& .MuiAutocomplete-option:hover': {
                                        bgcolor: isDark ? 'rgba(13,148,136,0.2)' : 'rgba(0,0,0,0.04)'
                                    }
                                }
                            }}
                        />
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
            }}
        />
    );
}

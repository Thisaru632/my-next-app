'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    IconButton,
    Divider,
    Stack,
    Tooltip,
    Chip,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    TableChart as TableChartIcon,
    CheckCircle as CheckCircleIcon,
    TrendingUp as TrendingUpIcon,
    Percent as PercentIcon,
    Assessment as AssessmentIcon,
} from '@mui/icons-material';

import { API_ENDPOINTS } from '@/config/api';

interface RateCardEntry {
    _id: string;
    type: string;
    vehicle: string;
    days: number;
    km: number;
    hrs: number;
    ratePercent: string;
    rateAmount: number;
    extraKMRate: number;
    extraHrRate1: number;
    extraHrRate2: number;
    status: string;
}

interface RateAdjustment {
    _id: string;
    vehicle: string;
    type: string;
    percentage: number;
    validFrom: string | null;
    validTo: string | null;
    lastUpdated: string;
}

const RateCardManagePage = () => {
    const [rateCards, setRateCards] = useState<RateCardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Filtering states
    const [kmFilter, setKmFilter] = useState('');
    const [vehicleFilter, setVehicleFilter] = useState('All'); // Assuming these exist elsewhere
    const [typeFilter, setTypeFilter] = useState('All'); // Assuming these exist elsewhere
    const [daysFilter, setDaysFilter] = useState('All');
    const [hrsFilter, setHrsFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState(''); // State for debounced search term

    // Pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    // Debounced search state
    const [searchInput, setSearchInput] = useState('');

    // Adjustment states
    const [adjustments, setAdjustments] = useState<RateAdjustment[]>([]);
    const [adjustValue, setAdjustValue] = useState<string>('');
    const [adjusting, setAdjusting] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [validFrom, setValidFrom] = useState<string>('');
    const [validTo, setValidTo] = useState<string>('');

    // Conflict states
    const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
    const [conflictMessage, setConflictMessage] = useState('');
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    
    // Global Settings states
    const [nightSurchargeEnabled, setNightSurchargeEnabled] = useState<boolean>(true);
    const [updatingSettings, setUpdatingSettings] = useState(false);

    const fetchRateCards = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_ENDPOINTS.RATE_CARDS);
            if (response.ok) {
                const data = await response.json();
                setRateCards(data);
            } else {
                setError('Failed to fetch rate card data');
            }
        } catch (err) {
            console.error('Error fetching rate cards:', err);
            setError('An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAdjustments = async () => {
        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/adjust`);
            if (response.ok) {
                const data = await response.json();
                setAdjustments(data);
            }
        } catch (err) {
            console.error('Error fetching adjustments:', err);
        }
    };

    const fetchGlobalSettings = async () => {
        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/settings`);
            if (response.ok) {
                const data = await response.json();
                if (data.nightSurchargeEnabled !== undefined) {
                    setNightSurchargeEnabled(data.nightSurchargeEnabled);
                }
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(searchInput);
            setPage(0); // Reset to first page on search
        }, 300);
        return () => clearTimeout(handler);
    }, [searchInput]);

    useEffect(() => {
        fetchRateCards();
        fetchAdjustments();
        fetchGlobalSettings();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if it's a CSV
        if (!file.name.endsWith('.csv')) {
            setError('Please upload a valid CSV file');
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                setSuccess(`Successfully uploaded ${result.count} rate card entries.`);
                fetchRateCards();
            } else {
                const errData = await response.json();
                setError(errData.message || 'Failed to upload CSV');
            }
        } catch (err) {
            console.error('Error uploading file:', err);
            setError('An error occurred during upload');
        } finally {
            setUploading(false);
            // Reset input
            event.target.value = '';
        }
    };

    const clearRateCard = async () => {
        if (!confirm('Are you sure you want to clear all rate card data? This action cannot be undone.')) return;

        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.RATE_CARDS, {
                method: 'DELETE',
            });

            if (response.ok) {
                setSuccess('Rate card cleared successfully');
                setRateCards([]);
            } else {
                setError('Failed to clear rate card');
            }
        } catch (err) {
            setError('An error occurred while clearing data');
        } finally {
            setLoading(false);
        }
    };

    // Memoized filter logic to prevent lag during typing
    const filteredRateCards = useMemo(() => {
        return rateCards.filter(card => {
            const matchesSearch = card.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                card.type.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesVehicle = vehicleFilter === 'All' || card.vehicle === vehicleFilter;
            const matchesType = typeFilter === 'All' || card.type === typeFilter;
            const matchesDays = daysFilter === 'All' || card.days.toString() === daysFilter;
            const matchesHrs = hrsFilter === 'All' || card.hrs.toString() === hrsFilter;
            const matchesKm = kmFilter === '' || card.km.toString().includes(kmFilter);

            return matchesSearch && matchesVehicle && matchesType && matchesDays && matchesHrs && matchesKm;
        });
    }, [rateCards, searchTerm, vehicleFilter, typeFilter, daysFilter, hrsFilter, kmFilter]);

    // Paginated data
    const paginatedRateCards = useMemo(() => {
        return filteredRateCards.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredRateCards, page, rowsPerPage]);

    // Extract unique options for filters
    const uniqueVehicles = Array.from(new Set(rateCards.map(c => c.vehicle))).sort();
    const uniqueTypes = Array.from(new Set(rateCards.map(c => c.type))).sort();
    const uniqueDays = Array.from(new Set(rateCards.map(c => c.days.toString()))).sort((a, b) => parseInt(a) - parseInt(b));
    const uniqueHrs = Array.from(new Set(rateCards.map(c => c.hrs.toString()))).sort((a, b) => parseInt(a) - parseInt(b));

    const resetFilters = () => {
        setSearchInput('');
        setSearchTerm('');
        setVehicleFilter('All');
        setTypeFilter('All');
        setDaysFilter('All');
        setHrsFilter('All');
        setKmFilter('');
        setPage(0);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleBulkAdjust = async () => {
        if (!adjustValue || isNaN(parseFloat(adjustValue))) {
            setError('Please enter a valid percentage (e.g. 5 or -5)');
            return;
        }

        const newVehicle = vehicleFilter;
        const newType = typeFilter;

        // Conflict check: If adding a broader rule (Type = 'All') for the same vehicle scope
        if (newType === 'All') {
            const conflicts = adjustments.filter(adj =>
                adj.vehicle === newVehicle && adj.type !== 'All'
            );

            if (conflicts.length > 0) {
                const confNames = conflicts.map(c => `${c.percentage}% for ${c.vehicle} ${c.type}`).join(', ');
                setConflictMessage(`Remove previously added ${confNames} and apply newly added ${newVehicle === 'All' ? 'All Vehicle' : newVehicle} All rate?`);
                setIdsToDelete(conflicts.map(c => c._id));
                setConflictDialogOpen(true);
                return;
            }
        }

        setOpenConfirmDialog(true);
    };

    const handleConfirmAdjust = async () => {
        setOpenConfirmDialog(false);
        setConflictDialogOpen(false);
        setAdjusting(true);
        setError(null);
        setSuccess(null);

        try {
            // Delete conflicting IDs if any
            if (idsToDelete.length > 0) {
                await Promise.all(idsToDelete.map(id =>
                    fetch(`${API_ENDPOINTS.RATE_CARDS}/adjust/${id}`, { method: 'DELETE' })
                ));
                setIdsToDelete([]); // Clear after deletion
            }

            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/adjust`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    percentage: parseFloat(adjustValue),
                    vehicle: vehicleFilter,
                    type: typeFilter,
                    validFrom: validFrom || null,
                    validTo: validTo || null
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setSuccess(result.message);
                setAdjustValue('');
                setValidFrom('');
                setValidTo('');
                fetchAdjustments(); // Refresh adjustment table
            } else {
                const errData = await response.json();
                setError(errData.message || 'Failed to update adjustment');
            }
        } catch (err) {
            setError('An error occurred during adjustment');
        } finally {
            setAdjusting(false);
        }
    };

    const handleResetAdjustment = async (id: string) => {
        if (!confirm('Are you sure you want to reset this adjustment to 0%?')) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/adjust/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setSuccess('Adjustment reset successfully');
                fetchAdjustments();
            } else {
                setError('Failed to reset adjustment');
            }
        } catch (err) {
            setError('An error occurred while resetting');
        } finally {
            setLoading(false);
        }
    };

    const toggleNightSurcharge = async () => {
        setUpdatingSettings(true);
        const newValue = !nightSurchargeEnabled;
        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'nightSurchargeEnabled',
                    value: newValue,
                    description: 'Whether to apply night surcharge (12AM - 4AM)'
                }),
            });

            if (response.ok) {
                setNightSurchargeEnabled(newValue);
                setSuccess(`Night surcharge ${newValue ? 'activated' : 'deactivated'} successfully`);
            } else {
                setError('Failed to update settings');
            }
        } catch (err) {
            setError('An error occurred while updating settings');
        } finally {
            setUpdatingSettings(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        console.log(`Attempting to update rate card ${id} to ${newStatus}`);

        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Update success:', data);
                setRateCards(prev => prev.map(card => card._id === id ? { ...card, status: newStatus } : card));
                setSuccess(`Rate card status updated to ${newStatus}`);
            } else {
                const errorData = await response.json();
                console.error('Update failed:', errorData);
                setError(errorData.message || 'Failed to update status');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('An error occurred while updating status. Please check if the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 0 }}>
            {/* Page Header */}
            <Box
                sx={{
                    mb: 4,
                    pb: 2,
                    borderBottom: '2px solid',
                    borderImage: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
                    borderImageSlice: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                        background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                    }}
                >
                    Rate Card Manage
                </Typography>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchRateCards}
                        disabled={loading}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={clearRateCard}
                        disabled={loading || rateCards.length === 0}
                        sx={{ borderRadius: '10px', textTransform: 'none', bgcolor: '#ef4444' }}
                    >
                        Clear All
                    </Button>
                </Stack>
            </Box>

            {/* Global Settings & Info Section */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
                <Paper
                    sx={{
                        p: 3,
                        flex: 1,
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid',
                        borderColor: 'divider',
                        background: (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(30, 41, 59, 0.5)' 
                            : 'rgba(248, 250, 252, 0.5)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                            p: 1.5, 
                            borderRadius: '12px', 
                            bgcolor: nightSurchargeEnabled ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                            color: nightSurchargeEnabled ? 'primary.main' : 'text.disabled'
                        }}>
                             <TrendingUpIcon />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight="700">Night Surcharge</Typography>
                            <Typography variant="body2" color="text.secondary">Apply extra charges during 12AM - 4AM</Typography>
                        </Box>
                    </Box>
                    <Button
                        variant={nightSurchargeEnabled ? "contained" : "outlined"}
                        color={nightSurchargeEnabled ? "primary" : "inherit"}
                        onClick={toggleNightSurcharge}
                        disabled={updatingSettings}
                        sx={{ 
                            borderRadius: '12px', 
                            textTransform: 'none',
                            minWidth: '120px',
                            fontWeight: 700,
                            boxShadow: nightSurchargeEnabled ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                        }}
                    >
                        {updatingSettings ? <CircularProgress size={20} /> : (nightSurchargeEnabled ? 'Activate' : 'Deactivate')}
                    </Button>
                </Paper>

                <Paper
                    sx={{
                        p: 3,
                        flex: 1,
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        background: (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(30, 41, 59, 0.5)' 
                            : 'rgba(248, 250, 252, 0.5)',
                    }}
                >
                    <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '12px', 
                        bgcolor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981'
                    }}>
                         <CheckCircleIcon />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="700">Rate Card Status</Typography>
                        <Typography variant="body2" color="text.secondary">{rateCards.length} packages currently approved</Typography>
                    </Box>
                </Paper>
            </Stack>

            {/* Upload Section */}
            <Paper
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: '20px',
                    border: '2px dashed',
                    borderColor: 'divider',
                    textAlign: 'center',
                    bgcolor: 'rgba(59, 130, 246, 0.02)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'rgba(59, 130, 246, 0.05)',
                    },
                }}
            >
                <Box sx={{ mb: 2 }}>
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1, opacity: 0.8 }} />
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                        Upload Rate Card CSV
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Upload your rate card CSV file to populate the table. The header columns should match the rate card structure.
                    </Typography>

                    <Box sx={{
                        display: 'inline-block',
                        textAlign: 'left',
                        mx: 'auto',
                        mb: 3,
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'warning.light',
                        boxShadow: '0 4px 12px rgba(237, 108, 2, 0.05)'
                    }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'warning.main', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            ⚠️ CSV Upload Guidelines
                        </Typography>
                        <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                • <strong>Nano</strong> and <strong>SUV</strong> must be removed from the rate card.
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                • Only <strong>100%</strong> rates are accepted.
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                • <strong>28h</strong>, <strong>52h</strong>, and <strong>76h</strong> packages must be removed.
                            </Typography>
                        </Stack>
                    </Box>
                </Box>

                <input
                    accept=".csv"
                    style={{ display: 'none' }}
                    id="csv-upload-button"
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                />
                <label htmlFor="csv-upload-button">
                    <Button
                        variant="contained"
                        component="span"
                        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                        disabled={uploading}
                        sx={{
                            borderRadius: '12px',
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                        }}
                    >
                        {uploading ? 'Uploading...' : 'Select CSV File'}
                    </Button>
                </label>
            </Paper>

            {/* Filter Section (Moved up to define scope for both view and bulk adjustment) */}
            <Paper sx={{
                p: 2,
                mb: 3,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                backgroundImage: 'none'
            }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                    <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', md: '200px' } }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', textTransform: 'uppercase' }}>Search</Typography>
                        <input
                            placeholder="Search vehicle or type..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color, #cbd5e1)',
                                marginTop: '4px',
                                outline: 'none',
                                background: 'transparent',
                                color: 'inherit',
                                fontSize: '0.9rem',
                                fontFamily: 'inherit'
                            }}
                        />
                    </Box>

                    <Box sx={{ minWidth: '150px' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', textTransform: 'uppercase' }}>Vehicle</Typography>
                        <select
                            value={vehicleFilter}
                            onChange={(e) => {
                                setVehicleFilter(e.target.value);
                                setPage(0);
                            }}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color, #cbd5e1)',
                                marginTop: '4px',
                                outline: 'none',
                                background: 'transparent',
                                color: 'inherit',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                            }}
                        >
                            <option value="All" style={{ background: '#fff', color: '#000' }}>All Vehicles</option>
                            {uniqueVehicles.map(v => <option key={v} value={v} style={{ background: '#fff', color: '#000' }}>{v}</option>)}
                        </select>
                    </Box>

                    <Box sx={{ minWidth: '150px' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', textTransform: 'uppercase' }}>Type</Typography>
                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setPage(0);
                            }}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color, #cbd5e1)',
                                marginTop: '4px',
                                outline: 'none',
                                background: 'transparent',
                                color: 'inherit',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                            }}
                        >
                            <option value="All" style={{ background: '#fff', color: '#000' }}>All Types</option>
                            {uniqueTypes.map(t => <option key={t} value={t} style={{ background: '#fff', color: '#000' }}>{t}</option>)}
                        </select>
                    </Box>

                    <Box sx={{ minWidth: '100px' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', textTransform: 'uppercase' }}>Days</Typography>
                        <select
                            value={daysFilter}
                            onChange={(e) => {
                                setDaysFilter(e.target.value);
                                setPage(0);
                            }}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color, #cbd5e1)',
                                marginTop: '4px',
                                outline: 'none',
                                background: 'transparent',
                                color: 'inherit',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                            }}
                        >
                            <option value="All" style={{ background: '#fff', color: '#000' }}>All Days</option>
                            {uniqueDays.map(d => <option key={d} value={d} style={{ background: '#fff', color: '#000' }}>{d}</option>)}
                        </select>
                    </Box>

                    <Box sx={{ minWidth: '100px' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', textTransform: 'uppercase' }}>Hours</Typography>
                        <select
                            value={hrsFilter}
                            onChange={(e) => {
                                setHrsFilter(e.target.value);
                                setPage(0);
                            }}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color, #cbd5e1)',
                                marginTop: '4px',
                                outline: 'none',
                                background: 'transparent',
                                color: 'inherit',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                            }}
                        >
                            <option value="All" style={{ background: '#fff', color: '#000' }}>All Hours</option>
                            {uniqueHrs.map(h => <option key={h} value={h} style={{ background: '#fff', color: '#000' }}>{h}</option>)}
                        </select>
                    </Box>

                    <Box sx={{ minWidth: '100px' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', textTransform: 'uppercase' }}>KM Limit</Typography>
                        <input
                            type="text"
                            placeholder="e.g. 100"
                            value={kmFilter}
                            onChange={(e) => setKmFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color, #cbd5e1)',
                                marginTop: '4px',
                                outline: 'none',
                                background: 'transparent',
                                color: 'inherit',
                                fontSize: '0.9rem',
                                fontFamily: 'inherit'
                            }}
                        />
                    </Box>

                    <Button
                        size="small"
                        onClick={resetFilters}
                        sx={{ mt: { xs: 0, md: 2.5 }, textTransform: 'none', fontWeight: 600, color: 'text.disabled' }}
                    >
                        Reset
                    </Button>
                </Stack>
            </Paper>

            {/* Quick Price Adjustment Section (Premium Style) */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mb: 5,
                    borderRadius: '24px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(13, 148, 136, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(13, 148, 136, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '4px',
                        height: '100%',
                        background: 'linear-gradient(180deg, #0d9488 0%, #3b82f6 100%)',
                    }
                }}
            >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
                    <Box sx={{ flexGrow: 1 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                            <Box sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 16px rgba(13, 148, 136, 0.2)',
                                flexShrink: 0
                            }}>
                                <TrendingUpIcon sx={{ color: '#fff', fontSize: '1.8rem' }} />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                                    Bulk Price Adjustment
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
                                    Adjust rates for all packages matching current filters
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    <Box sx={{
                        p: 1.5,
                        borderRadius: '20px',
                        bgcolor: 'background.paper',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid',
                        borderColor: 'divider',
                        width: { xs: '100%', md: 'auto' }
                    }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ position: 'relative', width: '160px' }}>
                                <PercentIcon sx={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '1.2rem',
                                    color: '#0d9488',
                                    pointerEvents: 'none',
                                }} />
                                <input
                                    type="text"
                                    placeholder="e.g. 10 or -5"
                                    value={adjustValue}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
                                            setAdjustValue(val);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px 12px 38px',
                                        borderRadius: '12px',
                                        border: '1.5px solid var(--border-color, #cbd5e1)',
                                        background: 'transparent',
                                        color: 'inherit',
                                        fontWeight: 700,
                                        fontSize: '1.05rem',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.2s ease',
                                    }}
                                />
                            </Box>
                            <Button
                                variant="contained"
                                onClick={handleBulkAdjust}
                                disabled={adjusting || !adjustValue || filteredRateCards.length === 0}
                                sx={{
                                    background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
                                    color: '#ffffff !important',
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    px: 4,
                                    py: '14px',
                                    fontWeight: 700,
                                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
                                    '&:hover': {
                                        boxShadow: '0 6px 20px rgba(13, 148, 136, 0.35)',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                {adjusting ? <CircularProgress size={24} color="inherit" /> : 'Set Adjustment'}
                            </Button>
                        </Stack>
                    </Box>
                </Stack>

                {adjustValue && (
                    <Box sx={{
                        mt: 2,
                        ml: { xs: 0, md: 9 },
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                    }}>
                        <Typography variant="body2" sx={{ color: '#1e40af', fontWeight: 600 }}>
                            Preview:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4b5563', lineHeight: 1.4 }}>
                            Applying a persistent <strong style={{ color: '#0d9488' }}>{adjustValue}%</strong> adjustment for <strong style={{ color: '#1e293b' }}>{vehicleFilter}</strong> vehicles ({typeFilter}).
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Active Adjustments Premium UI */}
            {adjustments.length > 0 && (
                <Box sx={{ mb: 6 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3, ml: 1 }}>
                        <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(13, 148, 136, 0.1)' }}>
                            <PercentIcon sx={{ color: '#0d9488' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                            Currently Active Price Rules
                        </Typography>
                    </Stack>

                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: '24px',
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 25px rgba(0,0,0,0.04)'
                        }}
                    >
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: 'action.hover' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, px: 3, py: 2.5, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Vehicle</TableCell>
                                    <TableCell sx={{ fontWeight: 700, px: 3, py: 2.5, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trip Category</TableCell>
                                    <TableCell sx={{ fontWeight: 700, px: 3, py: 2.5, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price Change</TableCell>
                                    <TableCell sx={{ fontWeight: 700, px: 3, py: 2.5, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Validity Period</TableCell>
                                    <TableCell sx={{ fontWeight: 700, px: 3, py: 2.5, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Modified</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, px: 3, py: 2.5, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {adjustments.map((adj) => (
                                    <TableRow
                                        key={adj._id}
                                        sx={{
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ px: 3, py: 2 }}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: adj.vehicle === 'All' ? '#94a3b8' : '#0d9488' }} />
                                                <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{adj.vehicle}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ px: 3, py: 2 }}>
                                            <Chip
                                                label={adj.type}
                                                size="small"
                                                sx={{
                                                    fontWeight: 600,
                                                    borderRadius: '8px',
                                                    px: 1,
                                                    bgcolor: 'rgba(59, 130, 246, 0.08)',
                                                    color: 'primary.main',
                                                    border: '1px solid rgba(59, 130, 246, 0.15)'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ px: 3, py: 2 }}>
                                            <Box sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                px: 2,
                                                py: 1,
                                                borderRadius: '12px',
                                                bgcolor: adj.percentage >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: adj.percentage >= 0 ? '#10b981' : '#ef4444',
                                                border: '1px solid',
                                                borderColor: adj.percentage >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                                            }}>
                                                <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>
                                                    {adj.percentage >= 0 ? `+${adj.percentage}%` : `${adj.percentage}%`}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ px: 3, py: 2 }}>
                                            <Typography component="div" variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem', fontWeight: 500 }}>
                                                {adj.validFrom || adj.validTo ? (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography variant="caption" sx={{ color: 'text.disabled', minWidth: '35px' }}>From:</Typography>
                                                            {adj.validFrom ? new Date(adj.validFrom).toLocaleDateString() : '—'}
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography variant="caption" sx={{ color: 'text.disabled', minWidth: '35px' }}>To:</Typography>
                                                            {adj.validTo ? new Date(adj.validTo).toLocaleDateString() : '—'}
                                                        </Box>
                                                    </Box>
                                                ) : (
                                                    <Chip label="Permanent" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(0,0,0,0.05)' }} />
                                                )}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ px: 3, py: 2 }}>
                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', fontWeight: 500 }}>
                                                {new Date(adj.lastUpdated).toLocaleDateString('en-GB', {
                                                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" sx={{ px: 3, py: 2 }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => handleResetAdjustment(adj._id)}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: '10px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    bgcolor: 'background.paper',
                                                    color: '#ef4444',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    boxShadow: 'none',
                                                    '&:hover': {
                                                        bgcolor: 'error.light',
                                                        color: '#fff',
                                                        boxShadow: '0 4px 10px rgba(239, 68, 68, 0.1)',
                                                        border: '1px solid transparent'
                                                    }
                                                }}
                                            >
                                                Reset to 0%
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Box>
            )}


            {/* Messages */}
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            {/* Data Table */}
            <Paper
                sx={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
                }}
            >
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.default', color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.default', color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>Vehicle</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.default', color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>Days</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.default', color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>KM</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.default', color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>Hrs</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.default', color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}></TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.default', color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>Rate</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.default', color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>Ext KM</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.default', color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>Ext Hrs</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.default', color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>Ext Hr 2</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.default', color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.default', color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={12} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={40} />
                                        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading rate card data...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedRateCards.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={12} align="center" sx={{ py: 8 }}>
                                        <TableChartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                        <Typography color="text.secondary">No matching rate cards found with current filters.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRateCards.map((row) => (
                                    <TableRow
                                        key={row._id}
                                        sx={{ '&:hover': { bgcolor: 'action.hover' }, transition: 'background 0.2s' }}
                                    >
                                        <TableCell>{row.type}</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>{row.vehicle}</TableCell>
                                        <TableCell>{row.days}</TableCell>
                                        <TableCell>{row.km}</TableCell>
                                        <TableCell>{row.hrs}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.ratePercent}
                                                size="small"
                                                sx={{ fontWeight: 600, bgcolor: 'rgba(59, 130, 246, 0.1)', color: 'primary.main' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#0d9488' }}>
                                            {row.rateAmount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>{row.extraKMRate}</TableCell>
                                        <TableCell>{row.extraHrRate1}</TableCell>
                                        <TableCell>{row.extraHrRate2}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.status || 'Approved'}
                                                size="small"
                                                color={
                                                    row.status === 'Approved' ? 'success' :
                                                        row.status === 'Rejected' ? 'error' : 'warning'
                                                }
                                                sx={{ fontWeight: 700, borderRadius: '6px' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                {row.status !== 'Approved' && (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        onClick={() => handleStatusUpdate(row._id, 'Approved')}
                                                        sx={{ py: 0, minWidth: '70px', textTransform: 'none', fontSize: '0.75rem', borderRadius: '6px', bgcolor: '#10b981' }}
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                                {row.status !== 'Rejected' && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => handleStatusUpdate(row._id, 'Rejected')}
                                                        sx={{ py: 0, minWidth: '70px', textTransform: 'none', fontSize: '0.75rem', borderRadius: '6px' }}
                                                    >
                                                        Reject
                                                    </Button>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[25, 50, 100, 200]}
                    component="div"
                    count={filteredRateCards.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: '1px solid', borderColor: 'divider' }}
                />
            </Paper>

            {/* Hint for CSV format */}
            <Box sx={{ mt: 3, p: 2, borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.02)', border: '1px solid divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700, textTransform: 'uppercase' }}>
                    Expected CSV Headers
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Type, Vehicle, Days, KM, Hrs, Rate %, Rate, Extra KM (or KM Rate/Price-KM), Ext Hrs (or Extra Hr/Price-Hr)... (Mapping handles variations like "Basic Rate" or "Amount")
                </Typography>
            </Box>

            {/* Confirmation Dialog */}
            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        p: 1,
                        minWidth: '400px',
                        background: 'background.paper',
                        backgroundImage: 'none'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.4rem', color: 'text.primary', pb: 1 }}>
                    Confirm Price Adjustment
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'text.secondary', fontSize: '1rem', mb: 2 }}>
                        Are you sure you want to apply a persistent <strong>{adjustValue}%</strong> adjustment for current filters?
                    </DialogContentText>

                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                        <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Target Vehicle:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{vehicleFilter}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Trip Category:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{typeFilter}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Percentage:</Typography>
                                <Typography variant="body2" sx={{
                                    fontWeight: 800,
                                    color: parseFloat(adjustValue) >= 0 ? '#10b981' : '#ef4444'
                                }}>
                                    {parseFloat(adjustValue) >= 0 ? `+${adjustValue}%` : `${adjustValue}%`}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                            📅 Set Validity Period (Optional)
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>From Date</Typography>
                                <input
                                    type="date"
                                    value={validFrom}
                                    onChange={(e) => setValidFrom(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit',
                                        outline: 'none'
                                    }}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>To Date</Typography>
                                <input
                                    type="date"
                                    value={validTo}
                                    onChange={(e) => setValidTo(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit',
                                        outline: 'none'
                                    }}
                                />
                            </Box>
                        </Stack>
                        <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>
                            Leave blank to apply the rule permanently.
                        </Typography>
                    </Box>

                    <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.disabled', fontStyle: 'italic' }}>
                        * This will be applied dynamically to the customer trip summary.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={() => setOpenConfirmDialog(false)}
                        sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmAdjust}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
                            color: 'white !important',
                            borderRadius: '10px',
                            px: 3,
                            textTransform: 'none',
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)'
                        }}
                    >
                        Confirm & Apply
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Conflict Resolution Dialog */}
            <Dialog
                open={conflictDialogOpen}
                onClose={() => setConflictDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        p: 1,
                        minWidth: '400px',
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: 'warning.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon /> Conflict Detected
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'text.primary', mb: 2 }}>
                        {conflictMessage}
                    </DialogContentText>
                    <Typography variant="body2" color="text.secondary">
                        Adding a broader "All" type rate will replace your more specific rates for this vehicle.
                    </Typography>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                            📅 Set Validity Period (Optional)
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>From Date</Typography>
                                <input
                                    type="date"
                                    value={validFrom}
                                    onChange={(e) => setValidFrom(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit',
                                        outline: 'none'
                                    }}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>To Date</Typography>
                                <input
                                    type="date"
                                    value={validTo}
                                    onChange={(e) => setValidTo(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit',
                                        outline: 'none'
                                    }}
                                />
                            </Box>
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setConflictDialogOpen(false)} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmAdjust}
                        variant="contained"
                        color="warning"
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
                    >
                        Remove Previously Added & Apply New
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RateCardManagePage;

'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    TableChart as TableChartIcon,
    CheckCircle as CheckCircleIcon,
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

const RateCardManagePage = () => {
    const [rateCards, setRateCards] = useState<RateCardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Filtering states
    const [searchTerm, setSearchTerm] = useState('');
    const [vehicleFilter, setVehicleFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [daysFilter, setDaysFilter] = useState('All');
    const [kmFilter, setKmFilter] = useState('');

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

    useEffect(() => {
        fetchRateCards();
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

    // Filter logic
    const filteredRateCards = rateCards.filter(card => {
        const matchesSearch = card.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesVehicle = vehicleFilter === 'All' || card.vehicle === vehicleFilter;
        const matchesType = typeFilter === 'All' || card.type === typeFilter;
        const matchesDays = daysFilter === 'All' || card.days.toString() === daysFilter;
        const matchesKm = kmFilter === '' || card.km.toString().includes(kmFilter);

        return matchesSearch && matchesVehicle && matchesType && matchesDays && matchesKm;
    });

    // Extract unique options for filters
    const uniqueVehicles = Array.from(new Set(rateCards.map(c => c.vehicle))).sort();
    const uniqueTypes = Array.from(new Set(rateCards.map(c => c.type))).sort();
    const uniqueDays = Array.from(new Set(rateCards.map(c => c.days.toString()))).sort((a, b) => parseInt(a) - parseInt(b));

    const resetFilters = () => {
        setSearchTerm('');
        setVehicleFilter('All');
        setTypeFilter('All');
        setDaysFilter('All');
        setKmFilter('');
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
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Upload your rate card CSV file to populate the table. The header columns should match the rate card structure.
                    </Typography>
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

            <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                    <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', md: '200px' } }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: '#94a3b8', textTransform: 'uppercase' }}>Search</Typography>
                        <input
                            placeholder="Search vehicle or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                marginTop: '4px',
                                outline: 'none',
                                background: '#ffffff',
                                color: '#1e293b',
                                fontSize: '0.9rem',
                                fontFamily: 'inherit'
                            }}
                        />
                    </Box>

                    <Box sx={{ minWidth: '150px' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: '#94a3b8', textTransform: 'uppercase' }}>Vehicle</Typography>
                        <select
                            value={vehicleFilter}
                            onChange={(e) => setVehicleFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                marginTop: '4px',
                                outline: 'none',
                                background: '#ffffff',
                                color: '#1e293b',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                            }}
                        >
                            <option value="All">All Vehicles</option>
                            {uniqueVehicles.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </Box>

                    <Box sx={{ minWidth: '150px' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: '#94a3b8', textTransform: 'uppercase' }}>Type</Typography>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                marginTop: '4px',
                                outline: 'none',
                                background: '#ffffff',
                                color: '#1e293b',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                            }}
                        >
                            <option value="All">All Types</option>
                            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </Box>

                    <Box sx={{ minWidth: '100px' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: '#94a3b8', textTransform: 'uppercase' }}>Days</Typography>
                        <select
                            value={daysFilter}
                            onChange={(e) => setDaysFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                marginTop: '4px',
                                outline: 'none',
                                background: '#ffffff',
                                color: '#1e293b',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontFamily: 'inherit'
                            }}
                        >
                            <option value="All">All Days</option>
                            {uniqueDays.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </Box>

                    <Box sx={{ minWidth: '100px' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: '#94a3b8', textTransform: 'uppercase' }}>KM Limit</Typography>
                        <input
                            type="text"
                            placeholder="e.g. 100"
                            value={kmFilter}
                            onChange={(e) => setKmFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e1',
                                marginTop: '4px',
                                outline: 'none',
                                background: '#ffffff',
                                color: '#1e293b',
                                fontSize: '0.9rem',
                                fontFamily: 'inherit'
                            }}
                        />
                    </Box>

                    <Button
                        size="small"
                        onClick={resetFilters}
                        sx={{ mt: { xs: 0, md: 2.5 }, textTransform: 'none', fontWeight: 600, color: '#94a3b8' }}
                    >
                        Reset
                    </Button>
                </Stack>
            </Paper>

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
                                    <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={40} />
                                        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading rate card data...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredRateCards.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                                        <TableChartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                        <Typography color="text.secondary">No matching rate cards found with current filters.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRateCards.map((row) => (
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
                                                label={row.status || 'Pending'}
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
            </Paper>

            {/* Hint for CSV format */}
            <Box sx={{ mt: 3, p: 2, borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.02)', border: '1px solid divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700, textTransform: 'uppercase' }}>
                    Expected CSV Headers
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Type, Vehicle, Days, KM, Hrs, Rate %, Rate, Extra KM, Ext Hrs... (Mapping handles variations like "Basic Rate" or "Amount")
                </Typography>
            </Box>
        </Box>
    );
};

export default RateCardManagePage;

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
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Tooltip,
  Chip,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
    DialogActions,
    Grid,
    TextField,
    InputAdornment,
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Refresh as RefreshIcon,
    TableChart as TableChartIcon,
    CheckCircle as CheckCircleIcon,
    TrendingUp as TrendingUpIcon,
    Percent as PercentIcon,
    Assessment as AssessmentIcon,
} from '@mui/icons-material';

import { API_ENDPOINTS } from '@/config/api';
import PromoCodeManagePage from '../promo_code_manage/page';
import ProvinceManagePage from '../province_manage/page';

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
    category?: string;
    status: string;
}

interface RateAdjustment {
    _id: string;
    vehicle: string;
    type: string;
    percentage: number;
    fixedAmount?: number;
    adjustmentType?: 'percentage' | 'fixed';
    minKm?: number;
    maxKm?: number;
    validFrom: string | null;
    validTo: string | null;
    lastUpdated: string;
}

interface NightSurchargeRule {
    _id: string;
    vehicle: string;
    type: string;
    minKm: number;
    maxKm: number;
    startTime: string;
    endTime: string;
    amount: number;
    status: 'Active' | 'Inactive';
    lastUpdated: string;
}

const RateCardManagePage = () => {
    const [rateCards, setRateCards] = useState<RateCardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    // Filtering states
    const [kmFilter, setKmFilter] = useState('');
    const [vehicleFilter, setVehicleFilter] = useState('All'); // Assuming these exist elsewhere
    const [typeFilter, setTypeFilter] = useState('All'); // Assuming these exist elsewhere
    const [daysFilter, setDaysFilter] = useState('All');
    const [hrsFilter, setHrsFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState(''); // State for debounced search term

    // Pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    // Debounced search state
    const [searchInput, setSearchInput] = useState('');

    // Adjustment states
    const [adjustments, setAdjustments] = useState<RateAdjustment[]>([]);
    const [adjustValue, setAdjustValue] = useState<string>('');
    const [adjustmentType, setAdjustmentType] = useState<'percentage' | 'fixed'>('percentage');
    const [adjusting, setAdjusting] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [validFrom, setValidFrom] = useState<string>('');
    const [validTo, setValidTo] = useState<string>('');
    const [adjustMinKm, setAdjustMinKm] = useState<string>('0');
    const [adjustMaxKm, setAdjustMaxKm] = useState<string>('0');

    // Conflict states
    const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
    const [conflictMessage, setConflictMessage] = useState('');
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

    // Adjustment Edit states
    const [editingAdjustment, setEditingAdjustment] = useState<RateAdjustment | null>(null);
    const [isAdjustmentEditDialogOpen, setIsAdjustmentEditDialogOpen] = useState(false);
    
    const [nightSurchargeEnabled, setNightSurchargeEnabled] = useState<boolean>(true);
    const [nightSurchargeCar, setNightSurchargeCar] = useState<number>(500);
    const [nightSurchargeVan, setNightSurchargeVan] = useState<number>(1000);
    const [updatingSettings, setUpdatingSettings] = useState(false);

    // Night surcharge rules state
    const [nsRules, setNsRules] = useState<NightSurchargeRule[]>([]);
    const [nsAmount, setNsAmount] = useState<string>('');
    const [nsMinKm, setNsMinKm] = useState<string>('0');
    const [nsMaxKm, setNsMaxKm] = useState<string>('0');
    const [nsStartTime, setNsStartTime] = useState<string>('00:00');
    const [nsEndTime, setNsEndTime] = useState<string>('04:00');
    const [nsVehicle, setNsVehicle] = useState<string>('All');
    const [nsType, setNsType] = useState<string>('All');
    
    // NS Edit states
    const [editingNsRule, setEditingNsRule] = useState<NightSurchargeRule | null>(null);
    const [isNsEditDialogOpen, setIsNsEditDialogOpen] = useState(false);

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

    const fetchNsRules = async () => {
        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/night-surcharge`);
            if (response.ok) {
                const data = await response.json();
                setNsRules(data);
            }
        } catch (err) {
            console.error('Error fetching NS rules:', err);
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
                if (data.nightSurchargeCar !== undefined) {
                    setNightSurchargeCar(data.nightSurchargeCar);
                }
                if (data.nightSurchargeVan !== undefined) {
                    setNightSurchargeVan(data.nightSurchargeVan);
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
        fetchNsRules();
        fetchGlobalSettings();
    }, []);

    const handleAddNsRule = async () => {
        if (!nsAmount || isNaN(parseFloat(nsAmount))) {
            setError('Please enter a valid amount');
            return;
        }

        setUpdatingSettings(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/night-surcharge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehicle: nsVehicle,
                    type: nsType,
                    minKm: parseInt(nsMinKm),
                    maxKm: parseInt(nsMaxKm),
                    startTime: nsStartTime,
                    endTime: nsEndTime,
                    amount: parseFloat(nsAmount)
                }),
            });

            if (response.ok) {
                setSuccess('Night surcharge rule added successfully');
                setNsAmount('');
                fetchNsRules();
            } else {
                const errData = await response.json();
                setError(errData.message || 'Failed to add rule');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setUpdatingSettings(false);
        }
    };

    const handleRemoveNsRule = async (id: string) => {
        if (!confirm('Are you sure you want to remove this rule?')) return;

        setUpdatingSettings(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/night-surcharge/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setSuccess('Rule removed successfully');
                fetchNsRules();
            } else {
                setError('Failed to remove rule');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setUpdatingSettings(false);
        }
    };

    const handleUpdateNsStatus = async (id: string, newStatus: 'Active' | 'Inactive') => {
        setUpdatingSettings(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/night-surcharge/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setSuccess(`Rule marked as ${newStatus}`);
                fetchNsRules();
            } else {
                setError('Failed to update status');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setUpdatingSettings(false);
        }
    };

    const handleOpenNsEdit = (rule: NightSurchargeRule) => {
        setEditingNsRule({ ...rule });
        setIsNsEditDialogOpen(true);
    };

    const handleUpdateNsRule = async () => {
        if (!editingNsRule) return;
        setUpdatingSettings(true);
        setError(null);
        setSuccess(null);

        // Sanitize numbers to ensure they aren't NaN
        const cleanPayload = {
            vehicle: editingNsRule.vehicle,
            type: editingNsRule.type,
            minKm: isNaN(editingNsRule.minKm) ? 0 : editingNsRule.minKm,
            maxKm: isNaN(editingNsRule.maxKm) ? 99999 : editingNsRule.maxKm,
            startTime: editingNsRule.startTime,
            endTime: editingNsRule.endTime,
            amount: isNaN(editingNsRule.amount) ? 0 : editingNsRule.amount,
            status: editingNsRule.status
        };

        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/night-surcharge/${editingNsRule._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanPayload),
            });

            if (response.ok) {
                setSuccess('Night surcharge rule updated successfully');
                setIsNsEditDialogOpen(false);
                setEditingNsRule(null);
                fetchNsRules();
            } else {
                const errData = await response.json();
                setError(errData.message || 'Failed to update rule');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setUpdatingSettings(false);
        }
    };

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
                card.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (card.category && card.category.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesVehicle = vehicleFilter === 'All' || card.vehicle === vehicleFilter;
            const matchesType = typeFilter === 'All' || card.type === typeFilter;
            const matchesDays = daysFilter === 'All' || card.days.toString() === daysFilter;
            const matchesHrs = hrsFilter === 'All' || card.hrs.toString() === hrsFilter;
            const matchesKm = kmFilter === '' || card.km.toString().includes(kmFilter);
            const matchesCategory = categoryFilter === 'All' || card.category === categoryFilter;

            const isPromotion = card.category?.toLowerCase() === 'promotion' || card.category?.toLowerCase() === 'promotion ';
            return matchesSearch && matchesVehicle && matchesType && matchesDays && matchesHrs && matchesKm && matchesCategory && !isPromotion;
        });
    }, [rateCards, searchTerm, vehicleFilter, typeFilter, daysFilter, hrsFilter, kmFilter, categoryFilter]);

    // Paginated data
    const paginatedRateCards = useMemo(() => {
        return filteredRateCards.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredRateCards, page, rowsPerPage]);

    // Extract unique options for filters
    const uniqueVehicles = Array.from(new Set(rateCards.map(c => c.vehicle))).sort();
    const uniqueTypes = Array.from(new Set(rateCards.map(c => c.type))).sort();
    const uniqueDays = Array.from(new Set(rateCards.map(c => c.days.toString()))).sort((a, b) => parseInt(a) - parseInt(b));
    const uniqueHrs = Array.from(new Set(rateCards.map(c => c.hrs.toString()))).sort((a, b) => parseInt(a) - parseInt(b));
    const uniqueCategories = Array.from(new Set(rateCards.map(c => c.category).filter(Boolean) as string[])).sort();

    const resetFilters = () => {
        setSearchInput('');
        setSearchTerm('');
        setVehicleFilter('All');
        setTypeFilter('All');
        setDaysFilter('All');
        setHrsFilter('All');
        setCategoryFilter('All');
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
            const bodyPayload = {
                vehicle: vehicleFilter,
                type: typeFilter,
                adjustmentType: adjustmentType,
                percentage: adjustmentType === 'percentage' ? parseFloat(adjustValue) : 0,
                fixedAmount: adjustmentType === 'fixed' ? parseFloat(adjustValue) : 0,
                minKm: adjustMinKm === '' ? 0 : parseInt(adjustMinKm),
                maxKm: adjustMaxKm === '' ? 99999 : parseInt(adjustMaxKm),
                validFrom: validFrom || null,
                validTo: validTo || null
            };

            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/adjust`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload),
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
        if (!confirm('Are you sure you want to reset this adjustment rule?')) return;

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

    const handleOpenAdjustmentEdit = (adj: RateAdjustment) => {
        // Prepare string dates for <input type="date">
        setEditingAdjustment({ 
            ...adj,
            minKm: adj.minKm ?? 0,
            maxKm: adj.maxKm ?? 99999,
            validFrom: adj.validFrom ? new Date(adj.validFrom).toISOString().split('T')[0] : null,
            validTo: adj.validTo ? new Date(adj.validTo).toISOString().split('T')[0] : null
        });
        setIsAdjustmentEditDialogOpen(true);
    };

    const handleUpdateAdjustment = async () => {
        if (!editingAdjustment) return;
        setAdjusting(true);
        setError(null);
        setSuccess(null);

        try {
            const body = {
                adjustmentType: editingAdjustment.adjustmentType,
                percentage: parseFloat(editingAdjustment.percentage?.toString()) || 0,
                fixedAmount: parseFloat(editingAdjustment.fixedAmount?.toString()) || 0,
                vehicle: editingAdjustment.vehicle,
                type: editingAdjustment.type,
                minKm: editingAdjustment.minKm === undefined ? 0 : parseInt(editingAdjustment.minKm.toString()),
                maxKm: editingAdjustment.maxKm === undefined ? 99999 : parseInt(editingAdjustment.maxKm.toString()),
                validFrom: editingAdjustment.validFrom,
                validTo: editingAdjustment.validTo
            };

            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/adjust/${editingAdjustment._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                setSuccess('Adjustment rule updated successfully');
                setIsAdjustmentEditDialogOpen(false);
                setEditingAdjustment(null);
                fetchAdjustments();
            } else {
                const errData = await response.json();
                setError(errData.message || 'Failed to update adjustment');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setAdjusting(false);
        }
    };

    const updateNightSurchargeAmount = async (vehicle: string, amount: number) => {
        setUpdatingSettings(true);
        const key = vehicle === 'Car' ? 'nightSurchargeCar' : 'nightSurchargeVan';
        try {
            const response = await fetch(`${API_ENDPOINTS.RATE_CARDS}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: key,
                    value: amount,
                    description: `Night surcharge amount for ${vehicle}`
                }),
            });

            if (response.ok) {
                if (vehicle === 'Car') setNightSurchargeCar(amount);
                else setNightSurchargeVan(amount);
                setSuccess(`${vehicle} night surcharge updated`);
            } else {
                setError('Failed to update amount');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setUpdatingSettings(false);
            setTimeout(() => setSuccess(null), 3000);
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
            {/* Unified Management Header with Tabs */}
            <Box
                sx={{
                    mb: 3,
                    pb: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        fontSize: { xs: '1.5rem', sm: '1.8rem' },
                        background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                    }}
                >
                    Management Dashboard
                </Typography>

                <Tabs 
                    value={activeTab} 
                    onChange={(e, v) => setActiveTab(v)}
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            minWidth: { xs: 'auto', sm: 140 },
                            px: 2,
                            borderRadius: '12px 12px 0 0',
                            transition: 'all 0.2s',
                            '&.Mui-selected': {
                                color: 'primary.main',
                                bgcolor: 'rgba(59, 130, 246, 0.05)',
                            }
                        }
                    }}
                >
                    <Tab label="Rate Card Manage" />
                    <Tab label="Province Manage" />
                    <Tab label="Promo Code Manage" />
                    <Tab label="Bulk Price Adjustment" />
                    <Tab label="Night Surcharge" />
                </Tabs>
            </Box>
            

            {activeTab === 0 && (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
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
                    </Box>


                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
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

            {/* Filter Section (Moved under Upload Section) */}
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
                        <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', textTransform: 'uppercase' }}>Category</Typography>
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
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
                            <option value="All" style={{ background: '#fff', color: '#000' }}>All Categories</option>
                            {uniqueCategories.map(c => <option key={c} value={c} style={{ background: '#fff', color: '#000' }}>{c}</option>)}
                        </select>
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


                    <Button
                        size="small"
                        onClick={resetFilters}
                        sx={{ mt: { xs: 0, md: 2.5 }, textTransform: 'none', fontWeight: 600, color: 'text.disabled' }}
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
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.default', color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' }}>Category</TableCell>
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
                                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{row.category || '-'}</TableCell>
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
                    Category, Type, Vehicle, Days, KM, Hrs, Rate %, Rate, Extra KM (or KM Rate/Price-KM), Ext Hrs (or Extra Hr/Price-Hr)... (Mapping handles variations like "Basic Rate" or "Amount")
                </Typography>
            </Box>
                </>
            )}

            {activeTab === 1 && <ProvinceManagePage />}
            {activeTab === 2 && <PromoCodeManagePage />}

            {activeTab === 3 && (
                <>
                    {/* Filter Section (Specific to Bulk Adjustment) */}
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
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', textTransform: 'uppercase' }}>Category</Typography>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => {
                                        setCategoryFilter(e.target.value);
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
                                    <option value="All" style={{ background: '#fff', color: '#000' }}>All Categories</option>
                                    {uniqueCategories.map(c => <option key={c} value={c} style={{ background: '#fff', color: '#000' }}>{c}</option>)}
                                </select>
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
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-end">
                            {/* Toggle between % and Rs */}
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', display: 'block', mb: 0.5 }}>Type</Typography>
                                <Box sx={{ display: 'flex', bgcolor: 'rgba(0,0,0,0.03)', p: 0.5, borderRadius: '14px', mr: 1 }}>
                                <Button 
                                    size="small"
                                    onClick={() => setAdjustmentType('percentage')}
                                    sx={{ 
                                        borderRadius: '10px', 
                                        px: 2,
                                        minWidth: '60px',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        bgcolor: adjustmentType === 'percentage' ? '#0d9488' : 'transparent',
                                        color: adjustmentType === 'percentage' ? '#fff !important' : 'text.secondary',
                                        '&:hover': { bgcolor: adjustmentType === 'percentage' ? '#0d9488' : 'rgba(0,0,0,0.05)' }
                                    }}
                                >
                                    %
                                </Button>
                                <Button 
                                    size="small"
                                    onClick={() => setAdjustmentType('fixed')}
                                    sx={{ 
                                        borderRadius: '10px', 
                                        px: 2,
                                        minWidth: '60px',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        bgcolor: adjustmentType === 'fixed' ? '#0d9488' : 'transparent',
                                        color: adjustmentType === 'fixed' ? '#fff !important' : 'text.secondary',
                                        '&:hover': { bgcolor: adjustmentType === 'fixed' ? '#0d9488' : 'rgba(0,0,0,0.05)' }
                                    }}
                                >
                                    Rs
                                </Button>
                            </Box>
                        </Box>

                        <Box sx={{ position: 'relative', width: '200px' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', display: 'block', mb: 0.5 }}>Value</Typography>
                            <Box sx={{ position: 'relative' }}>
                                {adjustmentType === 'percentage' ? (
                                    <PercentIcon sx={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '1.2rem',
                                        color: '#0d9488',
                                        pointerEvents: 'none',
                                    }} />
                                ) : (
                                    <Typography sx={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '0.9rem',
                                        fontWeight: 800,
                                        color: '#0d9488',
                                        pointerEvents: 'none',
                                    }}>Rs</Typography>
                                )}
                                <input
                                    type="text"
                                    placeholder={adjustmentType === 'percentage' ? "e.g. 10 or -5" : "e.g. 500 or -200"}
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
                                        border: '1.5px solid #cbd5e1',
                                        background: 'transparent',
                                        color: 'inherit',
                                        fontWeight: 700,
                                        fontSize: '1.05rem',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.2s ease',
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ width: '130px' }}>
                           <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', display: 'block', mb: 0.5 }}>Min KM</Typography>
                           <input
                               id="adjust-min-km-input"
                               type="number"
                               value={adjustMinKm}
                               onChange={(e) => setAdjustMinKm(e.target.value)}
                               style={{
                                   width: '100%',
                                   padding: '10px 14px',
                                   borderRadius: '12px',
                                   border: '1.5px solid #cbd5e1',
                                   background: 'transparent',
                                   fontWeight: 700,
                                   fontSize: '0.95rem',
                                   fontFamily: 'inherit',
                                   outline: 'none'
                               }}
                           />
                       </Box>

                            <Box sx={{ width: '130px' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', display: 'block', mb: 0.5 }}>Max KM</Typography>
                                <input
                                    type="number"
                                    value={adjustMaxKm}
                                    onChange={(e) => setAdjustMaxKm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                        border: '1.5px solid #cbd5e1',
                                        background: 'transparent',
                                        fontWeight: 700,
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        outline: 'none'
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
                            Applying a persistent <strong style={{ color: '#0d9488' }}>
                                {adjustmentType === 'percentage' ? `${adjustValue}%` : `Rs. ${adjustValue}`}
                            </strong> adjustment for <strong style={{ color: '#1e293b' }}>{vehicleFilter}</strong> vehicles ({typeFilter}).
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
                                    <TableCell sx={{ fontWeight: 700, px: 3, py: 2.5, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>KM Range</TableCell>
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
                                            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'text.secondary' }}>
                                                {adj.minKm ?? 0} - {adj.maxKm ?? 0} KM
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ px: 3, py: 2 }}>
                                            {(() => {
                                                const isPercentage = !adj.adjustmentType || adj.adjustmentType === 'percentage';
                                                const isPositive = isPercentage ? adj.percentage >= 0 : (adj.fixedAmount || 0) >= 0;
                                                const valText = isPercentage 
                                                    ? (adj.percentage >= 0 ? `+${adj.percentage}%` : `${adj.percentage}%`)
                                                    : ((adj.fixedAmount || 0) >= 0 ? `+Rs. ${adj.fixedAmount || 0}` : `-Rs. ${Math.abs(adj.fixedAmount || 0)}`);

                                                return (
                                                    <Box sx={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        px: 2,
                                                        py: 1,
                                                        borderRadius: '12px',
                                                        bgcolor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: isPositive ? '#10b981' : '#ef4444',
                                                        border: '1px solid',
                                                        borderColor: isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                                                    }}>
                                                        <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>
                                                            {valText}
                                                        </Typography>
                                                    </Box>
                                                );
                                            })()}
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
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleOpenAdjustmentEdit(adj)}
                                                    sx={{ color: 'primary.main', border: '1px solid', borderColor: 'divider', borderRadius: '10px' }}
                                                >
                                                    <EditIcon sx={{ fontSize: '1.1rem' }} />
                                                </IconButton>
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
                                                    Reset
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                    </Box>
                )}

            {/* Confirmation Dialog */}
            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        p: 1.5,
                        minWidth: { xs: '95vw', sm: '480px' },
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        backgroundImage: 'none'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#1e293b', pb: 1 }}>
                    Confirm Price Adjustment
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#64748b', fontSize: '1.05rem', mb: 3, lineHeight: 1.5 }}>
                        Are you sure you want to apply a persistent <strong style={{ color: '#0f172a' }}>{adjustmentType === 'percentage' ? `${adjustValue}%` : `Rs. ${adjustValue}`}</strong> adjustment for current filters?
                    </DialogContentText>

                    <Box sx={{ 
                        p: 2.5, 
                        borderRadius: '20px', 
                        bgcolor: 'rgba(248, 250, 252, 0.8)', 
                        border: '1px solid', 
                        borderColor: '#e2e8f0',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Target Vehicle:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>{vehicleFilter === 'All' ? 'All Vehicles' : vehicleFilter}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Trip Category:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>{typeFilter === 'All' ? 'All Types' : typeFilter}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>{adjustmentType === 'percentage' ? 'Percentage:' : 'Fixed Amount:'}</Typography>
                                <Typography variant="body2" sx={{
                                    fontWeight: 900,
                                    fontSize: '1.1rem',
                                    color: parseFloat(adjustValue) >= 0 ? '#059669' : '#dc2626'
                                }}>
                                    {adjustmentType === 'percentage' 
                                        ? (parseFloat(adjustValue) >= 0 ? `+${adjustValue}%` : `${adjustValue}%`)
                                        : (parseFloat(adjustValue) >= 0 ? `+Rs. ${adjustValue}` : `-Rs. ${Math.abs(parseFloat(adjustValue))}`)
                                    }
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    <Box sx={{ mt: 4 }}>
                        <Typography variant="body2" sx={{ mb: 2, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <span style={{ fontSize: '1.2rem' }}>🗓️</span> Set Validity Period (Optional)
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.75, ml: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>From Date</Typography>
                                <input
                                    type="date"
                                    value={validFrom}
                                    onChange={(e) => setValidFrom(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '12px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        backgroundColor: '#fff',
                                        color: '#1e293b'
                                    }}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.75, ml: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>To Date</Typography>
                                <input
                                    type="date"
                                    value={validTo}
                                    onChange={(e) => setValidTo(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '12px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        backgroundColor: '#fff',
                                        color: '#1e293b'
                                    }}
                                />
                            </Box>
                        </Stack>
                        <Typography variant="caption" sx={{ color: '#94a3b8', mt: 1.5, display: 'block', fontStyle: 'italic' }}>
                            Leave blank to apply the rule permanently.
                        </Typography>
                    </Box>

                    <Typography variant="caption" sx={{ display: 'block', mt: 3, color: '#94a3b8', fontStyle: 'italic', borderTop: '1px solid', borderColor: '#f1f5f9', pt: 2 }}>
                        * This will be applied dynamically to the customer trip summary.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
                    <Button
                        onClick={() => setOpenConfirmDialog(false)}
                        sx={{ 
                            color: '#64748b', 
                            textTransform: 'none', 
                            fontWeight: 700, 
                            fontSize: '0.95rem',
                            '&:hover': { bgcolor: '#f1f5f9', color: '#1e293b' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmAdjust}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
                            color: 'white !important',
                            borderRadius: '12px',
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                            '&:hover': {
                                boxShadow: '0 6px 20px rgba(13, 148, 136, 0.4)',
                                transform: 'translateY(-1px)'
                            }
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
                        borderRadius: '24px',
                        p: 1.5,
                        minWidth: { xs: '95vw', sm: '480px' },
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1.4rem' }}>
                    <TrendingUpIcon sx={{ fontSize: '1.8rem' }} /> Conflict Detected
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#1e293b', fontWeight: 600, fontSize: '1.05rem', mb: 2 }}>
                        {conflictMessage}
                    </DialogContentText>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 3, lineHeight: 1.5 }}>
                        Adding a broader <strong style={{color: '#1e293b'}}>"All"</strong> type rate will replace your more specific rates for this vehicle. This action ensures price consistency within categories.
                    </Typography>

                    <Box sx={{ mt: 2, pt: 3, borderTop: '1px solid', borderColor: '#f1f5f9' }}>
                        <Typography variant="body2" sx={{ mb: 2, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <span style={{ fontSize: '1.2rem' }}>🗓️</span> Set Validity Period (Optional)
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.75, ml: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>From Date</Typography>
                                <input
                                    type="date"
                                    value={validFrom}
                                    onChange={(e) => setValidFrom(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '12px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        backgroundColor: '#fff',
                                        color: '#1e293b'
                                    }}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.75, ml: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>To Date</Typography>
                                <input
                                    type="date"
                                    value={validTo}
                                    onChange={(e) => setValidTo(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '12px',
                                        border: '1.5px solid #e2e8f0',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        backgroundColor: '#fff',
                                        color: '#1e293b'
                                    }}
                                />
                            </Box>
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button 
                        onClick={() => setConflictDialogOpen(false)} 
                        sx={{ 
                            color: '#64748b', 
                            textTransform: 'none', 
                            fontWeight: 700,
                            '&:hover': { bgcolor: '#f1f5f9' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmAdjust}
                        variant="contained"
                        sx={{ 
                            borderRadius: '12px', 
                            textTransform: 'none', 
                            fontWeight: 800, 
                            bgcolor: '#f59e0b',
                            px: 3,
                            py: 1.2,
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                            '&:hover': {
                                bgcolor: '#d97706',
                                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)',
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        Resolve & Apply New
                    </Button>
                </DialogActions>
            </Dialog>
                </>
            )}


            {activeTab === 4 && (
                <Box sx={{ p: 4 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: '24px',
                            border: '1px solid',
                            borderColor: 'divider',
                            background: (theme) => theme.palette.mode === 'dark' 
                                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)' 
                                : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%)',
                            width: '100%',
                        }}
                    >
                        {/* Header Section */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                            <Box sx={{ 
                                p: 2, 
                                borderRadius: '16px', 
                                bgcolor: nightSurchargeEnabled ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                color: nightSurchargeEnabled ? 'primary.main' : 'text.disabled',
                                display: 'flex'
                            }}>
                                <AssessmentIcon sx={{ fontSize: '2rem' }} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" fontWeight="800">Night Surcharge Manager</Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Configure additional fixed charges for specific time windows and trip parameters
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 4 }} />

                        {/* Add Rule Form */}
                        <Box sx={{ mb: 6, p: 3, borderRadius: '20px', bgcolor: 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Add New Surcharge Rule
                            </Typography>
                            
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 3 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', textTransform: 'uppercase' }}>Vehicle</Typography>
                                    <select
                                        value={nsVehicle}
                                        onChange={(e) => setNsVehicle(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border-color, #cbd5e1)',
                                            marginTop: '4px',
                                            outline: 'none',
                                            background: 'background.paper',
                                            fontSize: '0.9rem',
                                            fontFamily: 'inherit'
                                        }}
                                    >
                                        <option value="All">All Vehicles</option>
                                        {uniqueVehicles.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </Grid>
                                
                                <Grid size={{ xs: 12, sm: 3 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', textTransform: 'uppercase' }}>Trip Type</Typography>
                                    <select
                                        value={nsType}
                                        onChange={(e) => setNsType(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border-color, #cbd5e1)',
                                            marginTop: '4px',
                                            outline: 'none',
                                            fontSize: '0.9rem',
                                            fontFamily: 'inherit'
                                        }}
                                    >
                                        <option value="All">All Types</option>
                                        {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 3 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', textTransform: 'uppercase' }}>MIN KM</Typography>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        size="small"
                                        value={nsMinKm}
                                        onChange={(e) => setNsMinKm(e.target.value)}
                                        sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'background.paper' } }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 3 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', textTransform: 'uppercase' }}>MAX KM</Typography>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        size="small"
                                        value={nsMaxKm}
                                        onChange={(e) => setNsMaxKm(e.target.value)}
                                        sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'background.paper' } }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 3 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', textTransform: 'uppercase' }}>Start Time</Typography>
                                    <TextField
                                        fullWidth
                                        type="time"
                                        size="small"
                                        value={nsStartTime}
                                        onChange={(e) => setNsStartTime(e.target.value)}
                                        sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'background.paper' } }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 3 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', textTransform: 'uppercase' }}>End Time</Typography>
                                    <TextField
                                        fullWidth
                                        type="time"
                                        size="small"
                                        value={nsEndTime}
                                        onChange={(e) => setNsEndTime(e.target.value)}
                                        sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'background.paper' } }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 3 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', textTransform: 'uppercase' }}>Amount (LKR)</Typography>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        size="small"
                                        value={nsAmount}
                                        onChange={(e) => setNsAmount(e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start">Rs</InputAdornment> }}
                                        sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'background.paper' } }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 3 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleAddNsRule}
                                        disabled={updatingSettings}
                                        sx={{ mt: 2.8, borderRadius: '12px', textTransform: 'none', fontWeight: 700, height: '40px' }}
                                    >
                                        Add Rule
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Active Rules Table */}
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'text.secondary', textTransform: 'uppercase' }}>
                            Active Surcharge Rules
                        </Typography>
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Vehicle</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>KM Range</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Time Window</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {nsRules.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.disabled' }}>
                                                No specific rules added yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        nsRules.map((rule) => (
                                            <TableRow key={rule._id}>
                                                <TableCell><Chip label={rule.vehicle} size="small" variant="outlined" /></TableCell>
                                                <TableCell><Chip label={rule.type} size="small" variant="outlined" /></TableCell>
                                                <TableCell>{rule.minKm} - {rule.maxKm} KM</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip label={rule.startTime} size="small" color="primary" />
                                                        <Typography variant="caption">to</Typography>
                                                        <Chip label={rule.endTime} size="small" color="primary" />
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Rs. {rule.amount.toLocaleString()}</TableCell>
                                                <TableCell align="center">
                                                    <Chip 
                                                        label={rule.status || 'Active'} 
                                                        size="small" 
                                                        color={(rule.status === 'Inactive') ? 'default' : 'success'}
                                                        sx={{ fontWeight: 700 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color={rule.status === 'Inactive' ? 'success' : 'warning'}
                                                            onClick={() => handleUpdateNsStatus(rule._id, rule.status === 'Inactive' ? 'Active' : 'Inactive')}
                                                            sx={{ borderRadius: '8px', minWidth: '80px', py: 0, textTransform: 'capitalize', fontWeight: 600 }}
                                                        >
                                                            {rule.status === 'Inactive' ? 'Activate' : 'Deactivate'}
                                                        </Button>
                                                        <IconButton 
                                                            onClick={() => handleRemoveNsRule(rule._id)} 
                                                            size="small" 
                                                            sx={{ color: 'error.main', '&:hover': { bgcolor: 'error.lighter' } }}
                                                        >
                                                            <DeleteIcon sx={{ fontSize: '1.2rem' }} />
                                                        </IconButton>
                                                        <IconButton 
                                                            onClick={() => handleOpenNsEdit(rule)} 
                                                            size="small" 
                                                            sx={{ color: 'primary.main', '&:hover': { bgcolor: 'primary.lighter' } }}
                                                        >
                                                            <EditIcon sx={{ fontSize: '1.2rem' }} />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Alert severity="info" sx={{ mt: 4, borderRadius: '16px' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                Rules are applied based on the trip's pickup time and distance. Multiple rules can overlap, and the most specific one or last updated one might apply depending on logic.
                            </Typography>
                        </Alert>
                    </Paper>
                </Box>
            )}

            {/* NS Rule Edit Dialog */}
            <Dialog 
                open={isNsEditDialogOpen} 
                onClose={() => setIsNsEditDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: '24px', p: 1, minWidth: { xs: '95vw', sm: '500px' } } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Edit Surcharge Rule</DialogTitle>
                <DialogContent>
                    {editingNsRule && (
                        <Grid container spacing={3} sx={{ mt: 0.5 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary' }}>Vehicle</Typography>
                                <select
                                    value={editingNsRule.vehicle}
                                    onChange={(e) => setEditingNsRule({ ...editingNsRule, vehicle: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '12px',
                                        border: '1px solid #cbd5e1',
                                        marginTop: '4px',
                                        outline: 'none',
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    <option value="All">All Vehicles</option>
                                    {uniqueVehicles.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary' }}>Trip Type</Typography>
                                <select
                                    value={editingNsRule.type}
                                    onChange={(e) => setEditingNsRule({ ...editingNsRule, type: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '12px',
                                        border: '1px solid #cbd5e1',
                                        marginTop: '4px',
                                        outline: 'none',
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    <option value="All">All Types</option>
                                    {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary' }}>MIN KM</Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    size="small"
                                    value={isNaN(editingNsRule.minKm) ? '' : editingNsRule.minKm}
                                    onChange={(e) => setEditingNsRule({ ...editingNsRule, minKm: parseInt(e.target.value) })}
                                    sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary' }}>MAX KM</Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    size="small"
                                    value={isNaN(editingNsRule.maxKm) ? '' : editingNsRule.maxKm}
                                    onChange={(e) => setEditingNsRule({ ...editingNsRule, maxKm: parseInt(e.target.value) })}
                                    sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary' }}>Start Time</Typography>
                                <TextField
                                    fullWidth
                                    type="time"
                                    size="small"
                                    value={editingNsRule.startTime}
                                    onChange={(e) => setEditingNsRule({ ...editingNsRule, startTime: e.target.value })}
                                    sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary' }}>End Time</Typography>
                                <TextField
                                    fullWidth
                                    type="time"
                                    size="small"
                                    value={editingNsRule.endTime}
                                    onChange={(e) => setEditingNsRule({ ...editingNsRule, endTime: e.target.value })}
                                    sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 12 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary' }}>Amount (LKR)</Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    size="small"
                                    value={isNaN(editingNsRule.amount) ? '' : editingNsRule.amount}
                                    onChange={(e) => setEditingNsRule({ ...editingNsRule, amount: parseFloat(e.target.value) })}
                                    InputProps={{ startAdornment: <InputAdornment position="start">Rs</InputAdornment> }}
                                    sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsNsEditDialogOpen(false)} sx={{ fontWeight: 700, textTransform: 'none' }}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleUpdateNsRule} 
                        disabled={updatingSettings}
                        sx={{ borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 3 }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Price Adjustment Edit Dialog */}
            <Dialog 
                open={isAdjustmentEditDialogOpen} 
                onClose={() => setIsAdjustmentEditDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: '24px', p: 1, minWidth: { xs: '95vw', sm: '500px' } } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Edit Price Adjustment</DialogTitle>
                <DialogContent>
                    {editingAdjustment && (
                        <Grid container spacing={3} sx={{ mt: 0.5 }}>
                            <Grid size={{ xs: 12, sm: 12 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary' }}>Adjustment Type</Typography>
                                <Box sx={{ display: 'flex', bgcolor: 'rgba(0,0,0,0.03)', p: 0.5, borderRadius: '14px', mt: 1 }}>
                                    <Button 
                                        fullWidth
                                        onClick={() => setEditingAdjustment({...editingAdjustment, adjustmentType: 'percentage'})}
                                        sx={{ 
                                            borderRadius: '10px', 
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            bgcolor: editingAdjustment.adjustmentType === 'percentage' ? '#0d9488' : 'transparent',
                                            color: editingAdjustment.adjustmentType === 'percentage' ? '#fff !important' : 'text.secondary',
                                        }}
                                    >
                                        Percentage (%)
                                    </Button>
                                    <Button 
                                        fullWidth
                                        onClick={() => setEditingAdjustment({...editingAdjustment, adjustmentType: 'fixed'})}
                                        sx={{ 
                                            borderRadius: '10px', 
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            bgcolor: editingAdjustment.adjustmentType === 'fixed' ? '#0d9488' : 'transparent',
                                            color: editingAdjustment.adjustmentType === 'fixed' ? '#fff !important' : 'text.secondary',
                                        }}
                                    >
                                        Fixed Amount (Rs)
                                    </Button>
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 12 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary' }}>
                                    {editingAdjustment.adjustmentType === 'percentage' ? 'Percentage' : 'Amount (LKR)'}
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    size="small"
                                    value={editingAdjustment.adjustmentType === 'percentage' ? editingAdjustment.percentage : (editingAdjustment.fixedAmount || 0)}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        if (editingAdjustment.adjustmentType === 'percentage') {
                                            setEditingAdjustment({...editingAdjustment, percentage: val});
                                        } else {
                                            setEditingAdjustment({...editingAdjustment, fixedAmount: val});
                                        }
                                    }}
                                    InputProps={{ 
                                        startAdornment: <InputAdornment position="start">
                                            {editingAdjustment.adjustmentType === 'percentage' ? '%' : 'Rs'}
                                        </InputAdornment> 
                                    }}
                                    sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary' }}>Vehicle</Typography>
                                <select
                                    value={editingAdjustment.vehicle}
                                    onChange={(e) => setEditingAdjustment({ ...editingAdjustment, vehicle: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '12px',
                                        border: '1px solid #cbd5e1',
                                        marginTop: '4px',
                                        outline: 'none',
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    <option value="All">All Vehicles</option>
                                    {uniqueVehicles.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary' }}>Trip Type</Typography>
                                <select
                                    value={editingAdjustment.type}
                                    onChange={(e) => setEditingAdjustment({ ...editingAdjustment, type: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '12px',
                                        border: '1px solid #cbd5e1',
                                        marginTop: '4px',
                                        outline: 'none',
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    <option value="All">All Types</option>
                                    {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary' }}>Min KM</Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    size="small"
                                    value={editingAdjustment.minKm}
                                    onChange={(e) => setEditingAdjustment({ ...editingAdjustment, minKm: parseInt(e.target.value) || 0 })}
                                    sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary' }}>Max KM</Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    size="small"
                                    value={editingAdjustment.maxKm}
                                    onChange={(e) => setEditingAdjustment({ ...editingAdjustment, maxKm: parseInt(e.target.value) || 0 })}
                                    sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', display: 'block' }}>From Date</Typography>
                                <input
                                    type="date"
                                    value={editingAdjustment.validFrom || ''}
                                    onChange={(e) => setEditingAdjustment({ ...editingAdjustment, validFrom: e.target.value || null })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '12px',
                                        border: '1.5px solid #e2e8f0',
                                        marginTop: '4px',
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, ml: 1, color: 'text.secondary', display: 'block' }}>To Date</Typography>
                                <input
                                    type="date"
                                    value={editingAdjustment.validTo || ''}
                                    onChange={(e) => setEditingAdjustment({ ...editingAdjustment, validTo: e.target.value || null })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '12px',
                                        border: '1.5px solid #e2e8f0',
                                        marginTop: '4px',
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsAdjustmentEditDialogOpen(false)} sx={{ fontWeight: 700, textTransform: 'none' }}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleUpdateAdjustment} 
                        disabled={adjusting}
                        sx={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)', borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 3 }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RateCardManagePage;

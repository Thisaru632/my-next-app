'use client';

import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Button, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    IconButton, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    Snackbar, 
    Alert,
    CircularProgress,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Checkbox,
    ListItemText,
    OutlinedInput,
    Chip,
    Tabs,
    Tab,
    Autocomplete,
    InputAdornment,
    Grid,
    Divider,
    Menu
} from '@mui/material';
import { 
    Add as AddIcon, 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    LocalTaxi as TaxiIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Warning as WarningIcon,
    Visibility as ViewIcon,
    Block as BlockIcon,
    CheckCircle as ApproveIcon,
    TrendingUp as TrendingUpIcon,
    Info as InfoIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useThemeContext } from '@/context/ThemeContext';
import { API_ENDPOINTS } from '@/config/api';

interface CabService {
    _id?: string;
    serviceName: string;
    hotlineNumbers: string;
    location: string;
    serviceType: string;
    comments?: string;
    status: string;
    createdAt?: string;
}

interface CabRate {
    _id?: string;
    refNo?: string;
    addedBy?: string;
    rateDate: string;
    cabCompanyName: string;
    hotline: string;
    nearTown: string;
    vehicle: string;
    startLocation: string;
    endLocation: string;
    tripType: string;
    km: number | '';
    hours: number | '';
    price: number | '';
    extraKmPrice: number | '';
    extraHourPrice: number | '';
    comment: string;
    calledSim?: string;
    createdAt?: string;
}

const SERVICE_TYPE_OPTIONS = [
    'Car', 'Van', 'Lorry', 'Bus', 'School Services', 'Staff Services', 'Airport Drop', 'Office Hires'
];

const PHONE_REGEX = /^(?:\+94|0)?[0-9]{9,10}$/;

const CabServicePage = () => {
    const { mode } = useThemeContext();
    const [services, setServices] = useState<CabService[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hotlineError, setHotlineError] = useState('');
    const [currentService, setCurrentService] = useState<CabService>({
        serviceName: '',
        hotlineNumbers: '',
        location: '',
        serviceType: '',
        status: 'Active'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [errorModal, setErrorModal] = useState({ open: false, message: '', title: '' });
    const [serviceTypeFilter, setServiceTypeFilter] = useState('All');
    const [userRole, setUserRole] = useState('');

    // Rates State
    const [activeTab, setActiveTab] = useState(0);
    const [rates, setRates] = useState<CabRate[]>([]);
    const [rateCardVehicles, setRateCardVehicles] = useState<string[]>([]);
    const [rateCompanyFilter, setRateCompanyFilter] = useState('All');
    const [rateVehicleFilter, setRateVehicleFilter] = useState('All');
    const [rateHourFilter, setRateHourFilter] = useState('All');
    const [rateStartDateFilter, setRateStartDateFilter] = useState('');
    const [rateEndDateFilter, setRateEndDateFilter] = useState('');
    const [rateMinKmFilter, setRateMinKmFilter] = useState('');
    const [rateMaxKmFilter, setRateMaxKmFilter] = useState('');
    const [openRateDialog, setOpenRateDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuRate, setMenuRate] = useState<CabRate | null>(null);
    const [isEditingRate, setIsEditingRate] = useState(false);
    const [isViewingRate, setIsViewingRate] = useState(false);
    const [senuRateCards, setSenuRateCards] = useState<any[]>([]);
    const [currentRate, setCurrentRate] = useState<CabRate>({
        rateDate: new Date().toISOString().split('T')[0],
        cabCompanyName: '',
        hotline: '',
        nearTown: '',
        vehicle: '',
        startLocation: '',
        endLocation: '',
        tripType: '',
        km: '',
        hours: '',
        price: '',
        extraKmPrice: '',
        extraHourPrice: '',
        comment: '',
        calledSim: ''
    });

    // SIM State
    const [sims, setSims] = useState<any[]>([]);
    const [openSimDialog, setOpenSimDialog] = useState(false);
    const [currentSim, setCurrentSim] = useState({ simNumber: 1, phoneNumber: '' });

    const fetchServices = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('staffToken');
            const response = await fetch(API_ENDPOINTS.CAB_SERVICES, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setServices(data);
            }
        } catch (error) {
            console.error('Error fetching cab services:', error);
            showSnackbar('Failed to load services', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchRates = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.CAB_RATES);
            if (response.ok) {
                const data = await response.json();
                setRates(data);
            }
        } catch (error) {
            console.error('Error fetching cab rates:', error);
        }
    };

    const fetchRateCardVehicles = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.RATE_CARD_CATEGORIES);
            if (response.ok) {
                const data = await response.json();
                setRateCardVehicles(data);
            }
        } catch (error) {
            console.error('Error fetching rate card vehicles:', error);
        }
    };

    const fetchSenuRateCards = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.RATE_CARDS);
            if (response.ok) {
                setSenuRateCards(await response.json());
            }
        } catch (error) {
            console.error('Error fetching senu rates:', error);
        }
    };

    const fetchSims = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.SIMS);
            if (response.ok) {
                setSims(await response.json());
            }
        } catch (error) {
            console.error('Error fetching sims:', error);
        }
    };

    useEffect(() => {
        const userStr = localStorage.getItem('staffUser');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserRole(user.role || '');
        }
        fetchServices();
        fetchRates();
        fetchRateCardVehicles();
        fetchSenuRateCards();
        fetchSims();
    }, []);

    const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleOpenDialog = (service?: CabService, viewing = false) => {
        setIsViewing(viewing);
        if (service) {
            setCurrentService({
                _id: service._id,
                serviceName: service.serviceName || '',
                hotlineNumbers: service.hotlineNumbers || '',
                location: service.location || '',
                serviceType: service.serviceType || '',
                status: service.status || 'Active',
                comments: service.comments || ''
            });
            setIsEditing(!viewing);
        } else {
            setCurrentService({
                serviceName: '',
                hotlineNumbers: '',
                location: '',
                serviceType: '',
                status: 'Active',
                comments: ''
            });
            setIsEditing(false);
        }
        setHotlineError('');
        setOpenDialog(true);
    };

    const handleReject = async (id: string) => {
        if (!window.confirm('Are you sure you want to reject this cab service?')) return;
        try {
            const token = localStorage.getItem('staffToken');
            const response = await fetch(`${API_ENDPOINTS.CAB_SERVICES}/${id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Rejected' })
            });

            if (response.ok) {
                showSnackbar('Service rejected successfully');
                fetchServices();
            } else {
                showSnackbar('Failed to update status', 'error');
            }
        } catch (error) {
            console.error('Error rejecting service:', error);
            showSnackbar('An error occurred', 'error');
        }
    };

    const handleApprove = async (id: string) => {
        if (!window.confirm('Are you sure you want to approve this cab service?')) return;
        try {
            const token = localStorage.getItem('staffToken');
            const response = await fetch(`${API_ENDPOINTS.CAB_SERVICES}/${id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Active' })
            });

            if (response.ok) {
                showSnackbar('Service approved successfully');
                fetchServices();
            } else {
                showSnackbar('Failed to update status', 'error');
            }
        } catch (error) {
            console.error('Error approving service:', error);
            showSnackbar('An error occurred', 'error');
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSubmit = async () => {
        if (!currentService.serviceName) {
            showSnackbar('Service Name is required', 'error');
            return;
        }

        if (hotlineError) {
            showSnackbar('Please fix the invalid hotline number(s)', 'error');
            return;
        }

        const currentNums = currentService.hotlineNumbers.split(',').map(num => num.trim().replace(/\D/g, ''));
        const duplicate = services.find(s => {
            if (isEditing && s._id === currentService._id) return false;
            const existingNums = s.hotlineNumbers.split(',').map(num => num.trim().replace(/\D/g, ''));
            return existingNums.some(num => num && currentNums.includes(num));
        });

        if (duplicate) {
            setErrorModal({
                open: true,
                title: 'Duplicate Hotline Detected',
                message: `This hotline number already belongs to "${duplicate.serviceName}". Duplicate entries are not allowed.`
            });
            return;
        }

        try {
            const token = localStorage.getItem('staffToken');
            const url = isEditing 
                ? `${API_ENDPOINTS.CAB_SERVICES}/${currentService._id}`
                : API_ENDPOINTS.CAB_SERVICES;
            
            const response = await fetch(url, {
                method: isEditing ? 'PATCH' : 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(currentService)
            });

            if (response.ok) {
                showSnackbar(isEditing ? 'Service updated successfully' : 'Service registered successfully');
                handleCloseDialog();
                fetchServices();
            } else {
                showSnackbar('Failed to save service', 'error');
            }
        } catch (error) {
            console.error('Error saving cab service:', error);
            showSnackbar('An error occurred', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this cab service?')) return;

        try {
            const token = localStorage.getItem('staffToken');
            const response = await fetch(`${API_ENDPOINTS.CAB_SERVICES}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                showSnackbar('Service deleted successfully');
                fetchServices();
            } else {
                showSnackbar('Failed to delete service', 'error');
            }
        } catch (error) {
            console.error('Error deleting cab service:', error);
            showSnackbar('An error occurred', 'error');
        }
    };

    const filteredServices = services.filter(s => {
        const matchesSearch = s.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.hotlineNumbers.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.serviceType && s.serviceType.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesType = serviceTypeFilter === 'All' || 
            (s.serviceType && s.serviceType.split(', ').includes(serviceTypeFilter));
        
        return matchesSearch && matchesType;
    });

    const filteredRates = rates.filter(r => {
        const matchesSearch = r.cabCompanyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.nearTown.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.startLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.endLocation.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCompany = rateCompanyFilter === 'All' || r.cabCompanyName === rateCompanyFilter;
        const matchesVehicle = rateVehicleFilter === 'All' || r.vehicle === rateVehicleFilter;
        const matchesHour = rateHourFilter === 'All' || r.hours === parseInt(rateHourFilter);
        
        let matchesDate = true;
        if (rateStartDateFilter || rateEndDateFilter) {
            const rDate = new Date(r.rateDate);
            if (rateStartDateFilter && rDate < new Date(rateStartDateFilter)) matchesDate = false;
            if (rateEndDateFilter && rDate > new Date(rateEndDateFilter)) matchesDate = false;
        }
        
        const minKm = rateMinKmFilter ? parseInt(rateMinKmFilter) : 0;
        const maxKm = rateMaxKmFilter ? parseInt(rateMaxKmFilter) : Infinity;
        const rKm = typeof r.km === 'number' ? r.km : 0;
        const matchesKm = rKm >= minKm && rKm <= maxKm;

        return matchesSearch && matchesCompany && matchesVehicle && matchesHour && matchesDate && matchesKm;
    });

    const clearRateFilters = () => {
        setRateCompanyFilter('All');
        setRateVehicleFilter('All');
        setRateHourFilter('All');
        setRateStartDateFilter('');
        setRateEndDateFilter('');
        setRateMinKmFilter('');
        setRateMaxKmFilter('');
        setSearchQuery('');
    };

    const uniqueRateCompanies = Array.from(new Set([
        ...rates.map(r => r.cabCompanyName),
        ...services.map(s => s.serviceName)
    ])).filter(Boolean).sort();
    const uniqueRateVehicles = Array.from(new Set(rates.map(r => r.vehicle))).sort();
    const uniqueRateHours = Array.from(new Set(rates.map(r => r.hours)))
        .filter((h): h is number => typeof h === 'number')
        .sort((a, b) => a - b);

    const getSenuRateDetails = (row: CabRate) => {
        if (!senuRateCards.length || !row.km || parseFloat(String(row.km)) === 0) return null;
        
        const simplify = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanVeh = simplify(row.vehicle);
        const cleanType = row.tripType.toLowerCase();

        const matches = senuRateCards.filter(card => {
            const cVeh = simplify(card.vehicle);
            const cType = simplify(card.type);
            
            const isOneway = cType.includes('oneway') || cType === 'drop';
            const isReturn = cType.includes('roundtrip') || cType.includes('bothway') || cType === 'return';
            
            const typeMatch = (cleanType === 'drop' && isOneway) ||
                              (cleanType === 'return' && isReturn);
            
            const vehMatch = cVeh === cleanVeh || cVeh.includes(cleanVeh) || cleanVeh.includes(cVeh);
            const dayMatch = card.days === 1;

            return typeMatch && vehMatch && (card.status === 'Approved' || card.status === 'Active') && dayMatch;
        });

        if (matches.length === 0) {
             const fallback = senuRateCards.filter(card => {
                const cVeh = simplify(card.vehicle);
                const cType = simplify(card.type);
                const isOneway = cType.includes('oneway') || cType === 'drop';
                const isReturn = cType.includes('roundtrip') || cType.includes('bothway') || cType === 'return';
                const typeMatch = (cleanType === 'drop' && isOneway) || (cleanType === 'return' && isReturn);
                const vehMatch = cVeh === cleanVeh || cVeh.includes(cleanVeh) || cleanVeh.includes(cVeh);
                return typeMatch && vehMatch;
            });
            if (fallback.length === 0) return null;
            matches.push(...fallback);
        }

        const rowKm = parseFloat(String(row.km)) || 0;
        const rowHrs = parseFloat(String(row.hours)) || 0;

        const exactKmMatches = matches.filter(c => parseFloat(String(c.km)) === rowKm);
        let matchedPkg = null;
        let method = '';

        if (exactKmMatches.length > 0) {
            const preferredExact = exactKmMatches.filter(c => c.category?.toLowerCase() === 'city & mountain');
            const targetExact = preferredExact.length > 0 ? preferredExact : exactKmMatches;
            matchedPkg = targetExact.reduce((min, curr) => (curr.hrs < min.hrs ? curr : min), targetExact[0]);
            method = preferredExact.length > 0 ? 'Exact KM Match (City & Mountain)' : 'Exact KM Match';
        } else {
            let priorityMatches = matches.filter(c => c.category?.toLowerCase() === 'city & mountain');
            const finalMatches = priorityMatches.length > 0 ? priorityMatches : matches;
            const sorted = finalMatches.sort((a, b) => a.km !== b.km ? a.km - b.km : a.hrs - b.hrs);
            const possible = sorted.filter(c => c.km <= rowKm).map(c => c.km);
            const maxBelow = possible.length > 0 ? Math.max(...possible) : null;
            matchedPkg = maxBelow !== null ? sorted.find(c => c.km === maxBelow) : sorted[0];
            method = priorityMatches.length > 0 ? (maxBelow !== null ? 'Closest Match Below (C&M)' : 'Smallest Package (C&M)') : (maxBelow !== null ? 'Closest Match Below' : 'Smallest Package');
        }

        if (!matchedPkg) return null;

        let total = matchedPkg.rateAmount;
        let extraKmCost = 0;
        let extraHrCost = 0;

        if (rowKm > matchedPkg.km) {
            extraKmCost = Math.ceil(rowKm - matchedPkg.km) * (matchedPkg.extraKMRate || 0);
            total += extraKmCost;
        }
        if (rowHrs > matchedPkg.hrs) {
            extraHrCost = (rowHrs - matchedPkg.hrs) * (matchedPkg.extraHrRate1 || 0);
            total += extraHrCost;
        }

        return {
            package: `${matchedPkg.km} KM / ${matchedPkg.hrs} Hrs`,
            method,
            baseRate: matchedPkg.rateAmount,
            extraKmRate: matchedPkg.extraKMRate,
            extraHrRate: matchedPkg.extraHrRate1,
            extraKmCost,
            extraHrCost,
            total,
            category: matchedPkg.category
        };
    };

    const calculateSenuRateValue = (row: CabRate) => {
        if (!row.km || parseFloat(String(row.km)) === 0) return '---';
        const details = getSenuRateDetails(row);
        return details ? details.total : 'No Card';
    };

    const handleOpenRateDialog = (rate?: CabRate, viewing = false) => {
        setIsViewingRate(viewing);
        if (rate) {
            setCurrentRate({
                ...rate,
                rateDate: rate.rateDate ? new Date(rate.rateDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                cabCompanyName: rate.cabCompanyName || '',
                hotline: rate.hotline || '',
                nearTown: rate.nearTown || '',
                vehicle: rate.vehicle || '',
                startLocation: rate.startLocation || '',
                endLocation: rate.endLocation || '',
                tripType: rate.tripType || '',
                km: rate.km ?? '',
                hours: rate.hours ?? '',
                price: rate.price ?? '',
                extraKmPrice: rate.extraKmPrice ?? '',
                extraHourPrice: rate.extraHourPrice ?? '',
                comment: rate.comment || '',
                calledSim: rate.calledSim || ''
            });
            setIsEditingRate(!viewing);
        } else {
            setCurrentRate({
                rateDate: new Date().toISOString().split('T')[0],
                cabCompanyName: '',
                hotline: '',
                nearTown: '',
                vehicle: '',
                startLocation: '',
                endLocation: '',
                tripType: '',
                km: '',
                hours: '',
                price: '',
                extraKmPrice: '',
                extraHourPrice: '',
                comment: '',
                calledSim: ''
            });
            setIsEditingRate(false);
        }
        setOpenRateDialog(true);
    };

    const handleEditRate = (rate: CabRate) => {
        setCurrentRate({
            ...rate,
            rateDate: rate.rateDate ? new Date(rate.rateDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            cabCompanyName: rate.cabCompanyName || '',
            hotline: rate.hotline || '',
            nearTown: rate.nearTown || '',
            vehicle: rate.vehicle || '',
            startLocation: rate.startLocation || '',
            endLocation: rate.endLocation || '',
            tripType: rate.tripType || '',
            km: rate.km ?? '',
            hours: rate.hours ?? '',
            price: rate.price ?? '',
            extraKmPrice: rate.extraKmPrice ?? '',
            extraHourPrice: rate.extraHourPrice ?? '',
            comment: rate.comment || '',
            calledSim: rate.calledSim || ''
        });
        setIsEditingRate(true);
        setIsViewingRate(false);
        setOpenRateDialog(true);
    };

    const handleRateSubmit = async () => {
        if (!currentRate.cabCompanyName) {
            showSnackbar('Cab Company Name is required', 'error');
            return;
        }

        try {
            const userStr = localStorage.getItem('staffUser');
            let addedBy = 'System';
            if (userStr) {
                const user = JSON.parse(userStr);
                addedBy = user.fullName || user.username || 'System';
            }

            const url = isEditingRate 
                ? `${API_ENDPOINTS.CAB_RATES}/${currentRate._id}`
                : API_ENDPOINTS.CAB_RATES;
            
            const response = await fetch(url, {
                method: isEditingRate ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...currentRate, addedBy })
            });

            if (response.ok) {
                showSnackbar(isEditingRate ? 'Rate updated successfully' : 'Rate added successfully');
                setOpenRateDialog(false);
                fetchRates();
            } else {
                showSnackbar('Failed to save rate', 'error');
            }
        } catch (error) {
            console.error('Error saving cab rate:', error);
            showSnackbar('An error occurred', 'error');
        }
    };

    const handleDeleteRate = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this rate?')) return;

        try {
            const response = await fetch(`${API_ENDPOINTS.CAB_RATES}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showSnackbar('Rate deleted successfully');
                fetchRates();
            } else {
                showSnackbar('Failed to delete rate', 'error');
            }
        } catch (error) {
            console.error('Error deleting rate:', error);
            showSnackbar('An error occurred', 'error');
        }
    };

    const handleSimSubmit = async () => {
        if (!currentSim.phoneNumber) {
            showSnackbar('Phone number is required', 'error');
            return;
        }
        try {
            const response = await fetch(API_ENDPOINTS.SIMS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentSim)
            });
            if (response.ok) {
                showSnackbar('SIM saved successfully');
                setOpenSimDialog(false);
                fetchSims();
            } else {
                showSnackbar('Failed to save SIM', 'error');
            }
        } catch (error) {
            console.error('Error saving SIM:', error);
            showSnackbar('An error occurred', 'error');
        }
    };

    const handleDeleteSim = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this SIM?')) return;
        try {
            const response = await fetch(`${API_ENDPOINTS.SIMS}/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                showSnackbar('SIM deleted successfully');
                fetchSims();
            }
        } catch (error) {
            console.error('Error deleting SIM:', error);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* SIM Registration Section */}
            <Paper 
                sx={{ 
                    p: 2.5, 
                    mb: 4, 
                    borderRadius: '20px', 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 3, 
                    alignItems: 'center', 
                    background: mode === 'light' ? 'rgba(59, 130, 246, 0.05)' : '#1e293b',
                    border: '1px solid',
                    borderColor: mode === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
                }}
            >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PhoneIcon /> Registered SIMs
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, flexGrow: 1 }}>
                    {sims.map((sim, index) => (
                        <Box 
                            key={sim._id || index} 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2, 
                                bgcolor: mode === 'light' ? '#fff' : 'rgba(255,255,255,0.05)', 
                                px: 2.5, 
                                py: 1.2, 
                                borderRadius: '14px', 
                                border: '1.5px solid', 
                                borderColor: 'divider',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderColor: '#3b82f6',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
                                }
                            }}
                        >
                            <Box sx={{ minWidth: 50 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase' }}>SIM {sim.simNumber}</Typography>
                                <Typography sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1rem' }}>{sim.phoneNumber}</Typography>
                            </Box>
                            {userRole === 'superadmin' && (
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => { 
                                            setCurrentSim({ 
                                                simNumber: sim.simNumber || 0, 
                                                phoneNumber: sim.phoneNumber || '' 
                                            }); 
                                            setOpenSimDialog(true); 
                                        }} 
                                        sx={{ color: '#3b82f6' }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDeleteSim(sim._id)} sx={{ color: '#ef4444' }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                    ))}

                    {userRole === 'superadmin' && (
                        <Button 
                            startIcon={<AddIcon />} 
                            variant="outlined" 
                            onClick={() => { 
                                const nextNum = sims.length > 0 ? Math.max(...sims.map(s => s.simNumber)) + 1 : 1;
                                setCurrentSim({ simNumber: nextNum, phoneNumber: '' }); 
                                setOpenSimDialog(true); 
                            }}
                            sx={{ 
                                borderRadius: '14px', 
                                textTransform: 'none', 
                                fontWeight: 700,
                                borderWidth: '2px',
                                '&:hover': { borderWidth: '2px' }
                            }}
                        >
                            Add SIM
                        </Button>
                    )}
                </Box>
            </Paper>
            <Box
                sx={{
                    mb: 4,
                    pb: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                    borderBottom: '2px solid',
                    borderImage: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
                    borderImageSlice: 1,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            background: mode === 'light'
                                ? 'linear-gradient(135deg, #1e293b 0%, #475569 100%)'
                                : 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5
                        }}
                    >
                        <TaxiIcon sx={{ fontSize: '2.5rem', color: '#3b82f6' }} />
                        SEARCHABLE Cab Service Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Maintain a registry of partner cab services and hotlines.
                    </Typography>
                </Box>
                
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => activeTab === 0 ? handleOpenDialog() : handleOpenRateDialog()}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        }
                    }}
                >
                    {activeTab === 0 ? 'Add New Cab Service' : 'Add New Rate'}
                </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={(_, v) => { setActiveTab(v); setSearchQuery(''); }}
                    sx={{
                        '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '1rem' }
                    }}
                >
                    <Tab label="Cab Services (Hotlines)" />
                    <Tab label="Company Rates" />
                </Tabs>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                    placeholder={activeTab === 0 ? "Search by name, location or hotline..." : "Search by company, town or vehicle..."}
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ 
                        flexGrow: 1,
                        maxWidth: '400px',
                        '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                    }}
                />

                {activeTab === 0 && (
                    <Autocomplete
                        size="small"
                        options={['All', ...SERVICE_TYPE_OPTIONS]}
                        value={serviceTypeFilter}
                        onChange={(_, newValue) => setServiceTypeFilter(newValue || 'All')}
                        renderInput={(params) => <TextField {...params} label="Filter by Service Type" />}
                        sx={{ 
                            minWidth: 220, 
                            '& .MuiOutlinedInput-root': { borderRadius: '12px' } 
                        }}
                    />
                )}

                {activeTab === 1 && (
                    <>
                        <Autocomplete
                            size="small"
                            options={['All', ...uniqueRateCompanies]}
                            value={rateCompanyFilter}
                            onChange={(_, newValue) => setRateCompanyFilter(newValue || 'All')}
                            renderInput={(params) => <TextField {...params} label="Company" />}
                            sx={{ 
                                minWidth: 200, 
                                '& .MuiOutlinedInput-root': { borderRadius: '12px' } 
                            }}
                        />

                        <Autocomplete
                            size="small"
                            options={['All', ...rateCardVehicles]}
                            value={rateVehicleFilter}
                            onChange={(_, newValue) => setRateVehicleFilter(newValue || 'All')}
                            renderInput={(params) => <TextField {...params} label="Vehicle" />}
                            sx={{ 
                                minWidth: 160, 
                                '& .MuiOutlinedInput-root': { borderRadius: '12px' } 
                            }}
                        />

                        <Autocomplete
                            size="small"
                            options={['All', ...uniqueRateHours.map(String)]}
                            getOptionLabel={(option) => option === 'All' ? 'All Hrs' : `${option}h`}
                            value={String(rateHourFilter)}
                            onChange={(_, newValue) => setRateHourFilter(newValue === 'All' ? 'All' : Number(newValue))}
                            renderInput={(params) => <TextField {...params} label="Hours" />}
                            sx={{ 
                                minWidth: 120, 
                                '& .MuiOutlinedInput-root': { borderRadius: '12px' } 
                            }}
                        />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                                label="From"
                                size="small"
                                type="date"
                                value={rateStartDateFilter}
                                onChange={(e) => setRateStartDateFilter(e.target.value)}
                                sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                InputLabelProps={{ shrink: true }}
                            />
                            <Typography variant="caption" color="text.secondary">to</Typography>
                            <TextField
                                label="To"
                                size="small"
                                type="date"
                                value={rateEndDateFilter}
                                onChange={(e) => setRateEndDateFilter(e.target.value)}
                                sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                                label="Min KM"
                                size="small"
                                type="number"
                                value={rateMinKmFilter}
                                onChange={(e) => setRateMinKmFilter(e.target.value)}
                                sx={{ width: 90, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                            <Typography variant="caption" color="text.secondary">-</Typography>
                            <TextField
                                label="Max KM"
                                size="small"
                                type="number"
                                value={rateMaxKmFilter}
                                onChange={(e) => setRateMaxKmFilter(e.target.value)}
                                sx={{ width: 90, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Box>

                        <Button 
                            variant="text" 
                            size="small" 
                            onClick={clearRateFilters}
                            sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
                        >
                            Reset
                        </Button>
                    </>
                )}

                <IconButton onClick={activeTab === 0 ? fetchServices : fetchRates} disabled={loading} color="primary" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)' }}>
                    <RefreshIcon className={loading ? 'spin' : ''} />
                </IconButton>
            </Box>

            {activeTab === 0 ? (
                <TableContainer 
                    component={Paper} 
                    sx={{ 
                        borderRadius: '20px', 
                        border: '1px solid', 
                        borderColor: 'divider',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        overflow: 'hidden'
                    }}
                >
                    {loading ? (
                        <Box sx={{ p: 8, textAlign: 'center' }}>
                            <CircularProgress />
                            <Typography sx={{ mt: 2 }}>Loading cab services...</Typography>
                        </Box>
                    ) : (
                        <Table>
                            <TableHead sx={{ bgcolor: mode === 'light' ? '#f8fafc' : '#1e293b' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Service Name</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Hotline Number</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Service Type</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Comments</TableCell>
                                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredServices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                            <Typography color="text.secondary">No cab services found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredServices.map((service) => (
                                        <TableRow key={service._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                {service.serviceName}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <PhoneIcon fontSize="small" color="action" />
                                                    {service.hotlineNumbers}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {service.location && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <LocationIcon fontSize="small" color="action" />
                                                        {service.location}
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 150 }}>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {service.serviceType?.split(', ').filter(Boolean).map((type) => (
                                                        <Chip 
                                                            key={type} 
                                                            label={type} 
                                                            size="small" 
                                                            variant="outlined"
                                                            sx={{ 
                                                                fontSize: '0.65rem',
                                                                height: '22px',
                                                                borderColor: 'rgba(59, 130, 246, 0.3)',
                                                                color: 'primary.main',
                                                                fontWeight: 600,
                                                                borderRadius: '6px'
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={service.status || 'Active'} 
                                                    size="small" 
                                                    color={service.status === 'Rejected' ? 'error' : (service.status === 'Pending' ? 'warning' : 'success')}
                                                    variant="outlined"
                                                    sx={{ fontWeight: 700, minWidth: 80, borderRadius: '8px' }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {service.comments || '---'}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                    <Tooltip title="View Details">
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => handleOpenDialog(service, true)}
                                                            sx={{ color: 'text.secondary' }}
                                                        >
                                                            <ViewIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit Service">
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => handleOpenDialog(service, false)}
                                                            color="primary"
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {service.status !== 'Active' && (
                                                        <Tooltip title="Approve Service">
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleApprove(service._id!)}
                                                                sx={{ color: '#22c55e' }}
                                                            >
                                                                <ApproveIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {service.status !== 'Rejected' && (
                                                        <Tooltip title="Reject Service">
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleReject(service._id!)}
                                                                sx={{ color: '#ef4444' }}
                                                            >
                                                                <BlockIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="Delete Permanently">
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => handleDelete(service._id!)}
                                                            sx={{ color: '#94a3b8' }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
            ) : (
                <TableContainer 
                    component={Paper} 
                    sx={{ 
                        borderRadius: '20px', 
                        border: '1px solid', 
                        borderColor: 'divider',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        overflowX: 'auto'
                    }}
                >
                    {loading ? (
                        <Box sx={{ p: 8, textAlign: 'center' }}>
                            <CircularProgress />
                            <Typography sx={{ mt: 2 }}>Loading rates...</Typography>
                        </Box>
                    ) : (
                        <Table size="small" sx={{ minWidth: 1200 }}>
                            <TableHead sx={{ bgcolor: mode === 'light' ? '#f8fafc' : '#1e293b' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>SIM</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Cab Company</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Vehicle</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Start</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>End</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>KM</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Hours</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Ex KM</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Ex Hr</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Cab Rate</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Senu Rate</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRates.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={17} align="center" sx={{ py: 8 }}>
                                            <Typography color="text.secondary">No company rates found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRates.map((rate) => (
                                        <TableRow key={rate._id} hover>
                                            <TableCell>{rate.rateDate ? new Date(rate.rateDate).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block', bgcolor: mode === 'light' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.05)', px: 1, py: 0.5, borderRadius: '6px', textAlign: 'center' }}>
                                                    {rate.calledSim || '---'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>{rate.cabCompanyName}</TableCell>
                                            <TableCell>{rate.vehicle}</TableCell>
                                            <TableCell>{rate.startLocation}</TableCell>
                                            <TableCell>{rate.endLocation}</TableCell>
                                            <TableCell>{rate.tripType}</TableCell>
                                            <TableCell>{rate.km}</TableCell>
                                            <TableCell>{rate.hours}</TableCell>
                                            <TableCell>{rate.extraKmPrice}</TableCell>
                                            <TableCell>{rate.extraHourPrice}</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{rate.price?.toLocaleString()}</TableCell>
                                            <TableCell sx={{ color: '#16a34a', fontWeight: 700 }}>
                                                {calculateSenuRateValue(rate) === 'No Card' || calculateSenuRateValue(rate) === '---' 
                                                    ? calculateSenuRateValue(rate) 
                                                    : `Rs. ${calculateSenuRateValue(rate).toLocaleString()}`}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={(e) => {
                                                        setAnchorEl(e.currentTarget);
                                                        setMenuRate(rate);
                                                    }}
                                                >
                                                    <MoreVertIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
            )}

            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '24px', p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {isViewing ? 'Cab Service Details' : (isEditing ? 'Edit Cab Service' : 'Add New Cab Service')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField
                            label="Service Name"
                            fullWidth
                            variant="outlined"
                            required
                            disabled={isViewing}
                            value={currentService.serviceName}
                            onChange={(e) => setCurrentService({ ...currentService, serviceName: e.target.value })}
                        />
                        <TextField
                            label="Hotline Number(s)"
                            fullWidth
                            variant="outlined"
                            helperText={hotlineError || "E.g. 0112337337 / 777456"}
                            error={!!hotlineError}
                            disabled={isViewing}
                            value={currentService.hotlineNumbers}
                            onChange={(e) => {
                                const val = e.target.value;
                                setCurrentService({ ...currentService, hotlineNumbers: val });
                                if (!val) {
                                    setHotlineError('');
                                    return;
                                }
                                const numbers = val.split(/[\/,]/);
                                let hasError = false;
                                for (const num of numbers) {
                                    const trimmed = num.trim();
                                    if (trimmed && !PHONE_REGEX.test(trimmed)) {
                                        hasError = true;
                                        break;
                                    }
                                }
                                setHotlineError(hasError ? 'Invalid format (e.g. 0XXXXXXXXX)' : '');
                            }}
                        />
                        <TextField
                            label="Location"
                            fullWidth
                            variant="outlined"
                            disabled={isViewing}
                            value={currentService.location}
                            onChange={(e) => setCurrentService({ ...currentService, location: e.target.value })}
                        />
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="service-type-multiple-chip-label">Service Type</InputLabel>
                            <Select
                                labelId="service-type-multiple-chip-label"
                                id="service-type-multiple-chip"
                                multiple
                                value={currentService.serviceType ? currentService.serviceType.split(', ').filter(Boolean) : []}
                                onChange={(e) => {
                                    const val = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                                    setCurrentService({ ...currentService, serviceType: (val as string[]).join(', ') });
                                }}
                                input={<OutlinedInput id="select-multiple-chip" label="Service Type" />}
                                disabled={isViewing}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(selected as string[]).map((value) => (
                                            <Chip 
                                                key={value} 
                                                label={value} 
                                                size="small" 
                                                sx={{ 
                                                    bgcolor: 'rgba(59, 130, 246, 0.1)', 
                                                    color: '#2563eb',
                                                    fontWeight: 600,
                                                    borderRadius: '6px'
                                                }} 
                                            />
                                        ))}
                                    </Box>
                                )}
                            >
                                {SERVICE_TYPE_OPTIONS.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        <Checkbox checked={currentService.serviceType.split(', ').indexOf(name) > -1} />
                                        <ListItemText primary={name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth variant="outlined" disabled={isViewing}>
                            <InputLabel id="service-status-label">Status</InputLabel>
                            <Select
                                labelId="service-status-label"
                                label="Status"
                                value={currentService.status || 'Active'}
                                onChange={(e) => setCurrentService({ ...currentService, status: e.target.value })}
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Rejected">Rejected</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Comments"
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            disabled={isViewing}
                            value={currentService.comments}
                            onChange={(e) => setCurrentService({ ...currentService, comments: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}>
                        {isViewing ? 'Close' : 'Cancel'}
                    </Button>
                    {!isViewing && (
                        <Button 
                            onClick={handleSubmit} 
                            variant="contained" 
                            sx={{ 
                                borderRadius: '12px', 
                                textTransform: 'none', 
                                px: 4,
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                            }}
                        >
                            {isEditing ? 'Update Changes' : 'Register Service'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Dialog 
                open={openRateDialog} 
                onClose={() => setOpenRateDialog(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '24px', p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {isViewingRate ? 'Company Rate Details' : (isEditingRate ? 'Edit Company Rate' : 'Add New Company Rate')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                            <TextField
                                label="Date"
                                type="date"
                                disabled={isViewingRate}
                                value={currentRate.rateDate}
                                onChange={(e) => setCurrentRate({ ...currentRate, rateDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                            {(isEditingRate || isViewingRate) && (
                                <TextField
                                    label="Reference Number"
                                    disabled
                                    value={currentRate.refNo || currentRate._id?.slice(-6) || '---'}
                                />
                            )}
                            <Autocomplete
                                freeSolo
                                options={uniqueRateCompanies}
                                value={currentRate.cabCompanyName}
                                disabled={isViewingRate}
                                onChange={(_, newValue) => {
                                    if (newValue) {
                                        const company = services.find(s => s.serviceName === newValue);
                                        if (company) {
                                            setCurrentRate(prev => ({ 
                                                ...prev, 
                                                cabCompanyName: newValue,
                                                hotline: company.hotlineNumbers,
                                                nearTown: company.location
                                            }));
                                        } else {
                                            setCurrentRate(prev => ({ ...prev, cabCompanyName: newValue }));
                                        }
                                    }
                                }}
                                onInputChange={(_, newValue) => {
                                    if (newValue) {
                                        const match = services.find(s => s.serviceName.toLowerCase() === newValue.toLowerCase());
                                        if (match) {
                                            setCurrentRate(prev => ({ 
                                                ...prev, 
                                                cabCompanyName: newValue,
                                                hotline: match.hotlineNumbers,
                                                nearTown: match.location
                                            }));
                                        } else {
                                            setCurrentRate(prev => ({ ...prev, cabCompanyName: newValue }));
                                        }
                                    }
                                }}
                                renderInput={(params) => <TextField {...params} label="Cab Company Name" required />}
                                freeSolo
                            />
                            <TextField
                                label="Hotline"
                                disabled={isViewingRate}
                                value={currentRate.hotline}
                                onChange={(e) => setCurrentRate({ ...currentRate, hotline: e.target.value })}
                            />
                            <TextField
                                label="Near Town"
                                disabled={isViewingRate}
                                value={currentRate.nearTown}
                                onChange={(e) => setCurrentRate({ ...currentRate, nearTown: e.target.value })}
                            />
                            <Autocomplete
                                options={rateCardVehicles}
                                disabled={isViewingRate}
                                value={currentRate.vehicle}
                                onChange={(_, newValue) => setCurrentRate({ ...currentRate, vehicle: newValue || '' })}
                                onInputChange={(_, newValue) => setCurrentRate({ ...currentRate, vehicle: newValue })}
                                renderInput={(params) => <TextField {...params} label="Vehicle" />}
                                freeSolo
                            />
                            <TextField
                                label="Start Location"
                                disabled={isViewingRate}
                                value={currentRate.startLocation}
                                onChange={(e) => setCurrentRate({ ...currentRate, startLocation: e.target.value })}
                            />
                            <TextField
                                label="End Location"
                                disabled={isViewingRate}
                                value={currentRate.endLocation}
                                onChange={(e) => setCurrentRate({ ...currentRate, endLocation: e.target.value })}
                            />
                            <FormControl fullWidth disabled={isViewingRate}>
                                <InputLabel>Trip Type</InputLabel>
                                <Select
                                    label="Trip Type"
                                    disabled={isViewingRate}
                                    value={currentRate.tripType}
                                    onChange={(e) => setCurrentRate({ ...currentRate, tripType: e.target.value })}
                                >
                                    <MenuItem value="Drop">Drop</MenuItem>
                                    <MenuItem value="Return">Return</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="KM"
                                type="number"
                                disabled={isViewingRate}
                                value={currentRate.km}
                                onChange={(e) => setCurrentRate({ ...currentRate, km: e.target.value ? Number(e.target.value) : '' })}
                            />
                            <TextField
                                label="Hours"
                                type="number"
                                disabled={isViewingRate}
                                value={currentRate.hours}
                                onChange={(e) => setCurrentRate({ ...currentRate, hours: e.target.value ? Number(e.target.value) : '' })}
                            />
                            <TextField
                                label="Price"
                                type="number"
                                disabled={isViewingRate}
                                value={currentRate.price}
                                onChange={(e) => setCurrentRate({ ...currentRate, price: e.target.value ? Number(e.target.value) : '' })}
                                sx={{ '& .MuiInputBase-input': { fontWeight: 700, color: 'primary.main' } }}
                            />
                            <TextField
                                label="Extra Per KM"
                                type="number"
                                disabled={isViewingRate}
                                value={currentRate.extraKmPrice}
                                onChange={(e) => setCurrentRate({ ...currentRate, extraKmPrice: e.target.value ? Number(e.target.value) : '' })}
                            />
                            <TextField
                                label="Extra Per Hour"
                                type="number"
                                disabled={isViewingRate}
                                value={currentRate.extraHourPrice}
                                onChange={(e) => setCurrentRate({ ...currentRate, extraHourPrice: e.target.value ? Number(e.target.value) : '' })}
                            />
                            <Autocomplete
                                options={sims.map(sim => `SIM ${sim.simNumber}`)}
                                value={currentRate.calledSim || ''}
                                disabled={isViewingRate}
                                onChange={(_, newValue) => setCurrentRate({ ...currentRate, calledSim: newValue || '' })}
                                renderInput={(params) => <TextField {...params} label="Called SIM" />}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Box>
                         <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                label="Comment"
                                fullWidth
                                multiline
                                rows={2}
                                disabled={isViewingRate}
                                value={currentRate.comment}
                                onChange={(e) => setCurrentRate({ ...currentRate, comment: e.target.value })}
                            />
                            {(isEditingRate || isViewingRate) && (
                                <TextField
                                    label="Added By"
                                    disabled
                                    value={currentRate.addedBy || 'System'}
                                />
                            )}
                        </Box>
                        
                        {(isViewingRate || isEditingRate) && (
                            (() => {
                                const details = getSenuRateDetails(currentRate);
                                if (!details) return null;
                                return (
                                    <Box sx={{ 
                                        mt: 1, 
                                        p: 2.5, 
                                        borderRadius: '20px', 
                                        bgcolor: mode === 'light' ? 'rgba(59, 130, 246, 0.04)' : 'rgba(59, 130, 246, 0.08)',
                                        border: '1px solid',
                                        borderColor: 'rgba(59, 130, 246, 0.2)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <Box sx={{ 
                                            position: 'absolute', 
                                            top: 0, 
                                            right: 0, 
                                            p: 1.5, 
                                            bgcolor: 'primary.main', 
                                            color: 'white',
                                            borderRadius: '0 0 0 20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                                        }}>
                                            <TrendingUpIcon fontSize="small" />
                                            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.05em' }}>SENU RATE ENGINE</Typography>
                                        </Box>

                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <InfoIcon fontSize="small" /> Comparison with Senu Rate Card
                                        </Typography>

                                        <Box sx={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                                            gap: 3 
                                        }}>
                                            <TextField
                                                label="Matched Base Package"
                                                fullWidth
                                                disabled
                                                value={`${details.package}`}
                                                variant="outlined"
                                                size="small"
                                                helperText={`Standard Package Price: Rs. ${details.baseRate.toLocaleString()}`}
                                                InputProps={{ sx: { borderRadius: '10px', bgcolor: mode === 'light' ? 'white' : 'rgba(255,255,255,0.05)', fontWeight: 700 } }}
                                            />
                                            <TextField
                                                label="Selection Logic"
                                                fullWidth
                                                disabled
                                                value={details.method}
                                                variant="outlined"
                                                size="small"
                                                helperText="How this package was chosen from the rate card"
                                                InputProps={{ sx: { borderRadius: '10px', bgcolor: mode === 'light' ? 'white' : 'rgba(255,255,255,0.05)' } }}
                                            />
                                            <TextField
                                                label="Extra Distance (KM) Breakdown"
                                                fullWidth
                                                disabled
                                                value={`@ Rs. ${details.extraKmRate}/km → Charge: Rs. ${details.extraKmCost.toLocaleString()}`}
                                                variant="outlined"
                                                size="small"
                                                helperText={details.extraKmCost > 0 ? `Calculated for additional distance beyond base KM` : "No additional distance charge"}
                                                InputProps={{ sx: { borderRadius: '10px', bgcolor: mode === 'light' ? 'white' : 'rgba(255,255,255,0.05)' } }}
                                            />
                                            <TextField
                                                label="Extra Time (Hrs) Breakdown"
                                                fullWidth
                                                disabled
                                                value={`@ Rs. ${details.extraHrRate}/hr → Charge: Rs. ${details.extraHrCost.toLocaleString()}`}
                                                variant="outlined"
                                                size="small"
                                                helperText={details.extraHrCost > 0 ? `Calculated for additional hours beyond base package` : "No additional hours charge"}
                                                InputProps={{ sx: { borderRadius: '10px', bgcolor: mode === 'light' ? 'white' : 'rgba(255,255,255,0.05)' } }}
                                            />

                                            <Box sx={{ 
                                                gridColumn: { xs: 'span 1', md: 'span 2' },
                                                mt: 1,
                                                p: 2.5,
                                                borderRadius: '16px',
                                                bgcolor: 'rgba(34, 197, 94, 0.08)',
                                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                                display: 'flex',
                                                flexDirection: { xs: 'column', sm: 'row' },
                                                justifyContent: 'space-between',
                                                alignItems: { xs: 'flex-start', sm: 'center' },
                                                gap: 2
                                            }}>
                                                <Box>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5, letterSpacing: '0.05em' }}>
                                                        TOTAL CALCULATED SENU RATE
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem' }}>
                                                        Base Rs. {details.baseRate.toLocaleString()} 
                                                        {details.extraKmCost > 0 && ` + KM Rs. ${details.extraKmCost.toLocaleString()}`}
                                                        {details.extraHrCost > 0 && ` + Hrs Rs. ${details.extraHrCost.toLocaleString()}`}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>
                                                        Rs. {details.total.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                            })()
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenRateDialog(false)} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}>
                        {isViewingRate ? 'Close' : 'Cancel'}
                    </Button>
                    {!isViewingRate && (
                        <Button 
                            onClick={handleRateSubmit} 
                            variant="contained" 
                            sx={{ 
                                borderRadius: '12px', 
                                textTransform: 'none', 
                                px: 4,
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                            }}
                        >
                            {isEditingRate ? 'Update Rate' : 'Add Rate'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Dialog 
                open={openSimDialog} 
                onClose={() => setOpenSimDialog(false)}
                PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>SIM Registration</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1, minWidth: 300 }}>
                        <TextField
                            label="SIM Number"
                            type="number"
                            fullWidth
                            value={currentSim.simNumber}
                            onChange={(e) => setCurrentSim({ ...currentSim, simNumber: parseInt(e.target.value) })}
                        />
                        <TextField
                            label="Phone Number"
                            fullWidth
                            value={currentSim.phoneNumber}
                            onChange={(e) => setCurrentSim({ ...currentSim, phoneNumber: e.target.value })}
                            placeholder="e.g. 077XXXXXXXX"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenSimDialog(false)} sx={{ fontWeight: 600, textTransform: 'none' }}>Cancel</Button>
                    <Button onClick={handleSimSubmit} variant="contained" sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}>Save SIM</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                    sx={{ borderRadius: '12px', fontWeight: 600 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Dialog 
                open={errorModal.open} 
                onClose={() => setErrorModal({ ...errorModal, open: false })}
                PaperProps={{
                    sx: { borderRadius: '24px', p: 1, maxWidth: '400px' }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: 'error.main', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="error" />
                    Duplicate Hotline Detected
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, mt: 1 }}>
                        {errorModal.message}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setErrorModal({ ...errorModal, open: false })}
                        variant="contained"
                        color="error"
                        fullWidth
                        sx={{ 
                            borderRadius: '12px', 
                            textTransform: 'none', 
                            py: 1.5, 
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)'
                        }}
                    >
                        I'll Fix It
                    </Button>
                </DialogActions>
            </Dialog>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => {
                    setAnchorEl(null);
                    setMenuRate(null);
                }}
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        minWidth: 150,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <MenuItem onClick={() => {
                    if (menuRate) {
                        setCurrentRate(menuRate);
                        setIsEditingRate(false);
                        setIsViewingRate(true);
                        setOpenRateDialog(true);
                    }
                    setAnchorEl(null);
                }}>
                    <ViewIcon sx={{ mr: 1.5, fontSize: '1.1rem', color: 'text.secondary' }} />
                    View Details
                </MenuItem>
                <MenuItem onClick={() => {
                    if (menuRate) handleEditRate(menuRate);
                    setAnchorEl(null);
                }}>
                    <EditIcon sx={{ mr: 1.5, fontSize: '1.1rem', color: 'primary.main' }} />
                    Edit Rate
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={() => {
                    if (menuRate) handleDeleteRate(menuRate._id!);
                    setAnchorEl(null);
                }} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1.5, fontSize: '1.1rem' }} />
                    Delete Rate
                </MenuItem>
            </Menu>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
            `}</style>
        </Box>
    );
};

export default CabServicePage;

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
    Autocomplete
} from '@mui/material';
import { 
    Add as AddIcon, 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    LocalTaxi as TaxiIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon
} from '@mui/icons-material';
import { useThemeContext } from '@/context/ThemeContext';
import { API_ENDPOINTS } from '@/config/api';

interface CabService {
    _id?: string;
    serviceName: string;
    hotlineNumbers: string;
    location: string;
    serviceType: string;
    comments: string;
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
        comments: '',
        status: 'Active'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Rates State
    const [activeTab, setActiveTab] = useState(0);
    const [rates, setRates] = useState<CabRate[]>([]);
    const [rateCardVehicles, setRateCardVehicles] = useState<string[]>([]);
    const [openRateDialog, setOpenRateDialog] = useState(false);
    const [isEditingRate, setIsEditingRate] = useState(false);
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
        comment: ''
    });

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

    useEffect(() => {
        fetchServices();
        fetchRates();
        fetchRateCardVehicles();
    }, []);

    const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleOpenDialog = (service?: CabService) => {
        if (service) {
            setCurrentService(service);
            setIsEditing(true);
        } else {
            setCurrentService({
                serviceName: '',
                hotlineNumbers: '',
                location: '',
                serviceType: '',
                comments: '',
                status: 'Active'
            });
            setIsEditing(false);
        }
        setHotlineError('');
        setOpenDialog(true);
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

    const filteredServices = services.filter(s => 
        s.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.hotlineNumbers.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.serviceType && s.serviceType.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredRates = rates.filter(r => 
        r.cabCompanyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nearTown.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.startLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.endLocation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenRateDialog = (rate?: CabRate) => {
        if (rate) {
            setCurrentRate({
                ...rate,
                rateDate: rate.rateDate ? new Date(rate.rateDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            });
            setIsEditingRate(true);
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
                comment: ''
            });
            setIsEditingRate(false);
        }
        setOpenRateDialog(true);
    };

    const handleRateSubmit = async () => {
        if (!currentRate.cabCompanyName) {
            showSnackbar('Cab Company Name is required', 'error');
            return;
        }

        try {
            // Get current user for tracking
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

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Page Header */}
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
                        Cab Service Management
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

            {/* Search and Refresh */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    placeholder="Search by name, location, or phone..."
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                    sx={{ 
                        flex: 1, 
                        maxWidth: '500px',
                        '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                    }}
                />
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
                                    <TableCell sx={{ fontWeight: 700 }}>Comments</TableCell>
                                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredServices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
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
                                            <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {service.comments}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Edit">
                                                    <IconButton onClick={() => handleOpenDialog(service)} size="small" color="primary">
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton onClick={() => handleDelete(service._id!)} size="small" color="error">
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
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
                                    <TableCell sx={{ fontWeight: 700 }}>Ref No</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Cab Company</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Hotline</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Near Town</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Vehicle</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Start</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>End</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>KM</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Hours</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Ex KM</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Ex Hr</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Added By</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Comment</TableCell>
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
                                            <TableCell>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', bgcolor: 'rgba(59, 130, 246, 0.1)', px: 1, py: 0.5, borderRadius: '4px' }}>
                                                    {rate.refNo || '---'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{rate.rateDate ? new Date(rate.rateDate).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>{rate.cabCompanyName}</TableCell>
                                            <TableCell>{rate.hotline}</TableCell>
                                            <TableCell>{rate.nearTown}</TableCell>
                                            <TableCell>{rate.vehicle}</TableCell>
                                            <TableCell>{rate.startLocation}</TableCell>
                                            <TableCell>{rate.endLocation}</TableCell>
                                            <TableCell>{rate.tripType}</TableCell>
                                            <TableCell>{rate.km}</TableCell>
                                            <TableCell>{rate.hours}</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{rate.price?.toLocaleString()}</TableCell>
                                            <TableCell>{rate.extraKmPrice}</TableCell>
                                            <TableCell>{rate.extraHourPrice}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={rate.addedBy || 'System'} 
                                                    size="small" 
                                                    sx={{ fontSize: '0.65rem', height: '20px', bgcolor: 'rgba(0,0,0,0.05)' }} 
                                                />
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rate.comment}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleOpenRateDialog(rate)} size="small" color="primary">
                                                    <EditIcon fontSize="inherit" />
                                                </IconButton>
                                                <IconButton onClick={() => handleDeleteRate(rate._id!)} size="small" color="error">
                                                    <DeleteIcon fontSize="inherit" />
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

            {/* Dialog */}
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
                    {isEditing ? 'Edit Cab Service' : 'Add New Cab Service'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField
                            label="Service Name"
                            fullWidth
                            variant="outlined"
                            required
                            value={currentService.serviceName}
                            onChange={(e) => setCurrentService({ ...currentService, serviceName: e.target.value })}
                        />
                        <TextField
                            label="Hotline Number(s)"
                            fullWidth
                            variant="outlined"
                            helperText={hotlineError || "E.g. 0112337337 / 777456"}
                            error={!!hotlineError}
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
                        <TextField
                            label="Comments"
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            value={currentService.comments}
                            onChange={(e) => setCurrentService({ ...currentService, comments: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}>
                        Cancel
                    </Button>
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
                </DialogActions>
            </Dialog>

            {/* Rate Dialog */}
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
                    {isEditingRate ? 'Edit Company Rate' : 'Add New Company Rate'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                            <TextField
                                label="Date"
                                type="date"
                                value={currentRate.rateDate}
                                onChange={(e) => setCurrentRate({ ...currentRate, rateDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                            <Autocomplete
                                options={services}
                                getOptionLabel={(option) => typeof option === 'string' ? option : option.serviceName}
                                value={services.find(s => s.serviceName === currentRate.cabCompanyName) || null}
                                onChange={(_, newValue) => {
                                    if (newValue && typeof newValue !== 'string') {
                                        setCurrentRate({
                                            ...currentRate,
                                            cabCompanyName: newValue.serviceName,
                                            hotline: newValue.hotlineNumbers,
                                            nearTown: newValue.location
                                        });
                                    } else if (!newValue) {
                                        setCurrentRate({
                                            ...currentRate,
                                            cabCompanyName: '',
                                            hotline: '',
                                            nearTown: ''
                                        });
                                    }
                                }}
                                onInputChange={(_, newValue) => {
                                    if (typeof newValue === 'string') {
                                        // Try to find a match as the user types
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
                                value={currentRate.hotline}
                                onChange={(e) => setCurrentRate({ ...currentRate, hotline: e.target.value })}
                            />
                            <TextField
                                label="Near Town"
                                value={currentRate.nearTown}
                                onChange={(e) => setCurrentRate({ ...currentRate, nearTown: e.target.value })}
                            />
                            <Autocomplete
                                options={rateCardVehicles}
                                value={currentRate.vehicle}
                                onChange={(_, newValue) => setCurrentRate({ ...currentRate, vehicle: newValue || '' })}
                                onInputChange={(_, newValue) => setCurrentRate({ ...currentRate, vehicle: newValue })}
                                renderInput={(params) => <TextField {...params} label="Vehicle" />}
                                freeSolo
                            />
                            <TextField
                                label="Start Location"
                                value={currentRate.startLocation}
                                onChange={(e) => setCurrentRate({ ...currentRate, startLocation: e.target.value })}
                            />
                            <TextField
                                label="End Location"
                                value={currentRate.endLocation}
                                onChange={(e) => setCurrentRate({ ...currentRate, endLocation: e.target.value })}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Trip Type</InputLabel>
                                <Select
                                    label="Trip Type"
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
                                value={currentRate.km}
                                onChange={(e) => setCurrentRate({ ...currentRate, km: e.target.value ? Number(e.target.value) : '' })}
                            />
                            <TextField
                                label="Hours"
                                type="number"
                                value={currentRate.hours}
                                onChange={(e) => setCurrentRate({ ...currentRate, hours: e.target.value ? Number(e.target.value) : '' })}
                            />
                            <TextField
                                label="Price"
                                type="number"
                                value={currentRate.price}
                                onChange={(e) => setCurrentRate({ ...currentRate, price: e.target.value ? Number(e.target.value) : '' })}
                                sx={{ '& .MuiInputBase-input': { fontWeight: 700, color: 'primary.main' } }}
                            />
                            <TextField
                                label="Extra Per KM"
                                type="number"
                                value={currentRate.extraKmPrice}
                                onChange={(e) => setCurrentRate({ ...currentRate, extraKmPrice: e.target.value ? Number(e.target.value) : '' })}
                            />
                            <TextField
                                label="Extra Per Hour"
                                type="number"
                                value={currentRate.extraHourPrice}
                                onChange={(e) => setCurrentRate({ ...currentRate, extraHourPrice: e.target.value ? Number(e.target.value) : '' })}
                            />
                        </Box>
                        <TextField
                            label="Comment"
                            fullWidth
                            multiline
                            rows={2}
                            value={currentRate.comment}
                            onChange={(e) => setCurrentRate({ ...currentRate, comment: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenRateDialog(false)} sx={{ borderRadius: '12px', textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleRateSubmit} 
                        variant="contained" 
                        sx={{ 
                            borderRadius: '12px', 
                            textTransform: 'none', 
                            px: 4,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                        }}
                    >
                        {isEditingRate ? 'Update Rate' : 'Add Rate'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
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

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                
                /* Remove spin buttons from number inputs */
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

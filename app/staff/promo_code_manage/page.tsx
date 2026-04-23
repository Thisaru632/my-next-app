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
    Chip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    CircularProgress,
    Alert,
    Tooltip,
    Divider,
    MenuItem,
    Select,
    Checkbox,
    ListItemText,
    FormControl,
    InputLabel,
    OutlinedInput
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    LocalOffer as LocalOfferIcon,
    Visibility as ViewIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { API_ENDPOINTS } from '@/config/api';

interface PromoCode {
    _id: string;
    code: string;
    discountType: 'Percentage' | 'Fixed Amount';
    discountValue: number;
    applicableVehicle: string;
    description: string;
    validFrom: string | null;
    validTo: string | null;
    status: 'Active' | 'Expired' | 'Disabled';
    usageCount: number;
    createdAt: string;
}

interface PromoCodeManageProps {
    availableVehicles?: string[];
}

const PromoCodeManagePage = ({ availableVehicles }: PromoCodeManageProps) => {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // Form/Selected states
    const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'Percentage' as 'Percentage' | 'Fixed Amount',
        discountValue: '',
        applicableVehicles: ['All'],
        description: '',
        validFrom: '',
        validTo: '',
        status: 'Active'
    });

    const fetchPromoCodes = async () => {
        try {
            setLoading(true);
            const res = await fetch(API_ENDPOINTS.PROMO_CODES);
            if (!res.ok) throw new Error('Failed to fetch promo codes');
            const data = await res.json();
            setPromoCodes(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const vehicleNames = availableVehicles || [
        'ALTO | 3 Seater', 
        'WAGON R | 3 Seater', 
        'AQUA | 4 Seater', 
        'AXIO | 4 Seater',
        'KDH HIGH ROOF VAN | 14 Seater', 
        'KDH FLAT ROOF VAN | 9 Seater', 
        'MINI VAN | 6 Seater', 
        'DUAL AC VAN | 9 Seater', 
        'NON AC VAN | 14 Seater',
        'BUS | AC 29 Seater', 
        'BUS | Non AC 29 Seater',
        'BUS | AC 32 Seater', 
        'BUS | Non AC 32 Seater',
        'VEZEL | 4 Seater'
    ];

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const handleOpenCreate = () => {
        setSelectedPromo(null);
        setFormData({
            code: '',
            discountType: 'Percentage',
            discountValue: '',
            applicableVehicles: ['All'],
            description: '',
            validFrom: '',
            validTo: '',
            status: 'Active'
        });
        setOpenDialog(true);
    };

    const handleOpenEdit = (promo: PromoCode) => {
        setSelectedPromo(promo);
        setFormData({
            code: promo.code,
            discountType: promo.discountType,
            discountValue: promo.discountValue.toString(),
            applicableVehicles: promo.applicableVehicle ? promo.applicableVehicle.split(',').map(v => v.trim()) : ['All'],
            description: promo.description || '',
            validFrom: promo.validFrom ? new Date(promo.validFrom).toISOString().split('T')[0] : '',
            validTo: promo.validTo ? new Date(promo.validTo).toISOString().split('T')[0] : '',
            status: promo.status
        });
        setOpenDialog(true);
    };

    const handleOpenView = (promo: PromoCode) => {
        setSelectedPromo(promo);
        setViewDialogOpen(true);
    };

    const handleOpenDelete = (promo: PromoCode) => {
        setSelectedPromo(promo);
        setDeleteConfirmOpen(true);
    };

    const handleSave = async () => {
        try {
            const url = selectedPromo
                ? `${API_ENDPOINTS.PROMO_CODES}/${selectedPromo._id}`
                : API_ENDPOINTS.PROMO_CODES;
            const method = selectedPromo ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    applicableVehicle: formData.applicableVehicles.join(', ')
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to save promo code');
            }

            setSuccess(`Promo code ${selectedPromo ? 'updated' : 'created'} successfully!`);
            setOpenDialog(false);
            fetchPromoCodes();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleDelete = async () => {
        if (!selectedPromo) return;
        try {
            const res = await fetch(`${API_ENDPOINTS.PROMO_CODES}/${selectedPromo._id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete promo code');

            setSuccess('Promo code deleted successfully!');
            setDeleteConfirmOpen(false);
            fetchPromoCodes();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(null), 5000);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'success';
            case 'Expired': return 'error';
            case 'Disabled': return 'default';
            default: return 'primary';
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
                    borderImage: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #10b981 100%)',
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
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                    }}
                >
                    Promo Code Manager
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                    }}
                >
                    New Promo Code
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : promoCodes.length === 0 ? (
                /* Empty State */
                <Paper
                    sx={{
                        p: 8,
                        textAlign: 'center',
                        borderRadius: '24px',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                    }}
                >
                    <LocalOfferIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        No promo codes found
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.disabled', mb: 3 }}>
                        Start by creating your first promotional discount code.
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={handleOpenCreate}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Create Promo Code
                    </Button>
                </Paper>
            ) : (
                /* Data Table */
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 4px 25px rgba(0,0,0,0.04)',
                        overflow: 'hidden'
                    }}
                >
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Vehicle</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Discount</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Valid Period</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Usage</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {promoCodes.map((promo) => (
                                <TableRow key={promo._id} hover>
                                    <TableCell>
                                        <Typography sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '0.05em' }}>
                                            {promo.code}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {(promo.applicableVehicle || 'All').split(',').map((v, i) => (
                                                <Chip
                                                    key={i}
                                                    label={v.trim()}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontWeight: 600, borderRadius: '6px' }}
                                                />
                                            ))}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={promo.discountType === 'Percentage' ? `${promo.discountValue ?? 0}% OFF` : `LKR ${(promo.discountValue ?? 0).toLocaleString()} OFF`}
                                            size="small"
                                            sx={{ fontWeight: 700, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                                            {promo.validFrom ? new Date(promo.validFrom).toLocaleDateString() : '∞'}
                                            {' → '}
                                            {promo.validTo ? new Date(promo.validTo).toLocaleDateString() : '∞'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={promo.status}
                                            size="small"
                                            color={getStatusColor(promo.status) as any}
                                            sx={{ fontWeight: 700, borderRadius: '6px' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {promo.usageCount} times
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="View Details">
                                                <IconButton size="small" onClick={() => handleOpenView(promo)} sx={{ color: 'info.main' }}>
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => handleOpenEdit(promo)} sx={{ color: 'warning.main' }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={() => handleOpenDelete(promo)} sx={{ color: 'error.main' }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                PaperProps={{ sx: { borderRadius: '24px', p: 1, minWidth: '450px' } }}
            >
                <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
                    {selectedPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
                </DialogTitle>
                <Divider sx={{ mx: 3 }} />
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Promo Code"
                            placeholder="e.g. SUMMER20"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            disabled={!!selectedPromo}
                            helperText="This is what the customer enters at checkout"
                        />
                        <TextField
                            select
                            fullWidth
                            label="Discount Type"
                            value={formData.discountType}
                            onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                        >
                            <MenuItem value="Percentage">Percentage (%)</MenuItem>
                            <MenuItem value="Fixed Amount">Fixed Amount (LKR)</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            label={formData.discountType === 'Percentage' ? "Discount Percentage (%)" : "Discount Amount (LKR)"}
                            type="number"
                            value={formData.discountValue}
                            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel id="applicable-vehicles-label">Applicable Vehicles</InputLabel>
                            <Select
                                labelId="applicable-vehicles-label"
                                multiple
                                value={formData.applicableVehicles}
                                onChange={(e) => {
                                    const value = e.target.value as string[];
                                    // If 'All' is selected, clear other selections
                                    if (value.includes('All') && !formData.applicableVehicles.includes('All')) {
                                        setFormData({ ...formData, applicableVehicles: ['All'] });
                                    } else if (value.length > 1 && value.includes('All')) {
                                        // If other vehicles are selected while 'All' is present, remove 'All'
                                        setFormData({ ...formData, applicableVehicles: value.filter(v => v !== 'All') });
                                    } else {
                                        setFormData({ ...formData, applicableVehicles: value.length === 0 ? ['All'] : value });
                                    }
                                }}
                                input={<OutlinedInput label="Applicable Vehicles" />}
                                renderValue={(selected) => selected.join(', ')}
                            >
                                <MenuItem value="All">
                                    <Checkbox checked={formData.applicableVehicles.includes('All')} />
                                    <ListItemText primary="All Vehicles" />
                                </MenuItem>
                                {vehicleNames.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        <Checkbox checked={formData.applicableVehicles.includes(name)} />
                                        <ListItemText primary={name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe what this promo is for..."
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                fullWidth
                                label="Valid From"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={formData.validFrom}
                                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                            />
                            <TextField
                                fullWidth
                                label="Valid To"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={formData.validTo}
                                onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                            />
                        </Stack>
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Disabled">Disabled</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{ borderRadius: '10px', textTransform: 'none', px: 4, fontWeight: 700 }}
                    >
                        {selectedPromo ? 'Save Changes' : 'Create Code'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: '24px', p: 1, minWidth: '400px' } }}
            >
                <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOfferIcon color="primary" /> {selectedPromo?.code}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                            <Typography variant="caption" color="text.secondary">Discount ({selectedPromo?.discountType})</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>
                                {selectedPromo?.discountType === 'Percentage' ? `${selectedPromo?.discountValue ?? 0}% OFF` : `LKR ${(selectedPromo?.discountValue ?? 0).toLocaleString()} OFF`}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">Applicable Vehicle</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                {selectedPromo?.applicableVehicle || 'All Vehicles'}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">Description</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {selectedPromo?.description || 'No description provided.'}
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={4}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Valid From</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {selectedPromo?.validFrom ? new Date(selectedPromo.validFrom).toLocaleDateString() : 'N/A'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Valid Until</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {selectedPromo?.validTo ? new Date(selectedPromo.validTo).toLocaleDateString() : 'N/A'}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={4}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Status</Typography>
                                <Chip
                                    label={selectedPromo?.status}
                                    size="small"
                                    color={getStatusColor(selectedPromo?.status || '') as any}
                                    sx={{ display: 'block', mt: 0.5 }}
                                />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Total Uses</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                    {selectedPromo?.usageCount}
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button fullWidth variant="outlined" onClick={() => setViewDialogOpen(false)} sx={{ borderRadius: '10px' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                PaperProps={{ sx: { borderRadius: '20px' } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete promo code <strong>{selectedPromo?.code}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: '8px' }}>
                        Delete Code
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PromoCodeManagePage;

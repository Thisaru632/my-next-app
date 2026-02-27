'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    Grid,
    CircularProgress,
    Tooltip,
    useTheme,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Image as ImageIcon,
    Check as CheckIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { API_ENDPOINTS } from '@/config/api';

interface TourPackage {
    _id?: string;
    type: 'freedom' | 'destination';
    title: string;
    limit?: string;
    description: string;
    image: string;
    gradient?: string;
    tall?: boolean;
    label?: string;
    status: 'active' | 'inactive';
}

const CMSPage = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [packages, setPackages] = useState<TourPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
    const [formData, setFormData] = useState<TourPackage>({
        type: 'freedom',
        title: '',
        limit: '',
        description: '',
        image: '',
        gradient: 'linear-gradient(to top, rgba(13, 148, 136, 0.9), transparent)',
        tall: false,
        label: 'Destinations',
        status: 'active'
    });

    const [uploading, setUploading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.TOUR_PACKAGES}/all`);
            const data = await response.json();
            setPackages(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching packages:', error);
            showSnackbar('Error fetching packages', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleOpenDialog = (pkg: TourPackage | null = null) => {
        if (pkg) {
            setEditingPackage(pkg);
            setFormData(pkg);
        } else {
            setEditingPackage(null);
            setFormData({
                type: activeTab === 0 ? 'freedom' : 'destination',
                title: '',
                limit: '',
                description: '',
                image: '',
                gradient: 'linear-gradient(to top, rgba(13, 148, 136, 0.9), transparent)',
                tall: false,
                label: 'Destinations',
                status: 'active'
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingPackage(null);
    };

    const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        setUploading(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.TOUR_PACKAGES}/upload`, {
                method: 'POST',
                body: formDataUpload,
            });

            if (response.ok) {
                const data = await response.json();
                setFormData({ ...formData, image: data.url });
                showSnackbar('Image uploaded successfully');
            } else {
                showSnackbar('Error uploading image', 'error');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            showSnackbar('Error uploading image', 'error');
        } finally {
            setUploading(false);
        }
    };

    const getFullImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = API_ENDPOINTS.AUTH.replace('/api/auth', '');
        return `${baseUrl}${path}`;
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.image || !formData.description) {
            showSnackbar('Please fill in all required fields', 'error');
            return;
        }

        try {
            const url = editingPackage
                ? `${API_ENDPOINTS.TOUR_PACKAGES}/${editingPackage._id}`
                : API_ENDPOINTS.TOUR_PACKAGES;

            const method = editingPackage ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                showSnackbar(`Package ${editingPackage ? 'updated' : 'created'} successfully`);
                handleCloseDialog();
                fetchPackages();
            } else {
                showSnackbar('Error saving package', 'error');
            }
        } catch (error) {
            console.error('Error saving package:', error);
            showSnackbar('Error saving package', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this package?')) return;

        try {
            const response = await fetch(`${API_ENDPOINTS.TOUR_PACKAGES}/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                showSnackbar('Package deleted successfully');
                fetchPackages();
            } else {
                showSnackbar('Error deleting package', 'error');
            }
        } catch (error) {
            console.error('Error deleting package:', error);
            showSnackbar('Error deleting package', 'error');
        }
    };

    const filteredPackages = Array.isArray(packages) ? packages.filter(p =>
        activeTab === 0 ? p.type === 'freedom' : p.type === 'destination'
    ) : [];

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: 'text.primary' }}>
                        CMS Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your tour packages and destinations.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={fetchPackages}
                        startIcon={<RefreshIcon />}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleOpenDialog()}
                        startIcon={<AddIcon />}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                            boxShadow: '0 4px 12px rgba(13,148,136,0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                            }
                        }}
                    >
                        Add New Package
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, val) => setActiveTab(val)}
                    sx={{
                        px: 2,
                        pt: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.95rem'
                        }
                    }}
                >
                    <Tab label="Freedom Road Packages" />
                    <Tab label="Magical Destinations" />
                </Tabs>

                {loading ? (
                    <Box sx={{ p: 5, textAlign: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: 'background.default' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Image</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Title / Name</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{activeTab === 0 ? 'Limit' : 'Label'}</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPackages.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">No packages found for this category.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPackages.map((pkg) => (
                                        <TableRow key={pkg._id} hover>
                                            <TableCell>
                                                <Box
                                                    component="img"
                                                    src={getFullImageUrl(pkg.image)}
                                                    sx={{ width: 60, height: 60, borderRadius: '8px', objectFit: 'cover' }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>{pkg.title}</TableCell>
                                            <TableCell>
                                                {activeTab === 0 ? pkg.limit : (
                                                    <Chip label={pkg.label} size="small" variant="outlined" />
                                                )}
                                                {activeTab === 1 && pkg.tall && (
                                                    <Chip label="Tall Layout" size="small" color="primary" sx={{ ml: 1 }} />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{
                                                    maxWidth: 250,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {pkg.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={pkg.status}
                                                    color={pkg.status === 'active' ? 'success' : 'default'}
                                                    size="small"
                                                    sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Edit">
                                                    <IconButton onClick={() => handleOpenDialog(pkg)} color="primary">
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton onClick={() => handleDelete(pkg._id!)} color="error">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Add / Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="md"
                PaperProps={{ sx: { borderRadius: '20px' } }}
            >
                <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3 }}>
                    {editingPackage ? 'Edit Package' : 'Add New Package'}
                </DialogTitle>
                <DialogContent sx={{ px: 3 }}>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Package Type</InputLabel>
                                <Select
                                    value={formData.type}
                                    label="Package Type"
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    disabled={!!editingPackage}
                                >
                                    <MenuItem value="freedom">Freedom Road</MenuItem>
                                    <MenuItem value="destination">Magical Destination</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label={formData.type === 'freedom' ? 'Package Title' : 'Destination Name'}
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </Grid>

                        {formData.type === 'freedom' ? (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Limit (e.g. 100 KM / 5 Hours)"
                                        value={formData.limit}
                                        onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Gradient Overlay"
                                        value={formData.gradient}
                                        onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                                        helperText="CSS gradient for the card bottom"
                                    />
                                </Grid>
                            </>
                        ) : (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Label"
                                        value={formData.label}
                                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.tall}
                                                onChange={(e) => setFormData({ ...formData, tall: e.target.checked })}
                                            />
                                        }
                                        label="Large Layout (Tall Card)"
                                    />
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12}>
                            <Box sx={{ border: '1px dashed', borderColor: 'divider', p: 2, borderRadius: 2, textAlign: 'center' }}>
                                {formData.image ? (
                                    <Box sx={{ position: 'relative', width: 'fit-content', mx: 'auto' }}>
                                        <Box
                                            component="img"
                                            src={getFullImageUrl(formData.image)}
                                            sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 2, display: 'block' }}
                                        />
                                        <IconButton
                                            size="small"
                                            sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
                                            onClick={() => setFormData({ ...formData, image: '' })}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Box>
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="button-file"
                                            type="file"
                                            onChange={handleImageUpload}
                                        />
                                        <label htmlFor="button-file">
                                            <Button
                                                variant="outlined"
                                                component="span"
                                                startIcon={uploading ? <CircularProgress size={20} /> : <ImageIcon />}
                                                disabled={uploading}
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                {uploading ? 'Uploading...' : 'Upload Image'}
                                            </Button>
                                        </label>
                                        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                                            Recommended: 800x600px. Max 5MB.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.status === 'active'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                                    />
                                }
                                label="Active Status"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog} sx={{ textTransform: 'none', fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 4
                        }}
                    >
                        {editingPackage ? 'Update Package' : 'Create Package'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: '10px' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CMSPage;

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    InputAdornment,
    TablePagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tooltip,
    Snackbar,
    Alert,
    Card,
    CardContent,
    Grid,
    Stack,
    CircularProgress,
    Menu,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Receipt as ReceiptIcon,
    MonetizationOn as MonetizationOnIcon,
    Layers as LayersIcon,
    LocationOn as LocationOnIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    UploadFile as UploadFileIcon,
    Person as PersonIcon,
    AssignmentInd as AssignmentIndIcon,
    DeleteSweep as DeleteSweepIcon,
    FiberManualRecord as FiberManualRecordIcon,
} from '@mui/icons-material';
import { useThemeContext } from '@/context/ThemeContext';
import { API_ENDPOINTS } from '@/config/api';

interface OfficeAsset {
    _id?: string;
    id?: string;
    assetType: string;
    description: string;
    assetCode: string;
    location: string;
    assignedTo?: string;
    assignedUserId?: string;
    assignedDate?: string;
    status?: 'In Use' | 'Not in Use';
    qty: number;
    value: number;
    totalValue: number;
    purchaseDate: string;
    billAvailability: 'Y' | 'N';
    warranty: string;
    supplier: string;
    contactNo: string;
    invNo: string;
    createdAt?: string;
    updatedAt?: string;
}

interface SystemUser {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    eNo?: string;
}

const DEFAULT_ASSETS: OfficeAsset[] = [
    {
        id: '1',
        assetType: 'Boards',
        description: 'Senu Cabs Name Board With Light (72"x50")',
        assetCode: 'SC-BRD-001',
        location: 'Front Office',
        qty: 1,
        value: 59600.00,
        totalValue: 59600.00,
        purchaseDate: '2022-12-30',
        billAvailability: 'Y',
        warranty: '1 Year',
        supplier: 'Kumara Wood',
        contactNo: '702775325',
        invNo: 'INV-2022-841',
    },
    {
        id: '2',
        assetType: 'Fan',
        description: 'Wall Fan (MITSHU MWF-438R)',
        assetCode: 'SC-FAN-002',
        location: 'Lunch Room',
        qty: 1,
        value: 10090.00,
        totalValue: 10090.00,
        purchaseDate: '2023-04-12',
        billAvailability: 'Y',
        warranty: '1 Year',
        supplier: 'Singer Sri Lanka',
        contactNo: '0112420420',
        invNo: 'INV-2023-109',
    },
    {
        id: '3',
        assetType: 'Fridge',
        description: 'Sisil Mini Fridge',
        assetCode: 'SC-FRG-003',
        location: 'Kitchen',
        qty: 1,
        value: 30000.00,
        totalValue: 30000.00,
        purchaseDate: '2023-01-15',
        billAvailability: 'Y',
        warranty: '2 Years',
        supplier: 'Sisil / Singer',
        contactNo: '0112345678',
        invNo: 'INV-2023-044',
    },
    {
        id: '4',
        assetType: 'Kettle',
        description: 'Homemaker 1.7L Kettle',
        assetCode: 'SC-KTL-004',
        location: 'Kitchen',
        qty: 1,
        value: 3245.00,
        totalValue: 3245.00,
        purchaseDate: '2023-02-10',
        billAvailability: 'Y',
        warranty: '6 Months',
        supplier: 'Arpico Supercentre',
        contactNo: '0114798798',
        invNo: 'INV-2023-288',
    },
];

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(val);
};

export default function OfficeAssetsManagePage() {
    const { mode } = useThemeContext();
    const [assets, setAssets] = useState<OfficeAsset[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [locationFilter, setLocationFilter] = useState('All');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<OfficeAsset | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState<OfficeAsset | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<OfficeAsset>>({
        assetType: '',
        description: '',
        assetCode: '',
        location: '',
        assignedTo: 'Unassigned',
        assignedUserId: '',
        assignedDate: '',
        qty: 1,
        value: 0,
        totalValue: 0,
        purchaseDate: '',
        billAvailability: 'Y',
        warranty: '',
        supplier: '',
        contactNo: '',
        invNo: '',
    });

    // Snackbar state
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [uploadingCsv, setUploadingCsv] = useState(false);
    const [loading, setLoading] = useState(false);

    // Users and Assignment states
    const [users, setUsers] = useState<SystemUser[]>([]);
    const [assignedFilter, setAssignedFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [assignAnchorEl, setAssignAnchorEl] = useState<null | HTMLElement>(null);
    const [assetForQuickAssign, setAssetForQuickAssign] = useState<OfficeAsset | null>(null);

    // Clear All Data dialog states
    const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
    const [clearingAll, setClearingAll] = useState(false);

    const handleOpenAssignMenu = (event: React.MouseEvent<HTMLElement>, asset: OfficeAsset) => {
        event.stopPropagation();
        setAssignAnchorEl(event.currentTarget);
        setAssetForQuickAssign(asset);
    };

    const handleCloseAssignMenu = () => {
        setAssignAnchorEl(null);
        setAssetForQuickAssign(null);
    };

    const handleQuickAssign = async (userName: string, userId?: string) => {
        if (!assetForQuickAssign) return;
        const assetId = assetForQuickAssign._id || assetForQuickAssign.id;
        const newAssignedTo = userName;
        const newAssignedDate = userName && userName !== 'Unassigned' ? new Date().toISOString().split('T')[0] : '';

        try {
            if (assetForQuickAssign._id) {
                await fetch(`${API_ENDPOINTS.OFFICE_ASSETS}/${assetForQuickAssign._id}/assign`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ assignedTo: newAssignedTo, assignedUserId: userId || null }),
                });
            }
            const updated = assets.map((a) =>
                (a._id === assetId || a.id === assetId)
                    ? { ...a, assignedTo: newAssignedTo, assignedUserId: userId || '', assignedDate: newAssignedDate }
                    : a
            );
            persistAssets(updated);
            setSnackbar({
                open: true,
                message: newAssignedTo === 'Unassigned' ? 'Asset marked as Unassigned' : `Asset assigned to ${newAssignedTo}`,
                severity: 'success',
            });
        } catch (e) {
            console.error('Assign error:', e);
        }
        handleCloseAssignMenu();
    };

    const handleToggleStatus = async (asset: OfficeAsset) => {
        const assetId = asset._id || asset.id;
        const currentStatus = asset.status || 'In Use';
        const nextStatus: 'In Use' | 'Not in Use' = currentStatus === 'In Use' ? 'Not in Use' : 'In Use';

        try {
            if (asset._id) {
                await fetch(`${API_ENDPOINTS.OFFICE_ASSETS}/${asset._id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: nextStatus }),
                });
            }
            const updated = assets.map((a) =>
                (a._id === assetId || a.id === assetId) ? { ...a, status: nextStatus } : a
            );
            persistAssets(updated);
            setSnackbar({
                open: true,
                message: `Asset marked as ${nextStatus}`,
                severity: 'success',
            });
        } catch (e) {
            console.error('Status toggle error:', e);
            setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
        }
    };

    const handleClearAllData = async () => {
        setClearingAll(true);
        try {
            const res = await fetch(`${API_ENDPOINTS.OFFICE_ASSETS}/clear-all`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (res.ok && data.success) {
                persistAssets([]);
                setSnackbar({
                    open: true,
                    message: data.message || 'All office assets have been cleared from the database',
                    severity: 'success',
                });
            } else {
                throw new Error(data.message || 'Failed to clear assets');
            }
        } catch (error: any) {
            console.error('Error clearing all assets:', error);
            setSnackbar({
                open: true,
                message: error.message || 'Failed to clear all assets',
                severity: 'error',
            });
        } finally {
            setClearingAll(false);
            setClearAllDialogOpen(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_ENDPOINTS.OFFICE_ASSETS}/users`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    setUsers(data.data);
                }
            }
        } catch (e) {
            console.error('Error fetching users:', e);
        }
    };

    const persistAssets = (newAssets: OfficeAsset[]) => {
        setAssets(newAssets);
        try {
            localStorage.setItem('office_assets_spreadsheet_data', JSON.stringify(newAssets));
        } catch (e) {
            console.error('LocalStorage error:', e);
        }
    };

    // Load assets from MongoDB on mount, fallback to localStorage/default
    const fetchAssets = async () => {
        try {
            setLoading(true);
            const res = await fetch(API_ENDPOINTS.OFFICE_ASSETS);
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    setAssets(data.data);
                    persistAssets(data.data);
                    return;
                }
            }
            const saved = localStorage.getItem('office_assets_spreadsheet_data');
            if (saved) {
                try {
                    setAssets(JSON.parse(saved));
                } catch {
                    setAssets(DEFAULT_ASSETS);
                }
            } else {
                setAssets(DEFAULT_ASSETS);
            }
        } catch (e) {
            console.error('Fetch error:', e);
            const saved = localStorage.getItem('office_assets_spreadsheet_data');
            if (saved) {
                try {
                    setAssets(JSON.parse(saved));
                } catch {
                    setAssets(DEFAULT_ASSETS);
                }
            } else {
                setAssets(DEFAULT_ASSETS);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
        fetchUsers();
    }, []);

    // CSV File Upload & MongoDB Persistence Handler
    const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset file input value so re-uploading the same file works
        event.target.value = '';

        setUploadingCsv(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_ENDPOINTS.OFFICE_ASSETS}/upload-csv`, {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();
            if (res.ok && result.success) {
                if (Array.isArray(result.data)) {
                    persistAssets(result.data);
                } else {
                    await fetchAssets();
                }
                setSnackbar({
                    open: true,
                    message: result.message || `Successfully uploaded and saved ${result.count || ''} assets in MongoDB!`,
                    severity: 'success',
                });
            } else {
                throw new Error(result.message || 'Failed to upload file');
            }
        } catch (error: any) {
            console.error('File upload error:', error);
            setSnackbar({
                open: true,
                message: error.message || 'Failed to upload and parse CSV / Excel file',
                severity: 'error',
            });
        } finally {
            setUploadingCsv(false);
        }
    };

    // Derived unique asset types and locations for dropdown filters
    const assetTypes = useMemo(() => {
        const types = Array.from(new Set(assets.map((a) => a.assetType).filter(Boolean)));
        return ['All', ...types];
    }, [assets]);

    const locations = useMemo(() => {
        const locs = Array.from(new Set(assets.map((a) => a.location).filter(Boolean)));
        return ['All', ...locs];
    }, [assets]);

    // Filtered assets
    const filteredAssets = useMemo(() => {
        return assets.filter((asset) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                query === '' ||
                (asset.assetType && asset.assetType.toLowerCase().includes(query)) ||
                (asset.description && asset.description.toLowerCase().includes(query)) ||
                (asset.assetCode && asset.assetCode.toLowerCase().includes(query)) ||
                (asset.location && asset.location.toLowerCase().includes(query)) ||
                (asset.assignedTo && asset.assignedTo.toLowerCase().includes(query)) ||
                (asset.supplier && asset.supplier.toLowerCase().includes(query)) ||
                (asset.contactNo && asset.contactNo.toLowerCase().includes(query)) ||
                (asset.invNo && asset.invNo.toLowerCase().includes(query));

            const matchesType = typeFilter === 'All' || asset.assetType === typeFilter;
            const matchesLoc = locationFilter === 'All' || asset.location === locationFilter;
            const matchesAssigned =
                assignedFilter === 'All'
                    ? true
                    : assignedFilter === 'Unassigned'
                    ? !asset.assignedTo || asset.assignedTo === 'Unassigned'
                    : assignedFilter === 'Assigned'
                    ? asset.assignedTo && asset.assignedTo !== 'Unassigned'
                    : asset.assignedTo === assignedFilter;

            const matchesStatus =
                statusFilter === 'All'
                    ? true
                    : (asset.status || 'In Use') === statusFilter;

            return matchesSearch && matchesType && matchesLoc && matchesAssigned && matchesStatus;
        });
    }, [assets, searchQuery, typeFilter, locationFilter, assignedFilter, statusFilter]);

    // Financial & Quantity Stats
    const totalAssetsQty = useMemo(() => assets.reduce((sum, a) => sum + (Number(a.qty) || 0), 0), [assets]);
    const totalGrossValue = useMemo(() => assets.reduce((sum, a) => sum + (Number(a.totalValue) || 0), 0), [assets]);
    const billsAvailableCount = useMemo(() => assets.filter((a) => a.billAvailability === 'Y').length, [assets]);
    const assignedAssetsCount = useMemo(() => assets.filter((a) => a.assignedTo && a.assignedTo !== 'Unassigned').length, [assets]);
    const inUseAssetsCount = useMemo(() => assets.filter((a) => (a.status || 'In Use') === 'In Use').length, [assets]);

    const handleOpenCreate = () => {
        setIsEditing(false);
        setSelectedAsset(null);
        setFormData({
            assetType: '',
            description: '',
            assetCode: `SC-AST-${String(assets.length + 1).padStart(3, '0')}`,
            location: 'Front Office',
            assignedTo: 'Unassigned',
            assignedUserId: '',
            assignedDate: '',
            status: 'In Use',
            qty: 1,
            value: 0,
            totalValue: 0,
            purchaseDate: new Date().toISOString().split('T')[0],
            billAvailability: 'Y',
            warranty: '',
            supplier: '',
            contactNo: '',
            invNo: '',
        });
        setOpenDialog(true);
    };

    const handleOpenEdit = (asset: OfficeAsset) => {
        setIsEditing(true);
        setSelectedAsset(asset);
        setFormData({
            ...asset,
            assignedTo: asset.assignedTo || 'Unassigned',
            assignedUserId: asset.assignedUserId || '',
            assignedDate: asset.assignedDate || '',
            status: asset.status || 'In Use',
        });
        setOpenDialog(true);
    };

    const handleOpenView = (asset: OfficeAsset) => {
        setSelectedAsset(asset);
        setViewDialogOpen(true);
    };

    const handleValueOrQtyChange = (field: 'qty' | 'value', rawVal: string) => {
        const numVal = parseFloat(rawVal) || 0;
        const currentQty = field === 'qty' ? numVal : (Number(formData.qty) || 1);
        const currentValue = field === 'value' ? numVal : (Number(formData.value) || 0);
        const calculatedTotal = currentQty * currentValue;

        setFormData((prev) => ({
            ...prev,
            [field]: numVal,
            totalValue: calculatedTotal,
        }));
    };

    const handleSave = async () => {
        if (!formData.assetType?.trim()) {
            setSnackbar({ open: true, message: 'Asset Type is required', severity: 'error' });
            return;
        }
        if (!formData.description?.trim()) {
            setSnackbar({ open: true, message: 'Description is required', severity: 'error' });
            return;
        }

        const qtyNum = Number(formData.qty) || 1;
        const valueNum = Number(formData.value) || 0;
        const totalValueNum = Number(formData.totalValue) || (qtyNum * valueNum);

        const assetPayload = {
            assetType: formData.assetType.trim(),
            description: formData.description.trim(),
            assetCode: formData.assetCode?.trim() || '',
            location: formData.location?.trim() || 'Office',
            assignedTo: formData.assignedTo?.trim() || 'Unassigned',
            assignedUserId: formData.assignedUserId || null,
            assignedDate: formData.assignedDate || (formData.assignedTo && formData.assignedTo !== 'Unassigned' ? new Date().toISOString().split('T')[0] : ''),
            status: (formData.status as 'In Use' | 'Not in Use') || 'In Use',
            qty: qtyNum,
            value: valueNum,
            totalValue: totalValueNum,
            purchaseDate: formData.purchaseDate || '',
            billAvailability: (formData.billAvailability as 'Y' | 'N') || 'Y',
            warranty: formData.warranty?.trim() || '',
            supplier: formData.supplier?.trim() || '',
            contactNo: formData.contactNo?.trim() || '',
            invNo: formData.invNo?.trim() || '',
        };

        try {
            if (isEditing && selectedAsset) {
                const assetId = selectedAsset._id || selectedAsset.id;
                if (selectedAsset._id) {
                    await fetch(`${API_ENDPOINTS.OFFICE_ASSETS}/${selectedAsset._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(assetPayload),
                    });
                }
                const updated = assets.map((a) =>
                    (a._id === assetId || a.id === assetId)
                        ? ({ ...a, ...assetPayload } as OfficeAsset)
                        : a
                );
                persistAssets(updated);
                setSnackbar({ open: true, message: 'Asset updated successfully', severity: 'success' });
            } else {
                const res = await fetch(API_ENDPOINTS.OFFICE_ASSETS, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(assetPayload),
                });
                if (res.ok) {
                    const resData = await res.json();
                    if (resData.data) {
                        const updated = [resData.data, ...assets];
                        persistAssets(updated);
                        setSnackbar({ open: true, message: 'Asset added successfully and saved to MongoDB', severity: 'success' });
                        setOpenDialog(false);
                        return;
                    }
                }
                const newAsset: OfficeAsset = {
                    id: Date.now().toString(),
                    ...assetPayload,
                };
                persistAssets([newAsset, ...assets]);
                setSnackbar({ open: true, message: 'Asset added successfully', severity: 'success' });
            }
        } catch (e) {
            console.error('Save error:', e);
            const newAsset: OfficeAsset = {
                id: Date.now().toString(),
                ...assetPayload,
            };
            persistAssets([newAsset, ...assets]);
            setSnackbar({ open: true, message: 'Asset added locally', severity: 'success' });
        }
        setOpenDialog(false);
    };

    const handleDelete = async () => {
        if (!assetToDelete) return;
        const assetId = assetToDelete._id || assetToDelete.id;
        try {
            if (assetToDelete._id) {
                await fetch(`${API_ENDPOINTS.OFFICE_ASSETS}/${assetToDelete._id}`, {
                    method: 'DELETE',
                });
            }
        } catch (e) {
            console.error('Delete error:', e);
        }
        const updated = assets.filter((a) => a._id !== assetId && a.id !== assetId);
        persistAssets(updated);
        setDeleteConfirmOpen(false);
        setAssetToDelete(null);
        setSnackbar({ open: true, message: 'Asset removed successfully', severity: 'success' });
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box
                sx={{
                    mb: 3,
                    pb: 2,
                    borderBottom: '2px solid',
                    borderImage: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #10b981 100%)',
                    borderImageSlice: 1,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: '1.5rem', sm: '2rem' },
                            background:
                                mode === 'light'
                                     ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                                     : 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Office Assets Manage
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        Official asset inventory register, valuations, suppliers, and purchase details
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                    <input
                        type="file"
                        accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                        ref={fileInputRef}
                        onChange={handleCsvUpload}
                        style={{ display: 'none' }}
                        id="office-asset-csv-upload-input"
                    />
                    <Button
                        variant="outlined"
                        component="label"
                        htmlFor="office-asset-csv-upload-input"
                        disabled={uploadingCsv}
                        startIcon={uploadingCsv ? <CircularProgress size={18} color="inherit" /> : <UploadFileIcon />}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2.5,
                            py: 1.1,
                            borderColor: mode === 'light' ? '#0ea5e9' : '#38bdf8',
                            color: mode === 'light' ? '#0284c7' : '#38bdf8',
                            bgcolor: mode === 'light' ? 'rgba(14, 165, 233, 0.05)' : 'rgba(56, 189, 248, 0.1)',
                            '&:hover': {
                                borderColor: mode === 'light' ? '#0284c7' : '#0ea5e9',
                                bgcolor: mode === 'light' ? 'rgba(14, 165, 233, 0.12)' : 'rgba(56, 189, 248, 0.2)',
                            },
                        }}
                    >
                        {uploadingCsv ? 'Uploading...' : 'Upload CSV / Excel'}
                    </Button>

                    <Button
                        variant="outlined"
                        color="error"
                        disabled={assets.length === 0 || clearingAll}
                        startIcon={clearingAll ? <CircularProgress size={18} color="inherit" /> : <DeleteSweepIcon />}
                        onClick={() => setClearAllDialogOpen(true)}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2.5,
                            py: 1.1,
                            borderColor: mode === 'light' ? '#fca5a5' : '#7f1d1d',
                            color: mode === 'light' ? '#dc2626' : '#f87171',
                            bgcolor: mode === 'light' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.1)',
                            '&:hover': {
                                borderColor: mode === 'light' ? '#dc2626' : '#ef4444',
                                bgcolor: mode === 'light' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.2)',
                            },
                            '&.Mui-disabled': {
                                opacity: 0.5,
                                borderColor: 'divider',
                            },
                        }}
                    >
                        {clearingAll ? 'Clearing...' : 'Clear All Data'}
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreate}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            py: 1.1,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            },
                        }}
                    >
                        Add New Asset
                    </Button>
                </Stack>
            </Box>

            {/* Quick Metrics */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LayersIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Total Items (Qty)</Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>{totalAssetsQty}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MonetizationOnIcon sx={{ color: '#10b981', fontSize: 20 }} />
                                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>Total Asset Value</Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981', mt: 0.5 }}>
                                LKR {formatCurrency(totalGrossValue)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ReceiptIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                                <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 600 }}>Bills Available</Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#3b82f6', mt: 0.5 }}>
                                {billsAvailableCount} / {assets.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                                <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 600 }}>Assigned to Users</Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#8b5cf6', mt: 0.5 }}>
                                {assignedAssetsCount} / {assets.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search & Filters */}
            <Paper
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                }}
            >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search by Asset Type, Description, Code, Location, Assigned User, Supplier, Contact No, or Inv No..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(0);
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flex: 2 }}
                    />

                    <FormControl size="small" sx={{ minWidth: 150, width: { xs: '100%', md: 'auto' } }}>
                        <InputLabel>Asset Type</InputLabel>
                        <Select
                            value={typeFilter}
                            label="Asset Type"
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setPage(0);
                            }}
                        >
                            {assetTypes.map((t) => (
                                <MenuItem key={t} value={t}>
                                    {t}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150, width: { xs: '100%', md: 'auto' } }}>
                        <InputLabel>Location</InputLabel>
                        <Select
                            value={locationFilter}
                            label="Location"
                            onChange={(e) => {
                                setLocationFilter(e.target.value);
                                setPage(0);
                            }}
                        >
                            {locations.map((loc) => (
                                <MenuItem key={loc} value={loc}>
                                    {loc}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 170, width: { xs: '100%', md: 'auto' } }}>
                        <InputLabel>Assigned User</InputLabel>
                        <Select
                            value={assignedFilter}
                            label="Assigned User"
                            onChange={(e) => {
                                setAssignedFilter(e.target.value);
                                setPage(0);
                            }}
                        >
                            <MenuItem value="All">All Users</MenuItem>
                            <MenuItem value="Assigned">Assigned (Any)</MenuItem>
                            <MenuItem value="Unassigned">Unassigned Only</MenuItem>
                            <Divider />
                            {users.map((u) => (
                                <MenuItem key={u.id} value={u.name}>
                                    {u.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150, width: { xs: '100%', md: 'auto' } }}>
                        <InputLabel>Usage Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Usage Status"
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                        >
                            <MenuItem value="All">All Statuses</MenuItem>
                            <MenuItem value="In Use">In Use</MenuItem>
                            <MenuItem value="Not in Use">Not in Use</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            {/* Assets List Table with Spreadsheet Columns */}
            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 4px 25px rgba(0,0,0,0.04)',
                    overflowX: 'auto',
                }}
            >
                <Table sx={{ minWidth: 1350 }}>
                    <TableHead sx={{ bgcolor: mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.04)' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Asset Type</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap', minWidth: 240 }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Asset Code</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Location</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Assigned To</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Qty</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Value (LKR)</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Total Value (LKR)</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Purchase Date</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Bill Availability</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Warranty</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Supplier</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Contact No</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Inv No</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAssets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={16} sx={{ textAlign: 'center', py: 8 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <LayersIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1.5, opacity: 0.7 }} />
                                        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, mb: 0.5 }}>
                                            {assets.length === 0 ? 'No Office Assets in the System' : 'No assets found matching your criteria'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 450, mb: 2 }}>
                                            {assets.length === 0
                                                ? 'All office assets have been cleared. Upload an Excel or CSV file or click below to add new assets.'
                                                : 'Try adjusting your search keywords or filter dropdowns.'}
                                        </Typography>
                                        <Stack direction="row" spacing={1.5}>
                                            <Button
                                                variant="outlined"
                                                component="label"
                                                htmlFor="office-asset-csv-upload-input"
                                                startIcon={<UploadFileIcon />}
                                                size="small"
                                                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                                            >
                                                Upload CSV / Excel
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={handleOpenCreate}
                                                startIcon={<AddIcon />}
                                                size="small"
                                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                                            >
                                                Add New Asset
                                            </Button>
                                        </Stack>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAssets
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((asset, idx) => (
                                    <TableRow key={asset._id || asset.id || `ast-${idx}`} hover sx={{ transition: 'all 0.15s ease' }}>
                                        {/* Asset Type */}
                                        <TableCell sx={{ fontWeight: 700, color: 'primary.main', whiteSpace: 'nowrap' }}>
                                            {asset.assetType}
                                        </TableCell>

                                        {/* Description */}
                                        <TableCell sx={{ fontWeight: 600, color: 'text.primary', minWidth: 240 }}>
                                            {asset.description}
                                        </TableCell>

                                        {/* Asset Code */}
                                        <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                            {asset.assetCode || '-'}
                                        </TableCell>

                                        {/* Location */}
                                        <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.primary' }}>
                                            {asset.location || '-'}
                                        </TableCell>

                                        {/* Assigned To */}
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            <Tooltip title="Click to assign or change user">
                                                <Chip
                                                    icon={<PersonIcon sx={{ fontSize: '15px !important' }} />}
                                                    label={asset.assignedTo && asset.assignedTo !== 'Unassigned' ? asset.assignedTo : 'Unassigned'}
                                                    size="small"
                                                    onClick={(e) => handleOpenAssignMenu(e, asset)}
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer',
                                                        borderRadius: '6px',
                                                        bgcolor:
                                                            asset.assignedTo && asset.assignedTo !== 'Unassigned'
                                                                ? mode === 'light' ? '#e0f2fe' : 'rgba(56, 189, 248, 0.15)'
                                                                : mode === 'light' ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)',
                                                        color:
                                                            asset.assignedTo && asset.assignedTo !== 'Unassigned'
                                                                ? mode === 'light' ? '#0369a1' : '#7dd3fc'
                                                                : 'text.secondary',
                                                        border: '1px solid',
                                                        borderColor:
                                                            asset.assignedTo && asset.assignedTo !== 'Unassigned'
                                                                ? mode === 'light' ? '#bae6fd' : 'rgba(56, 189, 248, 0.3)'
                                                                : 'divider',
                                                        '& .MuiChip-icon': {
                                                            color:
                                                                asset.assignedTo && asset.assignedTo !== 'Unassigned'
                                                                    ? mode === 'light' ? '#0284c7' : '#38bdf8'
                                                                    : 'text.secondary',
                                                        },
                                                        '&:hover': {
                                                            bgcolor: mode === 'light' ? '#bae6fd' : 'rgba(56, 189, 248, 0.25)',
                                                        },
                                                    }}
                                                />
                                            </Tooltip>
                                        </TableCell>

                                        {/* Status (In Use / Not in Use) */}
                                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                            <Tooltip title={`Click to mark as ${(asset.status || 'In Use') === 'In Use' ? 'Not in Use' : 'In Use'}`}>
                                                <Chip
                                                    icon={
                                                        <FiberManualRecordIcon
                                                            sx={{
                                                                fontSize: '9px !important',
                                                                color:
                                                                    (asset.status || 'In Use') === 'In Use'
                                                                        ? '#10b981 !important'
                                                                        : '#ef4444 !important',
                                                            }}
                                                        />
                                                    }
                                                    label={(asset.status || 'In Use') === 'In Use' ? 'In Use' : 'Not in Use'}
                                                    size="small"
                                                    onClick={() => handleToggleStatus(asset)}
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer',
                                                        borderRadius: '6px',
                                                        bgcolor:
                                                            (asset.status || 'In Use') === 'In Use'
                                                                ? mode === 'light' ? '#ecfdf5' : 'rgba(16, 185, 129, 0.12)'
                                                                : mode === 'light' ? '#fef2f2' : 'rgba(239, 68, 68, 0.12)',
                                                        color:
                                                            (asset.status || 'In Use') === 'In Use'
                                                                ? mode === 'light' ? '#065f46' : '#6ee7b7'
                                                                : mode === 'light' ? '#991b1b' : '#fca5a5',
                                                        border: '1px solid',
                                                        borderColor:
                                                            (asset.status || 'In Use') === 'In Use'
                                                                ? mode === 'light' ? '#a7f3d0' : 'rgba(16, 185, 129, 0.3)'
                                                                : mode === 'light' ? '#fecaca' : 'rgba(239, 68, 68, 0.3)',
                                                        '&:hover': {
                                                            bgcolor:
                                                                (asset.status || 'In Use') === 'In Use'
                                                                    ? mode === 'light' ? '#d1fae5' : 'rgba(16, 185, 129, 0.22)'
                                                                    : mode === 'light' ? '#fee2e2' : 'rgba(239, 68, 68, 0.22)',
                                                        },
                                                    }}
                                                />
                                            </Tooltip>
                                        </TableCell>

                                        {/* Qty */}
                                        <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                                            {asset.qty}
                                        </TableCell>

                                        {/* Value */}
                                        <TableCell align="right" sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                                            {asset.value ? formatCurrency(asset.value) : '-'}
                                        </TableCell>

                                        {/* Total Value */}
                                        <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 700, color: 'success.main' }}>
                                            {asset.totalValue ? formatCurrency(asset.totalValue) : '-'}
                                        </TableCell>

                                        {/* Purchase Date */}
                                        <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                                            {asset.purchaseDate || '-'}
                                        </TableCell>

                                        {/* Bill Availability */}
                                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                            <Chip
                                                label={asset.billAvailability || 'N'}
                                                size="small"
                                                icon={asset.billAvailability === 'Y' ? <CheckCircleIcon sx={{ fontSize: '14px !important' }} /> : <CancelIcon sx={{ fontSize: '14px !important' }} />}
                                                sx={{
                                                    height: '24px',
                                                    fontWeight: 800,
                                                    fontSize: '0.75rem',
                                                    borderRadius: '6px',
                                                    bgcolor: asset.billAvailability === 'Y' ? '#d1fae5' : '#fee2e2',
                                                    color: asset.billAvailability === 'Y' ? '#065f46' : '#991b1b',
                                                    '& .MuiChip-icon': {
                                                        color: asset.billAvailability === 'Y' ? '#065f46' : '#991b1b',
                                                    },
                                                }}
                                            />
                                        </TableCell>

                                        {/* Warranty */}
                                        <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                                            {asset.warranty || '-'}
                                        </TableCell>

                                        {/* Supplier */}
                                        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600, color: 'text.primary' }}>
                                            {asset.supplier || '-'}
                                        </TableCell>

                                        {/* Contact No */}
                                        <TableCell sx={{ whiteSpace: 'nowrap', fontFamily: 'monospace', color: 'text.secondary' }}>
                                            {asset.contactNo || '-'}
                                        </TableCell>

                                        {/* Inv No */}
                                        <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                                            {asset.invNo || '-'}
                                        </TableCell>

                                        {/* Action */}
                                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                            <Stack direction="row" spacing={0.5} justifyContent="center">
                                                <Tooltip title="View Specification">
                                                    <IconButton size="small" onClick={() => handleOpenView(asset)} sx={{ color: 'primary.main' }}>
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit Asset">
                                                    <IconButton size="small" onClick={() => handleOpenEdit(asset)} sx={{ color: 'warning.main' }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Asset">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setAssetToDelete(asset);
                                                            setDeleteConfirmOpen(true);
                                                        }}
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    count={filteredAssets.length}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {isEditing ? 'Edit Asset Record' : 'Add New Asset Record'}
                </DialogTitle>
                <Divider sx={{ mx: 3 }} />
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Asset Type *"
                                    placeholder="e.g. Boards, Fan, Fridge, Kettle"
                                    value={formData.assetType}
                                    onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 8 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Description *"
                                    placeholder='e.g. Senu Cabs Name Board With Light (72"x50")'
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Assigned User</InputLabel>
                                    <Select
                                        value={formData.assignedTo || 'Unassigned'}
                                        label="Assigned User"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const matchedUser = users.find((u) => u.name === val || u.username === val);
                                            setFormData({
                                                ...formData,
                                                assignedTo: val,
                                                assignedUserId: matchedUser ? matchedUser.id : '',
                                                assignedDate: val && val !== 'Unassigned' ? (formData.assignedDate || new Date().toISOString().split('T')[0]) : '',
                                            });
                                        }}
                                    >
                                        <MenuItem value="Unassigned">
                                            <em>Unassigned</em>
                                        </MenuItem>
                                        <Divider />
                                        {users.map((u) => (
                                            <MenuItem key={u.id} value={u.name}>
                                                {u.name} {u.eNo ? `(${u.eNo})` : ''} - <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>{u.role}</Typography>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    label="Assigned Date"
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.assignedDate || ''}
                                    onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                                    disabled={!formData.assignedTo || formData.assignedTo === 'Unassigned'}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Usage Status</InputLabel>
                                    <Select
                                        value={formData.status || 'In Use'}
                                        label="Usage Status"
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'In Use' | 'Not in Use' })}
                                    >
                                        <MenuItem value="In Use">In Use</MenuItem>
                                        <MenuItem value="Not in Use">Not in Use</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Asset Code"
                                    placeholder="e.g. SC-BRD-001"
                                    value={formData.assetCode}
                                    onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Location"
                                    placeholder="e.g. Front Office, Lunch Room, Kitchen"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Quantity (Qty)"
                                    value={formData.qty}
                                    onChange={(e) => handleValueOrQtyChange('qty', e.target.value)}
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Unit Value (LKR)"
                                    placeholder="e.g. 59600.00"
                                    value={formData.value || ''}
                                    onChange={(e) => handleValueOrQtyChange('value', e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Total Value (LKR)"
                                    placeholder="Auto-calculated (Qty x Value)"
                                    value={formData.totalValue || ''}
                                    onChange={(e) => setFormData({ ...formData, totalValue: parseFloat(e.target.value) || 0 })}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    label="Purchase Date"
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.purchaseDate}
                                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Bill Availability</InputLabel>
                                    <Select
                                        value={formData.billAvailability || 'Y'}
                                        label="Bill Availability"
                                        onChange={(e) => setFormData({ ...formData, billAvailability: e.target.value as 'Y' | 'N' })}
                                    >
                                        <MenuItem value="Y">Y (Available)</MenuItem>
                                        <MenuItem value="N">N (Not Available)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Warranty"
                                    placeholder="e.g. 1 Year, 2 Years, None"
                                    value={formData.warranty}
                                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Supplier"
                                    placeholder="e.g. Kumara Wood, Singer"
                                    value={formData.supplier}
                                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Contact No"
                                    placeholder="e.g. 702775325"
                                    value={formData.contactNo}
                                    onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Inv No (Invoice Number)"
                                    placeholder="e.g. INV-2022-841"
                                    value={formData.invNo}
                                    onChange={(e) => setFormData({ ...formData, invNo: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, px: 3 }}
                    >
                        {isEditing ? 'Save Changes' : 'Save Asset'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Asset Specification</DialogTitle>
                <Divider sx={{ mx: 3 }} />
                <DialogContent>
                    {selectedAsset && (
                        <Stack spacing={1.5} sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" fontWeight={800} color="primary.main">
                                    {selectedAsset.assetType}
                                </Typography>
                                <Chip
                                    label={`Bill: ${selectedAsset.billAvailability || 'N'}`}
                                    size="small"
                                    sx={{
                                        fontWeight: 800,
                                        bgcolor: selectedAsset.billAvailability === 'Y' ? '#d1fae5' : '#fee2e2',
                                        color: selectedAsset.billAvailability === 'Y' ? '#065f46' : '#991b1b',
                                    }}
                                />
                            </Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                {selectedAsset.description}
                            </Typography>
                            <Divider />

                            <Grid container spacing={1}>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Asset Code:</Typography>
                                    <Typography variant="body2" fontFamily="monospace" fontWeight={600}>{selectedAsset.assetCode || '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Location:</Typography>
                                    <Typography variant="body2" fontWeight={600}>{selectedAsset.location || '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Assigned To:</Typography>
                                    <Typography variant="body2" fontWeight={700} color={selectedAsset.assignedTo && selectedAsset.assignedTo !== 'Unassigned' ? 'primary.main' : 'text.secondary'}>
                                        {selectedAsset.assignedTo || 'Unassigned'}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Assigned Date:</Typography>
                                    <Typography variant="body2">{selectedAsset.assignedDate || '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Usage Status:</Typography>
                                    <Box sx={{ mt: 0.3 }}>
                                        <Chip
                                            label={(selectedAsset.status || 'In Use') === 'In Use' ? 'In Use' : 'Not in Use'}
                                            size="small"
                                            sx={{
                                                fontWeight: 800,
                                                fontSize: '0.75rem',
                                                bgcolor:
                                                    (selectedAsset.status || 'In Use') === 'In Use'
                                                        ? '#ecfdf5'
                                                        : '#fef2f2',
                                                color:
                                                    (selectedAsset.status || 'In Use') === 'In Use'
                                                        ? '#065f46'
                                                        : '#991b1b',
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Quantity (Qty):</Typography>
                                    <Typography variant="body2" fontWeight={700}>{selectedAsset.qty}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Unit Value:</Typography>
                                    <Typography variant="body2">LKR {formatCurrency(selectedAsset.value)}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Total Value:</Typography>
                                    <Typography variant="body2" fontWeight={700} color="success.main">
                                        LKR {formatCurrency(selectedAsset.totalValue)}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Purchase Date:</Typography>
                                    <Typography variant="body2">{selectedAsset.purchaseDate || '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Warranty:</Typography>
                                    <Typography variant="body2">{selectedAsset.warranty || '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Supplier:</Typography>
                                    <Typography variant="body2" fontWeight={600}>{selectedAsset.supplier || '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Contact No:</Typography>
                                    <Typography variant="body2" fontFamily="monospace">{selectedAsset.contactNo || '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Invoice No (Inv No):</Typography>
                                    <Typography variant="body2" fontFamily="monospace">{selectedAsset.invNo || '-'}</Typography>
                                </Grid>
                            </Grid>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setViewDialogOpen(false)} sx={{ textTransform: 'none' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{ sx: { borderRadius: '20px' } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{assetToDelete?.assetType} - {assetToDelete?.description}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
                        Delete Asset
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Clear All Data Confirmation Dialog */}
            <Dialog
                open={clearAllDialogOpen}
                onClose={() => !clearingAll && setClearAllDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: '20px', maxWidth: 460, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DeleteSweepIcon color="error" />
                    Clear All Assets Data
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: 'text.primary', mb: 1.5 }}>
                        Are you sure you want to permanently delete <strong>all {assets.length} office assets</strong>?
                    </Typography>
                    <Box sx={{ bgcolor: mode === 'light' ? '#fee2e2' : 'rgba(239, 68, 68, 0.15)', p: 1.5, borderRadius: '10px' }}>
                        <Typography variant="body2" sx={{ color: mode === 'light' ? '#991b1b' : '#fca5a5', fontWeight: 600 }}>
                            ⚠️ Warning: This will delete all assets data from the table and MongoDB. This action cannot be undone.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1 }}>
                    <Button
                        onClick={() => setClearAllDialogOpen(false)}
                        disabled={clearingAll}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleClearAllData}
                        disabled={clearingAll}
                        startIcon={clearingAll ? <CircularProgress size={16} color="inherit" /> : <DeleteSweepIcon />}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, px: 2.5 }}
                    >
                        {clearingAll ? 'Clearing...' : 'Yes, Clear All Data'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Quick Assign Menu */}
            <Menu
                anchorEl={assignAnchorEl}
                open={Boolean(assignAnchorEl)}
                onClose={handleCloseAssignMenu}
                PaperProps={{
                    sx: {
                        borderRadius: '14px',
                        minWidth: 240,
                        maxHeight: 350,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    },
                }}
            >
                <MenuItem
                    onClick={() => handleQuickAssign('Unassigned')}
                    sx={{ fontWeight: 600, color: 'text.secondary' }}
                >
                    <em>Unassigned</em>
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                {users.map((u) => (
                    <MenuItem
                        key={u.id}
                        onClick={() => handleQuickAssign(u.name, u.id)}
                        selected={assetForQuickAssign?.assignedTo === u.name}
                        sx={{ fontSize: '0.85rem' }}
                    >
                        <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {u.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                {u.role} {u.eNo ? `• ${u.eNo}` : ''}
                            </Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Menu>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: '12px', fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

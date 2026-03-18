'use client';
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Button, IconButton, TextField, 
    Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, 
    Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    AppBar, Toolbar, Slide
} from '@mui/material';
import { 
    Delete as DeleteIcon, 
    FileUpload as FileUploadIcon, 
    Add as AddIcon,
    Refresh as RefreshIcon,
    Visibility as VisibilityIcon,
    Close as CloseIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { API_ENDPOINTS } from '@/config/api';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface Guide {
    _id: string;
    title: string;
    description: string;
    category: string;
    fileUrl: string;
    fileName: string;
    size: number;
    createdAt: string;
    uploadedBy: {
        fullName: string;
    };
}

export default function ManageStaffGuidePage() {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [viewingGuide, setViewingGuide] = useState<Guide | null>(null);
    
    // Form data
    const [newGuide, setNewGuide] = useState({
        title: '',
        description: '',
        category: 'General',
        file: null as File | null
    });

    useEffect(() => {
        fetchGuides();
    }, []);

    const fetchGuides = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('staffToken');
            const res = await fetch(API_ENDPOINTS.STAFF_GUIDES, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setGuides(data);
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to fetch guides', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!newGuide.file) {
            setSnackbar({ open: true, message: 'Please select a PDF file', severity: 'error' });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('title', newGuide.title);
        formData.append('description', newGuide.description);
        formData.append('category', newGuide.category);
        formData.append('guide', newGuide.file);

        try {
            const token = localStorage.getItem('staffToken');
            const res = await fetch(`${API_ENDPOINTS.STAFF_GUIDES}/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                setSnackbar({ open: true, message: 'Guide uploaded successfully!', severity: 'success' });
                setOpenDialog(false);
                setNewGuide({ title: '', description: '', category: 'General', file: null });
                fetchGuides();
            } else {
                const err = await res.json();
                setSnackbar({ open: true, message: err.message || 'Upload failed', severity: 'error' });
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'An error occurred during upload', severity: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this guide?')) return;

        try {
            const token = localStorage.getItem('staffToken');
            const res = await fetch(`${API_ENDPOINTS.STAFF_GUIDES}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setSnackbar({ open: true, message: 'Guide deleted successfully', severity: 'success' });
                fetchGuides();
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to delete guide', severity: 'error' });
        }
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const sizes = ['B', 'KB', 'MB'];
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFullFileUrl = (url: string) => {
        return `${API_ENDPOINTS.AUTH.replace('/api/auth', '')}${url}#toolbar=0&navpanes=0&scrollbar=0`;
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FileUploadIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                        <Typography variant="h4" fontWeight="bold">Manage Staff Guides</Typography>
                        <Typography color="text.secondary">Securely upload and maintain operational manuals</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                        variant="outlined" 
                        startIcon={<RefreshIcon />} 
                        onClick={fetchGuides}
                    >
                        Refresh
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => setOpenDialog(true)}
                        sx={{ borderRadius: 2 }}
                    >
                        Upload New Manual
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4, overflow: 'hidden' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>File Details</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Uploaded By</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
                        ) : guides.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}>No guides found. Upload one to get started.</TableCell></TableRow>
                        ) : (
                            guides.map((guide) => (
                                <TableRow key={guide._id} hover>
                                    <TableCell>
                                        <Typography fontWeight={600} variant="body1">{guide.title}</Typography>
                                        <Typography variant="caption" color="text.secondary" >{guide.description || ''}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ px: 1.5, py: 0.5, borderRadius: 10, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', fontSize: '0.7rem', fontWeight: 600, display: 'inline-block' }}>
                                            {guide.category}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{guide.fileName}</Typography>
                                        <Typography variant="caption" color="text.secondary">{formatSize(guide.size)}</Typography>
                                    </TableCell>
                                    <TableCell>{guide.uploadedBy?.fullName || 'System'}</TableCell>
                                    <TableCell>{new Date(guide.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        <IconButton color="primary" onClick={() => setViewingGuide(guide)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(guide._id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Upload Dialog */}
            <Dialog open={openDialog} onClose={() => !uploading && setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Upload PDF Manual</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={12}>
                            <TextField 
                                fullWidth 
                                label="Manual Title" 
                                value={newGuide.title} 
                                onChange={(e) => setNewGuide({...newGuide, title: e.target.value})}
                                placeholder="e.g. Driver's Etiquette Guide"
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField 
                                fullWidth 
                                label="Category" 
                                value={newGuide.category} 
                                onChange={(e) => setNewGuide({...newGuide, category: e.target.value})}
                                placeholder="e.g. Operations, Vehicles, Safety"
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField 
                                fullWidth 
                                label="Description" 
                                multiline 
                                rows={3} 
                                value={newGuide.description} 
                                onChange={(e) => setNewGuide({...newGuide, description: e.target.value})}
                            />
                        </Grid>
                        <Grid size={12}>
                            <Box 
                                sx={{ 
                                    border: '2px dashed', 
                                    borderColor: newGuide.file ? 'primary.main' : 'rgba(0,0,0,0.12)',
                                    borderRadius: 3, 
                                    p: 3, 
                                    textAlign: 'center',
                                    bgcolor: 'action.hover'
                                }}
                            >
                                <input 
                                    type="file" 
                                    accept="application/pdf" 
                                    id="manual-file-btn" 
                                    style={{ display: 'none' }} 
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setNewGuide({...newGuide, file: e.target.files[0]});
                                        }
                                    }}
                                />
                                <label htmlFor="manual-file-btn">
                                    <Button 
                                        component="span" 
                                        variant="outlined" 
                                        startIcon={<FileUploadIcon />}
                                        disabled={uploading}
                                    >
                                        {newGuide.file ? 'Change File' : 'Select PDF File'}
                                    </Button>
                                </label>
                                {newGuide.file && (
                                    <Typography sx={{ mt: 2, fontWeight: 500 }} color="primary">
                                        Selected: {newGuide.file.name} ({formatSize(newGuide.file.size)})
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} disabled={uploading}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleUpload} 
                        disabled={uploading || !newGuide.file || !newGuide.title}
                        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <FileUploadIcon />}
                    >
                        {uploading ? 'Uploading...' : 'Upload Manual'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* SECURE VIEWER DIALOG */}
            <Dialog
                fullScreen
                open={!!viewingGuide}
                onClose={() => setViewingGuide(null)}
                TransitionComponent={Transition}
                onContextMenu={(e) => e.preventDefault()}
            >
                <AppBar sx={{ position: 'relative', background: '#1e293b' }}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => setViewingGuide(null)}>
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
                            Preview: {viewingGuide?.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.7)' }}>
                            <LockIcon sx={{ fontSize: 18 }} />
                            <Typography variant="body2">Protected Preview</Typography>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Box sx={{ flex: 1, bgcolor: '#525659', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
                    {viewingGuide && (
                        <iframe
                            src={getFullFileUrl(viewingGuide.fileUrl)}
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                            title="Admin Preview"
                        />
                    )}
                </Box>
            </Dialog>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar({...snackbar, open: false})}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

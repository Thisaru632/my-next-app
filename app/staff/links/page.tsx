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
    Link as MuiLink,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Link as LinkIcon,
    OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { API_ENDPOINTS } from '@/config/api';

interface SavedLink {
    _id: string;
    title: string;
    url: string;
    description: string;
    createdAt: string;
}

const LinksManagePage = () => {
    const [links, setLinks] = useState<SavedLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // Form/Selected states
    const [selectedLink, setSelectedLink] = useState<SavedLink | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        description: '',
    });

    const fetchLinks = async () => {
        try {
            setLoading(true);
            const res = await fetch(API_ENDPOINTS.LINKS);
            if (!res.ok) throw new Error('Failed to fetch links');
            const data = await res.json();
            setLinks(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const handleOpenCreate = () => {
        setSelectedLink(null);
        setFormData({
            title: '',
            url: '',
            description: '',
        });
        setOpenDialog(true);
    };

    const handleOpenEdit = (link: SavedLink) => {
        setSelectedLink(link);
        setFormData({
            title: link.title,
            url: link.url,
            description: link.description || '',
        });
        setOpenDialog(true);
    };


    const handleOpenDelete = (link: SavedLink) => {
        setSelectedLink(link);
        setDeleteConfirmOpen(true);
    };

    const handleSave = async () => {
        try {
            // Basic validation
            if (!formData.title.trim()) throw new Error('Title is required');
            if (!formData.url.trim()) throw new Error('URL is required');

            // Add http:// if missing (basic UX improvement)
            let formattedUrl = formData.url.trim();
            if (!/^https?:\/\//i.test(formattedUrl)) {
                formattedUrl = 'https://' + formattedUrl;
            }

            const url = selectedLink
                ? `${API_ENDPOINTS.LINKS}/${selectedLink._id}`
                : API_ENDPOINTS.LINKS;
            const method = selectedLink ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    url: formattedUrl
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to save link');
            }

            setSuccess(`Link ${selectedLink ? 'updated' : 'added'} successfully!`);
            setOpenDialog(false);
            fetchLinks();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleDelete = async () => {
        if (!selectedLink) return;
        try {
            const res = await fetch(`${API_ENDPOINTS.LINKS}/${selectedLink._id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete link');

            setSuccess('Link deleted successfully!');
            setDeleteConfirmOpen(false);
            fetchLinks();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(null), 5000);
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
                    Necessary Links Manager
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
                    Add New Link
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : links.length === 0 ? (
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
                    <LinkIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        No saved links yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.disabled', mb: 3 }}>
                        Add important external resources, forms, or documents here for easy access.
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={handleOpenCreate}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Add Link
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
                                <TableCell sx={{ fontWeight: 700, width: '25%' }}>Title</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: '35%' }}>URL</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: '25%' }}>Description</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, width: '15%' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {links.map((link) => (
                                <TableRow key={link._id} hover>
                                    <TableCell>
                                        <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
                                            {link.title}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <MuiLink 
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 0.5,
                                                fontWeight: 600,
                                                color: 'primary.main',
                                                textDecoration: 'none',
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                        >
                                            <span style={{ 
                                                maxWidth: '250px', 
                                                whiteSpace: 'nowrap', 
                                                overflow: 'hidden', 
                                                textOverflow: 'ellipsis' 
                                            }}>
                                                {link.url}
                                            </span>
                                            <OpenInNewIcon sx={{ fontSize: '1rem' }} />
                                        </MuiLink>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {link.description || 'No description'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">

                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => handleOpenEdit(link)} sx={{ color: 'warning.main', bgcolor: 'rgba(245, 158, 11, 0.1)' }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={() => handleOpenDelete(link)} sx={{ color: 'error.main', bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
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
                    {selectedLink ? 'Edit Link' : 'Add New Link'}
                </DialogTitle>
                <Divider sx={{ mx: 3 }} />
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            placeholder="e.g. Agent Guide, Rate Card PDF"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            autoFocus
                        />
                        <TextField
                            fullWidth
                            label="URL"
                            placeholder="e.g. https://docs.google.com/..."
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Description (Optional)"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe what this link is for..."
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!formData.title.trim() || !formData.url.trim()}
                        sx={{ borderRadius: '10px', textTransform: 'none', px: 4, fontWeight: 700 }}
                    >
                        {selectedLink ? 'Save Changes' : 'Add Link'}
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
                        Are you sure you want to delete the link <strong>{selectedLink?.title}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: '8px' }}>
                        Delete Link
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LinksManagePage;

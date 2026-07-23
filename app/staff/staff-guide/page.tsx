'use client';
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Card, CardContent, Grid, Button, CircularProgress, 
    Dialog, IconButton, Slide, Fab, Tooltip
} from '@mui/material';
import { 
    Close as CloseIcon, 
    Visibility as VisibilityIcon, 
    MenuBook as MenuBookIcon,
    Lock as LockIcon,
    Fullscreen as FullscreenIcon
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

export default function StaffGuidePage() {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewingGuide, setViewingGuide] = useState<Guide | null>(null);

    useEffect(() => {
        fetchGuides();
    }, []);

    const fetchGuides = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('staffToken');
            if (!token) {
                window.location.href = '/staff/login';
                return;
            }
            const res = await fetch(API_ENDPOINTS.STAFF_GUIDES, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setGuides(data);
            } else if (res.status === 401) {
                localStorage.removeItem('staffToken');
                window.location.href = '/staff/login';
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.message || 'Failed to fetch guides');
            }
        } catch (err) {
            setError('An error occurred while fetching guides');
        } finally {
            setLoading(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleClose = () => {
        setViewingGuide(null);
    };

    const getFullFileUrl = (url: string) => {
        // Use fit and fitV to ensure the PDF fills the iframe as much as possible
        return `${API_ENDPOINTS.AUTH.replace('/api/auth', '')}${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&pagemode=none`;
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 3, 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
                }}>
                    <MenuBookIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.02em' }}>Staff Learning Center</Typography>
                    <Typography color="text.secondary" fontWeight="500">Secure full-screen operational manuals & guides</Typography>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
                    <CircularProgress thickness={5} size={60} />
                </Box>
            ) : error ? (
                <Box sx={{ p: 4, bgcolor: 'error.lighter', borderRadius: 3, textAlign: 'center' }}>
                    <Typography color="error" fontWeight="600">{error}</Typography>
                    <Button sx={{ mt: 2 }} onClick={fetchGuides}>Try Again</Button>
                </Box>
            ) : guides.length === 0 ? (
                <Box sx={{ py: 10, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 4 }}>
                    <Typography color="text.secondary" variant="h6">No guides available in the library yet.</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {guides.map((guide) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={guide._id}>
                            <Card sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                    borderColor: 'primary.main',
                                }
                            }}>
                                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ 
                                            px: 1.5, py: 0.5, borderRadius: 1.5, 
                                            bgcolor: 'primary.main', color: 'white',
                                            fontSize: '0.7rem', fontWeight: 700,
                                            textTransform: 'uppercase', letterSpacing: '0.05em'
                                        }}>
                                            {guide.category}
                                        </Box>
                                        <LockIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                    </Box>
                                    
                                    <Typography variant="h6" fontWeight="700" sx={{ mb: 1, lineHeight: 1.3 }}>
                                        {guide.title}
                                    </Typography>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                        mb: 3, 
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        minHeight: '3.6em'
                                    }}>
                                        {guide.description || 'Access internal guidelines and standard operating procedures for this category.'}
                                    </Typography>
                                    
                                    <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Box>
                                                <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Publisher</Typography>
                                                <Typography variant="body2" fontWeight={600} color="text.primary">{guide.uploadedBy?.fullName || 'Senu Cabs'}</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>Revision</Typography>
                                                <Typography variant="body2" fontWeight={600} color="text.primary">{new Date(guide.createdAt).toLocaleDateString()}</Typography>
                                            </Box>
                                        </Box>

                                        <Button 
                                            fullWidth 
                                            variant="contained" 
                                            size="large"
                                            startIcon={<FullscreenIcon />}
                                            onClick={() => setViewingGuide(guide)}
                                            sx={{ 
                                                borderRadius: 2.5,
                                                py: 1.2,
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                '&:hover': { 
                                                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                                    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)',
                                                }
                                            }}
                                        >
                                            View Full Screen
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* TRUE FULL SCREEN PDF VIEWER */}
            <Dialog
                fullScreen
                open={!!viewingGuide}
                onClose={handleClose}
                TransitionComponent={Transition}
                PaperProps={{
                    sx: { bgcolor: '#1e293b' }
                }}
            >
                {/* Floating Controls */}
                <Box sx={{ 
                    position: 'absolute', 
                    top: 20, 
                    right: 20, 
                    zIndex: 1000,
                    display: 'flex',
                    gap: 2,
                    pointerEvents: 'none'
                }}>
                    <Tooltip title="Close Full Screen" placement="left">
                        <Fab 
                            size="medium" 
                            color="error" 
                            onClick={handleClose}
                            sx={{ 
                                pointerEvents: 'auto',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                                '&:hover': { transform: 'scale(1.1)' }
                            }}
                        >
                            <CloseIcon />
                        </Fab>
                    </Tooltip>
                </Box>

                {/* Secure Badge */}
                <Box sx={{ 
                    position: 'absolute', 
                    bottom: 20, 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    px: 3, py: 1,
                    borderRadius: 10,
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <LockIcon sx={{ fontSize: 16, color: '#10b981' }} />
                    <Typography variant="caption" sx={{ letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase' }}>
                        Secure System View • Protected Content
                    </Typography>
                </Box>

                <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: '#525659' }}>
                    {viewingGuide && (
                        <iframe
                            src={getFullFileUrl(viewingGuide.fileUrl)}
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                            title="Full Screen Viewer"
                        />
                    )}
                </Box>
            </Dialog>
        </Box>
    );
}

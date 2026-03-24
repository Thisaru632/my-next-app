'use client';
import React, { useState, useEffect } from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Paper,
    TextField,
    InputAdornment,
    CircularProgress,
    Divider,
    TablePagination,
    Alert,
    Snackbar,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    People as PeopleIcon,
    NoAccounts as NoAccountsIcon,
} from '@mui/icons-material';
import { API_ENDPOINTS } from '@/config/api';

interface WebUser {
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'deactivated';
    isOnline: boolean;
    lastActive: string;
    createdAt: string;
    bookingCount?: number;
}

const WebUsersPage: React.FC = () => {
    const theme = useTheme();
    const { mode } = useThemeContext();
    const [users, setUsers] = useState<WebUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<WebUser | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    
    // Tabs state
    const [currentTab, setCurrentTab] = useState(0);
    
    // Status Logic
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [userToUpdate, setUserToUpdate] = useState<WebUser | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    
    // Notification logic
    const [notification, setNotification] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
        show: false,
        msg: '',
        type: 'success'
    });

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchWebUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('staffToken');
            const response = await fetch(`${API_ENDPOINTS.CUSTOMERS}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching web users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWebUsers();
    }, []);

    // Tab-based filtering
    const tabFilteredUsers = users.filter(user => {
        if (currentTab === 0) return true; // Show all
        if (currentTab === 1) return user.status === 'deactivated'; // Show blocked
        return true;
    });

    // Search filtering
    const finalFilteredUsers = tabFilteredUsers.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            (u.phone && u.phone.includes(search))
    );

    const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
        setPage(0); // Reset page on tab change
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedUsers = finalFilteredUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleViewUser = (user: WebUser) => {
        setSelectedUser(user);
        setViewDialogOpen(true);
    };

    const handleOpenStatusDialog = (user: WebUser) => {
        setUserToUpdate(user);
        setStatusDialogOpen(true);
    };

    const handleUpdateStatus = async () => {
        if (!userToUpdate) return;
        
        try {
            setUpdatingStatus(true);
            const token = localStorage.getItem('staffToken');
            const newStatus = userToUpdate.status === 'active' ? 'deactivated' : 'active';
            
            const response = await fetch(`${API_ENDPOINTS.CUSTOMERS}/${userToUpdate._id}/status`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setUsers(prev => prev.map(u => 
                    u._id === userToUpdate._id ? { ...u, status: newStatus } : u
                ));
                setNotification({
                    show: true,
                    msg: `User account ${newStatus === 'active' ? 'activated' : 'blocked'} successfully!`,
                    type: 'success'
                });
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            setNotification({
                show: true,
                msg: 'Failed to update account status. Please try again.',
                type: 'error'
            });
        } finally {
            setUpdatingStatus(false);
            setStatusDialogOpen(false);
            setUserToUpdate(null);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: 'background.default',
                p: { xs: 2, md: 4 },
            }}
        >
            {/* Page Header */}
            <Box
                sx={{
                    mb: 4,
                    pb: 3,
                    borderBottom: '2px solid',
                    borderImage: 'linear-gradient(90deg, #3b82f6 0%, #f43f5e 100%)',
                    borderImageSlice: 1,
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        fontSize: '2rem',
                        background: mode === 'light'
                            ? 'linear-gradient(135deg, #1e293b 0%, #475569 100%)'
                            : 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                    }}
                >
                    Account Directory
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
                    Monitor customer accounts and manage account restrictions.
                </Typography>
            </Box>

            {/* Stats Row */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                {[
                    { label: 'Total Users', value: users.length, color: '#3b82f6', icon: <PeopleIcon /> },
                    { label: 'Active', value: users.filter((u) => u.status === 'active').length, color: '#10b981', icon: <CheckCircleIcon /> },
                    { label: 'Blocked', value: users.filter((u) => u.status === 'deactivated').length, color: '#f43f5e', icon: <NoAccountsIcon /> },
                ].map((stat) => (
                    <Paper
                        key={stat.label}
                        elevation={0}
                        sx={{
                            flex: '1 1 200px',
                            background: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderTop: `4px solid ${stat.color}`,
                            borderRadius: 3,
                            p: 3,
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                {stat.icon}{stat.label}
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: stat.color, fontSize: '2.5rem' }}>
                                {stat.value}
                            </Typography>
                        </Box>
                    </Paper>
                ))}
            </Box>

            {/* Tabs Control */}
            <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                    value={currentTab} 
                    onChange={handleChangeTab} 
                    textColor="primary" 
                    indicatorColor="primary"
                    sx={{
                        '& .MuiTab-root': {
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            minWidth: 150,
                            py: 2,
                        }
                    }}
                >
                    <Tab label="Directory Home" />
                    <Tab label="Blocked Records" />
                </Tabs>
            </Box>

            {/* Main Content */}
            <Paper
                elevation={0}
                sx={{
                    background: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                }}
            >
                {/* Search Bar */}
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <TextField
                        size="small"
                        placeholder="Search by name or email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2 }
                        }}
                        sx={{ width: { xs: '100%', sm: 350 } }}
                    />
                </Box>

                <Divider />

                <TableContainer>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ bgcolor: mode === 'light' ? '#f8fafc' : '#1e293b' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Member Profile</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Access Tier</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>User Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Live Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Stats</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                        <CircularProgress size={44} thickness={4} />
                                    </TableCell>
                                </TableRow>
                            ) : finalFilteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                        <Typography color="text.secondary" fontWeight={500}>
                                            Empty directory for this view.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <TableRow key={user._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: mode === 'light' ? '#e2e8f0' : '#334155', color: 'primary.main', fontWeight: 800 }}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography fontWeight={700} variant="body2">{user.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600} color="text.secondary">Web Customer</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={user.status} 
                                                size="small" 
                                                color={user.status === 'active' ? 'success' : 'error'} 
                                                sx={{ textTransform: 'uppercase', fontWeight: 800, fontSize: '0.625rem', px: 1 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: user.isOnline ? '#10b981' : '#94a3b8' }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600, color: user.isOnline ? '#10b981' : 'text.secondary' }}>
                                                    {user.isOnline ? 'Online' : 'Offline'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="caption" display="block" color="text.secondary" fontWeight={600}>
                                                    {user.bookingCount ?? 0} Trips Completed
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
                                                    Member since {new Date(user.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                                                <Tooltip title="View Overview">
                                                    <IconButton onClick={() => handleViewUser(user)} size="small" sx={{ bgcolor: 'action.hover' }}>
                                                        <ViewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={user.status === 'active' ? 'Suspend Access' : 'Re-activate Account'}>
                                                    <IconButton 
                                                        onClick={() => handleOpenStatusDialog(user)} 
                                                        size="small" 
                                                        sx={{ 
                                                            bgcolor: user.status === 'active' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                            color: user.status === 'active' ? 'error.main' : 'success.main',
                                                        }}
                                                    >
                                                        {user.status === 'active' ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={finalFilteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: '1px solid', borderColor: 'divider' }}
                />
            </Paper>

            {/* View User Dialog */}
            <Dialog 
                open={viewDialogOpen} 
                onClose={() => setViewDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 480, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Customer Profile Review</DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <Box sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: mode === 'light' ? '#f1f5f9' : '#1e293b', color: 'primary.main', fontSize: '2rem', fontWeight: 800 }}>
                                    {selectedUser.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight={800}>{selectedUser.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
                                    <Chip 
                                        label={selectedUser.status === 'active' ? 'Standard Customer' : 'Access Suspended'} 
                                        color={selectedUser.status === 'active' ? 'success' : 'error'}
                                        size="small" 
                                        sx={{ mt: 1, fontWeight: 700, height: 24, fontSize: '0.65rem' }} 
                                    />
                                </Box>
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, bgcolor: 'action.hover', p: 3, borderRadius: 3 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</Typography>
                                    <Typography variant="body1" fontWeight={600}>{selectedUser.phone || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined On</Typography>
                                    <Typography variant="body1" fontWeight={600}>{new Date(selectedUser.createdAt).toLocaleDateString()}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Activity</Typography>
                                    <Typography variant="body1" fontWeight={700} color="primary">{selectedUser.bookingCount ?? 0} Trips</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Seen</Typography>
                                    <Typography variant="body1" fontWeight={600}>{selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleDateString() : 'N/A'}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setViewDialogOpen(false)} fullWidth variant="contained" sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}>
                        Done Viewing
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Status Change Confirmation */}
            <Dialog 
                open={statusDialogOpen} 
                onClose={() => !updatingStatus && setStatusDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 4, maxWidth: 400 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: userToUpdate?.status === 'active' ? 'error.main' : 'success.main', pt: 3 }}>
                    {userToUpdate?.status === 'active' ? 'Suspend Account Session?' : 'Reconfirm Account Access?'}
                </DialogTitle>
                <DialogContent sx={{ pb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {userToUpdate?.status === 'active' 
                            ? `Are you sure you want to block ${userToUpdate.name}? This will invalidate their credentials until manually restored.`
                            : `This will grant ${userToUpdate?.name} full access to their dashboard and booking tools again.`
                        }
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button disabled={updatingStatus} onClick={() => setStatusDialogOpen(false)} sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Dismiss
                    </Button>
                    <Button 
                        disabled={updatingStatus} 
                        onClick={handleUpdateStatus} 
                        variant="contained" 
                        color={userToUpdate?.status === 'active' ? 'error' : 'success'}
                        sx={{ borderRadius: 3, px: 3, fontWeight: 700 }}
                    >
                        {updatingStatus ? <CircularProgress size={20} color="inherit" /> : (userToUpdate?.status === 'active' ? 'Yes, Block User' : 'Yes, Restore Access')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={notification.show} 
                autoHideDuration={4000} 
                onClose={() => setNotification({ ...notification, show: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={notification.type} sx={{ borderRadius: 3, fontWeight: 700, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                    {notification.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default WebUsersPage;

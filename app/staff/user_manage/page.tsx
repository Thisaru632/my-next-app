'use client';
import React, { useState, useEffect } from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Typography,
    Tab,
    Tabs,
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
    FormGroup,
    FormControlLabel,
    Checkbox,
    Divider,
    Paper,
    TextField,
    InputAdornment,
    Badge,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Security as SecurityIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Search as SearchIcon,
    PersonAdd as PersonAddIcon,
    Group as GroupIcon,
    Close as CloseIcon,
    Undo as UndoIcon,
    History as HistoryIcon,
    Key as KeyIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { API_ENDPOINTS } from '@/config/api';
import { CircularProgress } from '@mui/material';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Permission {
    dashboard: boolean;
    leads: boolean;
    cms: boolean;
    userManagement: boolean;
    reports: boolean;
    rateCardManage: boolean;
}

interface CurrentUser {
    id: string; // Changed from number to string for MongoDB compatibility
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    joinedDate: string;
    avatar: string;
    permissions: Permission;
}

interface NewUser {
    id: string; // Changed from number to string
    name: string;
    email: string;
    requestedRole: string;
    requestDate: string;
    avatar: string;
    reason: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const initialCurrentUsers: CurrentUser[] = [
    {
        id: '1',
        name: 'Sarah Mitchell',
        email: 'sarah.m@company.com',
        role: 'Admin',
        status: 'active',
        joinedDate: '2024-01-15',
        avatar: 'SM',
        permissions: { dashboard: true, leads: true, cms: true, userManagement: true, reports: true, rateCardManage: true },
    },
    {
        id: '2',
        name: 'James Carter',
        email: 'j.carter@company.com',
        role: 'Editor',
        status: 'active',
        joinedDate: '2024-03-22',
        avatar: 'JC',
        permissions: { dashboard: true, leads: true, cms: true, userManagement: false, reports: false, rateCardManage: true },
    },
    {
        id: '3',
        name: 'Priya Sharma',
        email: 'p.sharma@company.com',
        role: 'Viewer',
        status: 'inactive',
        joinedDate: '2024-05-10',
        avatar: 'PS',
        permissions: { dashboard: true, leads: false, cms: false, userManagement: false, reports: false, rateCardManage: false },
    },
    {
        id: '4',
        name: 'Tom Nguyen',
        email: 't.nguyen@company.com',
        role: 'Editor',
        status: 'active',
        joinedDate: '2024-07-01',
        avatar: 'TN',
        permissions: { dashboard: true, leads: true, cms: false, userManagement: false, reports: true, rateCardManage: false },
    },
];

const initialNewUsers: NewUser[] = [
    {
        id: '101',
        name: 'Lena Fischer',
        email: 'lena.fischer@gmail.com',
        requestedRole: 'Editor',
        requestDate: '2025-02-17',
        avatar: 'LF',
        reason: 'Joining the marketing team to manage content.',
    },
    {
        id: '102',
        name: 'Carlos Mendez',
        email: 'c.mendez@outlook.com',
        requestedRole: 'Viewer',
        requestDate: '2025-02-18',
        avatar: 'CM',
        reason: 'Need access to review campaign reports.',
    },
    {
        id: '103',
        name: 'Aisha Okonkwo',
        email: 'aisha.ok@corp.io',
        requestedRole: 'Admin',
        requestDate: '2025-02-19',
        avatar: 'AO',
        reason: 'Transferred from HQ to manage regional operations.',
    },
];

const initialRejectedUsers: NewUser[] = [
    {
        id: '201',
        name: 'John Doe',
        email: 'john.doe@example.com',
        requestedRole: 'Viewer',
        requestDate: '2025-02-10',
        avatar: 'JD',
        reason: 'Suspicious activity during signup.',
    },
];

// ─── Avatar Colors ────────────────────────────────────────────────────────────

const avatarColors: Record<string, string> = {
    SM: '#6366f1',
    JC: '#0ea5e9',
    PS: '#f59e0b',
    TN: '#10b981',
    LF: '#ec4899',
    CM: '#8b5cf6',
    AO: '#f97316',
};

const roleColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    SuperAdmin: 'secondary',
    Admin: 'error',
    Staff: 'primary',
    Editor: 'primary',
    Viewer: 'default',
};

// ─── Tabs Panel ───────────────────────────────────────────────────────────────

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
        {value === index && children}
    </Box>
);

// ─── Permission Labels ─────────────────────────────────────────────────────────

const permissionLabels: { key: keyof Permission; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'leads', label: 'Lead Info' },
    { key: 'cms', label: 'CMS' },
    { key: 'userManagement', label: 'User Management' },
    { key: 'reports', label: 'Reports' },
    { key: 'rateCardManage', label: 'Rate Card Manage' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const UserManagementPage: React.FC = () => {
    const theme = useTheme();
    const { mode } = useThemeContext();
    const [activeTab, setActiveTab] = useState(0);
    const [currentUsers, setCurrentUsers] = useState<CurrentUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [newUsers, setNewUsers] = useState<NewUser[]>(initialNewUsers);
    const [rejectedUsers, setRejectedUsers] = useState<NewUser[]>(initialRejectedUsers);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('staffToken');
            const response = await fetch(`${API_ENDPOINTS.AUTH}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();

                const allMapped: any[] = data.map((user: any) => ({
                    id: user._id,
                    name: user.fullName || user.username,
                    email: user.email,
                    role: user.role === 'superadmin' ? 'SuperAdmin' : user.role === 'admin' ? 'Admin' : 'Staff',
                    status: user.isOnline ? 'active' : 'inactive',
                    dbStatus: user.status || 'active',
                    joinedDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'N/A',
                    avatar: (user.fullName || user.username).substring(0, 2).toUpperCase(),
                    permissions: user.permissions || {
                        dashboard: true,
                        leads: false,
                        cms: false,
                        userManagement: false,
                        reports: false,
                        rateCardManage: false
                    },
                    requestedRole: user.role === 'admin' ? 'Admin' : 'Staff',
                    requestDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'N/A',
                    reason: 'Registration request',
                }));

                setCurrentUsers(allMapped.filter(u => u.dbStatus === 'active'));
                setNewUsers(allMapped.filter(u => u.dbStatus === 'pending'));
                setRejectedUsers(allMapped.filter(u => u.dbStatus === 'rejected'));
            } else if (response.status === 403 || response.status === 401) {
                // If not authorized, redirect to dashboard or show error
                window.location.href = '/staff/dashboard';
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    // Delete dialog
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: CurrentUser | null }>({ open: false, user: null });

    // Permission dialog
    const [permDialog, setPermDialog] = useState<{ open: boolean; user: CurrentUser | null; perms: Permission | null; role: string }>({
        open: false,
        user: null,
        perms: null,
        role: 'Staff'
    });

    // Password reset dialog
    const [passDialog, setPassDialog] = useState<{ open: boolean; user: CurrentUser | null; newPass: string; currentHash: string; showHash: boolean }>({
        open: false,
        user: null,
        newPass: '',
        currentHash: '',
        showHash: false
    });

    // Reject dialog (new users)
    const [rejectDialog, setRejectDialog] = useState<{ open: boolean; user: NewUser | null }>({ open: false, user: null });

    // ── Handlers: Current Users ──
    const handleDeleteConfirm = async () => {
        if (deleteDialog.user) {
            try {
                const token = localStorage.getItem('staffToken');
                const res = await fetch(`${API_ENDPOINTS.AUTH}/users/${deleteDialog.user.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    fetchUsers();
                }
            } catch (error) {
                console.error('Delete failed:', error);
            }
        }
        setDeleteDialog({ open: false, user: null });
    };

    const handlePassReset = async () => {
        if (passDialog.user && passDialog.newPass) {
            try {
                const token = localStorage.getItem('staffToken');
                const res = await fetch(`${API_ENDPOINTS.AUTH}/users/${passDialog.user.id}/password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ password: passDialog.newPass })
                });
                if (res.ok) {
                    alert('Password updated successfully');
                    setPassDialog({ ...passDialog, open: false, newPass: '' });
                }
            } catch (error) {
                console.error('Password reset failed:', error);
            }
        }
    };

    const fetchHash = async (user: CurrentUser) => {
        try {
            const token = localStorage.getItem('staffToken');
            const res = await fetch(`${API_ENDPOINTS.AUTH}/users/${user.id}/password`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPassDialog(prev => ({ ...prev, currentHash: data.password, showHash: true }));
            }
        } catch (error) {
            console.error('Fetch hash failed:', error);
        }
    };

    const openPermDialog = (user: CurrentUser) => {
        setPermDialog({ open: true, user, perms: { ...user.permissions }, role: user.role });
    };

    const handlePermChange = (key: keyof Permission) => {
        setPermDialog((prev) => ({
            ...prev,
            perms: prev.perms ? { ...prev.perms, [key]: !prev.perms[key] } : null,
        }));
    };

    const handlePermSave = async () => {
        if (permDialog.user && permDialog.perms) {
            try {
                const token = localStorage.getItem('staffToken');
                const res = await fetch(`${API_ENDPOINTS.AUTH}/users/${permDialog.user.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        permissions: permDialog.perms,
                        role: permDialog.role.toLowerCase() === 'superadmin' ? 'superadmin' : permDialog.role.toLowerCase() === 'admin' ? 'admin' : 'staff'
                    })
                });
                if (res.ok) {
                    fetchUsers();
                }
            } catch (error) {
                console.error('Permission update failed:', error);
            }
        }
        setPermDialog({ open: false, user: null, perms: null, role: 'Staff' });
    };

    // ── Handlers: New Users ──
    const handleApprove = async (user: NewUser) => {
        try {
            const token = localStorage.getItem('staffToken');
            const res = await fetch(`${API_ENDPOINTS.AUTH}/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'active' })
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Approval failed:', error);
        }
    };

    const handleRejectConfirm = async () => {
        if (rejectDialog.user) {
            try {
                const token = localStorage.getItem('staffToken');
                const res = await fetch(`${API_ENDPOINTS.AUTH}/users/${rejectDialog.user.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: 'rejected' })
                });
                if (res.ok) {
                    fetchUsers();
                }
            } catch (error) {
                console.error('Rejection failed:', error);
            }
        }
        setRejectDialog({ open: false, user: null });
    };

    const handleUndoReject = async (user: NewUser) => {
        try {
            const token = localStorage.getItem('staffToken');
            const res = await fetch(`${API_ENDPOINTS.AUTH}/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'pending' })
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Restore failed:', error);
        }
    };

    const handlePermanentDelete = async (id: string) => {
        try {
            const token = localStorage.getItem('staffToken');
            const res = await fetch(`${API_ENDPOINTS.AUTH}/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Permanent delete failed:', error);
        }
    };

    // ── Filtered Lists ──
    const filteredCurrentUsers = currentUsers.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    const filteredNewUsers = newUsers.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    const filteredRejectedUsers = rejectedUsers.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    // ─── Render ─────────────────────────────────────────────────────────────────

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: 'background.default',
                color: 'text.primary',
                p: { xs: 2, md: 4, lg: 6 },
            }}
        >
            {/* Page Header */}
            <Box
                sx={{
                    mb: 4,
                    pb: 3,
                    borderBottom: '2px solid',
                    borderImage: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
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
                    User Management
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
                    Manage staff access, permissions, and onboard new members.
                </Typography>
            </Box>

            {/* Stats Row */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                {[
                    { label: 'Total Users', value: currentUsers.length, color: '#3b82f6' },
                    { label: 'Active', value: currentUsers.filter((u) => u.status === 'active').length, color: '#10b981' },
                    { label: 'Pending Approval', value: newUsers.length, color: '#f59e0b' },
                    { label: 'Rejected', value: rejectedUsers.length, color: '#f43f5e' },
                ].map((stat) => (
                    <Box
                        key={stat.label}
                        sx={{
                            flex: '1 1 140px',
                            background: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderTop: `3px solid ${stat.color}`,
                            borderRadius: 2,
                            p: 2.5,
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                fontWeight: 500,
                                fontSize: '0.875rem',
                                letterSpacing: '0.02em',
                                mb: 1,
                            }}
                        >
                            {stat.label}
                        </Typography>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                color: stat.color,
                                fontSize: '2rem',
                                lineHeight: 1,
                            }}
                        >
                            {stat.value}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Main Card */}
            <Paper
                elevation={0}
                sx={{
                    background: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                }}
            >
                {/* Toolbar */}
                <Box
                    sx={{
                        px: 3,
                        pt: 3,
                        pb: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={(_, v) => { setActiveTab(v); setSearch(''); }}
                        sx={{
                            '& .MuiTab-root': { color: 'text.secondary', fontWeight: 600, textTransform: 'none', fontSize: 14 },
                            '& .Mui-selected': { color: 'primary.main !important' },
                            '& .MuiTabs-indicator': { backgroundColor: 'primary.main', height: 3, borderRadius: 2 },
                        }}
                    >
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <GroupIcon fontSize="small" />
                                    Current Users
                                    <Chip
                                        label={currentUsers.length}
                                        size="small"
                                        sx={{ backgroundColor: '#eff6ff', color: '#1d4ed8', height: 20, fontSize: 11 }}
                                    />
                                </Box>
                            }
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonAddIcon fontSize="small" />
                                    New Users
                                    {newUsers.length > 0 && (
                                        <Chip
                                            label={newUsers.length}
                                            size="small"
                                            sx={{ backgroundColor: '#451a03', color: '#fb923c', height: 20, fontSize: 11 }}
                                        />
                                    )}
                                </Box>
                            }
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <HistoryIcon fontSize="small" />
                                    Rejected Users
                                    {rejectedUsers.length > 0 && (
                                        <Chip
                                            label={rejectedUsers.length}
                                            size="small"
                                            sx={{ backgroundColor: '#fef2f2', color: '#ef4444', height: 20, fontSize: 11 }}
                                        />
                                    )}
                                </Box>
                            }
                        />
                    </Tabs>

                    <TextField
                        size="small"
                        placeholder="Search users…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#475569', fontSize: 18 }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            width: { xs: '100%', sm: 250 },
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'background.default',
                                color: 'text.primary',
                                borderRadius: 2,
                                '& fieldset': { borderColor: 'divider' },
                                '&:hover fieldset': { borderColor: 'text.secondary' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                            },
                            '& input::placeholder': { color: 'text.secondary' },
                        }}
                    />
                </Box>

                <Divider sx={{ borderColor: '#334155', mt: 0 }} />

                {/* ── Tab 0: Current Users ── */}
                <TabPanel value={activeTab} index={0}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: '#3b82f6' }} />
                        </Box>
                    ) : (
                        <TableContainer sx={{
                            px: 1,
                            overflowX: 'auto',
                            '&::-webkit-scrollbar': {
                                height: '6px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#cbd5e1',
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: '#f1f5f9',
                            },
                            '@media (max-width: 600px)': {
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: '#3b82f6',
                                }
                            }
                        }}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow>
                                        {['User', 'Role', 'Status', 'Joined', 'Permissions', 'Actions'].map((h) => (
                                            <TableCell
                                                key={h}
                                                sx={{
                                                    color: '#475569',
                                                    fontWeight: 700,
                                                    fontSize: '0.875rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    borderColor: '#e2e8f0',
                                                    py: 2,
                                                }}
                                            >
                                                {h}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredCurrentUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ color: '#94a3b8', py: 6, borderColor: '#f1f5f9' }}>
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCurrentUsers.map((user) => (
                                            <TableRow
                                                key={user.id}
                                                sx={{
                                                    '&:hover': { backgroundColor: '#f8fafc' },
                                                    '& td': { borderColor: '#f1f5f9' },
                                                    transition: 'background 0.15s',
                                                }}
                                            >
                                                {/* User */}
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ bgcolor: avatarColors[user.avatar] || '#3b82f6', width: 36, height: 36, fontSize: 13, fontWeight: 700 }}>
                                                            {user.avatar}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ color: '#1e293b', fontSize: 14, fontWeight: 500 }}>{user.name}</Typography>
                                                            <Typography sx={{ color: '#64748b', fontSize: 12 }}>{user.email}</Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                {/* Role */}
                                                <TableCell>
                                                    <Chip label={user.role} color={roleColors[user.role]} size="small" variant="outlined" />
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                        <Box
                                                            sx={{
                                                                width: 8, height: 8, borderRadius: '50%',
                                                                backgroundColor: user.status === 'active' ? '#10b981' : '#64748b',
                                                                boxShadow: user.status === 'active' ? '0 0 6px #10b981' : 'none',
                                                            }}
                                                        />
                                                        <Typography sx={{ color: user.status === 'active' ? '#10b981' : '#64748b', fontSize: 13, textTransform: 'capitalize' }}>
                                                            {user.status}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                {/* Joined */}
                                                <TableCell sx={{ color: '#64748b', fontSize: 13 }}>{user.joinedDate}</TableCell>

                                                {/* Permissions summary */}
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                        {permissionLabels
                                                            .filter((p) => user.permissions[p.key])
                                                            .map((p) => (
                                                                <Chip key={p.key} label={p.label} size="small"
                                                                    sx={{ fontSize: 10, height: 18, backgroundColor: '#eff6ff', color: '#1d4ed8' }} />
                                                            ))}
                                                    </Box>
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        <Tooltip title={user.role === 'SuperAdmin' ? "Super Admin permissions cannot be changed" : "Edit Permissions"}>
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    disabled={user.role === 'SuperAdmin'}
                                                                    onClick={() => openPermDialog(user)}
                                                                    sx={{ color: '#3b82f6', '&:hover': { backgroundColor: '#eff6ff' } }}
                                                                >
                                                                    <SecurityIcon fontSize="small" />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                        <Tooltip title={user.role === 'SuperAdmin' ? "Super Admin cannot be deleted" : "Delete User"}>
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    disabled={user.role === 'SuperAdmin'}
                                                                    onClick={() => setDeleteDialog({ open: true, user })}
                                                                    sx={{ color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                        <Tooltip title="Manage Password">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => setPassDialog({ open: true, user, newPass: '', currentHash: '', showHash: false })}
                                                                sx={{ color: '#f59e0b', '&:hover': { backgroundColor: '#fff7ed' } }}
                                                            >
                                                                <KeyIcon fontSize="small" />
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
                    )}
                </TabPanel>

                {/* ── Tab 1: New Users ── */}
                <TabPanel value={activeTab} index={1}>
                    <TableContainer sx={{
                        px: 1,
                        overflowX: 'auto',
                        '&::-webkit-scrollbar': {
                            height: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#cbd5e1',
                            borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: '#f1f5f9',
                        },
                        '@media (max-width: 600px)': {
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#3b82f6',
                            }
                        }
                    }}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    {['Applicant', 'Requested Role', 'Request Date', 'Reason', 'Actions'].map((h) => (
                                        <TableCell
                                            key={h}
                                            sx={{
                                                color: '#475569',
                                                fontWeight: 700,
                                                fontSize: '0.875rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderColor: '#e2e8f0',
                                                py: 2,
                                            }}
                                        >
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredNewUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ color: '#94a3b8', py: 6, borderColor: '#f1f5f9' }}>
                                            No pending requests.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredNewUsers.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            sx={{
                                                '&:hover': { backgroundColor: '#f8fafc' },
                                                '& td': { borderColor: '#f1f5f9' },
                                                transition: 'background 0.15s',
                                            }}
                                        >
                                            {/* Applicant */}
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ bgcolor: avatarColors[user.avatar] || '#f59e0b', width: 36, height: 36, fontSize: 13, fontWeight: 700 }}>
                                                        {user.avatar}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ color: '#1e293b', fontSize: 14, fontWeight: 500 }}>{user.name}</Typography>
                                                        <Typography sx={{ color: '#64748b', fontSize: 12 }}>{user.email}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>

                                            {/* Role */}
                                            <TableCell>
                                                <Chip label={user.requestedRole} color={roleColors[user.requestedRole]} size="small" variant="outlined" />
                                            </TableCell>

                                            {/* Date */}
                                            <TableCell sx={{ color: '#64748b', fontSize: 13 }}>{user.requestDate}</TableCell>

                                            {/* Reason */}
                                            <TableCell>
                                                <Typography sx={{ color: '#94a3b8', fontSize: 13, maxWidth: 280 }}>{user.reason}</Typography>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        startIcon={<ApproveIcon />}
                                                        onClick={() => handleApprove(user)}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                            color: '#ffffff',
                                                            textTransform: 'none',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            borderRadius: '8px',
                                                            px: 2,
                                                            py: 0.8,
                                                            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                                transform: 'translateY(-1px)',
                                                                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
                                                            },
                                                            transition: 'all 0.2s',
                                                        }}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        startIcon={<RejectIcon />}
                                                        onClick={() => setRejectDialog({ open: true, user })}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                                                            color: '#ffffff',
                                                            textTransform: 'none',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            borderRadius: '8px',
                                                            px: 2,
                                                            py: 0.8,
                                                            boxShadow: '0 4px 6px -1px rgba(244, 63, 94, 0.2)',
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                                                                transform: 'translateY(-1px)',
                                                                boxShadow: '0 10px 15px -3px rgba(244, 63, 94, 0.3)',
                                                            },
                                                            transition: 'all 0.2s',
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* ── Tab 2: Rejected Users ── */}
                <TabPanel value={activeTab} index={2}>
                    <TableContainer sx={{ px: 1, overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    {['Rejected User', 'Requested Role', 'Request Date', 'Reason', 'Actions'].map((h) => (
                                        <TableCell
                                            key={h}
                                            sx={{
                                                color: '#475569',
                                                fontWeight: 700,
                                                fontSize: '0.875rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                borderColor: '#e2e8f0',
                                                py: 2,
                                            }}
                                        >
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRejectedUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ color: '#94a3b8', py: 6, borderColor: '#f1f5f9' }}>
                                            No rejected requests.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRejectedUsers.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            sx={{
                                                '&:hover': { backgroundColor: '#f8fafc' },
                                                '& td': { borderColor: '#f1f5f9' },
                                                transition: 'background 0.15s',
                                            }}
                                        >
                                            {/* Rejected User */}
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ bgcolor: '#ef4444', width: 36, height: 36, fontSize: 13, fontWeight: 700 }}>
                                                        {user.avatar}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ color: '#1e293b', fontSize: 14, fontWeight: 500 }}>{user.name}</Typography>
                                                        <Typography sx={{ color: '#64748b', fontSize: 12 }}>{user.email}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>

                                            {/* Role */}
                                            <TableCell>
                                                <Chip label={user.requestedRole} color={roleColors[user.requestedRole]} size="small" variant="outlined" />
                                            </TableCell>

                                            {/* Date */}
                                            <TableCell sx={{ color: '#64748b', fontSize: 13 }}>{user.requestDate}</TableCell>

                                            {/* Reason */}
                                            <TableCell>
                                                <Typography sx={{ color: '#94a3b8', fontSize: 13, maxWidth: 280 }}>{user.reason}</Typography>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="Restore to New Users">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleUndoReject(user)}
                                                            sx={{ color: '#3b82f6', '&:hover': { backgroundColor: '#eff6ff' } }}
                                                        >
                                                            <UndoIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Permanently Delete">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handlePermanentDelete(user.id)}
                                                            sx={{ color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}
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
                    </TableContainer>
                </TabPanel>

                <Box sx={{ height: 16 }} />
            </Paper>

            {/* ── Delete Confirmation Dialog ── */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, user: null })}
                PaperProps={{ sx: { backgroundColor: 'background.paper', color: 'text.primary', borderRadius: 3, border: '1px solid', borderColor: 'divider', width: '90%', maxWidth: 380, m: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: 'text.primary', pb: 1 }}>Delete User</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: 'text.secondary' }}>
                        Are you sure you want to delete{' '}
                        <Box component="span" sx={{ color: '#f87171', fontWeight: 600 }}>
                            {deleteDialog.user?.name}
                        </Box>
                        ? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setDeleteDialog({ open: false, user: null })}
                        sx={{ color: 'text.secondary', textTransform: 'none', '&:hover': { backgroundColor: 'action.hover' } }}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} variant="contained"
                        sx={{ backgroundColor: '#ef4444', textTransform: 'none', '&:hover': { backgroundColor: '#dc2626' } }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Reject Confirmation Dialog ── */}
            <Dialog
                open={rejectDialog.open}
                onClose={() => setRejectDialog({ open: false, user: null })}
                PaperProps={{ sx: { backgroundColor: 'background.paper', color: 'text.primary', borderRadius: 3, border: '1px solid', borderColor: 'divider', width: '90%', maxWidth: 380, m: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: 'text.primary', pb: 1 }}>Reject Request</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: 'text.secondary' }}>
                        Reject access request from{' '}
                        <Box component="span" sx={{ color: '#fb923c', fontWeight: 600 }}>
                            {rejectDialog.user?.name}
                        </Box>
                        ?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setRejectDialog({ open: false, user: null })}
                        sx={{ color: 'text.secondary', textTransform: 'none', '&:hover': { backgroundColor: 'action.hover' } }}>
                        Cancel
                    </Button>
                    <Button onClick={handleRejectConfirm} variant="contained"
                        sx={{ backgroundColor: '#ef4444', textTransform: 'none', '&:hover': { backgroundColor: '#dc2626' } }}>
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Permissions Dialog ── */}
            <Dialog
                open={permDialog.open}
                onClose={() => setPermDialog({ open: false, user: null, perms: null, role: 'Staff' })}
                PaperProps={{ sx: { backgroundColor: 'background.paper', color: 'text.primary', borderRadius: 4, border: '1px solid', borderColor: 'divider', width: '95%', maxWidth: 450, m: 2 } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, color: 'text.primary' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <SecurityIcon sx={{ color: '#3b82f6' }} />
                        Edit Permissions
                    </Box>
                    <IconButton size="small" onClick={() => setPermDialog({ open: false, user: null, perms: null, role: 'Staff' })}
                        sx={{ color: '#94a3b8', '&:hover': { backgroundColor: '#f1f5f9' } }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>

                <Divider sx={{ borderColor: '#334155' }} />

                <DialogContent sx={{ pt: 2 }}>
                    {permDialog.user && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                            <Avatar sx={{ bgcolor: avatarColors[permDialog.user.avatar] || '#3b82f6', width: 40, height: 40, fontWeight: 700 }}>
                                {permDialog.user.avatar}
                            </Avatar>
                            <Box>
                                <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>{permDialog.user.name}</Typography>
                                <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>{permDialog.user.email}</Typography>
                            </Box>
                        </Box>
                    )}

                    <Typography sx={{ color: 'text.secondary', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                        Module Access
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <TextField
                            select
                            fullWidth
                            label="Role"
                            value={permDialog.role}
                            onChange={(e) => setPermDialog(prev => ({ ...prev, role: e.target.value }))}
                            SelectProps={{ native: true }}
                            variant="outlined"
                            size="small"
                        >
                            <option value="Staff">Staff</option>
                            <option value="Admin">Admin</option>
                            <option value="SuperAdmin">SuperAdmin</option>
                        </TextField>
                    </Box>

                    <FormGroup>
                        {permissionLabels.map((p) => (
                            <FormControlLabel
                                key={p.key}
                                control={
                                    <Checkbox
                                        checked={permDialog.perms?.[p.key] ?? false}
                                        onChange={() => handlePermChange(p.key)}
                                        sx={{
                                            color: 'text.secondary',
                                            '&.Mui-checked': { color: 'primary.main' },
                                        }}
                                    />
                                }
                                label={<Typography sx={{ color: 'text.primary', fontSize: 14 }}>{p.label}</Typography>}
                                sx={{
                                    px: 1.5, py: 0.5, mb: 0.5, borderRadius: 2,
                                    '&:hover': { backgroundColor: 'action.hover' },
                                }}
                            />
                        ))}
                    </FormGroup>
                </DialogContent>

                <Divider sx={{ borderColor: '#f1f5f9' }} />
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => setPermDialog({ open: false, user: null, perms: null, role: 'Staff' })}
                        sx={{ color: '#64748b', textTransform: 'none', '&:hover': { backgroundColor: '#f1f5f9' } }}>
                        Cancel
                    </Button>
                    <Button onClick={handlePermSave} variant="contained"
                        sx={{ backgroundColor: '#3b82f6', textTransform: 'none', '&:hover': { backgroundColor: '#2563eb' } }}>
                        Save Permissions
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Password Management Dialog ── */}
            <Dialog
                open={passDialog.open}
                onClose={() => setPassDialog({ ...passDialog, open: false })}
                PaperProps={{ sx: { backgroundColor: 'background.paper', color: 'text.primary', borderRadius: 4, border: '1px solid', borderColor: 'divider', width: '95%', maxWidth: 450, m: 2 } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, color: 'text.primary' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <KeyIcon sx={{ color: '#f59e0b' }} />
                        Password Management
                    </Box>
                    <IconButton size="small" onClick={() => setPassDialog({ ...passDialog, open: false })}
                        sx={{ color: '#94a3b8', '&:hover': { backgroundColor: '#f1f5f9' } }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>

                <Divider sx={{ borderColor: '#334155' }} />

                <DialogContent sx={{ pt: 2 }}>
                    {passDialog.user && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                            <Avatar sx={{ bgcolor: avatarColors[passDialog.user.avatar] || '#3b82f6', width: 40, height: 40, fontWeight: 700 }}>
                                {passDialog.user.avatar}
                            </Avatar>
                            <Box>
                                <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>{passDialog.user.name}</Typography>
                                <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>{passDialog.user.email}</Typography>
                            </Box>
                        </Box>
                    )}

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>Set New Password</Typography>
                        <TextField
                            fullWidth
                            type="text"
                            placeholder="Enter new password"
                            value={passDialog.newPass}
                            onChange={(e) => setPassDialog(prev => ({ ...prev, newPass: e.target.value }))}
                            variant="outlined"
                            size="small"
                        />
                    </Box>

                    <Box>
                        <Button
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => passDialog.user && fetchHash(passDialog.user)}
                            sx={{ color: '#3b82f6', textTransform: 'none', mb: 1 }}
                        >
                            View Password Hash
                        </Button>

                        {passDialog.showHash && (
                            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                    {passDialog.currentHash}
                                </Typography>
                                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'info.main', fontStyle: 'italic' }}>
                                    * Passwords are encrypted for security. The above is the secure hash.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                <Divider sx={{ borderColor: '#f1f5f9' }} />
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => setPassDialog({ ...passDialog, open: false })}
                        sx={{ color: '#64748b', textTransform: 'none', '&:hover': { backgroundColor: '#f1f5f9' } }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePassReset}
                        variant="contained"
                        disabled={!passDialog.newPass}
                        sx={{ backgroundColor: '#f59e0b', color: 'white', textTransform: 'none', '&:hover': { backgroundColor: '#d97706' } }}
                    >
                        Update Password
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagementPage;
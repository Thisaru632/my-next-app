'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Button,
    IconButton,
    Chip,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Tooltip,
    Divider,
    Tabs,
    Tab,
    Avatar,
    InputAdornment,
    RadioGroup,
    FormControlLabel,
    Radio,
} from '@mui/material';
import {
    EventNote as EventNoteIcon,
    Add as AddIcon,
    FileDownload as DownloadIcon,
    Search as SearchIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Pending as PendingIcon,
    AccessTime as TimeIcon,
    People as PeopleIcon,
    DateRange as DateRangeIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { useThemeContext } from '@/context/ThemeContext';
import { API_ENDPOINTS } from '@/config/api';

interface LeaveRequest {
    id: string;
    eNo: string;
    staffName: string;
    staffEmail: string;
    avatar?: string;
    leaveType: 'Annual' | 'Casual' | 'Medical' | 'Short Leave' | 'Emergency' | 'Unpaid';
    fromDate: string; // YYYY-MM-DD
    toDate: string;   // YYYY-MM-DD
    period: 'Full Day' | 'Half Day (Morning)' | 'Half Day (Evening)';
    daysCount: number;
    reason: string;
    appliedDate: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    approvedBy?: string;
    approvedAt?: string;
    hrNotes?: string;
}

interface StaffMember {
    id: string;
    eNo: string;
    name: string;
    email: string;
    avatar?: string;
}

const LEAVE_TYPE_CONFIG = {
    Annual: { label: 'Annual Leave', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    Casual: { label: 'Casual Leave', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
    Medical: { label: 'Medical / Sick Leave', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    'Short Leave': { label: 'Short Leave (Half Day)', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    Emergency: { label: 'Emergency Leave', color: '#b91c1c', bg: '#fff1f2', border: '#fecdd3' },
    Unpaid: { label: 'Unpaid Leave', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
};

const compareENo = (a?: string, b?: string): number => {
    const cleanA = (a || '').trim();
    const cleanB = (b || '').trim();
    const isInvalidA = !cleanA || cleanA.toLowerCase() === 'n/a' || cleanA === '-';
    const isInvalidB = !cleanB || cleanB.toLowerCase() === 'n/a' || cleanB === '-';
    if (isInvalidA && isInvalidB) return 0;
    if (isInvalidA) return 1;
    if (isInvalidB) return -1;
    return cleanA.localeCompare(cleanB, undefined, { numeric: true, sensitivity: 'base' });
};

const formatDateYMD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function LeaveManagementPage() {
    const router = useRouter();
    const { mode } = useThemeContext();
    const [loading, setLoading] = useState(true);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [statusTab, setStatusTab] = useState<'ALL' | 'Pending' | 'Approved' | 'Rejected'>('ALL');
    const [leaveTypeFilter, setLeaveTypeFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    // Apply / Edit Dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [formStaffENo, setFormStaffENo] = useState('');
    const [formLeaveType, setFormLeaveType] = useState<LeaveRequest['leaveType']>('Casual');
    const [formFromDate, setFormFromDate] = useState(() => formatDateYMD(new Date()));
    const [formToDate, setFormToDate] = useState(() => formatDateYMD(new Date()));
    const [formPeriod, setFormPeriod] = useState<LeaveRequest['period']>('Full Day');
    const [formReason, setFormReason] = useState('');
    const [formStatus, setFormStatus] = useState<LeaveRequest['status']>('Approved');
    const [formHrNotes, setFormHrNotes] = useState('');

    // View Details Dialog
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewItem, setViewItem] = useState<LeaveRequest | null>(null);

    // Permission check
    useEffect(() => {
        const userStr = localStorage.getItem('staffUser');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const isSuperAdmin = user.role === 'superadmin';
                const hasHrPermission = user.permissions?.hrSection;
                if (!isSuperAdmin && !hasHrPermission) {
                    router.push('/staff');
                    return;
                }
            } catch (e) {}
        }
    }, [router]);

    // Load initial data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('staffToken');
            const res = await fetch(`${API_ENDPOINTS.AUTH}/attendance?all=true`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            let staffMembers: StaffMember[] = [];
            if (res.ok) {
                const logs = await res.json();
                const map = new Map<string, StaffMember>();
                logs.forEach((item: any) => {
                    const eNo = (item.eNo || '').trim();
                    if (eNo && !map.has(eNo.toLowerCase())) {
                        map.set(eNo.toLowerCase(), {
                            id: item.id || item.staffId || eNo,
                            eNo: item.eNo,
                            name: item.name || item.fullName || 'Staff Member',
                            email: item.email || '',
                            avatar: item.avatar || '',
                        });
                    }
                });
                staffMembers = Array.from(map.values()).sort((a, b) => compareENo(a.eNo, b.eNo));
            }
            setStaffList(staffMembers);

            // Load leaves from localStorage
            const saved = localStorage.getItem('staff_leave_requests');
            if (saved) {
                try {
                    setLeaveRequests(JSON.parse(saved));
                } catch (e) {
                    setLeaveRequests([]);
                }
            } else if (staffMembers.length > 0) {
                // Initialize default demo leave records for staff
                const sampleLeaves: LeaveRequest[] = [
                    {
                        id: 'leave_101',
                        eNo: 'E111',
                        staffName: 'Ravindu Lakshan',
                        staffEmail: 'user03.senucabs@gmail.com',
                        leaveType: 'Annual',
                        fromDate: '2026-09-15',
                        toDate: '2026-09-16',
                        period: 'Full Day',
                        daysCount: 2,
                        reason: 'Annual family trip',
                        appliedDate: '2026-09-08',
                        status: 'Approved',
                        approvedBy: 'HR Admin',
                        approvedAt: '2026-09-09',
                        hrNotes: 'Approved as per annual quota balance',
                    },
                    {
                        id: 'leave_102',
                        eNo: 'E113',
                        staffName: 'Sasanka',
                        staffEmail: 'user05.senucabs@gmail.com',
                        leaveType: 'Short Leave',
                        fromDate: '2026-09-12',
                        toDate: '2026-09-12',
                        period: 'Half Day (Morning)',
                        daysCount: 0.5,
                        reason: 'Medical checkup and lab tests',
                        appliedDate: '2026-09-09',
                        status: 'Pending',
                        hrNotes: 'Awaiting doctor receipt',
                    },
                    {
                        id: 'leave_103',
                        eNo: 'E114',
                        staffName: 'Weerasinghe',
                        staffEmail: 'user06.senucabs@gmail.com',
                        leaveType: 'Casual',
                        fromDate: '2026-09-20',
                        toDate: '2026-09-20',
                        period: 'Full Day',
                        daysCount: 1,
                        reason: 'Personal family matter',
                        appliedDate: '2026-09-07',
                        status: 'Approved',
                        approvedBy: 'HR Admin',
                        approvedAt: '2026-09-08',
                    },
                    {
                        id: 'leave_104',
                        eNo: 'E150',
                        staffName: 'Thisaru',
                        staffEmail: 'thisarudilhara2@gmail.com',
                        leaveType: 'Medical',
                        fromDate: '2026-09-05',
                        toDate: '2026-09-06',
                        period: 'Full Day',
                        daysCount: 2,
                        reason: 'Fever and rest advised by medical doctor',
                        appliedDate: '2026-09-04',
                        status: 'Approved',
                        approvedBy: 'HR Admin',
                        approvedAt: '2026-09-05',
                        hrNotes: 'Medical certificate verified',
                    },
                ];
                setLeaveRequests(sampleLeaves);
                localStorage.setItem('staff_leave_requests', JSON.stringify(sampleLeaves));
            }
        } catch (e) {
            console.error('Failed to load leave data:', e);
        } finally {
            setLoading(false);
        }
    };

    // Calculate days count
    const calculateDays = (from: string, to: string, period: LeaveRequest['period']) => {
        if (period.startsWith('Half Day')) return 0.5;
        const d1 = new Date(from + 'T00:00:00');
        const d2 = new Date(to + 'T00:00:00');
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return isNaN(diffDays) ? 1 : diffDays;
    };

    const handleOpenCreateDialog = () => {
        setSelectedRequest(null);
        setFormStaffENo(staffList.length > 0 ? staffList[0].eNo : '');
        setFormLeaveType('Casual');
        setFormFromDate(formatDateYMD(new Date()));
        setFormToDate(formatDateYMD(new Date()));
        setFormPeriod('Full Day');
        setFormReason('');
        setFormStatus('Approved');
        setFormHrNotes('');
        setDialogOpen(true);
    };

    const handleSaveLeave = () => {
        const staff = staffList.find((s) => s.eNo.toLowerCase() === formStaffENo.toLowerCase());
        const staffName = staff ? staff.name : formStaffENo;
        const staffEmail = staff ? staff.email : '';
        const avatar = staff ? staff.avatar : '';
        const days = calculateDays(formFromDate, formToDate, formPeriod);

        const newLeave: LeaveRequest = {
            id: selectedRequest ? selectedRequest.id : `leave_${Date.now()}`,
            eNo: formStaffENo,
            staffName,
            staffEmail,
            avatar,
            leaveType: formLeaveType,
            fromDate: formFromDate,
            toDate: formToDate,
            period: formPeriod,
            daysCount: days,
            reason: formReason,
            appliedDate: selectedRequest ? selectedRequest.appliedDate : formatDateYMD(new Date()),
            status: formStatus,
            approvedBy: formStatus === 'Approved' ? 'HR Section' : undefined,
            approvedAt: formStatus === 'Approved' ? formatDateYMD(new Date()) : undefined,
            hrNotes: formHrNotes,
        };

        const updated = selectedRequest
            ? leaveRequests.map((l) => (l.id === selectedRequest.id ? newLeave : l))
            : [newLeave, ...leaveRequests];

        setLeaveRequests(updated);
        localStorage.setItem('staff_leave_requests', JSON.stringify(updated));
        setDialogOpen(false);
    };

    const handleStatusChange = (id: string, newStatus: 'Approved' | 'Rejected') => {
        const updated = leaveRequests.map((l) => {
            if (l.id === id) {
                return {
                    ...l,
                    status: newStatus,
                    approvedBy: 'HR Section',
                    approvedAt: formatDateYMD(new Date()),
                };
            }
            return l;
        });
        setLeaveRequests(updated);
        localStorage.setItem('staff_leave_requests', JSON.stringify(updated));
    };

    const handleDeleteLeave = (id: string) => {
        if (!confirm('Are you sure you want to delete this leave record?')) return;
        const updated = leaveRequests.filter((l) => l.id !== id);
        setLeaveRequests(updated);
        localStorage.setItem('staff_leave_requests', JSON.stringify(updated));
        if (viewDialogOpen) setViewDialogOpen(false);
    };

    const handleDownloadCSV = () => {
        const headers = ['E NO', 'Staff Name', 'Leave Type', 'From Date', 'To Date', 'Duration', 'Reason', 'Applied Date', 'Status', 'Approved By'];
        const sorted = [...leaveRequests].sort((a, b) => {
            const cmp = compareENo(a.eNo, b.eNo);
            if (cmp !== 0) return cmp;
            return a.fromDate.localeCompare(b.fromDate);
        });

        const rows = sorted.map((l) => [
            `"${l.eNo}"`,
            `"${l.staffName}"`,
            `"${l.leaveType}"`,
            `"${l.fromDate}"`,
            `"${l.toDate}"`,
            `"${l.daysCount} Days (${l.period})"`,
            `"${l.reason.replace(/"/g, '""')}"`,
            `"${l.appliedDate}"`,
            `"${l.status}"`,
            `"${l.approvedBy || '-'}"`,
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Staff_Leave_Management_${formatDateYMD(new Date())}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    };

    // Filter & Sort by E NO ascending
    const filteredLeaves = useMemo(() => {
        return leaveRequests
            .filter((l) => {
                const query = search.toLowerCase();
                const matchesSearch =
                    l.staffName.toLowerCase().includes(query) ||
                    l.eNo.toLowerCase().includes(query) ||
                    l.reason.toLowerCase().includes(query);
                const matchesStatus = statusTab === 'ALL' || l.status === statusTab;
                const matchesType = leaveTypeFilter === 'ALL' || l.leaveType === leaveTypeFilter;
                return matchesSearch && matchesStatus && matchesType;
            })
            .sort((a, b) => {
                const cmp = compareENo(a.eNo, b.eNo);
                if (cmp !== 0) return cmp;
                return a.fromDate.localeCompare(b.fromDate);
            });
    }, [leaveRequests, search, statusTab, leaveTypeFilter]);

    // Statistics
    const stats = useMemo(() => {
        const total = leaveRequests.length;
        const pending = leaveRequests.filter((l) => l.status === 'Pending').length;
        const approved = leaveRequests.filter((l) => l.status === 'Approved').length;
        const rejected = leaveRequests.filter((l) => l.status === 'Rejected').length;
        return { total, pending, approved, rejected };
    }, [leaveRequests]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: 'background.default',
                color: 'text.primary',
                p: { xs: 2, md: 4, lg: 6 },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    mb: 4,
                    pb: 3,
                    borderBottom: '2px solid',
                    borderImage: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
                    borderImageSlice: 1,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                fontSize: '2rem',
                                background:
                                    mode === 'light'
                                        ? 'linear-gradient(135deg, #1e293b 0%, #475569 100%)'
                                        : 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Leave Management
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
                            Track, review, and approve staff leave requests and time-off records sorted in ascending E NO order.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadCSV}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                        >
                            Export CSV
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreateDialog}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            }}
                        >
                            Log Leave Application
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Quick Metrics */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Requests', value: stats.total, color: '#3b82f6', icon: <EventNoteIcon /> },
                    { label: 'Pending Review', value: stats.pending, color: '#f59e0b', icon: <PendingIcon /> },
                    { label: 'Approved Leaves', value: stats.approved, color: '#10b981', icon: <ApproveIcon /> },
                    { label: 'Rejected Requests', value: stats.rejected, color: '#ef4444', icon: <RejectIcon /> },
                ].map((stat) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
                        <Paper
                            elevation={0}
                            sx={{
                                background: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderTop: `3px solid ${stat.color}`,
                                borderRadius: 2,
                                p: 2.5,
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    {stat.label}
                                </Typography>
                                <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: stat.color, fontSize: '1.75rem' }}>
                                {stat.value}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Filter Bar */}
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                }}
            >
                {/* Status Tabs */}
                <Tabs
                    value={statusTab}
                    onChange={(_, v) => setStatusTab(v)}
                    sx={{
                        '& .MuiTab-root': {
                            fontWeight: 700,
                            textTransform: 'none',
                            minHeight: 40,
                            fontSize: '0.875rem',
                        },
                    }}
                >
                    <Tab label={`All (${stats.total})`} value="ALL" />
                    <Tab label={`Pending (${stats.pending})`} value="Pending" />
                    <Tab label={`Approved (${stats.approved})`} value="Approved" />
                    <Tab label={`Rejected (${stats.rejected})`} value="Rejected" />
                </Tabs>

                {/* Search & Leave Type Dropdown */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Leave Type</InputLabel>
                        <Select
                            value={leaveTypeFilter}
                            label="Leave Type"
                            onChange={(e) => setLeaveTypeFilter(e.target.value)}
                        >
                            <MenuItem value="ALL">All Types</MenuItem>
                            <MenuItem value="Annual">Annual Leave</MenuItem>
                            <MenuItem value="Casual">Casual Leave</MenuItem>
                            <MenuItem value="Medical">Medical Leave</MenuItem>
                            <MenuItem value="Short Leave">Short Leave</MenuItem>
                            <MenuItem value="Emergency">Emergency Leave</MenuItem>
                            <MenuItem value="Unpaid">Unpaid Leave</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        placeholder="Search by name, E NO, reason..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ width: { xs: '100%', sm: 260 } }}
                    />
                </Box>
            </Paper>

            {/* Leave Applications Table */}
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
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#3b82f6' }} />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>E NO</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Staff Member</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Leave Type</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Leave Period</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Applied Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredLeaves.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                            No leave applications found matching current filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLeaves.map((item) => {
                                        const config = LEAVE_TYPE_CONFIG[item.leaveType] || LEAVE_TYPE_CONFIG.Casual;
                                        const isPending = item.status === 'Pending';
                                        const isApproved = item.status === 'Approved';
                                        const isRejected = item.status === 'Rejected';

                                        return (
                                            <TableRow key={item.id} hover sx={{ '& td': { borderColor: 'divider' } }}>
                                                <TableCell>
                                                    <Chip
                                                        label={item.eNo}
                                                        size="small"
                                                        sx={{ fontWeight: 700, bgcolor: '#f1f5f9', color: '#1e293b' }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#3b82f6' }}>
                                                            {item.staffName.charAt(0)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="700">
                                                                {item.staffName}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                {item.staffEmail}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={config.label}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: config.color,
                                                            bgcolor: config.bg,
                                                            border: `1px solid ${config.border}`,
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>
                                                    {item.fromDate === item.toDate ? item.fromDate : `${item.fromDate} → ${item.toDate}`}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>
                                                    {item.daysCount} {item.daysCount === 1 ? 'Day' : 'Days'}
                                                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                                                        {item.period}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: 220 }}>
                                                    <Typography variant="body2" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {item.reason}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>
                                                    {item.appliedDate}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={item.status}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 800,
                                                            bgcolor: isApproved ? '#f0fdf4' : isPending ? '#fffbeb' : '#fff1f2',
                                                            color: isApproved ? '#16a34a' : isPending ? '#d97706' : '#dc2626',
                                                            border: '1px solid',
                                                            borderColor: isApproved ? '#bbf7d0' : isPending ? '#fde68a' : '#fecdd3',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                        {isPending && (
                                                            <>
                                                                <Tooltip title="Approve Leave">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleStatusChange(item.id, 'Approved')}
                                                                        sx={{ color: '#16a34a' }}
                                                                    >
                                                                        <ApproveIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Reject Leave">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleStatusChange(item.id, 'Rejected')}
                                                                        sx={{ color: '#dc2626' }}
                                                                    >
                                                                        <RejectIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        )}
                                                        <Tooltip title="View Details">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setViewItem(item);
                                                                    setViewDialogOpen(true);
                                                                }}
                                                                sx={{ color: '#2563eb' }}
                                                            >
                                                                <ViewIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete Record">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteLeave(item.id)}
                                                                sx={{ color: '#94a3b8', '&:hover': { color: '#dc2626' } }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Log / Apply Leave Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    Log Staff Leave Application
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Staff Member (E NO)</InputLabel>
                            <Select
                                value={formStaffENo}
                                label="Staff Member (E NO)"
                                onChange={(e) => setFormStaffENo(e.target.value)}
                            >
                                {staffList.map((s) => (
                                    <MenuItem key={s.eNo} value={s.eNo}>
                                        {s.eNo} - {s.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel>Leave Type</InputLabel>
                            <Select
                                value={formLeaveType}
                                label="Leave Type"
                                onChange={(e) => setFormLeaveType(e.target.value as any)}
                            >
                                <MenuItem value="Annual">Annual Leave</MenuItem>
                                <MenuItem value="Casual">Casual Leave</MenuItem>
                                <MenuItem value="Medical">Medical / Sick Leave</MenuItem>
                                <MenuItem value="Short Leave">Short Leave (Half Day)</MenuItem>
                                <MenuItem value="Emergency">Emergency Leave</MenuItem>
                                <MenuItem value="Unpaid">Unpaid Leave</MenuItem>
                            </Select>
                        </FormControl>

                        <Grid container spacing={1.5}>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="From Date"
                                    value={formFromDate}
                                    onChange={(e) => setFormFromDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="To Date"
                                    value={formToDate}
                                    onChange={(e) => setFormToDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Grid>
                        </Grid>

                        <FormControl size="small">
                            <Typography variant="caption" fontWeight="600" sx={{ mb: 0.5, color: 'text.secondary' }}>
                                Leave Duration Period
                            </Typography>
                            <RadioGroup
                                row
                                value={formPeriod}
                                onChange={(e) => setFormPeriod(e.target.value as any)}
                            >
                                <FormControlLabel value="Full Day" control={<Radio size="small" />} label="Full Day" />
                                <FormControlLabel value="Half Day (Morning)" control={<Radio size="small" />} label="Half Day (AM)" />
                                <FormControlLabel value="Half Day (Evening)" control={<Radio size="small" />} label="Half Day (PM)" />
                            </RadioGroup>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Reason for Leave"
                            value={formReason}
                            onChange={(e) => setFormReason(e.target.value)}
                            size="small"
                            placeholder="State the reason or remarks..."
                            multiline
                            rows={3}
                            required
                        />

                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formStatus}
                                label="Status"
                                onChange={(e) => setFormStatus(e.target.value as any)}
                            >
                                <MenuItem value="Approved">Approved Immediately</MenuItem>
                                <MenuItem value="Pending">Pending Review</MenuItem>
                                <MenuItem value="Rejected">Rejected</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="HR Section Notes / Remarks"
                            value={formHrNotes}
                            onChange={(e) => setFormHrNotes(e.target.value)}
                            size="small"
                            placeholder="Internal HR remarks (optional)"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setDialogOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveLeave}
                        variant="contained"
                        disabled={!formStaffENo || !formReason.trim()}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        }}
                    >
                        Submit Leave Application
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Leave Details Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    Leave Application Details
                </DialogTitle>
                <DialogContent>
                    {viewItem && (
                        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: '#3b82f6' }}>
                                    {viewItem.staffName.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="700">
                                        {viewItem.staffName} ({viewItem.eNo})
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {viewItem.staffEmail}
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ my: 0.5 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">Leave Type:</Typography>
                                <Typography variant="body2" fontWeight="700">{viewItem.leaveType} Leave</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">Dates:</Typography>
                                <Typography variant="body2" fontWeight="600">{viewItem.fromDate} to {viewItem.toDate}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">Duration:</Typography>
                                <Typography variant="body2" fontWeight="700">{viewItem.daysCount} Days ({viewItem.period})</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">Current Status:</Typography>
                                <Chip label={viewItem.status} size="small" sx={{ fontWeight: 700 }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Reason:</Typography>
                                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                                    <Typography variant="body2">{viewItem.reason}</Typography>
                                </Paper>
                            </Box>
                            {viewItem.hrNotes && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>HR Notes:</Typography>
                                    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                                        <Typography variant="body2">{viewItem.hrNotes}</Typography>
                                    </Paper>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    {viewItem && (
                        <Button
                            color="error"
                            onClick={() => handleDeleteLeave(viewItem.id)}
                            sx={{ textTransform: 'none' }}
                        >
                            Delete
                        </Button>
                    )}
                    <Button onClick={() => setViewDialogOpen(false)} variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

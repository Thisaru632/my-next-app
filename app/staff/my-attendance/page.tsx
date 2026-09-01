'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Divider,
    CircularProgress,
    Grid,
} from '@mui/material';
import {
    AccessTime as ClockIcon,
    CheckCircle as CheckCircleIcon,
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon,
    ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import { useThemeContext } from '@/context/ThemeContext';
import { API_ENDPOINTS } from '@/config/api';

interface AttendanceRecord {
    id: string;
    eNo: string;
    name: string;
    email: string;
    date: string;
    clockInDate?: string;
    clockOutDate?: string;
    clockInTime: string;
    clockOutTime: string;
    clockInLocation?: string;
    clockOutLocation?: string;
    status: 'Clocked In' | 'Clocked Out';
}

interface MonthlySummary {
    daysPresent: number;
    daysAbsent: number;
    totalHours: string;
    otHours: string;
}

const getCurrentYearMonth = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

const calculateHourCount = (clockInStr: string, clockOutStr: string) => {
    if (!clockInStr || !clockOutStr || clockOutStr === 'Active Session' || clockOutStr === '-') {
        return '-';
    }

    try {
        const parseTime = (timeStr: string) => {
            const date = new Date();
            const match = timeStr.match(/(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i);
            if (!match) return null;
            let hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            const seconds = match[3] ? parseInt(match[3], 10) : 0;
            const ampm = match[4] ? match[4].toUpperCase() : null;

            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;

            date.setHours(hours, minutes, seconds, 0);
            return date;
        };

        const inTime = parseTime(clockInStr);
        const outTime = parseTime(clockOutStr);

        if (!inTime || !outTime) return '-';

        let diffMs = outTime.getTime() - inTime.getTime();
        if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;

        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const hrs = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;

        if (hrs === 0 && mins === 0) return '0h 1m';
        if (hrs === 0) return `${mins}m`;
        if (mins === 0) return `${hrs}h`;
        return `${hrs}h ${mins}m`;
    } catch (e) {
        return '-';
    }
};

const calculateOtHours = (clockInStr: string, clockOutStr: string) => {
    if (!clockInStr || !clockOutStr || clockOutStr === 'Active Session' || clockOutStr === '-') {
        return '-';
    }

    try {
        const parseTime = (timeStr: string) => {
            const date = new Date();
            const match = timeStr.match(/(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i);
            if (!match) return null;
            let hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            const seconds = match[3] ? parseInt(match[3], 10) : 0;
            const ampm = match[4] ? match[4].toUpperCase() : null;

            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;

            date.setHours(hours, minutes, seconds, 0);
            return date;
        };

        const inTime = parseTime(clockInStr);
        const outTime = parseTime(clockOutStr);

        if (!inTime || !outTime) return '-';

        let diffMs = outTime.getTime() - inTime.getTime();
        if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;

        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        if (totalMinutes <= 540) {
            return '0 hrs';
        }

        const otMins = totalMinutes - 540;
        const hrs = Math.floor(otMins / 60);
        const mins = otMins % 60;

        if (hrs === 0) return `${mins}m`;
        if (mins === 0) return `${hrs}h`;
        return `${hrs}h ${mins}m`;
    } catch (e) {
        return '-';
    }
};

export default function ViewMyAttendancePage() {
    const { mode } = useThemeContext();
    const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth);
    const [myRecords, setMyRecords] = useState<AttendanceRecord[]>([]);
    const [summary, setSummary] = useState<MonthlySummary>({
        daysPresent: 0,
        daysAbsent: 0,
        totalHours: '0 hrs',
        otHours: '0 hrs',
    });
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<{ name: string; eNo: string; email: string } | null>(null);

    useEffect(() => {
        try {
            const userStr = localStorage.getItem('staffUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                setUserInfo({
                    name: user.fullName || user.username || 'Staff Member',
                    eNo: user.eNo || 'N/A',
                    email: user.email || '',
                });
            }
        } catch (e) {
            console.error('Error reading staffUser from localStorage:', e);
        }
    }, []);

    useEffect(() => {
        if (userInfo) {
            fetchMyAttendance();
        }
    }, [selectedMonth, userInfo]);

    const fetchMyAttendance = async () => {
        if (!userInfo) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('staffToken');
            const targetENo = userInfo.eNo.toLowerCase().trim();
            const targetEmail = userInfo.email.toLowerCase().trim();

            // 1. Fetch Daily Logs
            const response = await fetch(`${API_ENDPOINTS.AUTH}/attendance?month=${selectedMonth}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            let userDailyLogs: AttendanceRecord[] = [];
            if (response.ok) {
                const allLogs: AttendanceRecord[] = await response.json();
                userDailyLogs = allLogs.filter((r) => {
                    const matchENo = r.eNo && targetENo && r.eNo.toLowerCase().trim() === targetENo;
                    const matchEmail = r.email && targetEmail && r.email.toLowerCase().trim() === targetEmail;
                    return matchENo || matchEmail;
                });
                setMyRecords(userDailyLogs);
            }

            // 2. Fetch Monthly Summary
            const monthlyRes = await fetch(`${API_ENDPOINTS.AUTH}/monthly-attendance?month=${selectedMonth}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (monthlyRes.ok) {
                const monthlyData = await monthlyRes.json();
                const myMonthlyRow = monthlyData.find((m: any) => {
                    const matchENo = m.eNo && targetENo && m.eNo.toLowerCase().trim() === targetENo;
                    const matchEmail = m.email && targetEmail && m.email.toLowerCase().trim() === targetEmail;
                    return matchENo || matchEmail;
                });

                if (myMonthlyRow) {
                    setSummary({
                        daysPresent: myMonthlyRow.daysPresent || 0,
                        daysAbsent: myMonthlyRow.daysAbsent || 0,
                        totalHours: myMonthlyRow.totalHours || '0 hrs',
                        otHours: myMonthlyRow.otHours || '0 hrs',
                    });
                } else {
                    const uniqueDates = new Set(userDailyLogs.map((l) => l.date));
                    setSummary({
                        daysPresent: uniqueDates.size,
                        daysAbsent: Math.max(0, 22 - uniqueDates.size),
                        totalHours: `${userDailyLogs.length * 8} hrs`,
                        otHours: '0 hrs',
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching my attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    const isCurrentlyClockedIn = myRecords.some((r) => r.status === 'Clocked In');

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
                    View My Attendance
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
                    Track your personal attendance records, clock in/out times, and monthly work hours.
                </Typography>
            </Box>

            {/* Filter Bar */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            fullWidth
                            type="month"
                            size="small"
                            label="Select Month & Year"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Stats Cards Row */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    {
                        label: 'Status',
                        value: isCurrentlyClockedIn ? 'Clocked In' : 'Clocked Out',
                        color: isCurrentlyClockedIn ? '#10b981' : '#64748b',
                        icon: <ClockIcon />,
                    },
                    {
                        label: 'Days Present',
                        value: `${summary.daysPresent} Days`,
                        color: '#3b82f6',
                        icon: <CalendarIcon />,
                    },
                    {
                        label: 'Total Hours Worked',
                        value: summary.totalHours,
                        color: '#8b5cf6',
                        icon: <ShowChartIcon />,
                    },
                    {
                        label: 'OT Hours',
                        value: summary.otHours,
                        color: '#f59e0b',
                        icon: <CheckCircleIcon />,
                    },
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
                            <Typography variant="h5" sx={{ fontWeight: 700, color: stat.color }}>
                                {stat.value}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* My Daily Attendance Table Card */}
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
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="bold">
                        My Attendance Logs ({selectedMonth})
                    </Typography>
                    {userInfo && (
                        <Chip
                            label={`${userInfo.name} (${userInfo.eNo})`}
                            size="small"
                            sx={{ fontWeight: 600, bgcolor: '#eff6ff', color: '#1d4ed8' }}
                        />
                    )}
                </Box>

                <Divider sx={{ borderColor: 'divider' }} />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#3b82f6' }} />
                    </Box>
                ) : (
                    <TableContainer sx={{ px: 1, overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    {['Date', 'Clock In Date', 'Clock In', 'Clock Out Date', 'Clock Out', 'Hours Worked', 'OT Hours', 'Location', 'Status'].map(
                                        (h) => (
                                            <TableCell
                                                key={h}
                                                sx={{
                                                    color: '#475569',
                                                    fontWeight: 700,
                                                    fontSize: '0.875rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    borderColor: 'divider',
                                                    py: 2,
                                                }}
                                            >
                                                {h}
                                            </TableCell>
                                        )
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {myRecords.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ color: '#94a3b8', py: 6 }}>
                                            No attendance logs found for this month.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    myRecords.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            sx={{
                                                '&:hover': { backgroundColor: 'action.hover' },
                                                '& td': { borderColor: 'divider' },
                                                transition: 'background 0.15s',
                                            }}
                                        >
                                            {/* Date */}
                                            <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: 13 }}>
                                                {row.date}
                                            </TableCell>

                                            {/* Clock In Date */}
                                            <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                                                {row.clockInDate || row.date}
                                            </TableCell>

                                            {/* Clock In */}
                                            <TableCell sx={{ color: '#10b981', fontWeight: 600, fontSize: 13 }}>
                                                {row.clockInTime}
                                            </TableCell>

                                            {/* Clock Out Date */}
                                            <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                                                {row.clockOutDate || (row.status === 'Clocked Out' ? row.date : '-')}
                                            </TableCell>

                                            {/* Clock Out */}
                                            <TableCell
                                                sx={{
                                                    color: row.clockOutTime === 'Active Session' ? '#3b82f6' : 'text.secondary',
                                                    fontSize: 13,
                                                    fontWeight: row.clockOutTime === 'Active Session' ? 600 : 400,
                                                }}
                                            >
                                                {row.clockOutTime}
                                            </TableCell>

                                            {/* Hours Worked */}
                                            <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: 13 }}>
                                                {calculateHourCount(row.clockInTime, row.clockOutTime)}
                                            </TableCell>

                                            {/* OT Hours */}
                                            <TableCell sx={{ fontWeight: 600, color: 'text.primary', fontSize: 13 }}>
                                                {calculateOtHours(row.clockInTime, row.clockOutTime)}
                                            </TableCell>

                                            {/* Location */}
                                            <TableCell sx={{ fontSize: 12, maxWidth: 220 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                                                    {row.clockInLocation ? (
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: '#059669',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.5,
                                                                fontWeight: 500,
                                                                fontSize: '0.725rem',
                                                            }}
                                                        >
                                                            <LocationIcon sx={{ fontSize: 13, color: '#10b981' }} />
                                                            <span>
                                                                <strong>In:</strong> {row.clockInLocation}
                                                            </span>
                                                        </Typography>
                                                    ) : null}
                                                    {row.clockOutLocation ? (
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: '#dc2626',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.5,
                                                                fontWeight: 500,
                                                                fontSize: '0.725rem',
                                                            }}
                                                        >
                                                            <LocationIcon sx={{ fontSize: 13, color: '#ef4444' }} />
                                                            <span>
                                                                <strong>Out:</strong> {row.clockOutLocation}
                                                            </span>
                                                        </Typography>
                                                    ) : null}
                                                    {!row.clockInLocation && !row.clockOutLocation && (
                                                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                                            N/A
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                <Chip
                                                    label={row.status}
                                                    size="small"
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        backgroundColor: row.status === 'Clocked In' ? '#ecfdf5' : '#f1f5f9',
                                                        color: row.status === 'Clocked In' ? '#047857' : '#475569',
                                                        border: '1px solid',
                                                        borderColor: row.status === 'Clocked In' ? '#a7f3d0' : '#cbd5e1',
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
}

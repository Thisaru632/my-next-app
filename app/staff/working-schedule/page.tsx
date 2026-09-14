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
} from '@mui/material';
import {
    CalendarMonth as CalendarMonthIcon,
    Add as AddIcon,
    FileDownload as DownloadIcon,
    Search as SearchIcon,
    AccessTime as ClockIcon,
    People as PeopleIcon,
    WbSunny as SunIcon,
    NightsStay as MoonIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ChevronLeft as PrevIcon,
    ChevronRight as NextIcon,
    CheckCircle as CheckCircleIcon,
    ViewWeek as WeekIcon,
    SupportAgent as SupportAgentIcon,
    AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useThemeContext } from '@/context/ThemeContext';
import { API_ENDPOINTS } from '@/config/api';

interface ScheduleEntry {
    id: string;
    eNo: string;
    staffName: string;
    staffEmail: string;
    avatar?: string;
    date: string; // YYYY-MM-DD
    shiftType: 'Morning' | 'Day' | 'Night' | 'Off';
    startTime: string; // e.g. "08:00 AM"
    endTime: string;   // e.g. "04:30 PM"
    dutyRole?: string; // e.g. "Counter", "Dispatcher", "Driver Coordinator"
    notes?: string;
}

interface StaffMember {
    id: string;
    eNo: string;
    name: string;
    email: string;
    avatar?: string;
}

const SHIFT_TEMPLATES = {
    Morning: { label: 'Morning Shift', start: '08:00:00 AM', end: '04:30:00 PM', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    Day: { label: 'Day Shift', start: '08:30:00 AM', end: '05:30:00 PM', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    Night: { label: 'Night Shift', start: '04:00:00 PM', end: '12:00:00 AM', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    Off: { label: 'Off Duty', start: '-', end: '-', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
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

const time12To24 = (time12?: string): string => {
    if (!time12 || time12 === '-' || time12 === 'Active Session') return '';
    const match = String(time12).match(/(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i);
    if (!match) {
        if (/^\d{2}:\d{2}(?::\d{2})?$/.test(String(time12).trim())) return String(time12).trim();
        return '';
    }
    let h = parseInt(match[1], 10);
    const m = match[2].padStart(2, '0');
    const s = match[3] ? match[3].padStart(2, '0') : '00';
    const ampm = match[4] ? match[4].toUpperCase() : null;

    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;

    const hh = String(h).padStart(2, '0');
    return `${hh}:${m}:${s}`;
};

const time24To12 = (time24?: string): string => {
    if (!time24) return '';
    const parts = String(time24).split(':');
    if (parts.length < 2) return time24;
    let h = parseInt(parts[0], 10);
    const m = parts[1].padStart(2, '0');
    const s = parts[2] ? parts[2].padStart(2, '0') : '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const hh = String(h).padStart(2, '0');
    return `${hh}:${m}:${s} ${ampm}`;
};

const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
};

const formatDateYMD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function StaffWorkingSchedulePage() {
    const router = useRouter();
    const { mode } = useThemeContext();
    const [tabValue, setTabValue] = useState(0); // 0 = Call Center Schedule, 1 = Admin Schedule
    const [loading, setLoading] = useState(true);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [callCenterSchedules, setCallCenterSchedules] = useState<ScheduleEntry[]>([]);
    const [adminSchedules, setAdminSchedules] = useState<ScheduleEntry[]>([]);
    const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));

    const activeSchedules = useMemo(() => {
        return tabValue === 0 ? callCenterSchedules : adminSchedules;
    }, [tabValue, callCenterSchedules, adminSchedules]);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(null);
    const [formStaffENo, setFormStaffENo] = useState('');
    const [formDate, setFormDate] = useState(() => formatDateYMD(new Date()));
    const [formShiftType, setFormShiftType] = useState<'Morning' | 'Day' | 'Night' | 'Off'>('Day');
    const [formStartTime, setFormStartTime] = useState('08:30:00 AM');
    const [formEndTime, setFormEndTime] = useState('05:30:00 PM');
    const [formDutyRole, setFormDutyRole] = useState('Customer Care & Booking Support');
    const [formNotes, setFormNotes] = useState('');

    // Check HR permissions on load
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

    // Load staff & schedules
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

            const monday = getMonday(new Date());

            // 1. Load Call Center schedules
            const savedCallCenter = localStorage.getItem('staff_callcenter_schedules') || localStorage.getItem('staff_working_schedules');
            let initialCallCenter: ScheduleEntry[] = [];
            if (savedCallCenter) {
                try {
                    initialCallCenter = JSON.parse(savedCallCenter);
                } catch (e) {
                    initialCallCenter = [];
                }
            } else if (staffMembers.length > 0) {
                staffMembers.forEach((staff, sIdx) => {
                    for (let d = 0; d < 7; d++) {
                        const target = new Date(monday);
                        target.setDate(monday.getDate() + d);
                        const dateStr = formatDateYMD(target);
                        const isWeekend = d >= 5;
                        const shift: 'Morning' | 'Day' | 'Night' | 'Off' = isWeekend
                            ? (sIdx % 2 === 0 ? 'Off' : 'Day')
                            : (sIdx % 3 === 0 ? 'Morning' : sIdx % 3 === 1 ? 'Day' : 'Night');

                        initialCallCenter.push({
                            id: `sch_cc_${staff.eNo}_${dateStr}`,
                            eNo: staff.eNo,
                            staffName: staff.name,
                            staffEmail: staff.email,
                            avatar: staff.avatar,
                            date: dateStr,
                            shiftType: shift,
                            startTime: SHIFT_TEMPLATES[shift].start,
                            endTime: SHIFT_TEMPLATES[shift].end,
                            dutyRole: shift === 'Off' ? 'Off Duty' : 'Call Center & Dispatcher Support',
                            notes: shift === 'Off' ? 'Weekly Rest Day' : 'Standard Assigned Shift',
                        });
                    }
                });
                localStorage.setItem('staff_callcenter_schedules', JSON.stringify(initialCallCenter));
            }
            setCallCenterSchedules(initialCallCenter);

            // 2. Load Admin schedules
            const savedAdmin = localStorage.getItem('staff_admin_schedules');
            let initialAdmin: ScheduleEntry[] = [];
            if (savedAdmin) {
                try {
                    initialAdmin = JSON.parse(savedAdmin);
                } catch (e) {
                    initialAdmin = [];
                }
            } else if (staffMembers.length > 0) {
                staffMembers.forEach((staff) => {
                    for (let d = 0; d < 7; d++) {
                        const target = new Date(monday);
                        target.setDate(monday.getDate() + d);
                        const dateStr = formatDateYMD(target);
                        const isWeekend = d >= 5;
                        const shift: 'Morning' | 'Day' | 'Night' | 'Off' = isWeekend ? 'Off' : 'Day';

                        initialAdmin.push({
                            id: `sch_adm_${staff.eNo}_${dateStr}`,
                            eNo: staff.eNo,
                            staffName: staff.name,
                            staffEmail: staff.email,
                            avatar: staff.avatar,
                            date: dateStr,
                            shiftType: shift,
                            startTime: SHIFT_TEMPLATES[shift].start,
                            endTime: SHIFT_TEMPLATES[shift].end,
                            dutyRole: shift === 'Off' ? 'Off Duty' : 'Office Administration & Operations',
                            notes: shift === 'Off' ? 'Weekend Rest Day' : 'Standard Office Day Shift',
                        });
                    }
                });
                localStorage.setItem('staff_admin_schedules', JSON.stringify(initialAdmin));
            }
            setAdminSchedules(initialAdmin);
        } catch (e) {
            console.error('Failed to load schedule data:', e);
        } finally {
            setLoading(false);
        }
    };

    // Week days calculation
    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(currentMonday);
            d.setDate(currentMonday.getDate() + i);
            days.push({
                dateObj: d,
                dateStr: formatDateYMD(d),
                dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
                displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                isToday: formatDateYMD(d) === formatDateYMD(new Date()),
            });
        }
        return days;
    }, [currentMonday]);

    const handlePrevWeek = () => {
        const prev = new Date(currentMonday);
        prev.setDate(prev.getDate() - 7);
        setCurrentMonday(prev);
    };

    const handleNextWeek = () => {
        const next = new Date(currentMonday);
        next.setDate(next.getDate() + 7);
        setCurrentMonday(next);
    };

    const handleTodayWeek = () => {
        setCurrentMonday(getMonday(new Date()));
    };

    // Filtered staff list
    const filteredStaff = useMemo(() => {
        return [...staffList].sort((a, b) => compareENo(a.eNo, b.eNo));
    }, [staffList]);

    // Fast lookup map: eNo_date -> ScheduleEntry
    const scheduleMap = useMemo(() => {
        const map = new Map<string, ScheduleEntry>();
        activeSchedules.forEach((entry) => {
            map.set(`${entry.eNo.toLowerCase()}_${entry.date}`, entry);
        });
        return map;
    }, [activeSchedules]);

    // Summary statistics for current week
    const currentWeekStats = useMemo(() => {
        const weekDateStrs = new Set(weekDays.map((w) => w.dateStr));
        const entriesInWeek = activeSchedules.filter((s) => weekDateStrs.has(s.date));
        const morningCount = entriesInWeek.filter((s) => s.shiftType === 'Morning').length;
        const dayCount = entriesInWeek.filter((s) => s.shiftType === 'Day').length;
        const nightCount = entriesInWeek.filter((s) => s.shiftType === 'Night').length;
        const offCount = entriesInWeek.filter((s) => s.shiftType === 'Off').length;

        return {
            total: entriesInWeek.length,
            morning: morningCount,
            day: dayCount,
            night: nightCount,
            off: offCount,
        };
    }, [activeSchedules, weekDays]);

    const handleOpenCreateDialog = (targetStaff?: StaffMember, targetDateStr?: string) => {
        const defaultStaff = targetStaff || (staffList.length > 0 ? staffList[0] : null);
        setSelectedEntry(null);
        setFormStaffENo(defaultStaff ? defaultStaff.eNo : '');
        setFormDate(targetDateStr || formatDateYMD(new Date()));
        setFormShiftType('Day');
        setFormStartTime(SHIFT_TEMPLATES.Day.start);
        setFormEndTime(SHIFT_TEMPLATES.Day.end);
        setFormDutyRole(tabValue === 0 ? 'Call Center & Dispatcher Support' : 'Office Administration & Operations');
        setFormNotes('');
        setDialogOpen(true);
    };

    const handleOpenEditDialog = (entry: ScheduleEntry) => {
        setSelectedEntry(entry);
        setFormStaffENo(entry.eNo);
        setFormDate(entry.date);
        setFormShiftType(entry.shiftType);
        setFormStartTime(entry.startTime);
        setFormEndTime(entry.endTime);
        setFormDutyRole(entry.dutyRole || '');
        setFormNotes(entry.notes || '');
        setDialogOpen(true);
    };

    const handleShiftTypeChange = (type: 'Morning' | 'Day' | 'Night' | 'Off') => {
        setFormShiftType(type);
        setFormStartTime(SHIFT_TEMPLATES[type].start);
        setFormEndTime(SHIFT_TEMPLATES[type].end);
    };

    const handleSaveSchedule = () => {
        const staff = staffList.find((s) => s.eNo.toLowerCase() === formStaffENo.toLowerCase());
        const staffName = staff ? staff.name : formStaffENo;
        const staffEmail = staff ? staff.email : '';
        const avatar = staff ? staff.avatar : '';

        const prefix = tabValue === 0 ? 'cc' : 'adm';
        const newEntry: ScheduleEntry = {
            id: selectedEntry ? selectedEntry.id : `sch_${prefix}_${formStaffENo}_${formDate}_${Date.now()}`,
            eNo: formStaffENo,
            staffName,
            staffEmail,
            avatar,
            date: formDate,
            shiftType: formShiftType,
            startTime: formStartTime,
            endTime: formEndTime,
            dutyRole: formDutyRole,
            notes: formNotes,
        };

        if (tabValue === 0) {
            const updated = callCenterSchedules.filter(
                (s) => s.id !== newEntry.id && !(s.eNo.toLowerCase() === formStaffENo.toLowerCase() && s.date === formDate)
            );
            updated.push(newEntry);
            setCallCenterSchedules(updated);
            localStorage.setItem('staff_callcenter_schedules', JSON.stringify(updated));
        } else {
            const updated = adminSchedules.filter(
                (s) => s.id !== newEntry.id && !(s.eNo.toLowerCase() === formStaffENo.toLowerCase() && s.date === formDate)
            );
            updated.push(newEntry);
            setAdminSchedules(updated);
            localStorage.setItem('staff_admin_schedules', JSON.stringify(updated));
        }
        setDialogOpen(false);
    };

    const handleDeleteSchedule = (id: string) => {
        if (!confirm('Are you sure you want to remove this assigned shift?')) return;
        if (tabValue === 0) {
            const updated = callCenterSchedules.filter((s) => s.id !== id);
            setCallCenterSchedules(updated);
            localStorage.setItem('staff_callcenter_schedules', JSON.stringify(updated));
        } else {
            const updated = adminSchedules.filter((s) => s.id !== id);
            setAdminSchedules(updated);
            localStorage.setItem('staff_admin_schedules', JSON.stringify(updated));
        }
        if (dialogOpen) setDialogOpen(false);
    };

    const handleDownloadCSV = () => {
        const scheduleLabel = tabValue === 0 ? 'Call_Center' : 'Admin';
        const headers = ['E NO', 'Staff Name', 'Date', 'Day', 'Shift Type', 'Start Time', 'End Time', 'Duty Role', 'Notes'];
        const weekDateStrs = new Set(weekDays.map((w) => w.dateStr));
        const entriesInWeek = activeSchedules
            .filter((s) => weekDateStrs.has(s.date))
            .sort((a, b) => {
                const cmp = compareENo(a.eNo, b.eNo);
                if (cmp !== 0) return cmp;
                return a.date.localeCompare(b.date);
            });

        const rows = entriesInWeek.map((e) => {
            const d = new Date(e.date + 'T00:00:00');
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            return [
                `"${e.eNo}"`,
                `"${e.staffName}"`,
                `"${e.date}"`,
                `"${dayName}"`,
                `"${e.shiftType}"`,
                `"${e.startTime}"`,
                `"${e.endTime}"`,
                `"${e.dutyRole || ''}"`,
                `"${e.notes || ''}"`,
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Staff_${scheduleLabel}_Schedule_${weekDays[0].dateStr}_to_${weekDays[6].dateStr}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    };

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
                            Staff Working Schedule
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
                            HR duty roster: plan, assign, and manage daily and weekly staff shifts in ascending E NO order.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadCSV}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                        >
                            Export Schedule
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenCreateDialog()}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            }}
                        >
                            Assign Shift
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Quick Metrics */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Registered Staff', value: staffList.length, color: '#3b82f6', icon: <PeopleIcon /> },
                    { label: 'Morning Shifts', value: currentWeekStats.morning, color: '#f59e0b', icon: <SunIcon /> },
                    { label: 'Day Shifts', value: currentWeekStats.day, color: '#2563eb', icon: <ClockIcon /> },
                    { label: 'Night Shifts / Off', value: `${currentWeekStats.night} / ${currentWeekStats.off}`, color: '#7c3aed', icon: <MoonIcon /> },
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


            {/* Schedule View Tabs */}
            <Paper
                elevation={0}
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    sx={{
                        px: 2,
                        '& .MuiTab-root': {
                            fontWeight: 700,
                            textTransform: 'none',
                            minHeight: 52,
                            fontSize: '0.925rem',
                        },
                    }}
                >
                    <Tab icon={<SupportAgentIcon sx={{ fontSize: 20, mr: 1 }} />} iconPosition="start" label="Call Center Schedule" />
                    <Tab icon={<AdminIcon sx={{ fontSize: 20, mr: 1 }} />} iconPosition="start" label="Admin Schedule" />
                </Tabs>
            </Paper>

            {/* Schedule Matrix Table */}
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
                    <TableContainer sx={{ maxHeight: '70vh' }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ minWidth: 100, fontWeight: 700, bgcolor: 'background.paper' }}>E NO</TableCell>
                                    <TableCell sx={{ minWidth: 180, fontWeight: 700, bgcolor: 'background.paper' }}>Staff Member</TableCell>
                                    {weekDays.map((day) => (
                                        <TableCell
                                            key={day.dateStr}
                                            align="center"
                                            sx={{
                                                minWidth: 140,
                                                fontWeight: 700,
                                                bgcolor: day.isToday ? 'rgba(59, 130, 246, 0.08)' : 'background.paper',
                                                borderLeft: '1px solid',
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: day.isToday ? '#2563eb' : 'text.primary' }}>
                                                {day.dayName}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStaff.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                            No staff members found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStaff.map((staff) => (
                                        <TableRow key={`schedule_row_${staff.eNo}`} hover sx={{ '& td': { borderColor: 'divider' } }}>
                                            <TableCell>
                                                <Chip
                                                    label={staff.eNo}
                                                    size="small"
                                                    sx={{ fontWeight: 700, bgcolor: '#f1f5f9', color: '#1e293b' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#3b82f6' }}>
                                                        {staff.name.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="700">
                                                            {staff.name}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                            {staff.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            {weekDays.map((day) => {
                                                const entry = scheduleMap.get(`${staff.eNo.toLowerCase()}_${day.dateStr}`);
                                                const shift = entry?.shiftType || 'Off';
                                                const template = SHIFT_TEMPLATES[shift];

                                                return (
                                                    <TableCell
                                                        key={`${staff.eNo}_${day.dateStr}`}
                                                        align="center"
                                                        sx={{
                                                            borderLeft: '1px solid',
                                                            borderColor: 'divider',
                                                            p: 1,
                                                            bgcolor: day.isToday ? 'rgba(59, 130, 246, 0.03)' : 'inherit',
                                                        }}
                                                    >
                                                        <Box
                                                            onClick={() => (entry ? handleOpenEditDialog(entry) : handleOpenCreateDialog(staff, day.dateStr))}
                                                            sx={{
                                                                cursor: 'pointer',
                                                                borderRadius: 1.5,
                                                                p: 0.8,
                                                                backgroundColor: template.bg,
                                                                border: `1px solid ${template.border}`,
                                                                transition: 'all 0.15s ease',
                                                                '&:hover': {
                                                                    transform: 'translateY(-2px)',
                                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                                },
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                sx={{ fontWeight: 800, color: template.color, display: 'block' }}
                                                            >
                                                                {template.label}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{ fontSize: '0.65rem', color: 'text.secondary', display: 'block', mt: 0.25 }}
                                                            >
                                                                {shift === 'Off' ? 'Rest Day' : `${entry?.startTime?.slice(0, 5) || '08:30'} - ${entry?.endTime?.slice(0, 5) || '17:30'}`}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Assign / Edit Shift Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {selectedEntry ? 'Edit Shift Assignment' : `Assign ${tabValue === 0 ? 'Call Center' : 'Admin'} Shift`}
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

                        <TextField
                            fullWidth
                            type="date"
                            label="Schedule Date"
                            value={formDate}
                            onChange={(e) => setFormDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />

                        <FormControl fullWidth size="small">
                            <InputLabel>Shift Template</InputLabel>
                            <Select
                                value={formShiftType}
                                label="Shift Template"
                                onChange={(e) => handleShiftTypeChange(e.target.value as any)}
                            >
                                <MenuItem value="Morning">Morning Shift (08:00 AM - 04:30 PM)</MenuItem>
                                <MenuItem value="Day">Regular Day Shift (08:30 AM - 05:30 PM)</MenuItem>
                                <MenuItem value="Night">Night Shift (04:00 PM - 12:00 AM)</MenuItem>
                                <MenuItem value="Off">Off Duty / Rest Day</MenuItem>
                            </Select>
                        </FormControl>

                        {formShiftType !== 'Off' && (
                            <Grid container spacing={1.5}>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        fullWidth
                                        type="time"
                                        label="Start Time"
                                        value={time12To24(formStartTime)}
                                        onChange={(e) => setFormStartTime(time24To12(e.target.value))}
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ step: 1 }}
                                        onClick={(e) => {
                                            try {
                                                (e.target as any).showPicker?.();
                                            } catch (err) {}
                                        }}
                                        size="small"
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField
                                        fullWidth
                                        type="time"
                                        label="End Time"
                                        value={time12To24(formEndTime)}
                                        onChange={(e) => setFormEndTime(time24To12(e.target.value))}
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ step: 1 }}
                                        onClick={(e) => {
                                            try {
                                                (e.target as any).showPicker?.();
                                            } catch (err) {}
                                        }}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        )}

                        <TextField
                            fullWidth
                            label="Duty Assignment / Role"
                            value={formDutyRole}
                            onChange={(e) => setFormDutyRole(e.target.value)}
                            size="small"
                            placeholder="e.g. Counter Service, Dispatch, Telephony"
                        />

                        <TextField
                            fullWidth
                            label="Notes"
                            value={formNotes}
                            onChange={(e) => setFormNotes(e.target.value)}
                            size="small"
                            placeholder="Optional instructions or notes"
                            multiline
                            rows={2}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    {selectedEntry ? (
                        <Button
                            color="error"
                            onClick={() => handleDeleteSchedule(selectedEntry.id)}
                            sx={{ textTransform: 'none' }}
                        >
                            Delete
                        </Button>
                    ) : <Box />}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={() => setDialogOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveSchedule}
                            variant="contained"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            }}
                        >
                            Save Shift
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    Avatar,
    InputAdornment,
    Divider,
    CircularProgress,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import {
    Search as SearchIcon,
    AccessTime as ClockIcon,
    CheckCircle as CheckCircleIcon,
    Group as GroupIcon,
    CalendarToday as CalendarIcon,
    ShowChart as ShowChartIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LocationOn as LocationIcon,
    Visibility as ViewIcon,
    FileDownload as DownloadIcon,
} from '@mui/icons-material';
import { useThemeContext } from '@/context/ThemeContext';
import { API_ENDPOINTS } from '@/config/api';

interface AttendanceRecord {
    id: string;
    eNo: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    date: string;
    clockInDate?: string;
    clockOutDate?: string;
    clockInTime: string;
    clockOutTime: string;
    clockInLocation?: string;
    clockOutLocation?: string;
    status: 'Clocked In' | 'Clocked Out' | 'Not Clocked In' | 'Leave';
}

interface MonthlyAttendanceRecord {
    id: string;
    eNo: string;
    name: string;
    email: string;
    avatar: string;
    month: string;
    totalDays: number;
    daysPresent: number;
    daysAbsent: number;
    shortLeaves: number;
    leaves: number;
    totalHours: number | string;
    otHours: number | string;
    lessHours?: number | string;
    actualOtOrLossHours?: number | string;
}

const parseHoursToMinutes = (str: string | number | undefined): number => {
    if (!str || str === '0 hrs' || str === '0' || str === '-') return 0;
    if (typeof str === 'number') return str * 60;
    if (typeof str === 'string' && !isNaN(Number(str))) return Number(str) * 60;
    
    let totalMins = 0;
    const hMatch = String(str).match(/(\d+)\s*h/i);
    const mMatch = String(str).match(/(\d+)\s*m/i);
    const hrsMatch = String(str).match(/(\d+)\s*hrs/i);
    
    if (hMatch) totalMins += parseInt(hMatch[1], 10) * 60;
    if (mMatch) totalMins += parseInt(mMatch[1], 10);
    if (!hMatch && !mMatch && hrsMatch) totalMins += parseInt(hrsMatch[1], 10) * 60;
    
    return totalMins;
};

const calculateActualOtOrLoss = (otHours: string | number | undefined, lessHours: string | number | undefined): string => {
    const otMins = parseHoursToMinutes(otHours);
    const lessMins = parseHoursToMinutes(lessHours);
    const netMins = otMins - lessMins;
    
    if (netMins === 0) return '0 hrs';
    
    const absMins = Math.abs(netMins);
    const hrs = Math.floor(absMins / 60);
    const mins = Math.round(absMins % 60);
    
    let res = '';
    if (hrs > 0 && mins > 0) res = `${hrs}h ${mins}m`;
    else if (hrs > 0) res = `${hrs}h`;
    else res = `${mins}m`;
    
    return netMins > 0 ? `+${res}` : `-${res}`;
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

const parseDateTimeHelper = (timeStr: string, dateStr?: string) => {
    const match = timeStr.match(/(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    const ampm = match[4] ? match[4].toUpperCase() : null;

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    let date = new Date();
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
        const [y, m, d] = dateStr.trim().split('-').map(Number);
        date = new Date(y, m - 1, d);
    }
    date.setHours(hours, minutes, seconds, 0);
    return date;
};

const calculateHourCount = (clockInStr: string, clockOutStr: string, clockInDateStr?: string, clockOutDateStr?: string) => {
    if (!clockInStr || !clockOutStr || clockOutStr === 'Active Session' || clockOutStr === '-') {
        return '-';
    }

    try {
        const inTime = parseDateTimeHelper(clockInStr, clockInDateStr);
        const outTime = parseDateTimeHelper(clockOutStr, clockOutDateStr);

        if (!inTime || !outTime) return '-';

        let diffMs = outTime.getTime() - inTime.getTime();
        if (diffMs < 0 && (!clockInDateStr || !clockOutDateStr || clockInDateStr === clockOutDateStr || clockOutDateStr === '-')) {
            diffMs += 24 * 60 * 60 * 1000;
        }
        if (diffMs < 0) return '-';

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

const calculateOtHours = (clockInStr: string, clockOutStr: string, clockInDateStr?: string, clockOutDateStr?: string) => {
    if (!clockInStr || !clockOutStr || clockOutStr === 'Active Session' || clockOutStr === '-') {
        return '-';
    }

    try {
        const inTime = parseDateTimeHelper(clockInStr, clockInDateStr);
        const outTime = parseDateTimeHelper(clockOutStr, clockOutDateStr);

        if (!inTime || !outTime) return '-';

        let diffMs = outTime.getTime() - inTime.getTime();
        if (diffMs < 0 && (!clockInDateStr || !clockOutDateStr || clockInDateStr === clockOutDateStr || clockOutDateStr === '-')) {
            diffMs += 24 * 60 * 60 * 1000;
        }
        if (diffMs < 0) return '-';

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

const calculateLessHours = (clockInStr: string, clockOutStr: string, clockInDateStr?: string, clockOutDateStr?: string) => {
    if (!clockInStr || !clockOutStr || clockOutStr === 'Active Session' || clockOutStr === '-') {
        return '-';
    }

    try {
        const inTime = parseDateTimeHelper(clockInStr, clockInDateStr);
        const outTime = parseDateTimeHelper(clockOutStr, clockOutDateStr);

        if (!inTime || !outTime) return '-';

        let diffMs = outTime.getTime() - inTime.getTime();
        if (diffMs < 0 && (!clockInDateStr || !clockOutDateStr || clockInDateStr === clockOutDateStr || clockOutDateStr === '-')) {
            diffMs += 24 * 60 * 60 * 1000;
        }
        if (diffMs < 0) return '-';

        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        if (totalMinutes >= 540) {
            return '0 hrs';
        }

        const lessMins = 540 - totalMinutes;
        const hrs = Math.floor(lessMins / 60);
        const mins = lessMins % 60;

        if (hrs === 0) return `${mins}m`;
        if (mins === 0) return `${hrs}h`;
        return `${hrs}h ${mins}m`;
    } catch (e) {
        return '-';
    }
};

const formatShortLocation = (loc?: string) => {
    if (!loc) return '';
    const words = loc.trim().split(/\s+/);
    if (words.length <= 3) return loc;
    return words.slice(0, 3).join(' ') + '...';
};

const getCurrentYearMonth = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

const getMonthOptions = () => {
    const options = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
        const date = new Date(d.getFullYear(), d.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const val = `${year}-${month}`;
        const label = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        options.push({ value: val, label });
    }
    return options;
};

// Designated Call Center staff E NOs
const CALL_CENTER_ENOS = new Set([
    'e113', 'e129', 'e134', 'e114', 'e118', 'e139',
    'e141', 'e123', 'e155', 'e156', 'e158', 'e157'
]);

// Official Call Center Daily Roster baseline (Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6)
const OFFICIAL_CALL_CENTER_ROSTER: Record<string, { shiftType: string }[]> = {
    e113: [ { shiftType: 'FullDay' }, { shiftType: 'Morning' }, { shiftType: 'FullDay' }, { shiftType: 'Morning' }, { shiftType: 'FullDay' }, { shiftType: 'Morning' }, { shiftType: 'Off' } ],
    e129: [ { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Off' }, { shiftType: 'Evening' }, { shiftType: 'Morning' } ],
    e134: [ { shiftType: 'Morning' }, { shiftType: 'Off' }, { shiftType: 'Evening' }, { shiftType: 'Evening' }, { shiftType: 'Evening' }, { shiftType: 'Evening' }, { shiftType: 'FullDay' } ],
    e114: [ { shiftType: 'Evening' }, { shiftType: 'Morning' }, { shiftType: 'Evening' }, { shiftType: 'Evening' }, { shiftType: 'Evening' }, { shiftType: 'Off' }, { shiftType: 'Evening' } ],
    e118: [ { shiftType: 'Evening' }, { shiftType: 'Evening' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Off' } ],
    e139: [ { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Off' }, { shiftType: 'Morning' }, { shiftType: 'Morning' } ],
    e141: [ { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Off' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' } ],
    e123: [ { shiftType: 'Evening' }, { shiftType: 'Morning' }, { shiftType: 'Evening' }, { shiftType: 'Evening' }, { shiftType: 'Evening' }, { shiftType: 'Off' }, { shiftType: 'Evening' } ],
    e155: [ { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Off' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' } ],
    e156: [ { shiftType: 'Off' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' } ],
    e158: [ { shiftType: 'Evening' }, { shiftType: 'Evening' }, { shiftType: 'Evening' }, { shiftType: 'Off' }, { shiftType: 'Evening' }, { shiftType: 'Evening' }, { shiftType: 'Evening' } ],
    e157: [ { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Off' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' }, { shiftType: 'Morning' } ],
};

/**
 * Checks if a specific staff member is scheduled on Leave (Off Duty) for a specific date (YYYY-MM-DD).
 * Follows priority:
 * 1. Temporarily customized schedules saved in localStorage ('staff_callcenter_future_schedules')
 * 2. Live working schedules saved in localStorage ('staff_callcenter_schedules')
 * 3. Official Call Center roster baseline
 * 4. Admin staff baseline (Saturday & Sunday Off)
 */
export const checkIfUserIsOnLeave = (
    eNo?: string,
    dateStr?: string,
    email?: string,
    name?: string
): boolean => {
    if (!dateStr) return false;
    const cleanE = (eNo || '').toLowerCase().trim();
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanName = (name || '').toLowerCase().trim();

    const matchesEntry = (entry: any) => {
        if (!entry) return false;
        const entryENo = (entry.eNo || '').toLowerCase().trim();
        const entryEmail = (entry.staffEmail || entry.email || '').toLowerCase().trim();
        const entryName = (entry.staffName || entry.name || '').toLowerCase().trim();

        if (cleanE && cleanE !== 'n/a' && cleanE !== '-' && entryENo && entryENo !== 'n/a' && entryENo !== '-' && entryENo === cleanE) {
            return true;
        }
        if (cleanEmail && entryEmail && entryEmail === cleanEmail) {
            return true;
        }
        if (cleanName && entryName && entryName === cleanName) {
            return true;
        }
        return false;
    };

    // 1. Check Temporarily Customized Schedules from localStorage ('staff_callcenter_future_schedules')
    try {
        const futureStr = typeof window !== 'undefined' ? localStorage.getItem('staff_callcenter_future_schedules') : null;
        if (futureStr) {
            const futureList = JSON.parse(futureStr);
            if (Array.isArray(futureList)) {
                const entry = futureList.find(
                    (s: any) => s.date === dateStr && matchesEntry(s)
                );
                if (entry) {
                    return entry.shiftType === 'Off';
                }
            }
        }
    } catch (_) {}

    // 2. Check Live Call Center schedules from localStorage ('staff_callcenter_schedules')
    try {
        const liveStr = typeof window !== 'undefined' ? localStorage.getItem('staff_callcenter_schedules') : null;
        if (liveStr) {
            const liveList = JSON.parse(liveStr);
            if (Array.isArray(liveList)) {
                const entry = liveList.find(
                    (s: any) => s.date === dateStr && matchesEntry(s)
                );
                if (entry) {
                    return entry.shiftType === 'Off';
                }
            }
        }
    } catch (_) {}

    // 3. Check Admin schedules from localStorage ('staff_admin_schedules')
    try {
        const adminStr = typeof window !== 'undefined' ? localStorage.getItem('staff_admin_schedules') : null;
        if (adminStr) {
            const adminList = JSON.parse(adminStr);
            if (Array.isArray(adminList)) {
                const entry = adminList.find(
                    (s: any) => s.date === dateStr && matchesEntry(s)
                );
                if (entry) {
                    return entry.shiftType === 'Off';
                }
            }
        }
    } catch (_) {}

    // 4. Fallback to Official Call Center baseline roster
    if (cleanE && OFFICIAL_CALL_CENTER_ROSTER[cleanE]) {
        const officialShifts = OFFICIAL_CALL_CENTER_ROSTER[cleanE];
        const d = new Date(dateStr + 'T00:00:00');
        const dayOfWeek = (d.getDay() + 6) % 7; // Mon=0, ..., Sun=6
        const def = officialShifts[dayOfWeek];
        if (def) {
            return def.shiftType === 'Off';
        }
    }

    // 5. Admin staff baseline (Saturday=5, Sunday=6 are Off/Leave days)
    if (!CALL_CENTER_ENOS.has(cleanE)) {
        const d = new Date(dateStr + 'T00:00:00');
        const dayOfWeek = (d.getDay() + 6) % 7;
        return dayOfWeek >= 5;
    }

    return false;
};

/**
 * Calculates total leave days for a user in a given month (YYYY-MM)
 * by evaluating each individual date against the temporarily customized schedule.
 */
export const getMonthlyLeaveDaysForUser = (
    eNo?: string,
    yearMonth?: string,
    email?: string,
    name?: string
): number => {
    if (!yearMonth) return 0;

    const [yearStr, monthStr] = yearMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    if (isNaN(year) || isNaN(month)) return 0;

    const daysInMonth = new Date(year, month, 0).getDate();
    let leaveCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (checkIfUserIsOnLeave(eNo, dateStr, email, name)) {
            leaveCount++;
        }
    }

    return leaveCount;
};

export default function AttendanceSheetPage() {
    const router = useRouter();
    const { mode } = useThemeContext();
    const [tabValue, setTabValue] = useState(0);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [monthlyRecords, setMonthlyRecords] = useState<MonthlyAttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth);
    const monthOptions = React.useMemo(() => getMonthOptions(), []);
    const [selectedDailyDate, setSelectedDailyDate] = useState(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const [selectedUserFilter, setSelectedUserFilter] = useState('ALL');

    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    // Edit Dialog States
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [editClockInDate, setEditClockInDate] = useState('');
    const [editClockIn, setEditClockIn] = useState('');
    const [editClockOutDate, setEditClockOutDate] = useState('');
    const [editClockOut, setEditClockOut] = useState('');
    const [editStatus, setEditStatus] = useState<'Clocked In' | 'Clocked Out'>('Clocked In');
    const [savingEdit, setSavingEdit] = useState(false);

    // Delete Confirmation States
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
    const [deletingRecord, setDeletingRecord] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('staffUser');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const superAdmin = (user.role || '').toLowerCase() === 'superadmin';
                setIsSuperAdmin(superAdmin);
                const hasHrPermission = user.permissions?.hrSection;
                if (!superAdmin && !hasHrPermission) {
                    router.push('/staff');
                    return;
                }
            } catch (e) {}
        }
    }, [router]);

    useEffect(() => {
        fetchAttendanceData(selectedMonth);
    }, [selectedMonth]);

    const fetchAttendanceData = async (targetMonth = selectedMonth) => {
        setLoading(true);
        let dailyData: any[] = [];
        try {
            const token = localStorage.getItem('staffToken');
            
            // 1. Fetch Daily Staff Attendance logs (Tab 0: Daily Staff Attendance)
            try {
                const response = await fetch(`${API_ENDPOINTS.AUTH}/attendance?all=true`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    dailyData = await response.json();
                    setRecords(dailyData);
                }
            } catch (err) {
                console.warn('Daily attendance fetch network error:', err);
            }

            // 2. Fetch User-Wise Monthly Attendance (Tab 1: User Wise Monthly Attendance)
            let monthlyLoaded = false;
            try {
                const monthlyRes = await fetch(`${API_ENDPOINTS.AUTH}/monthly-attendance?month=${targetMonth}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (monthlyRes.ok) {
                    const monthlyList = await monthlyRes.json();
                    if (Array.isArray(monthlyList) && monthlyList.length > 0) {
                        const enrichedMonthly = monthlyList.map((m: any) => ({
                            ...m,
                            leaves: getMonthlyLeaveDaysForUser(m.eNo, targetMonth, m.email, m.name)
                        }));
                        setMonthlyRecords(enrichedMonthly);
                        monthlyLoaded = true;
                    }
                }
            } catch (err) {
                console.warn('Error fetching monthly attendance endpoint:', err);
            }

            // Fallback: If monthly endpoint fails or is not available, deduplicate dailyData so each user has ONLY 1 row
            if (!monthlyLoaded && dailyData.length > 0) {
                const uniqueMap = new Map();
                dailyData.forEach((r: any, i: number) => {
                    const key = (r.eNo || r.email || r.name || '').toLowerCase().trim();
                    if (!uniqueMap.has(key)) {
                        const userDailyLogs = dailyData.filter((log: any) => {
                            const logKey = (log.eNo || log.email || log.name || '').toLowerCase().trim();
                            return logKey === key && log.status !== 'Not Clocked In' && log.clockInTime && log.clockInTime !== '-';
                        });
                        const uniqueDates = new Set(userDailyLogs.map((log: any) => log.date || log.clockInDate));
                        const daysPresent = uniqueDates.size;
                        const daysAbsent = Math.max(0, 22 - daysPresent);
                        const shortLeaves = i % 2;
                        const leaves = getMonthlyLeaveDaysForUser(r.eNo, targetMonth, r.email, r.name);
                        const hrs = calculateHourCount(r.clockInTime, r.clockOutTime);
                        const totalHours = hrs === '-' ? '0 hrs' : hrs;
                        const otHours = '0 hrs';
                        uniqueMap.set(key, {
                            id: r.id,
                            eNo: r.eNo,
                            name: r.name,
                            email: r.email,
                            avatar: r.avatar,
                            month: new Date(targetMonth + '-01').toLocaleString('en-US', { month: 'long', year: 'numeric' }),
                            totalDays: 22,
                            daysPresent,
                            daysAbsent,
                            shortLeaves,
                            leaves,
                            totalHours,
                            otHours,
                        });
                    }
                });
                setMonthlyRecords(Array.from(uniqueMap.values()));
            }
        } catch (error) {
            console.error('Error loading attendance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setEditClockInDate(record.clockInDate && record.clockInDate !== '-' ? record.clockInDate : (record.date && record.date !== '-' ? record.date : selectedDailyDate));
        setEditClockIn(record.clockInTime && record.clockInTime !== '-' ? record.clockInTime : '08:30 AM');
        setEditClockOutDate(record.clockOutDate && record.clockOutDate !== '-' ? record.clockOutDate : selectedDailyDate);
        setEditClockOut(record.clockOutTime && record.clockOutTime !== '-' ? record.clockOutTime : '05:30 PM');
        setEditStatus(record.status === 'Clocked Out' ? 'Clocked Out' : 'Clocked In');
        setEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedRecord) return;
        setSavingEdit(true);
        try {
            const token = localStorage.getItem('staffToken');
            const response = await fetch(`${API_ENDPOINTS.AUTH}/attendance/${selectedRecord.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    eNo: selectedRecord.eNo,
                    fullName: selectedRecord.name,
                    email: selectedRecord.email,
                    date: editClockInDate,
                    clockInDate: editClockInDate,
                    clockInTime: editClockIn,
                    clockOutDate: editClockOutDate,
                    clockOutTime: editClockOut,
                    status: editStatus,
                }),
            });

            if (response.ok) {
                setEditDialogOpen(false);
                fetchAttendanceData();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to update attendance record');
            }
        } finally {
            setSavingEdit(false);
        }
    };

    const handleOpenDelete = (record: AttendanceRecord) => {
        setRecordToDelete(record);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!recordToDelete) return;
        if (recordToDelete.id.startsWith('staff_') || recordToDelete.status === 'Not Clocked In') {
            alert('No attendance record exists to delete for this staff member.');
            setDeleteDialogOpen(false);
            return;
        }

        setDeletingRecord(true);
        try {
            const token = localStorage.getItem('staffToken');
            let response = await fetch(`${API_ENDPOINTS.AUTH}/attendance/${recordToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // If DELETE is blocked by host/proxy or returns 404, try POST fallback route
            if (response.status === 404) {
                response = await fetch(`${API_ENDPOINTS.AUTH}/attendance/${recordToDelete.id}/delete`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }

            if (response.ok) {
                setDeleteDialogOpen(false);
                setRecordToDelete(null);
                fetchAttendanceData();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to delete attendance record');
            }
        } catch (error) {
            console.error('Error deleting attendance record:', error);
            alert('Failed to delete attendance record. Please try again.');
        } finally {
            setDeletingRecord(false);
        }
    };

    // View User Monthly Logs States
    const [viewLogsOpen, setViewLogsOpen] = useState(false);
    const [selectedUserLogs, setSelectedUserLogs] = useState<MonthlyAttendanceRecord | null>(null);
    const [userLogs, setUserLogs] = useState<AttendanceRecord[]>([]);
    const [loadingUserLogs, setLoadingUserLogs] = useState(false);

    const handleOpenViewLogs = async (userRow: MonthlyAttendanceRecord) => {
        setSelectedUserLogs(userRow);
        setViewLogsOpen(true);
        setLoadingUserLogs(true);
        try {
            const token = localStorage.getItem('staffToken');
            const response = await fetch(`${API_ENDPOINTS.AUTH}/attendance?month=${selectedMonth}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const allLogs: AttendanceRecord[] = await response.json();
                const filtered = allLogs.filter(r => {
                    const sameUser = (r.eNo && userRow.eNo && r.eNo.toLowerCase() === userRow.eNo.toLowerCase()) ||
                        (r.email && userRow.email && r.email.toLowerCase() === userRow.email.toLowerCase()) ||
                        (r.name && userRow.name && r.name.toLowerCase() === userRow.name.toLowerCase());
                    return sameUser;
                });
                setUserLogs(filtered);
            } else {
                const filtered = records.filter(r => {
                    const sameUser = (r.eNo && userRow.eNo && r.eNo.toLowerCase() === userRow.eNo.toLowerCase()) ||
                        (r.email && userRow.email && r.email.toLowerCase() === userRow.email.toLowerCase()) ||
                        (r.name && userRow.name && r.name.toLowerCase() === userRow.name.toLowerCase());
                    const matchesMonth = !selectedMonth || !r.date || r.date.startsWith(selectedMonth);
                    return sameUser && matchesMonth;
                });
                setUserLogs(filtered);
            }
        } catch (err) {
            console.error('Error fetching user monthly logs:', err);
        } finally {
            setLoadingUserLogs(false);
        }
    };

    const dailyDisplayRecords = React.useMemo(() => {
        const staffMap = new Map<string, { id: string; eNo: string; name: string; email: string; avatar?: string }>();

        const findStaffInMap = (eNo?: string, email?: string) => {
            const cleanE = (eNo || '').toLowerCase().trim();
            const cleanEm = (email || '').toLowerCase().trim();
            for (const [_, s] of staffMap.entries()) {
                const sE = (s.eNo || '').toLowerCase().trim();
                const sEm = (s.email || '').toLowerCase().trim();
                if ((cleanE && cleanE !== 'n/a' && sE && sE !== 'n/a' && sE === cleanE) ||
                    (cleanEm && sEm && sEm === cleanEm)) {
                    return s;
                }
            }
            return null;
        };

        monthlyRecords.forEach(m => {
            const cleanE = (m.eNo || '').toLowerCase().trim();
            const cleanEm = (m.email || '').toLowerCase().trim();
            const key = cleanE && cleanE !== 'n/a' ? cleanE : (cleanEm || m.name || '').toLowerCase().trim();
            if (key && !findStaffInMap(m.eNo, m.email)) {
                staffMap.set(key, {
                    id: m.id,
                    eNo: m.eNo || 'N/A',
                    name: m.name || 'Staff Member',
                    email: m.email || '',
                    avatar: m.avatar || '',
                });
            }
        });

        records.forEach(r => {
            const cleanE = (r.eNo || '').toLowerCase().trim();
            const cleanEm = (r.email || '').toLowerCase().trim();
            const key = cleanE && cleanE !== 'n/a' ? cleanE : (cleanEm || r.name || '').toLowerCase().trim();
            const existing = findStaffInMap(r.eNo, r.email);
            if (key && !existing) {
                staffMap.set(key, {
                    id: r.id,
                    eNo: r.eNo || 'N/A',
                    name: r.name || 'Staff Member',
                    email: r.email || '',
                    avatar: r.avatar || '',
                });
            } else if (existing && (existing.eNo === 'N/A' || existing.eNo.includes('@')) && cleanE && cleanE !== 'n/a' && !cleanE.includes('@')) {
                existing.eNo = r.eNo;
            }
        });

        const allStaffList = Array.from(staffMap.values());
        const logsForSelectedDate = records.filter(r => r.date && r.date.startsWith(selectedDailyDate));

        const matchedLogIds = new Set<string>();
        const resultList: AttendanceRecord[] = [];

        allStaffList.forEach(staff => {
            const staffENo = (staff.eNo || '').toLowerCase().trim();
            const staffEmail = (staff.email || '').toLowerCase().trim();
            const staffName = (staff.name || '').toLowerCase().trim();

            const matchedLogs = logsForSelectedDate.filter(r => {
                const rENo = (r.eNo || '').toLowerCase().trim();
                const rEmail = (r.email || '').toLowerCase().trim();
                const rName = (r.name || '').toLowerCase().trim();

                return (staffENo && staffENo !== 'n/a' && rENo === staffENo) ||
                       (staffEmail && rEmail === staffEmail) ||
                       (staffName && rName === staffName);
            });

            const isLeave = checkIfUserIsOnLeave(staff.eNo, selectedDailyDate, staff.email, staff.name);

            if (matchedLogs.length > 0) {
                matchedLogs.forEach(log => {
                    matchedLogIds.add(log.id);
                    const notClockedIn = !log.clockInTime || log.clockInTime === '-' || log.status === 'Not Clocked In';
                    const userIsLeave = notClockedIn && (isLeave || checkIfUserIsOnLeave(log.eNo, selectedDailyDate, log.email, log.name));
                    resultList.push({
                        ...log,
                        name: log.name || staff.name,
                        eNo: (log.eNo && log.eNo !== 'N/A' && !log.eNo.includes('@')) ? log.eNo : staff.eNo,
                        email: log.email || staff.email,
                        avatar: log.avatar || staff.avatar || '',
                        status: (userIsLeave ? 'Leave' : (notClockedIn ? 'Not Clocked In' : (log.status || 'Clocked In'))) as any,
                    });
                });
            } else {
                resultList.push({
                    id: `staff_${staff.id || staff.eNo}_${selectedDailyDate}`,
                    eNo: staff.eNo || 'N/A',
                    name: staff.name || 'Staff Member',
                    email: staff.email || '',
                    role: 'staff',
                    avatar: staff.avatar || '',
                    date: selectedDailyDate,
                    clockInDate: '-',
                    clockOutDate: '-',
                    clockInTime: '-',
                    clockOutTime: '-',
                    clockInLocation: '',
                    clockOutLocation: '',
                    status: (isLeave ? 'Leave' : 'Not Clocked In') as any,
                });
            }
        });

        logsForSelectedDate.forEach(log => {
            if (!matchedLogIds.has(log.id)) {
                const notClockedIn = !log.clockInTime || log.clockInTime === '-' || log.status === 'Not Clocked In';
                const userIsLeave = notClockedIn && checkIfUserIsOnLeave(log.eNo, selectedDailyDate, log.email, log.name);
                resultList.push({
                    ...log,
                    status: (userIsLeave ? 'Leave' : log.status) as any,
                });
            }
        });

        // Sort by eNo first, then chronologically by 24h clockInTime for multiple records of the same staff
        resultList.sort((a, b) => {
            const cmp = compareENo(a.eNo, b.eNo);
            if (cmp !== 0) return cmp;
            const timeA = time12To24(a.clockInTime);
            const timeB = time12To24(b.clockInTime);
            return timeA.localeCompare(timeB);
        });

        return resultList;
    }, [records, monthlyRecords, selectedDailyDate]);

    const filteredDailyRecords = React.useMemo(() => {
        return dailyDisplayRecords.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                r.email.toLowerCase().includes(search.toLowerCase()) ||
                r.eNo.toLowerCase().includes(search.toLowerCase());
            return matchesSearch;
        });
    }, [dailyDisplayRecords, search]);

    const filteredMonthlyRecords = React.useMemo(() => {
        return monthlyRecords
            .filter(r => {
                const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                    r.email.toLowerCase().includes(search.toLowerCase()) ||
                    r.eNo.toLowerCase().includes(search.toLowerCase());
                const matchesUser = selectedUserFilter === 'ALL' || r.id === selectedUserFilter;
                return matchesSearch && matchesUser;
            })
            .sort((a, b) => compareENo(a.eNo, b.eNo));
    }, [monthlyRecords, search, selectedUserFilter]);

    const clockedInCount = dailyDisplayRecords.filter(r => r.status === 'Clocked In').length;
    const clockedOutCount = dailyDisplayRecords.filter(r => r.status === 'Clocked Out').length;
    const onLeaveCount = dailyDisplayRecords.filter(r => r.status === 'Leave').length;
    const notClockedInCount = dailyDisplayRecords.filter(r => r.status === 'Not Clocked In').length;

    const downloadCSV = (filename: string, csvContent: string) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleDownloadDailyCSV = () => {
        const headers = ['E NO', 'Staff Member', 'Clock In Date', 'Clock In', 'Clock Out Date', 'Clock Out', 'Location In', 'Location Out', 'Hour Count', 'Extra Hours', 'Less Hours', 'Status'];

        const rows = filteredDailyRecords.map(r => {
            const inLoc = r.clockInLocation ? r.clockInLocation.replace(/"/g, '""') : '';
            const outLoc = r.clockOutLocation ? r.clockOutLocation.replace(/"/g, '""') : '';
            const hrs = calculateHourCount(r.clockInTime, r.clockOutTime, r.clockInDate || r.date, r.clockOutDate);
            const extraHrs = calculateOtHours(r.clockInTime, r.clockOutTime, r.clockInDate || r.date, r.clockOutDate);
            const lessHrs = calculateLessHours(r.clockInTime, r.clockOutTime, r.clockInDate || r.date, r.clockOutDate);

            return [
                `"${r.eNo || ''}"`,
                `"${r.name || ''}"`,
                `"${r.clockInDate || r.date || ''}"`,
                `"${r.clockInTime || ''}"`,
                `"${r.clockOutDate || ''}"`,
                `"${r.clockOutTime || ''}"`,
                `"${inLoc}"`,
                `"${outLoc}"`,
                `"${hrs}"`,
                `"${extraHrs}"`,
                `"${lessHrs}"`,
                `"${r.status || ''}"`
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        downloadCSV(`Daily_Staff_Attendance_${selectedDailyDate || 'sheet'}.csv`, csvContent);
    };

    const handleDownloadMonthlyCSV = () => {
        const headers = ['E NO', 'Staff Member', 'Month', 'Days Present', 'Leave Days', 'Total Hours', 'Worked Hours', 'Extra Hours', 'Less Hours', 'Actual OT or Loss Hours'];

        const rows = filteredMonthlyRecords.map(r => {
            const daysStr = typeof r.daysPresent === 'number' ? `${r.daysPresent}` : '0';
            const leaveDaysStr = typeof r.leaves === 'number' ? `${r.leaves}` : '0';
            const totalHrs = typeof r.totalDays === 'number' ? `${r.totalDays * 9} hrs` : '198 hrs';
            const workedHrs = typeof r.totalHours === 'string'
                ? (r.totalHours.includes('h') || r.totalHours.includes('m') || r.totalHours.includes('hrs') ? r.totalHours : `${r.totalHours} hrs`)
                : `${r.totalHours} hrs`;
            const extraHrs = typeof r.otHours === 'string'
                ? (r.otHours.includes('h') || r.otHours.includes('m') || r.otHours.includes('hrs') ? r.otHours : `${r.otHours} hrs`)
                : `${r.otHours} hrs`;
            const lessHrs = typeof r.lessHours === 'string'
                ? (r.lessHours.includes('h') || r.lessHours.includes('m') || r.lessHours.includes('hrs') ? r.lessHours : `${r.lessHours} hrs`)
                : `${r.lessHours || '0'} hrs`;
            const actualOtLoss = calculateActualOtOrLoss(r.otHours, r.lessHours);

            return [
                `"${r.eNo || ''}"`,
                `"${r.name || ''}"`,
                `"${r.month || ''}"`,
                `"${daysStr}"`,
                `"${leaveDaysStr}"`,
                `"${totalHrs}"`,
                `"${workedHrs}"`,
                `"${extraHrs}"`,
                `"${lessHrs}"`,
                `"${actualOtLoss}"`
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        downloadCSV(`Monthly_Staff_Attendance_${selectedMonth || 'summary'}.csv`, csvContent);
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
                        background: mode === 'light'
                            ? 'linear-gradient(135deg, #1e293b 0%, #475569 100%)'
                            : 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                    }}
                >
                    Attendance Sheet
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
                    Monitor daily staff attendance logs and user-wise monthly attendance performance.
                </Typography>
            </Box>

            {/* Navigation Tabs */}
            <Paper
                elevation={0}
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    px: 2,
                    pt: 1,
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={(e, val) => setTabValue(val)}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            py: 1.5,
                            mr: 2,
                        },
                    }}
                >
                    <Tab icon={<CalendarIcon sx={{ fontSize: 18, mr: 1 }} />} iconPosition="start" label="Daily Staff Attendance" />
                    <Tab icon={<ShowChartIcon sx={{ fontSize: 18, mr: 1 }} />} iconPosition="start" label="User Wise Monthly Attendance" />
                </Tabs>
            </Paper>

            {/* Tab 0: Daily Staff Attendance */}
            {tabValue === 0 && (
                <>
                    {/* Stats Row */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Currently Clocked In', value: clockedInCount, color: '#10b981', icon: <ClockIcon /> },
                            { label: 'Clocked Out', value: clockedOutCount, color: '#3b82f6', icon: <CheckCircleIcon /> },
                            { label: 'On Leave (Scheduled Off)', value: onLeaveCount, color: '#f59e0b', icon: <CalendarIcon /> },
                            { label: 'Not Clocked In', value: notClockedInCount, color: '#ef4444', icon: <ClockIcon /> },
                        ].map((stat) => (
                            <Box
                                key={stat.label}
                                sx={{
                                    flex: '1 1 200px',
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
                                <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color, fontSize: '1.8rem' }}>
                                    {stat.value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Daily Table Card */}
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
                        {/* Search Bar */}
                        <Box
                            sx={{
                                p: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 2,
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold">
                                Daily Staff Logs
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
                                    onClick={handleDownloadDailyCSV}
                                    sx={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderColor: '#cbd5e1',
                                        color: '#334155',
                                        '&:hover': {
                                            borderColor: '#3b82f6',
                                            backgroundColor: '#eff6ff',
                                            color: '#2563eb',
                                        },
                                    }}
                                >
                                    Download CSV
                                </Button>
                                <TextField
                                    type="date"
                                    size="small"
                                    label="Select Date"
                                    value={selectedDailyDate}
                                    onChange={(e) => setSelectedDailyDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ width: 170 }}
                                />
                                <TextField
                                    size="small"
                                    placeholder="Search by name or E NO..."
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
                                            {['E NO', 'Staff Member', 'Clock In Date', 'Clock In', 'Clock Out Date', 'Clock Out', 'Location', 'Hour Count', 'Extra Hours', 'Less Hours', 'Status', 'Action'].map((h) => (
                                                <TableCell
                                                    key={h}
                                                    align={h === 'Action' ? 'center' : 'left'}
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
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredDailyRecords.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={12} align="center" sx={{ color: '#94a3b8', py: 6 }}>
                                                    No attendance records found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredDailyRecords.map((row, idx) => (
                                                <TableRow
                                                    key={`daily_row_${row.id}_${row.eNo}_${idx}`}
                                                    sx={{
                                                        backgroundColor: row.status === 'Leave'
                                                            ? (mode === 'light' ? 'rgba(254, 243, 199, 0.22)' : 'rgba(245, 158, 11, 0.06)')
                                                            : undefined,
                                                        '&:hover': {
                                                            backgroundColor: row.status === 'Leave'
                                                                ? (mode === 'light' ? 'rgba(254, 243, 199, 0.42)' : 'rgba(245, 158, 11, 0.12)')
                                                                : 'action.hover'
                                                        },
                                                        '& td': { borderColor: 'divider' },
                                                        transition: 'background 0.15s',
                                                    }}
                                                >
                                                    {/* E NO */}
                                                    <TableCell>
                                                        <Chip
                                                            label={row.eNo}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                                backgroundColor: '#f1f5f9',
                                                                color: '#334155',
                                                                borderRadius: '6px',
                                                                border: '1px solid #cbd5e1',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    {/* Staff Member */}
                                                    <TableCell sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>
                                                        {row.name}
                                                    </TableCell>

                                                    {/* Clock In Date */}
                                                    <TableCell sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 500 }}>
                                                        {row.clockInDate || row.date}
                                                    </TableCell>

                                                    {/* Clock In */}
                                                    <TableCell sx={{ color: '#10b981', fontWeight: 600, fontSize: 13 }}>
                                                        {row.clockInTime}
                                                    </TableCell>

                                                    {/* Clock Out Date */}
                                                    <TableCell sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 500 }}>
                                                        {row.clockOutDate || (row.status === 'Clocked Out' ? (row.date || '-') : '-')}
                                                    </TableCell>

                                                    {/* Clock Out */}
                                                    <TableCell sx={{ color: row.clockOutTime === 'Active Session' ? '#3b82f6' : 'text.secondary', fontSize: 13, fontWeight: row.clockOutTime === 'Active Session' ? 600 : 400 }}>
                                                        {row.clockOutTime}
                                                    </TableCell>

                                                    {/* Location */}
                                                    <TableCell sx={{ fontSize: 12, maxWidth: 220 }}>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                                                            {row.clockInLocation ? (
                                                                <Tooltip title={row.clockInLocation} arrow placement="top">
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: '#059669',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 0.5,
                                                                            fontWeight: 500,
                                                                            fontSize: '0.725rem',
                                                                            cursor: 'pointer',
                                                                            whiteSpace: 'nowrap',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                        }}
                                                                    >
                                                                        <LocationIcon sx={{ fontSize: 13, color: '#10b981', flexShrink: 0 }} />
                                                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                            <strong>In:</strong> {formatShortLocation(row.clockInLocation)}
                                                                        </span>
                                                                    </Typography>
                                                                </Tooltip>
                                                            ) : null}
                                                            {row.clockOutLocation ? (
                                                                <Tooltip title={row.clockOutLocation} arrow placement="top">
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: '#2563eb',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 0.5,
                                                                            fontWeight: 500,
                                                                            fontSize: '0.725rem',
                                                                            cursor: 'pointer',
                                                                            whiteSpace: 'nowrap',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                        }}
                                                                    >
                                                                        <LocationIcon sx={{ fontSize: 13, color: '#3b82f6', flexShrink: 0 }} />
                                                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                            <strong>Out:</strong> {formatShortLocation(row.clockOutLocation)}
                                                                        </span>
                                                                    </Typography>
                                                                </Tooltip>
                                                            ) : null}
                                                            {!row.clockInLocation && !row.clockOutLocation && (
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: row.status === 'Leave' ? '#b45309' : '#94a3b8',
                                                                        fontStyle: row.status === 'Leave' ? 'normal' : 'italic',
                                                                        fontWeight: row.status === 'Leave' ? 600 : 400,
                                                                    }}
                                                                >
                                                                    {row.status === 'Leave' ? 'Scheduled Off Day' : 'Not Recorded'}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>

                                                    {/* Hour Count */}
                                                    <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: 13 }}>
                                                        {calculateHourCount(row.clockInTime, row.clockOutTime, row.clockInDate || row.date, row.clockOutDate)}
                                                    </TableCell>

                                                    {/* OT Hours */}
                                                    <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: 13 }}>
                                                        {calculateOtHours(row.clockInTime, row.clockOutTime, row.clockInDate || row.date, row.clockOutDate)}
                                                    </TableCell>

                                                    {/* Less Hours */}
                                                    <TableCell sx={{ color: '#dc2626', fontWeight: 600, fontSize: 13 }}>
                                                        {calculateLessHours(row.clockInTime, row.clockOutTime, row.clockInDate || row.date, row.clockOutDate)}
                                                    </TableCell>

                                                    {/* Status */}
                                                    <TableCell>
                                                        <Chip
                                                            label={row.status === 'Leave' ? 'On Leave' : row.status}
                                                            size="small"
                                                            icon={row.status === 'Leave' ? <CalendarIcon sx={{ fontSize: '13px !important', color: '#92400e !important' }} /> : undefined}
                                                            sx={{
                                                                backgroundColor: row.status === 'Clocked In'
                                                                    ? '#dcfce7'
                                                                    : row.status === 'Clocked Out'
                                                                    ? '#f1f5f9'
                                                                    : row.status === 'Leave'
                                                                    ? '#fef3c7'
                                                                    : '#fff7ed',
                                                                color: row.status === 'Clocked In'
                                                                    ? '#15803d'
                                                                    : row.status === 'Clocked Out'
                                                                    ? '#64748b'
                                                                    : row.status === 'Leave'
                                                                    ? '#92400e'
                                                                    : '#c2410c',
                                                                border: row.status === 'Leave' ? '1px solid #fde68a' : undefined,
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    {/* Action */}
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                                            <Tooltip title="Edit Attendance Record">
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() => handleOpenEdit(row)}
                                                                    sx={{
                                                                        borderRadius: 1.5,
                                                                        '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            {isSuperAdmin && (
                                                                <Tooltip title={row.id?.startsWith('staff_') || row.status === 'Not Clocked In' || row.status === 'Leave' ? "No attendance record to delete" : "Delete Attendance Record"}>
                                                                    <span>
                                                                        <IconButton
                                                                            size="small"
                                                                            color="error"
                                                                            disabled={row.id?.startsWith('staff_') || row.status === 'Not Clocked In'}
                                                                            onClick={() => handleOpenDelete(row)}
                                                                            sx={{
                                                                                borderRadius: 1.5,
                                                                                '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                                                                            }}
                                                                        >
                                                                            <DeleteIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </>
            )}

            {/* Tab 1: User Wise Monthly Attendance */}
            {tabValue === 1 && (
                <>
                    {/* Filters Row */}
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
                            <Grid size={{ xs: 12, sm: 4 }}>
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

                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Select Staff Member</InputLabel>
                                    <Select
                                        value={selectedUserFilter}
                                        label="Select Staff Member"
                                        onChange={(e) => setSelectedUserFilter(e.target.value)}
                                    >
                                        <MenuItem value="ALL">All Staff Members</MenuItem>
                                        {monthlyRecords.map((r, idx) => (
                                             <MenuItem key={`user_filter_${r.id}_${idx}`} value={r.id}>
                                                 {r.name} ({r.eNo})
                                             </MenuItem>
                                         ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Filter by name or E NO..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Monthly Table Card */}
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
                        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                Monthly Attendance Summary ({selectedMonth})
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
                                onClick={handleDownloadMonthlyCSV}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderColor: '#cbd5e1',
                                    color: '#334155',
                                    '&:hover': {
                                        borderColor: '#3b82f6',
                                        backgroundColor: '#eff6ff',
                                        color: '#2563eb',
                                    },
                                }}
                            >
                                Download CSV
                            </Button>
                        </Box>

                        <Divider sx={{ borderColor: 'divider' }} />

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <CircularProgress sx={{ color: '#3b82f6' }} />
                            </Box>
                        ) : (
                            <TableContainer sx={{ px: 1, overflowX: 'auto' }}>
                                <Table sx={{ minWidth: 700 }}>
                                    <TableHead>
                                        <TableRow>
                                            {['E NO', 'Staff Member', 'Month', 'Days Present', 'Leave Days', 'Total Hours', 'Worked Hours', 'Extra Hours', 'Less Hours', 'Actual OT or Loss Hours', 'Action'].map((h) => (
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
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredMonthlyRecords.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={11} align="center" sx={{ color: '#94a3b8', py: 6 }}>
                                                    No monthly attendance records found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredMonthlyRecords.map((row, idx) => (
                                                <TableRow
                                                    key={`monthly_row_${row.id}_${row.eNo}_${idx}`}
                                                    sx={{
                                                        '&:hover': { backgroundColor: 'action.hover' },
                                                        '& td': { borderColor: 'divider' },
                                                        transition: 'background 0.15s',
                                                    }}
                                                >
                                                    {/* E NO */}
                                                    <TableCell>
                                                        <Chip
                                                            label={row.eNo}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                                backgroundColor: '#f1f5f9',
                                                                color: '#334155',
                                                                borderRadius: '6px',
                                                                border: '1px solid #cbd5e1',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    {/* Staff Member */}
                                                    <TableCell sx={{ color: 'text.primary', fontSize: 14, fontWeight: 500 }}>
                                                        {row.name}
                                                    </TableCell>

                                                    {/* Month */}
                                                    <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                                                        {row.month}
                                                    </TableCell>

                                                    {/* Days Present */}
                                                    <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: 13 }}>
                                                        <Chip
                                                            label={`${row.daysPresent || 0} ${row.daysPresent === 1 ? 'day' : 'days'}`}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                                backgroundColor: '#f1f5f9',
                                                                color: '#334155',
                                                                borderRadius: '6px',
                                                                border: '1px solid #cbd5e1',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    {/* Leave Days */}
                                                    <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: 13 }}>
                                                        <Chip
                                                            label={`${row.leaves || 0} ${row.leaves === 1 ? 'day' : 'days'}`}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                                backgroundColor: '#fef3c7',
                                                                color: '#92400e',
                                                                borderRadius: '6px',
                                                                border: '1px solid #fde68a',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    {/* Total Hours */}
                                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13 }}>
                                                        {typeof row.totalDays === 'number' ? `${row.totalDays * 9} hrs` : '198 hrs'}
                                                    </TableCell>

                                                    {/* Worked Hours */}
                                                    <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: 13 }}>
                                                        {typeof row.totalHours === 'string'
                                                            ? (row.totalHours.includes('h') || row.totalHours.includes('m') || row.totalHours.includes('hrs') ? row.totalHours : `${row.totalHours} hrs`)
                                                            : `${row.totalHours} hrs`}
                                                    </TableCell>

                                                    {/* OT Hours */}
                                                    <TableCell>
                                                        <Chip
                                                            label={typeof row.otHours === 'string'
                                                                ? (row.otHours.includes('h') || row.otHours.includes('m') || row.otHours.includes('hrs') ? row.otHours : `${row.otHours} hrs`)
                                                                : `${row.otHours} hrs`}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#eff6ff',
                                                                color: '#2563eb',
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                                border: '1px solid #bfdbfe',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    {/* Less Hours */}
                                                    <TableCell>
                                                        <Chip
                                                            label={typeof row.lessHours === 'string'
                                                                ? (row.lessHours.includes('h') || row.lessHours.includes('m') || row.lessHours.includes('hrs') ? row.lessHours : `${row.lessHours} hrs`)
                                                                : `${row.lessHours || '0'} hrs`}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#fef2f2',
                                                                color: '#dc2626',
                                                                fontWeight: 700,
                                                                fontSize: '0.75rem',
                                                                border: '1px solid #fecaca',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    {/* Actual OT or Loss Hours */}
                                                    <TableCell>
                                                        {(() => {
                                                            const val = calculateActualOtOrLoss(row.otHours, row.lessHours);
                                                            const isPositive = val.startsWith('+');
                                                            const isNegative = val.startsWith('-');

                                                            return (
                                                                <Chip
                                                                    label={val}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: isPositive ? '#f0fdf4' : isNegative ? '#fff1f2' : '#f8fafc',
                                                                        color: isPositive ? '#15803d' : isNegative ? '#e11d48' : '#64748b',
                                                                        fontWeight: 700,
                                                                        fontSize: '0.75rem',
                                                                        border: '1px solid',
                                                                        borderColor: isPositive ? '#bbf7d0' : isNegative ? '#fecdd3' : '#e2e8f0',
                                                                    }}
                                                                />
                                                            );
                                                        })()}
                                                    </TableCell>

                                                    {/* Action */}
                                                    <TableCell>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<ViewIcon sx={{ fontSize: 16 }} />}
                                                            onClick={() => handleOpenViewLogs(row)}
                                                            sx={{
                                                                borderRadius: '8px',
                                                                textTransform: 'none',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 600,
                                                                borderColor: '#cbd5e1',
                                                                color: '#334155',
                                                                '&:hover': {
                                                                    borderColor: '#3b82f6',
                                                                    backgroundColor: '#eff6ff',
                                                                    color: '#2563eb',
                                                                },
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </>
            )}

            {/* View User Monthly Clock In/Out Logs Dialog */}
            <Dialog
                open={viewLogsOpen}
                onClose={() => setViewLogsOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle component="div" sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography component="span" variant="h6" fontWeight="bold">
                        Monthly Clock In/Out Records ({selectedUserLogs?.eNo ? `${selectedUserLogs?.eNo} - ` : ''}{selectedUserLogs?.name})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                            label={`Leave: ${selectedUserLogs?.leaves || 0} days`}
                            size="small"
                            sx={{ fontWeight: 600, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
                        />
                        <Chip
                            label={selectedUserLogs?.month}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                        />
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {loadingUserLogs ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress sx={{ color: '#3b82f6' }} />
                        </Box>
                    ) : userLogs.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>
                            No clock-in/out records found for this user in {selectedUserLogs?.month}.
                        </Box>
                    ) : (
                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Clock In Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Clock In</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Clock Out Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Clock Out</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Hour Count</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Extra Hours</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Less Hours</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {userLogs.map((log, idx) => {
                                        const hrs = calculateHourCount(log.clockInTime, log.clockOutTime);
                                        return (
                                            <TableRow key={`user_log_${log.id}_${idx}`} hover>
                                                <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{log.clockInDate || log.date}</TableCell>
                                                <TableCell sx={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                                                    {log.clockInTime || '-'}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{log.clockOutDate || (log.status === 'Clocked Out' ? (log.date || '-') : '-')}</TableCell>
                                                <TableCell sx={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
                                                    {log.clockOutTime || '-'}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 12, color: 'text.secondary', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {log.clockInLocation || log.clockOutLocation ? (
                                                        <Tooltip title={log.clockInLocation || log.clockOutLocation} arrow placement="top">
                                                            <span style={{ cursor: 'pointer' }}>
                                                                {formatShortLocation(log.clockInLocation || log.clockOutLocation)}
                                                            </span>
                                                        </Tooltip>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>
                                                    {hrs === '-' ? '0 hrs' : hrs}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>
                                                    {calculateOtHours(log.clockInTime, log.clockOutTime)}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>
                                                    {calculateLessHours(log.clockInTime, log.clockOutTime)}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={log.status}
                                                        size="small"
                                                        color={log.status === 'Clocked In' ? 'success' : 'default'}
                                                        sx={{ fontSize: '0.7rem', fontWeight: 700 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setViewLogsOpen(false)} variant="contained" sx={{ textTransform: 'none', borderRadius: 2 }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Attendance Record Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    Edit Attendance Record ({selectedRecord?.eNo} - {selectedRecord?.name})
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Clock In Date"
                            value={editClockInDate}
                            onChange={(e) => setEditClockInDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                        <TextField
                            fullWidth
                            type="time"
                            label="Clock In Time"
                            value={time12To24(editClockIn)}
                            onChange={(e) => setEditClockIn(time24To12(e.target.value))}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 1 }}
                            onClick={(e) => {
                                try {
                                    (e.target as any).showPicker?.();
                                } catch (err) {}
                            }}
                            sx={{
                                '& input::-webkit-calendar-picker-indicator': {
                                    cursor: 'pointer',
                                },
                            }}
                            size="small"
                        />
                        <TextField
                            fullWidth
                            type="date"
                            label="Clock Out Date"
                            value={editClockOutDate}
                            onChange={(e) => setEditClockOutDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                        <TextField
                            fullWidth
                            type="time"
                            label="Clock Out Time"
                            value={time12To24(editClockOut)}
                            onChange={(e) => setEditClockOut(time24To12(e.target.value))}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 1 }}
                            onClick={(e) => {
                                try {
                                    (e.target as any).showPicker?.();
                                } catch (err) {}
                            }}
                            sx={{
                                '& input::-webkit-calendar-picker-indicator': {
                                    cursor: 'pointer',
                                },
                            }}
                            size="small"
                        />
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={editStatus}
                                label="Status"
                                onChange={(e) => setEditStatus(e.target.value as 'Clocked In' | 'Clocked Out')}
                            >
                                <MenuItem value="Clocked In">Clocked In</MenuItem>
                                <MenuItem value="Clocked Out">Clocked Out</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setEditDialogOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveEdit}
                        variant="contained"
                        disabled={savingEdit}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Attendance Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => !deletingRecord && setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    Delete Attendance Record
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Are you sure you want to delete the attendance record for{' '}
                        <strong>{recordToDelete?.name}</strong> ({recordToDelete?.eNo}) on{' '}
                        <strong>{recordToDelete?.clockInDate || recordToDelete?.date}</strong>?
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        This action cannot be undone. The attendance log will be permanently deleted and the staff member's status for this date will be reset.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        color="inherit"
                        disabled={deletingRecord}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        disabled={deletingRecord}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                        }}
                    >
                        {deletingRecord ? 'Deleting...' : 'Delete Record'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

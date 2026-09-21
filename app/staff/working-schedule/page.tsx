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
    Today as TodayIcon,
    SupportAgent as SupportAgentIcon,
    AdminPanelSettings as AdminIcon,
    CheckCircle as CheckCircleIcon,
    EventNote as EventNoteIcon,
    ContentCopy as CopyIcon,
    Tune as TuneIcon,
    RestartAlt as ResetIcon,
    Visibility as VisibilityIcon,
    Save as SaveIcon,
    SwapHoriz as SwapHorizIcon,
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
    shiftType: 'Morning' | 'Evening' | 'FullDay' | 'Day' | 'Night' | 'Off';
    startTime: string; // e.g. "08:00 AM"
    endTime: string;   // e.g. "04:30 PM"
    dutyRole?: string; // e.g. "Counter", "Dispatcher", "Driver Coordinator"
    notes?: string;
    isCustomized?: boolean;
    customizedWeek?: string;
}

interface StaffMember {
    id: string;
    eNo: string;
    name: string;
    email: string;
    avatar?: string;
}

const SHIFT_TEMPLATES: Record<string, { label: string; start: string; end: string; color: string; bg: string; border: string }> = {
    Morning: { label: 'Morning Shift', start: '06:00:00 AM', end: '03:00:00 PM', color: '#0369a1', bg: '#e0f2fe', border: '#bae6fd' },
    Evening: { label: 'Evening Shift', start: '10:00:00 AM', end: '10:00:00 PM', color: '#c2410c', bg: '#ffedd5', border: '#fed7aa' },
    FullDay: { label: 'Full Day', start: '07:00:00 AM', end: '10:00:00 PM', color: '#15803d', bg: '#dcfce7', border: '#86efac' },
    Day: { label: 'Day Shift', start: '08:30:00 AM', end: '05:30:00 PM', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    Night: { label: 'Night Shift', start: '04:00:00 PM', end: '12:00:00 AM', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    Off: { label: 'Off', start: '-', end: '-', color: '#ffffff', bg: '#334155', border: '#1e293b' },
};

// Designated Call Center staff names
const CALL_CENTER_NAMES = [
    'sasanka',
    'dilshan',
    'vihanga',
    'vishmika',
    'ayesh',
    'weerasinghe',
    'chamod',
    'rashee',
    'niduka',
    'vishwa',
    'wishwa',
    'kumudu',
    'nimsara',
    'senith',
    'hiranya',
    'dewlini',
];

// E NOs corresponding to designated Call Center staff
const CALL_CENTER_ENOS = new Set([
    'e113', // Sasanka
    'e129', // Dilshan
    'e134', // Vihanga / Vishmika
    'e114', // Ayesh / Weerasinghe
    'e118', // Chamod
    'e139', // Rashee
    'e141', // Niduka
    'e123', // Wishwa / Vishwa
    'e155', // Kumudu
    'e156', // Nimsara
    'e158', // Senith
    'e157', // Hiranya
]);

// Clean display names from official daily roster
const DEFAULT_NAME_MAP: Record<string, string> = {
    e113: 'Sasanka',
    e129: 'Dilshan',
    e134: 'Vihanga',
    e114: 'Ayesh',
    e118: 'Chamod',
    e139: 'Rashee',
    e141: 'Niduka',
    e123: 'Wishwa',
    e155: 'Kumudu',
    e156: 'Nimsara',
    e158: 'Senith',
    e157: 'Hiranya',
};

// Column ordering matching the official daily roster
const ROSTER_ORDER: Record<string, number> = {
    e113: 1, // Sasanka
    e129: 2, // Dilshan
    e134: 3, // Vihanga
    e114: 4, // Ayesh
    e118: 5, // Chamod
    e139: 6, // Rashee
    e141: 7, // Niduka
    e123: 8, // Wishwa
    e155: 9, // Kumudu
    e156: 10, // Nimsara
    e158: 11, // Senith
    e157: 12, // Hiranya
};

// Helper to determine if an employee belongs to Call Center
export const isCallCenterMember = (item?: {
    name?: string;
    fullName?: string;
    username?: string;
    staffName?: string;
    eNo?: string;
    email?: string;
}): boolean => {
    if (!item) return false;
    const cleanENo = (item.eNo || '').toLowerCase().trim();
    if (cleanENo && CALL_CENTER_ENOS.has(cleanENo)) {
        return true;
    }
    const combined = `${item.name || ''} ${item.fullName || ''} ${item.username || ''} ${item.staffName || ''}`.toLowerCase();
    return CALL_CENTER_NAMES.some((name) => combined.includes(name));
};

// Default fallback staff lists to ensure complete display even if backend is offline
const DEFAULT_CALL_CENTER_STAFF: StaffMember[] = [
    { id: 'cc_e113', eNo: 'E113', name: 'Sasanka', email: 'user05.senucabs@gmail.com' },
    { id: 'cc_e129', eNo: 'E129', name: 'Dilshan', email: 'user01.senucabs@gmail.com' },
    { id: 'cc_e134', eNo: 'E134', name: 'Vihanga', email: 'user03senucabs@gmail.com' },
    { id: 'cc_e114', eNo: 'E114', name: 'Ayesh', email: 'user06.senucabs@gmail.com' },
    { id: 'cc_e118', eNo: 'E118', name: 'Chamod', email: 'user10.senucabs@gmail.com' },
    { id: 'cc_e139', eNo: 'E139', name: 'Rashee', email: 'user20.senucabs@gmail.com' },
    { id: 'cc_e141', eNo: 'E141', name: 'Niduka', email: 'user02.senucabs@gmail.com' },
    { id: 'cc_e123', eNo: 'E123', name: 'Wishwa', email: 'user21.senucabs@gmail.com' },
    { id: 'cc_e155', eNo: 'E155', name: 'Kumudu', email: 'user13.senucabs@gmail.com' },
    { id: 'cc_e156', eNo: 'E156', name: 'Nimsara', email: 'user19.senucabs@gmail.com' },
    { id: 'cc_e158', eNo: 'E158', name: 'Senith', email: 'user04.senucabs@gmail.com' },
    { id: 'cc_e157', eNo: 'E157', name: 'Hiranya', email: 'user16.senucabs@gmail.com' },
];

const DEFAULT_ADMIN_STAFF: StaffMember[] = [
    { id: 'adm_0_1', eNo: '0', name: 'Sampath Kaluarachchi', email: 'pskaluarachchi@gmail.com' },
    { id: 'adm_0_2', eNo: '0', name: 'Udara', email: 'senucabs@gmail.com' },
    { id: 'adm_e111', eNo: 'E111', name: 'Ravindu Lakshan', email: 'user09.senucabs@gmail.com' },
    { id: 'adm_e120', eNo: 'E120', name: 'kaushalya', email: 'user11.senucabs@gmail.com' },
    { id: 'adm_e128', eNo: 'E128', name: 'Shashika Gayshan Wijesinghe', email: 'user15senucabs@gmail.com' },
    { id: 'adm_e150', eNo: 'E150', name: 'Thisaru', email: 'thisarudilhara2@gmail.com' },
    { id: 'adm_e152', eNo: 'E152', name: 'malka sewwandi', email: 'user18.senucabs@gmail.com' },
];

interface RosterShiftDef {
    shiftType: 'Morning' | 'Evening' | 'FullDay' | 'Day' | 'Night' | 'Off';
    startTime: string;
    endTime: string;
    dutyRole?: string;
    notes?: string;
}

// Official Senu Cabs Daily Roster (Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6)
const OFFICIAL_CALL_CENTER_ROSTER: Record<string, RosterShiftDef[]> = {
    // Sasanka (E113)
    e113: [
        { shiftType: 'FullDay', startTime: '07:00:00 AM', endTime: '10:00:00 PM', dutyRole: 'Full Day Call Center Shift', notes: '7.00 - 22.00' },
        { shiftType: 'Morning', startTime: '07:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Morning Call Center Shift', notes: '7.00 - 17.00' },
        { shiftType: 'FullDay', startTime: '07:00:00 AM', endTime: '10:00:00 PM', dutyRole: 'Full Day Call Center Shift', notes: '7.00 - 22.00' },
        { shiftType: 'Morning', startTime: '07:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Morning Call Center Shift', notes: '7.00 - 17.00' },
        { shiftType: 'FullDay', startTime: '07:00:00 AM', endTime: '10:00:00 PM', dutyRole: 'Full Day Call Center Shift', notes: '7.00 - 22.00' },
        { shiftType: 'Morning', startTime: '07:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Morning Call Center Shift', notes: '7.00 - 17.00' },
        { shiftType: 'Off', startTime: '-', endTime: '-', dutyRole: 'Off Duty', notes: 'Off' },
    ],
    // Dilshan (E129)
    e129: [
        { shiftType: 'Morning', startTime: '06:00:00 PM', endTime: '10:00:00 PM', dutyRole: 'Evening Support Shift', notes: '18.00 - 22.00' },
        { shiftType: 'Morning', startTime: '06:00:00 PM', endTime: '10:00:00 PM', dutyRole: 'Evening Support Shift', notes: '18.00 - 22.00' },
        { shiftType: 'Morning', startTime: '06:00:00 PM', endTime: '10:00:00 PM', dutyRole: 'Evening Support Shift', notes: '18.00 - 22.00' },
        { shiftType: 'Morning', startTime: '06:00:00 PM', endTime: '10:00:00 PM', dutyRole: 'Evening Support Shift', notes: '18.00 - 22.00' },
        { shiftType: 'Off', startTime: '-', endTime: '-', dutyRole: 'Off Duty', notes: 'Off' },
        { shiftType: 'Evening', startTime: '01:00:00 PM', endTime: '10:00:00 PM', dutyRole: 'Evening Dispatch Shift', notes: '13.00 - 22.00' },
        { shiftType: 'Morning', startTime: '07:00:00 AM', endTime: '04:00:00 PM', dutyRole: 'Morning Support Shift', notes: '7.00 - 16.00' },
    ],
    // Vihanga (E134)
    e134: [
        { shiftType: 'Morning', startTime: '06:00:00 AM', endTime: '03:00:00 PM', dutyRole: 'Morning Call Center Shift', notes: '6.00 - 15.00' },
        { shiftType: 'Off', startTime: '-', endTime: '-', dutyRole: 'Off Duty', notes: 'Off' },
        { shiftType: 'Evening', startTime: '12:00:00 PM', endTime: '12:00:00 AM', dutyRole: 'Late Evening Shift', notes: '12.00 - 24.00' },
        { shiftType: 'Evening', startTime: '12:00:00 PM', endTime: '11:00:00 PM', dutyRole: 'Late Evening Shift', notes: '12.00 - 23.00' },
        { shiftType: 'Evening', startTime: '12:00:00 PM', endTime: '11:00:00 PM', dutyRole: 'Late Evening Shift', notes: '12.00 - 23.00' },
        { shiftType: 'Evening', startTime: '12:00:00 PM', endTime: '11:00:00 PM', dutyRole: 'Late Evening Shift', notes: '12.00 - 23.00' },
        { shiftType: 'FullDay', startTime: '07:00:00 AM', endTime: '11:00:00 PM', dutyRole: 'Full Day Operations Shift', notes: '7.00 - 23.00' },
    ],
    // Ayesh (E114)
    e114: [
        { shiftType: 'Evening', startTime: '10:00:00 AM', endTime: '10:00:00 PM', dutyRole: 'Day & Evening Shift', notes: '10.00 - 22.00' },
        { shiftType: 'Morning', startTime: '09:00:00 AM', endTime: '07:00:00 PM', dutyRole: 'Day Operations Shift', notes: '09:00 - 19:00' },
        { shiftType: 'Evening', startTime: '10:00:00 AM', endTime: '10:00:00 PM', dutyRole: 'Day & Evening Shift', notes: '10.00 - 22.00' },
        { shiftType: 'Evening', startTime: '10:00:00 AM', endTime: '10:00:00 PM', dutyRole: 'Day & Evening Shift', notes: '10.00 - 22.00' },
        { shiftType: 'Evening', startTime: '10:00:00 AM', endTime: '10:00:00 PM', dutyRole: 'Day & Evening Shift', notes: '10.00 - 22.00' },
        { shiftType: 'Off', startTime: '-', endTime: '-', dutyRole: 'Off Duty', notes: 'Off' },
        { shiftType: 'Evening', startTime: '10:00:00 AM', endTime: '10:00:00 PM', dutyRole: 'Day & Evening Shift', notes: '10.00 - 22.00' },
    ],
    // Chamod (E118)
    e118: [
        { shiftType: 'Evening', startTime: '10:00:00 AM', endTime: '10:00:00 PM', dutyRole: 'Day & Evening Shift', notes: '10.00 - 22.00' },
        { shiftType: 'Evening', startTime: '10:00:00 AM', endTime: '10:00:00 PM', dutyRole: 'Day & Evening Shift', notes: '10.00 - 22.00' },
        { shiftType: 'Morning', startTime: '06:00:00 AM', endTime: '04:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '6.00 - 16:00' },
        { shiftType: 'Morning', startTime: '07:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '7.00 - 17:00' },
        { shiftType: 'Morning', startTime: '07:00:00 AM', endTime: '04:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '7.00 - 16:00' },
        { shiftType: 'Morning', startTime: '06:00:00 AM', endTime: '03:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '6.00 - 15.00' },
        { shiftType: 'Off', startTime: '-', endTime: '-', dutyRole: 'Off Duty', notes: 'Off' },
    ],
    // Rashee (E139)
    e139: [
        { shiftType: 'Morning', startTime: '06:00:00 AM', endTime: '04:00:00 PM', dutyRole: 'Morning Call Center Shift', notes: '06:00 - 16:00' },
        { shiftType: 'Morning', startTime: '06:00:00 AM', endTime: '04:00:00 PM', dutyRole: 'Morning Call Center Shift', notes: '06:00 - 16:00' },
        { shiftType: 'Morning', startTime: '09:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Day Operations Shift', notes: '09:00 - 17:00' },
        { shiftType: 'Morning', startTime: '06:00:00 AM', endTime: '04:00:00 PM', dutyRole: 'Morning Call Center Shift', notes: '06:00 - 16:00' },
        { shiftType: 'Off', startTime: '-', endTime: '-', dutyRole: 'Off Duty', notes: 'Off' },
        { shiftType: 'Morning', startTime: '11:00:00 AM', endTime: '08:00:00 PM', dutyRole: 'Midday & Evening Shift', notes: '11:00 - 20:00' },
        { shiftType: 'Morning', startTime: '06:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '6.00 - 17.00' },
    ],
    // Niduka (E141)
    e141: [
        { shiftType: 'Morning', startTime: '06:00:00 PM', endTime: '12:00:00 AM', dutyRole: 'Night Operations Shift', notes: '18.00 - 24.00' },
        { shiftType: 'Morning', startTime: '05:00:00 PM', endTime: '12:00:00 AM', dutyRole: 'Night Operations Shift', notes: '17.00 - 24.00' },
        { shiftType: 'Off', startTime: '-', endTime: '-', dutyRole: 'Off Duty', notes: 'Off' },
        { shiftType: 'Morning', startTime: '05:00:00 PM', endTime: '12:00:00 AM', dutyRole: 'Night Operations Shift', notes: '17.00 - 24.00' },
        { shiftType: 'Morning', startTime: '08:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Day Operations Shift', notes: '08.00 - 17.00' },
        { shiftType: 'Morning', startTime: '05:00:00 PM', endTime: '12:00:00 AM', dutyRole: 'Night Operations Shift', notes: '17.00 - 24.00' },
        { shiftType: 'Morning', startTime: '05:00:00 PM', endTime: '12:00:00 AM', dutyRole: 'Night Operations Shift', notes: '17.00 - 24.00' },
    ],
    // Wishwa (E123)
    e123: [
        { shiftType: 'Evening', startTime: '10:00:00 AM', endTime: '08:00:00 PM', dutyRole: 'Day & Evening Shift', notes: '10.00 - 20:00' },
        { shiftType: 'Morning', startTime: '09:00:00 AM', endTime: '06:00:00 PM', dutyRole: 'Day Operations Shift', notes: '9.00 - 18:00' },
        { shiftType: 'Evening', startTime: '10:00:00 AM', endTime: '08:00:00 PM', dutyRole: 'Day & Evening Shift', notes: '10.00 - 20:00' },
        { shiftType: 'Evening', startTime: '10:00:00 AM', endTime: '08:00:00 PM', dutyRole: 'Day & Evening Shift', notes: '10.00 - 20:00' },
        { shiftType: 'Evening', startTime: '10:00:00 AM', endTime: '08:00:00 PM', dutyRole: 'Day & Evening Shift', notes: '10.00 - 20:00' },
        { shiftType: 'Off', startTime: '-', endTime: '-', dutyRole: 'Off Duty', notes: 'Off' },
        { shiftType: 'Evening', startTime: '10:00:00 AM', endTime: '08:00:00 PM', dutyRole: 'Day & Evening Shift', notes: '10.00 - 20:00' },
    ],
    // Kumudu (E155)
    e155: [
        { shiftType: 'Morning', startTime: '06:00:00 AM', endTime: '03:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '6.00 - 15.00' },
        { shiftType: 'Morning', startTime: '06:00:00 AM', endTime: '03:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '6.00 - 15.00' },
        { shiftType: 'Morning', startTime: '06:00:00 AM', endTime: '04:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '6.00 - 16.00' },
        { shiftType: 'Off', startTime: '-', endTime: '-', dutyRole: 'Off Duty', notes: 'Off' },
        { shiftType: 'Morning', startTime: '06:00:00 AM', endTime: '03:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '6.00 - 15.00' },
        { shiftType: 'Morning', startTime: '06:00:00 AM', endTime: '03:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '6.00 - 15.00' },
        { shiftType: 'Morning', startTime: '07:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '7.00 - 17.00' },
    ],
    // Nimsara (E156)
    e156: [
        { shiftType: 'Off', startTime: '-', endTime: '-', dutyRole: 'Off Duty', notes: 'Off' },
        { shiftType: 'Morning', startTime: '09:00:00 AM', endTime: '06:00:00 PM', dutyRole: 'Day Operations Shift', notes: '9.00 - 18:00' },
        { shiftType: 'Morning', startTime: '07:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '7.00 - 17.00' },
        { shiftType: 'Morning', startTime: '08:00:00 AM', endTime: '06:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '8.00 - 18:00' },
        { shiftType: 'Morning', startTime: '07:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '7.00 - 17.00' },
        { shiftType: 'Morning', startTime: '07:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '7.00 - 17.00' },
        { shiftType: 'Morning', startTime: '07:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '7.00 - 17.00' },
    ],
    // Senith (E158)
    e158: [
        { shiftType: 'Evening', startTime: '01:00:00 PM', endTime: '11:00:00 PM', dutyRole: 'Evening Operations Shift', notes: '13.00 - 23.00' },
        { shiftType: 'Evening', startTime: '01:00:00 PM', endTime: '11:00:00 PM', dutyRole: 'Evening Operations Shift', notes: '13.00 - 23.00' },
        { shiftType: 'Evening', startTime: '01:00:00 PM', endTime: '12:00:00 AM', dutyRole: 'Evening & Night Shift', notes: '13.00 - 24.00' },
        { shiftType: 'Off', startTime: '-', endTime: '-', dutyRole: 'Off Duty', notes: 'Off' },
        { shiftType: 'Evening', startTime: '02:00:00 PM', endTime: '12:00:00 AM', dutyRole: 'Evening & Night Shift', notes: '14.00 - 24.00' },
        { shiftType: 'Evening', startTime: '01:00:00 PM', endTime: '10:00:00 PM', dutyRole: 'Evening Operations Shift', notes: '13.00 - 22.00' },
        { shiftType: 'Evening', startTime: '01:00:00 PM', endTime: '10:00:00 PM', dutyRole: 'Evening Operations Shift', notes: '13.00 - 22.00' },
    ],
    // Hiranya (E157)
    e157: [
        { shiftType: 'Morning', startTime: '08:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Day Operations Shift', notes: '8.00 - 17.00' },
        { shiftType: 'Morning', startTime: '08:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Day Operations Shift', notes: '8.00 - 17.00' },
        { shiftType: 'Off', startTime: '-', endTime: '-', dutyRole: 'Off Duty', notes: 'Off' },
        { shiftType: 'Morning', startTime: '07:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '7.00 - 17.00' },
        { shiftType: 'Morning', startTime: '06:00:00 AM', endTime: '03:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '6.00 - 15.00' },
        { shiftType: 'Morning', startTime: '07:00:00 AM', endTime: '05:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '7.00 - 17.00' },
        { shiftType: 'Morning', startTime: '06:00:00 AM', endTime: '03:00:00 PM', dutyRole: 'Morning Operations Shift', notes: '6.00 - 15.00' },
    ],
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

const formatShiftTimeDisplay = (startTime?: string, endTime?: string, notes?: string): string => {
    if (notes && /^\d{1,2}[:.]\d{2}/.test(notes.trim())) {
        return notes.trim();
    }
    if (!startTime || !endTime || startTime === '-' || endTime === '-') return '-';
    const s = time12To24(startTime).slice(0, 5) || startTime.slice(0, 5);
    const e = time12To24(endTime).slice(0, 5) || endTime.slice(0, 5);
    return `${s} - ${e}`;
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
    const [ccSubTab, setCcSubTab] = useState(0); // 0 = Main Schedule (Live), 1 = Future Week Planning (Draft)
    const [loading, setLoading] = useState(true);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);

    // Live schedules
    const [callCenterSchedules, setCallCenterSchedules] = useState<ScheduleEntry[]>([]);
    const [adminSchedules, setAdminSchedules] = useState<ScheduleEntry[]>([]);

    // Isolated future week planning schedules for Call Center (does NOT update main schedule)
    const [callCenterFutureSchedules, setCallCenterFutureSchedules] = useState<ScheduleEntry[]>([]);

    // Dates for Main Schedule vs Future Week Planning vs Temporarily Customized Schedules
    const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));
    const [planningMonday, setPlanningMonday] = useState(() => {
        const nextM = getMonday(new Date());
        nextM.setDate(nextM.getDate() + 7);
        return nextM;
    });
    const [customizedMonday, setCustomizedMonday] = useState(() => {
        const nextM = getMonday(new Date());
        nextM.setDate(nextM.getDate() + 7);
        return nextM;
    });

    // Drag-and-drop exchange state for Future Week Planning
    const [draggedCellKey, setDraggedCellKey] = useState<string | null>(null);
    const [dragOverCellKey, setDragOverCellKey] = useState<string | null>(null);
    const [planningDraftOverrides, setPlanningDraftOverrides] = useState<Map<string, ScheduleEntry>>(new Map());

    // Reset in-memory draft whenever the planning week changes
    useEffect(() => {
        setPlanningDraftOverrides(new Map());
    }, [planningMonday]);

    const [searchQuery, setSearchQuery] = useState('');

    // Active monday based on current section
    const activeMonday = useMemo(() => {
        if (tabValue === 0) {
            if (ccSubTab === 1) return planningMonday;
            if (ccSubTab === 2) return customizedMonday;
        }
        return currentMonday;
    }, [tabValue, ccSubTab, planningMonday, customizedMonday, currentMonday]);

    // Active schedules for current selected tab & sub-tab
    const activeSchedules = useMemo(() => {
        if (tabValue === 0) {
            return ccSubTab === 0 ? callCenterSchedules : callCenterFutureSchedules;
        }
        return adminSchedules;
    }, [tabValue, ccSubTab, callCenterSchedules, callCenterFutureSchedules, adminSchedules]);

    // Split staff into Call Center and Admin
    const callCenterStaff = useMemo(() => {
        return staffList.filter((s) => isCallCenterMember(s)).sort((a, b) => {
            const cleanA = (a.eNo || '').toLowerCase().trim();
            const cleanB = (b.eNo || '').toLowerCase().trim();
            const orderA = ROSTER_ORDER[cleanA] ?? 999;
            const orderB = ROSTER_ORDER[cleanB] ?? 999;
            if (orderA !== orderB) return orderA - orderB;
            return compareENo(a.eNo, b.eNo);
        });
    }, [staffList]);

    const adminStaff = useMemo(() => {
        return staffList.filter((s) => !isCallCenterMember(s)).sort((a, b) => compareENo(a.eNo, b.eNo));
    }, [staffList]);

    // Staff corresponding to current active tab
    const currentSectionStaff = useMemo(() => {
        return tabValue === 0 ? callCenterStaff : adminStaff;
    }, [tabValue, callCenterStaff, adminStaff]);

    // Search-filtered staff list
    const displayedStaff = useMemo(() => {
        if (!searchQuery.trim()) return currentSectionStaff;
        const q = searchQuery.toLowerCase().trim();
        return currentSectionStaff.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.eNo.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q)
        );
    }, [currentSectionStaff, searchQuery]);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(null);
    const [formStaffENo, setFormStaffENo] = useState('');
    const [formDate, setFormDate] = useState(() => formatDateYMD(new Date()));
    const [formShiftType, setFormShiftType] = useState<'Morning' | 'Evening' | 'FullDay' | 'Day' | 'Night' | 'Off'>('Day');
    const [formStartTime, setFormStartTime] = useState('08:30:00 AM');
    const [formEndTime, setFormEndTime] = useState('05:30:00 PM');
    const [formDutyRole, setFormDutyRole] = useState('Call Center & Dispatcher Support');
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

            // Initialize staff map with defaults so call center & admin staff are always available
            const staffMap = new Map<string, StaffMember>();
            [...DEFAULT_CALL_CENTER_STAFF, ...DEFAULT_ADMIN_STAFF].forEach((s) => {
                const key = s.eNo === '0' ? `${s.eNo}_${s.name.toLowerCase()}` : s.eNo.toLowerCase();
                staffMap.set(key, s);
            });

            if (res.ok) {
                const logs = await res.json();
                logs.forEach((item: any) => {
                    const eNo = (item.eNo || '').trim();
                    if (eNo) {
                        const cleanENo = eNo.toLowerCase();
                        const key = eNo === '0' ? `${eNo}_${(item.name || item.fullName || '').toLowerCase()}` : cleanENo;
                        const existing = staffMap.get(key);
                        const candidateName = (item.name || item.fullName || item.username || '').trim();
                        const isEmail = candidateName.includes('@');
                        const rosterName = DEFAULT_NAME_MAP[cleanENo];
                        const resolvedName = rosterName || (!isEmail && candidateName
                            ? candidateName
                            : (existing?.name && !existing.name.includes('@') ? existing.name : (candidateName || 'Staff Member')));

                        staffMap.set(key, {
                            id: item.id || item.staffId || eNo,
                            eNo: item.eNo,
                            name: resolvedName,
                            email: item.email || existing?.email || '',
                            avatar: item.avatar || existing?.avatar || '',
                        });
                    }
                });
            }

            const staffMembers = Array.from(staffMap.values()).sort((a, b) => compareENo(a.eNo, b.eNo));
            setStaffList(staffMembers);

            const monday = getMonday(new Date());
            const nextMonday = new Date(monday);
            nextMonday.setDate(monday.getDate() + 7);

            // Roster sync version tracking to automatically update to the official 2026-08-20 roster
            const ROSTER_SYNC_VERSION = '2026-08-20_official_roster_v4';
            const isRosterOutdated = localStorage.getItem('staff_roster_sync_version') !== ROSTER_SYNC_VERSION;
            if (isRosterOutdated) {
                localStorage.setItem('staff_roster_sync_version', ROSTER_SYNC_VERSION);
            }

            // Future planning sync version to clear old dummy data and synchronize with main schedule
            const FUTURE_SYNC_VERSION = '2026-09-21_future_roster_v2';
            const isFutureOutdated = localStorage.getItem('staff_future_sync_version') !== FUTURE_SYNC_VERSION;
            if (isFutureOutdated) {
                localStorage.setItem('staff_future_sync_version', FUTURE_SYNC_VERSION);
                localStorage.removeItem('staff_callcenter_future_schedules');
            }

            // 1. Load Main Live schedules
            const savedCallCenter = localStorage.getItem('staff_callcenter_schedules') || localStorage.getItem('staff_working_schedules');
            const savedAdmin = localStorage.getItem('staff_admin_schedules');

            let rawCallCenter: ScheduleEntry[] = [];
            let rawAdmin: ScheduleEntry[] = [];

            if (savedCallCenter) {
                try {
                    rawCallCenter = JSON.parse(savedCallCenter);
                } catch (e) {
                    rawCallCenter = [];
                }
            }
            if (savedAdmin) {
                try {
                    rawAdmin = JSON.parse(savedAdmin);
                } catch (e) {
                    rawAdmin = [];
                }
            }

            // Consolidate and re-partition all schedules:
            // Only designated call center employees stay in Call Center schedule;
            // All other employees move to Admin schedule.
            const allSaved = [...rawCallCenter, ...rawAdmin];
            const callCenterMap = new Map<string, ScheduleEntry>();
            const adminMap = new Map<string, ScheduleEntry>();

            allSaved.forEach((entry) => {
                const key = `${entry.eNo.toLowerCase()}_${entry.date}`;
                // Sanitize entry.staffName if it was previously saved with an email address
                const cleanENo = entry.eNo.toLowerCase().trim();
                const staff = staffMap.get(cleanENo);
                const rosterName = DEFAULT_NAME_MAP[cleanENo];
                if (staff || rosterName) {
                    entry.staffName = rosterName || staff?.name || entry.staffName;
                    if (staff && (!entry.staffEmail || entry.staffEmail.trim() === '')) {
                        entry.staffEmail = staff.email;
                    }
                }

                if (isCallCenterMember(entry)) {
                    callCenterMap.set(key, entry);
                } else {
                    adminMap.set(key, entry);
                }
            });

            // Ensure Call Center members have official roster shifts in Main Schedule
            const ccMembers = staffMembers.filter((s) => isCallCenterMember(s));
            ccMembers.forEach((staff) => {
                const cleanENo = staff.eNo.toLowerCase().trim();
                const officialShifts = OFFICIAL_CALL_CENTER_ROSTER[cleanENo];

                for (let d = 0; d < 7; d++) {
                    const target = new Date(monday);
                    target.setDate(monday.getDate() + d);
                    const dateStr = formatDateYMD(target);
                    const key = `${cleanENo}_${dateStr}`;

                    if (officialShifts && officialShifts[d] && (isRosterOutdated || !callCenterMap.has(key))) {
                        const def = officialShifts[d];
                        callCenterMap.set(key, {
                            id: `sch_cc_${staff.eNo}_${dateStr}`,
                            eNo: staff.eNo,
                            staffName: DEFAULT_NAME_MAP[cleanENo] || staff.name,
                            staffEmail: staff.email,
                            avatar: staff.avatar,
                            date: dateStr,
                            shiftType: def.shiftType,
                            startTime: def.startTime,
                            endTime: def.endTime,
                            dutyRole: def.dutyRole || (def.shiftType === 'Off' ? 'Off Duty' : 'Call Center & Dispatcher Support'),
                            notes: def.notes || '',
                        });
                    }
                }
            });

            // Ensure Admin members have schedules for the current week
            const admMembers = staffMembers.filter((s) => !isCallCenterMember(s));
            admMembers.forEach((staff) => {
                for (let d = 0; d < 7; d++) {
                    const target = new Date(monday);
                    target.setDate(monday.getDate() + d);
                    const dateStr = formatDateYMD(target);
                    const key = `${staff.eNo.toLowerCase()}_${dateStr}`;
                    if (!adminMap.has(key)) {
                        const isWeekend = d >= 5;
                        const shift: 'Morning' | 'Day' | 'Night' | 'Off' = isWeekend ? 'Off' : 'Day';

                        adminMap.set(key, {
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
                }
            });

            const finalCallCenter = Array.from(callCenterMap.values());
            const finalAdmin = Array.from(adminMap.values());

            localStorage.setItem('staff_callcenter_schedules', JSON.stringify(finalCallCenter));
            localStorage.setItem('staff_admin_schedules', JSON.stringify(finalAdmin));
            localStorage.removeItem('staff_working_schedules');

            setCallCenterSchedules(finalCallCenter);
            setAdminSchedules(finalAdmin);

            // 2. Load Isolated Future Week Planning schedules for Call Center
            const savedFuture = localStorage.getItem('staff_callcenter_future_schedules');
            let futureEntries: ScheduleEntry[] = [];
            if (savedFuture) {
                try {
                    futureEntries = JSON.parse(savedFuture);
                } catch (e) {
                    futureEntries = [];
                }
            }

            const futureMap = new Map<string, ScheduleEntry>();
            futureEntries.forEach((entry) => {
                const staff = staffMap.get(entry.eNo.toLowerCase());
                if (staff) {
                    if (!entry.staffName || entry.staffName.includes('@')) {
                        entry.staffName = staff.name;
                    }
                    if (!entry.staffEmail || entry.staffEmail.trim() === '') {
                        entry.staffEmail = staff.email;
                    }
                }
                futureMap.set(`${entry.eNo.toLowerCase()}_${entry.date}`, entry);
            });

            // Initialize planning draft shifts from official Main Schedule baseline for next week
            ccMembers.forEach((staff) => {
                const cleanENo = staff.eNo.toLowerCase().trim();
                const officialShifts = OFFICIAL_CALL_CENTER_ROSTER[cleanENo];

                for (let d = 0; d < 7; d++) {
                    const target = new Date(nextMonday);
                    target.setDate(nextMonday.getDate() + d);
                    const dateStr = formatDateYMD(target);
                    const key = `${cleanENo}_${dateStr}`;
                    if (!futureMap.has(key) || isRosterOutdated || isFutureOutdated) {
                        const def = (officialShifts && officialShifts[d]) || {
                            shiftType: 'Off' as const,
                            startTime: '-',
                            endTime: '-',
                            dutyRole: 'Off Duty',
                            notes: 'Off',
                        };

                        futureMap.set(key, {
                            id: `sch_cc_plan_${staff.eNo}_${dateStr}`,
                            eNo: staff.eNo,
                            staffName: DEFAULT_NAME_MAP[cleanENo] || staff.name,
                            staffEmail: staff.email,
                            avatar: staff.avatar,
                            date: dateStr,
                            shiftType: def.shiftType,
                            startTime: def.startTime,
                            endTime: def.endTime,
                            dutyRole: def.dutyRole || (def.shiftType === 'Off' ? 'Off Duty' : 'Call Center & Dispatcher Support'),
                            notes: def.notes || '',
                        });
                    }
                }
            });

            const finalFuture = Array.from(futureMap.values());
            localStorage.setItem('staff_callcenter_future_schedules', JSON.stringify(finalFuture));
            setCallCenterFutureSchedules(finalFuture);
        } catch (e) {
            console.error('Failed to load schedule data:', e);
        } finally {
            setLoading(false);
        }
    };

    // Week days calculation using activeMonday
    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(activeMonday);
            d.setDate(activeMonday.getDate() + i);
            days.push({
                dateObj: d,
                dateStr: formatDateYMD(d),
                dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
                displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                isToday: formatDateYMD(d) === formatDateYMD(new Date()),
            });
        }
        return days;
    }, [activeMonday]);

    const handlePrevWeek = () => {
        if (tabValue === 0 && ccSubTab === 1) {
            const prev = new Date(planningMonday);
            prev.setDate(prev.getDate() - 7);
            setPlanningMonday(prev);
        } else if (tabValue === 0 && ccSubTab === 2) {
            const prev = new Date(customizedMonday);
            prev.setDate(prev.getDate() - 7);
            setCustomizedMonday(prev);
        } else {
            const prev = new Date(currentMonday);
            prev.setDate(prev.getDate() - 7);
            setCurrentMonday(prev);
        }
    };

    const handleNextWeek = () => {
        if (tabValue === 0 && ccSubTab === 1) {
            const next = new Date(planningMonday);
            next.setDate(next.getDate() + 7);
            setPlanningMonday(next);
        } else if (tabValue === 0 && ccSubTab === 2) {
            const next = new Date(customizedMonday);
            next.setDate(next.getDate() + 7);
            setCustomizedMonday(next);
        } else {
            const next = new Date(currentMonday);
            next.setDate(next.getDate() + 7);
            setCurrentMonday(next);
        }
    };

    const handleTodayWeek = () => {
        const nextM = getMonday(new Date());
        nextM.setDate(nextM.getDate() + 7);
        if (tabValue === 0 && ccSubTab === 1) {
            setPlanningMonday(nextM);
        } else if (tabValue === 0 && ccSubTab === 2) {
            setCustomizedMonday(nextM);
        } else {
            setCurrentMonday(getMonday(new Date()));
        }
    };

    // List of planning weeks for the dropdown (next 12 weeks + any week with saved customizations)
    const availableWeeks = useMemo(() => {
        const weeksMap = new Map<string, { mondayStr: string; label: string; customizedCount: number; dateObj: Date }>();

        // Generate next 12 weeks starting from next Monday
        const baseMon = getMonday(new Date());
        for (let i = 1; i <= 12; i++) {
            const m = new Date(baseMon);
            m.setDate(baseMon.getDate() + i * 7);
            const sun = new Date(m);
            sun.setDate(m.getDate() + 6);
            const mStr = formatDateYMD(m);
            const label = `${m.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${m.getFullYear()}${i === 1 ? ' (Next Week)' : ''}`;
            weeksMap.set(mStr, {
                mondayStr: mStr,
                label,
                customizedCount: 0,
                dateObj: m,
            });
        }

        // Check callCenterFutureSchedules to count customizations and include any other customized weeks
        callCenterFutureSchedules.forEach((entry) => {
            const entryDate = new Date(entry.date + 'T00:00:00');
            const entryMon = getMonday(entryDate);
            const mStr = formatDateYMD(entryMon);
            if (!weeksMap.has(mStr)) {
                const sun = new Date(entryMon);
                sun.setDate(entryMon.getDate() + 6);
                const label = `${entryMon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${entryMon.getFullYear()}`;
                weeksMap.set(mStr, {
                    mondayStr: mStr,
                    label,
                    customizedCount: 0,
                    dateObj: entryMon,
                });
            }
            const item = weeksMap.get(mStr);
            if (item) {
                item.customizedCount++;
            }
        });

        return Array.from(weeksMap.values()).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    }, [callCenterFutureSchedules]);

    const totalCustomizedWeeksCount = useMemo(() => {
        return availableWeeks.filter((w) => w.customizedCount > 0).length;
    }, [availableWeeks]);

    const currentWeekCustomizedCount = useMemo(() => {
        if (tabValue !== 0 || (ccSubTab !== 1 && ccSubTab !== 2)) return 0;
        const weekDateStrs = new Set(weekDays.map((d) => d.dateStr));
        return callCenterFutureSchedules.filter((s) => weekDateStrs.has(s.date)).length;
    }, [tabValue, ccSubTab, weekDays, callCenterFutureSchedules]);

    const handleResetWeekCustomizations = () => {
        const weekDateStrs = new Set(weekDays.map((d) => d.dateStr));
        const count = callCenterFutureSchedules.filter((s) => weekDateStrs.has(s.date)).length;
        if (count === 0) {
            alert('There are no temporary customizations in this week.');
            return;
        }
        if (!confirm(`Are you sure you want to reset all ${count} temporary customization(s) for the week of ${weekDays[0].displayDate} – ${weekDays[6].displayDate}? All shifts will revert to the official Main Schedule.`)) {
            return;
        }
        const updated = callCenterFutureSchedules.filter((s) => !weekDateStrs.has(s.date));
        setCallCenterFutureSchedules(updated);
        localStorage.setItem('staff_callcenter_future_schedules', JSON.stringify(updated));
    };

    const handleExchangeShifts = (sourceKey: string, targetKey: string) => {
        if (sourceKey === targetKey) return;
        const entry1 = scheduleMap.get(sourceKey);
        const entry2 = scheduleMap.get(targetKey);
        if (!entry1 || !entry2) return;

        const newEntry1: ScheduleEntry = {
            ...entry1,
            shiftType: entry2.shiftType,
            startTime: entry2.startTime,
            endTime: entry2.endTime,
            dutyRole: entry2.dutyRole,
            notes: entry2.notes || (entry2.shiftType === 'Off' ? 'Off' : ''),
            isCustomized: true,
            customizedWeek: formatDateYMD(planningMonday),
        };

        const newEntry2: ScheduleEntry = {
            ...entry2,
            shiftType: entry1.shiftType,
            startTime: entry1.startTime,
            endTime: entry1.endTime,
            dutyRole: entry1.dutyRole,
            notes: entry1.notes || (entry1.shiftType === 'Off' ? 'Off' : ''),
            isCustomized: true,
            customizedWeek: formatDateYMD(planningMonday),
        };

        setPlanningDraftOverrides((prev) => {
            const next = new Map(prev);
            next.set(sourceKey, newEntry1);
            next.set(targetKey, newEntry2);
            return next;
        });
    };

    const handleSavePlanningSchedule = () => {
        const weekDateStrs = new Set(weekDays.map((d) => d.dateStr));
        const weekMondayStr = formatDateYMD(planningMonday);

        // Collect all entries for the active planning week from scheduleMap (combines baseline + draft swaps)
        const entriesToSave: ScheduleEntry[] = [];
        currentSectionStaff.forEach((staff) => {
            const cleanENo = staff.eNo.toLowerCase();
            weekDays.forEach((day) => {
                const entry = scheduleMap.get(`${cleanENo}_${day.dateStr}`);
                if (entry) {
                    entriesToSave.push({
                        ...entry,
                        id: `sch_cc_custom_${staff.eNo}_${day.dateStr}`,
                        isCustomized: true,
                        customizedWeek: weekMondayStr,
                    });
                }
            });
        });

        // Filter out any existing entries for this week in callCenterFutureSchedules
        const remaining = callCenterFutureSchedules.filter((s) => !weekDateStrs.has(s.date));
        const updated = [...remaining, ...entriesToSave];

        localStorage.setItem('staff_callcenter_future_schedules', JSON.stringify(updated));
        setCallCenterFutureSchedules(updated);
        setPlanningDraftOverrides(new Map());

        // Automatically switch to and display in Temporarily Customized Schedules tab
        setCustomizedMonday(new Date(planningMonday));
        setCcSubTab(2);
    };

    // Fast lookup map: eNo_date -> ScheduleEntry
    const scheduleMap = useMemo(() => {
        const map = new Map<string, ScheduleEntry>();

        if (tabValue === 0 && (ccSubTab === 1 || ccSubTab === 2)) {
            // Future Week Planning OR Temporarily Customized Schedules:
            // 1. First populate all cells with the Main Schedule baseline for the active week
            callCenterStaff.forEach((staff) => {
                const cleanENo = staff.eNo.toLowerCase().trim();
                const officialShifts = OFFICIAL_CALL_CENTER_ROSTER[cleanENo];

                weekDays.forEach((day, dIdx) => {
                    const dayOfWeekIdx = dIdx % 7; // Monday = 0, ..., Sunday = 6
                    const officialDef = officialShifts ? officialShifts[dayOfWeekIdx] : null;

                    const shiftType = officialDef?.shiftType || 'Off';
                    const startTime = officialDef?.startTime || (shiftType === 'Off' ? '-' : (SHIFT_TEMPLATES[shiftType]?.start || '08:00:00 AM'));
                    const endTime = officialDef?.endTime || (shiftType === 'Off' ? '-' : (SHIFT_TEMPLATES[shiftType]?.end || '05:00:00 PM'));
                    const dutyRole = officialDef?.dutyRole || (shiftType === 'Off' ? 'Off Duty' : 'Call Center & Dispatcher Support');
                    const notes = officialDef?.notes || '';

                    map.set(`${cleanENo}_${day.dateStr}`, {
                        id: `sch_cc_plan_${staff.eNo}_${day.dateStr}`,
                        eNo: staff.eNo,
                        staffName: DEFAULT_NAME_MAP[cleanENo] || staff.name,
                        staffEmail: staff.email,
                        avatar: staff.avatar,
                        date: day.dateStr,
                        shiftType,
                        startTime,
                        endTime,
                        dutyRole,
                        notes,
                        isCustomized: false,
                    });
                });
            });

            // 2. Overlay any customized future planning shifts (isolated, non-destructive overrides)
            callCenterFutureSchedules.forEach((entry) => {
                map.set(`${entry.eNo.toLowerCase()}_${entry.date}`, {
                    ...entry,
                    isCustomized: true,
                });
            });

            // 3. Overlay in-memory drag-and-drop draft exchanges in Future Week Planning
            if (ccSubTab === 1) {
                planningDraftOverrides.forEach((entry, key) => {
                    map.set(key, entry);
                });
            }
        } else {
            activeSchedules.forEach((entry) => {
                map.set(`${entry.eNo.toLowerCase()}_${entry.date}`, entry);
            });
        }

        return map;
    }, [tabValue, ccSubTab, callCenterStaff, weekDays, callCenterFutureSchedules, activeSchedules, planningDraftOverrides]);

    // Summary statistics for current week scoped to the active section & active week
    const currentWeekStats = useMemo(() => {
        let morningCount = 0;
        let dayFullDayCount = 0;
        let eveningNightCount = 0;
        let offCount = 0;
        let total = 0;

        currentSectionStaff.forEach((staff) => {
            const cleanENo = staff.eNo.toLowerCase();
            weekDays.forEach((day) => {
                const entry = scheduleMap.get(`${cleanENo}_${day.dateStr}`);
                if (entry) {
                    total++;
                    if (entry.shiftType === 'Morning') morningCount++;
                    else if (entry.shiftType === 'Day' || entry.shiftType === 'FullDay') dayFullDayCount++;
                    else if (entry.shiftType === 'Night' || entry.shiftType === 'Evening') eveningNightCount++;
                    else if (entry.shiftType === 'Off') offCount++;
                }
            });
        });

        return {
            total,
            morning: morningCount,
            day: dayFullDayCount,
            night: eveningNightCount,
            off: offCount,
        };
    }, [currentSectionStaff, weekDays, scheduleMap]);

    const handleOpenCreateDialog = (targetStaff?: StaffMember, targetDateStr?: string) => {
        const defaultStaff = targetStaff || (currentSectionStaff.length > 0 ? currentSectionStaff[0] : null);
        setSelectedEntry(null);
        const eNo = defaultStaff ? defaultStaff.eNo : '';
        const dateStr = targetDateStr || formatDateYMD(activeMonday);
        setFormStaffENo(eNo);
        setFormDate(dateStr);

        const cleanENo = eNo.toLowerCase().trim();
        const dateObj = new Date(dateStr + 'T00:00:00');
        const dayIdx = (dateObj.getDay() + 6) % 7;
        const rosterShift = (tabValue === 0 && OFFICIAL_CALL_CENTER_ROSTER[cleanENo]) ? OFFICIAL_CALL_CENTER_ROSTER[cleanENo][dayIdx] : null;

        if (rosterShift) {
            setFormShiftType(rosterShift.shiftType);
            setFormStartTime(rosterShift.startTime);
            setFormEndTime(rosterShift.endTime);
            setFormDutyRole(rosterShift.dutyRole || 'Call Center & Dispatcher Support');
            setFormNotes(rosterShift.notes || '');
        } else {
            setFormShiftType('Morning');
            setFormStartTime(SHIFT_TEMPLATES.Morning.start);
            setFormEndTime(SHIFT_TEMPLATES.Morning.end);
            setFormDutyRole(tabValue === 0 ? 'Call Center & Dispatcher Support' : 'Office Administration & Operations');
            setFormNotes(tabValue === 0 && ccSubTab === 1 ? 'Planned shift customization' : '');
        }
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

    const handleShiftTypeChange = (type: 'Morning' | 'Evening' | 'FullDay' | 'Day' | 'Night' | 'Off') => {
        setFormShiftType(type);
        if (type === 'Off') {
            setFormStartTime('-');
            setFormEndTime('-');
            setFormDutyRole('Off Duty');
        } else {
            const tmpl = SHIFT_TEMPLATES[type] || SHIFT_TEMPLATES.Day;
            setFormStartTime(tmpl.start);
            setFormEndTime(tmpl.end);
            setFormDutyRole(
                type === 'FullDay'
                    ? 'Full Day Operations'
                    : type === 'Evening'
                    ? 'Evening Call Center Support'
                    : 'Call Center & Dispatcher Support'
            );
        }
    };

    const handleSaveSchedule = () => {
        const staff = staffList.find((s) => s.eNo.toLowerCase() === formStaffENo.toLowerCase());
        const staffName = staff ? staff.name : formStaffENo;
        const staffEmail = staff ? staff.email : '';
        const avatar = staff ? staff.avatar : '';

        const isCC = isCallCenterMember({ eNo: formStaffENo, name: staffName });
        const isFuturePlanning = tabValue === 0 && (ccSubTab === 1 || ccSubTab === 2);
        const prefix = tabValue === 0 ? (isFuturePlanning ? 'cc_custom' : 'cc') : 'adm';
        const mondayOfDate = getMonday(new Date(formDate + 'T00:00:00'));
        const mondayStr = formatDateYMD(mondayOfDate);

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
            isCustomized: isFuturePlanning,
            customizedWeek: mondayStr,
        };

        if (tabValue === 0) {
            if (isFuturePlanning) {
                // Save ONLY to callCenterFutureSchedules! Main schedule is completely untouched!
                const updated = callCenterFutureSchedules.filter(
                    (s) => s.id !== newEntry.id && !(s.eNo.toLowerCase() === formStaffENo.toLowerCase() && s.date === formDate)
                );
                updated.push(newEntry);
                setCallCenterFutureSchedules(updated);
                localStorage.setItem('staff_callcenter_future_schedules', JSON.stringify(updated));
            } else {
                // Save to Main Live Call Center Schedule
                const updated = callCenterSchedules.filter(
                    (s) => s.id !== newEntry.id && !(s.eNo.toLowerCase() === formStaffENo.toLowerCase() && s.date === formDate)
                );
                updated.push(newEntry);
                setCallCenterSchedules(updated);
                localStorage.setItem('staff_callcenter_schedules', JSON.stringify(updated));
            }
        } else {
            // Admin Schedule
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
            if (ccSubTab === 1 || ccSubTab === 2) {
                // Future planning / Temporarily Customized: remove customized override so it falls back to Main Schedule baseline
                const targetENo = selectedEntry?.eNo.toLowerCase();
                const targetDate = selectedEntry?.date;
                const updated = callCenterFutureSchedules.filter(
                    (s) => s.id !== id && !(targetENo && targetDate && s.eNo.toLowerCase() === targetENo && s.date === targetDate)
                );
                setCallCenterFutureSchedules(updated);
                localStorage.setItem('staff_callcenter_future_schedules', JSON.stringify(updated));
            } else {
                // Main schedule
                const updated = callCenterSchedules.filter((s) => s.id !== id);
                setCallCenterSchedules(updated);
                localStorage.setItem('staff_callcenter_schedules', JSON.stringify(updated));
            }
        } else {
            const updated = adminSchedules.filter((s) => s.id !== id);
            setAdminSchedules(updated);
            localStorage.setItem('staff_admin_schedules', JSON.stringify(updated));
        }
        if (dialogOpen) setDialogOpen(false);
    };

    // Copy current live schedule to future planning draft as a starting baseline without affecting main schedule
    const handleCopyMainToFuture = () => {
        if (!confirm('This will copy the current Main Schedule shifts into the Future Week Planning draft for next week. You can then freely customize them with employees without changing the Main Schedule. Continue?')) {
            return;
        }

        const newFutureMap = new Map<string, ScheduleEntry>();

        // Retain any entries for other weeks
        callCenterFutureSchedules.forEach((entry) => {
            newFutureMap.set(`${entry.eNo.toLowerCase()}_${entry.date}`, entry);
        });

        // Copy current week shifts to planning week dates
        callCenterStaff.forEach((staff) => {
            for (let i = 0; i < 7; i++) {
                const sourceDateStr = formatDateYMD(new Date(currentMonday.getTime() + i * 24 * 60 * 60 * 1000));
                const targetDateStr = formatDateYMD(new Date(planningMonday.getTime() + i * 24 * 60 * 60 * 1000));

                const cleanENo = staff.eNo.toLowerCase().trim();
                const officialShift = OFFICIAL_CALL_CENTER_ROSTER[cleanENo]?.[i];
                const existingMain = callCenterSchedules.find(
                    (s) => s.eNo.toLowerCase() === cleanENo && s.date === sourceDateStr
                );

                const shift = existingMain ? existingMain.shiftType : (officialShift ? officialShift.shiftType : 'Day');
                const startTime = existingMain ? existingMain.startTime : (officialShift ? officialShift.startTime : (SHIFT_TEMPLATES[shift]?.start || '08:30:00 AM'));
                const endTime = existingMain ? existingMain.endTime : (officialShift ? officialShift.endTime : (SHIFT_TEMPLATES[shift]?.end || '05:30:00 PM'));
                const dutyRole = existingMain?.dutyRole || (officialShift ? officialShift.dutyRole : (shift === 'Off' ? 'Off Duty' : 'Call Center & Dispatcher Support'));
                const notes = existingMain ? existingMain.notes : (officialShift ? officialShift.notes : 'Copied from Main Schedule as baseline for planning');
                const targetKey = `${staff.eNo.toLowerCase()}_${targetDateStr}`;

                newFutureMap.set(targetKey, {
                    id: `sch_cc_plan_${staff.eNo}_${targetDateStr}_${Date.now()}`,
                    eNo: staff.eNo,
                    staffName: DEFAULT_NAME_MAP[cleanENo] || staff.name,
                    staffEmail: staff.email,
                    avatar: staff.avatar,
                    date: targetDateStr,
                    shiftType: shift,
                    startTime,
                    endTime,
                    dutyRole,
                    notes,
                });
            }
        });

        const updated = Array.from(newFutureMap.values());
        setCallCenterFutureSchedules(updated);
        localStorage.setItem('staff_callcenter_future_schedules', JSON.stringify(updated));
    };

    const handleDownloadCSV = () => {
        let scheduleLabel = 'Admin';
        if (tabValue === 0) {
            if (ccSubTab === 0) scheduleLabel = 'Call_Center_Main';
            else if (ccSubTab === 1) scheduleLabel = 'Call_Center_Future_Planning';
            else scheduleLabel = 'Call_Center_Temporarily_Customized';
        }
        const headers = ['E NO', 'Staff Name', 'Section', 'Schedule Type', 'Date', 'Day', 'Shift Type', 'Start Time', 'End Time', 'Duty Role', 'Notes', 'Customized'];
        const weekDateStrs = new Set(weekDays.map((w) => w.dateStr));
        const currentStaffENos = new Set(currentSectionStaff.map((s) => s.eNo.toLowerCase()));

        const entriesInWeek: ScheduleEntry[] = [];
        currentSectionStaff.forEach((staff) => {
            const cleanENo = staff.eNo.toLowerCase();
            weekDays.forEach((day) => {
                const entry = scheduleMap.get(`${cleanENo}_${day.dateStr}`);
                if (entry) {
                    entriesInWeek.push(entry);
                }
            });
        });

        entriesInWeek.sort((a, b) => {
            const cleanA = (a.eNo || '').toLowerCase().trim();
            const cleanB = (b.eNo || '').toLowerCase().trim();
            const orderA = ROSTER_ORDER[cleanA] ?? 999;
            const orderB = ROSTER_ORDER[cleanB] ?? 999;
            if (orderA !== orderB) return orderA - orderB;
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
                `"${tabValue === 0 ? 'Call Center' : 'Admin'}"`,
                `"${tabValue === 0 ? (ccSubTab === 0 ? 'Main Schedule' : ccSubTab === 1 ? 'Future Planning' : 'Temporarily Customized') : 'Office'}"`,
                `"${e.date}"`,
                `"${dayName}"`,
                `"${e.shiftType}"`,
                `"${e.startTime}"`,
                `"${e.endTime}"`,
                `"${e.dutyRole || ''}"`,
                `"${e.notes || ''}"`,
                `"${e.isCustomized ? 'Yes' : 'No'}"`,
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
                            HR duty roster: manage live working shifts and plan future employee schedules.
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
                        {tabValue === 0 && ccSubTab === 1 ? (
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSavePlanningSchedule}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.35)',
                                }}
                            >
                                Save Schedule
                            </Button>
                        ) : !(tabValue === 0 && ccSubTab === 2) ? (
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
                        ) : null}
                    </Box>
                </Box>
            </Box>

            {/* Quick Metrics */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    {
                        label: tabValue === 0
                            ? (ccSubTab === 2 ? 'Customized Call Center Staff' : ccSubTab === 1 ? 'Planning Call Center Staff' : 'Call Center Staff')
                            : 'Admin Staff',
                        value: currentSectionStaff.length,
                        color: tabValue === 0 && ccSubTab === 2 ? '#d97706' : tabValue === 0 && ccSubTab === 1 ? '#6366f1' : '#3b82f6',
                        icon: <PeopleIcon />,
                    },
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

            {/* Main Schedule View Tabs: Call Center vs Admin */}
            <Paper
                elevation={0}
                sx={{
                    mb: tabValue === 0 ? 2 : 3,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={(_, v) => {
                        setTabValue(v);
                        setSearchQuery('');
                    }}
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
                    <Tab
                        icon={<SupportAgentIcon sx={{ fontSize: 20, mr: 1 }} />}
                        iconPosition="start"
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>Call Center Schedule</span>
                                <Chip
                                    label={callCenterStaff.length}
                                    size="small"
                                    color={tabValue === 0 ? 'primary' : 'default'}
                                    sx={{ height: 20, fontSize: '0.75rem', fontWeight: 700 }}
                                />
                            </Box>
                        }
                    />
                    <Tab
                        icon={<AdminIcon sx={{ fontSize: 20, mr: 1 }} />}
                        iconPosition="start"
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>Admin Schedule</span>
                                <Chip
                                    label={adminStaff.length}
                                    size="small"
                                    color={tabValue === 1 ? 'primary' : 'default'}
                                    sx={{ height: 20, fontSize: '0.75rem', fontWeight: 700 }}
                                />
                            </Box>
                        }
                    />
                </Tabs>
            </Paper>

            {/* Call Center Sub-Tabs: Main Schedule vs Future Week Planning */}
            {tabValue === 0 && (
                <Box sx={{ mb: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 0.6,
                            display: 'inline-flex',
                            alignSelf: 'flex-start',
                            borderRadius: 2.5,
                            bgcolor: mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Tabs
                            value={ccSubTab}
                            onChange={(_, val) => setCcSubTab(val)}
                            sx={{
                                minHeight: 42,
                                '& .MuiTabs-indicator': {
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: mode === 'light' ? '#ffffff' : 'rgba(255,255,255,0.16)',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                                    zIndex: 0,
                                },
                                '& .MuiTab-root': {
                                    zIndex: 1,
                                    minHeight: 40,
                                    py: 0.5,
                                    px: 2.5,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    borderRadius: 2,
                                    color: 'text.secondary',
                                    '&.Mui-selected': {
                                        color: mode === 'light' ? '#0f172a' : '#f8fafc',
                                    },
                                },
                            }}
                        >
                            <Tab
                                icon={<CheckCircleIcon sx={{ fontSize: 18, mr: 0.75, color: '#10b981' }} />}
                                iconPosition="start"
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>Main Schedule</span>
                                        <Chip
                                            label="Live"
                                            size="small"
                                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#dcfce7', color: '#166534' }}
                                        />
                                    </Box>
                                }
                            />
                            <Tab
                                icon={<EventNoteIcon sx={{ fontSize: 18, mr: 0.75, color: '#6366f1' }} />}
                                iconPosition="start"
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>Future Week Planning</span>
                                        <Chip
                                            label="Planning Draft"
                                            size="small"
                                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#e0e7ff', color: '#3730a3' }}
                                        />
                                    </Box>
                                }
                            />
                            <Tab
                                icon={<TuneIcon sx={{ fontSize: 18, mr: 0.75, color: '#f59e0b' }} />}
                                iconPosition="start"
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>Temporarily Customized Schedules</span>
                                        <Chip
                                            label={totalCustomizedWeeksCount > 0 ? `${totalCustomizedWeeksCount} Weeks` : 'Customized'}
                                            size="small"
                                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#fef3c7', color: '#92400e' }}
                                        />
                                    </Box>
                                }
                            />
                        </Tabs>
                    </Paper>

                    {/* Top Action Bar for Future Week Planning (Drag & Drop + Save) */}
                    {ccSubTab === 1 && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 1.5,
                                px: 2,
                                borderRadius: 2.5,
                                bgcolor: mode === 'light' ? '#f5f3ff' : 'rgba(99, 102, 241, 0.08)',
                                border: '1px solid #ddd6fe',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                <Chip
                                    icon={<SwapHorizIcon sx={{ fontSize: '1.1rem !important', color: '#6d28d9' }} />}
                                    label="Drag & Drop: Exchange shifts and off days between any cells"
                                    size="small"
                                    sx={{
                                        fontWeight: 700,
                                        bgcolor: '#ede9fe',
                                        color: '#5b21b6',
                                        height: 28,
                                        fontSize: '0.78rem',
                                    }}
                                />
                                {planningDraftOverrides.size > 0 && (
                                    <Chip
                                        label={`${planningDraftOverrides.size / 2} change${planningDraftOverrides.size / 2 > 1 ? 's' : ''} ready to save`}
                                        size="small"
                                        color="secondary"
                                        sx={{ fontWeight: 800, height: 24, fontSize: '0.72rem' }}
                                    />
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {planningDraftOverrides.size > 0 && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => setPlanningDraftOverrides(new Map())}
                                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, color: '#6d28d9', borderColor: '#c4b5fd' }}
                                    >
                                        Reset Exchanges
                                    </Button>
                                )}
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSavePlanningSchedule}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        borderRadius: 2,
                                        px: 2.5,
                                        py: 0.8,
                                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                        boxShadow: '0 4px 10px rgba(99, 102, 241, 0.35)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                                        },
                                    }}
                                >
                                    Save Schedule
                                </Button>
                            </Box>
                        </Paper>
                    )}

                    {/* Temporarily Customized Schedules Banner */}
                    {ccSubTab === 2 && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 2.5,
                                bgcolor: mode === 'light' ? '#fffbeb' : 'rgba(245, 158, 11, 0.08)',
                                border: '1px solid #fde68a',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 2,
                                        bgcolor: '#fef3c7',
                                        color: '#b45309',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <TuneIcon fontSize="small" />
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400e' }}>
                                            Temporarily Customized Schedules
                                        </Typography>
                                        <Chip
                                            icon={<VisibilityIcon sx={{ fontSize: '0.85rem !important' }} />}
                                            label="View Only"
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.68rem',
                                                fontWeight: 800,
                                                bgcolor: '#fde68a',
                                                color: '#78350f',
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#b45309', display: 'block' }}>
                                        View-only schedule inspection for upcoming weeks. Select any week below to inspect its customized roster. <b>The Main Schedule is always protected.</b>
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                <FormControl size="small" sx={{ minWidth: 280, bgcolor: 'background.paper', borderRadius: 2 }}>
                                    <InputLabel id="custom-week-select-label" sx={{ fontWeight: 600 }}>Select Week</InputLabel>
                                    <Select
                                        labelId="custom-week-select-label"
                                        value={formatDateYMD(customizedMonday)}
                                        label="Select Week"
                                        onChange={(e) => {
                                            const newMon = new Date(e.target.value + 'T00:00:00');
                                            setCustomizedMonday(newMon);
                                        }}
                                        sx={{ fontWeight: 700, borderRadius: 2 }}
                                    >
                                        {availableWeeks.map((wk) => (
                                            <MenuItem key={wk.mondayStr} value={wk.mondayStr}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1.5 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                        {wk.label}
                                                    </Typography>
                                                    {wk.customizedCount > 0 ? (
                                                        <Chip
                                                            label={`${wk.customizedCount} customized`}
                                                            size="small"
                                                            color="secondary"
                                                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                                                        />
                                                    ) : (
                                                        <Chip
                                                            label="Baseline"
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ height: 18, fontSize: '0.65rem', color: 'text.secondary' }}
                                                        />
                                                    )}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Paper>
                    )}
                </Box>
            )}

            {/* Week Controls & Search Toolbar */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: tabValue === 0 && ccSubTab === 0 ? 'flex-end' : 'space-between',
                    alignItems: 'center',
                    mb: 2.5,
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                {!(tabValue === 0 && ccSubTab === 0) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <IconButton
                            onClick={handlePrevWeek}
                            size="small"
                            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
                            title="Previous Week"
                        >
                            <PrevIcon fontSize="small" />
                        </IconButton>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<TodayIcon fontSize="small" />}
                            onClick={handleTodayWeek}
                            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                        >
                            {tabValue === 0 && (ccSubTab === 1 || ccSubTab === 2) ? 'Next Week' : 'Current Week'}
                        </Button>
                        <IconButton
                            onClick={handleNextWeek}
                            size="small"
                            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
                            title="Next Week"
                        >
                            <NextIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ fontWeight: 700, ml: 1, color: 'text.primary' }}>
                            {weekDays[0].displayDate} – {weekDays[6].displayDate}, {weekDays[0].dateObj.getFullYear()}
                        </Typography>
                        <Chip
                            label={
                                tabValue === 0
                                    ? (ccSubTab === 1
                                        ? 'Call Center Future Planning Draft'
                                        : ccSubTab === 2
                                        ? 'Call Center Temporarily Customized'
                                        : 'Call Center Live Roster (24/7 Coverage)')
                                    : 'Admin Operations Roster (Office Hours)'
                            }
                            size="small"
                            variant="outlined"
                            color={tabValue === 0 ? (ccSubTab === 2 ? 'warning' : ccSubTab === 1 ? 'secondary' : 'primary') : 'default'}
                            sx={{ fontWeight: 600, ml: 1 }}
                        />
                    </Box>
                )}

                <TextField
                    size="small"
                    placeholder={`Search ${tabValue === 0 ? 'Call Center' : 'Admin'} staff by name or E NO...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ minWidth: { xs: '100%', sm: 300 } }}
                />
            </Box>

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
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                                                {day.displayDate}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayedStaff.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                            No {tabValue === 0 ? 'call center' : 'admin'} staff members found{searchQuery ? ` matching "${searchQuery}"` : ''}.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    displayedStaff.map((staff) => (
                                        <TableRow key={`schedule_row_${staff.eNo}_${staff.name}`} hover sx={{ '& td': { borderColor: 'divider' } }}>
                                            <TableCell>
                                                <Chip
                                                    label={staff.eNo}
                                                    size="small"
                                                    sx={{ fontWeight: 700, bgcolor: '#f1f5f9', color: '#1e293b' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: tabValue === 0 ? (ccSubTab === 1 ? '#6366f1' : '#3b82f6') : '#8b5cf6' }}>
                                                        {staff.name.charAt(0).toUpperCase()}
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
                                                const cellKey = `${staff.eNo.toLowerCase()}_${day.dateStr}`;
                                                const entry = scheduleMap.get(cellKey);
                                                const shift = entry?.shiftType || 'Off';
                                                const template = SHIFT_TEMPLATES[shift] || SHIFT_TEMPLATES.Off;
                                                const isViewOnlyTab = tabValue === 0 && ccSubTab === 2;
                                                const isPlanningTab = tabValue === 0 && ccSubTab === 1;
                                                const isBeingDragged = draggedCellKey === cellKey;
                                                const isDragTarget = dragOverCellKey === cellKey;

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
                                                            draggable={isPlanningTab}
                                                            onDragStart={(e) => {
                                                                if (!isPlanningTab) return;
                                                                setDraggedCellKey(cellKey);
                                                                e.dataTransfer.setData('text/plain', cellKey);
                                                                e.dataTransfer.effectAllowed = 'move';
                                                            }}
                                                            onDragOver={(e) => {
                                                                if (!isPlanningTab) return;
                                                                e.preventDefault();
                                                                e.dataTransfer.dropEffect = 'move';
                                                            }}
                                                            onDragEnter={(e) => {
                                                                if (!isPlanningTab) return;
                                                                e.preventDefault();
                                                                if (cellKey !== draggedCellKey) {
                                                                    setDragOverCellKey(cellKey);
                                                                }
                                                            }}
                                                            onDragLeave={(e) => {
                                                                if (!isPlanningTab) return;
                                                                if (dragOverCellKey === cellKey) {
                                                                    setDragOverCellKey(null);
                                                                }
                                                            }}
                                                            onDrop={(e) => {
                                                                if (!isPlanningTab) return;
                                                                e.preventDefault();
                                                                const sourceKey = e.dataTransfer.getData('text/plain') || draggedCellKey;
                                                                if (sourceKey && sourceKey !== cellKey) {
                                                                    handleExchangeShifts(sourceKey, cellKey);
                                                                }
                                                                setDraggedCellKey(null);
                                                                setDragOverCellKey(null);
                                                            }}
                                                            onDragEnd={() => {
                                                                setDraggedCellKey(null);
                                                                setDragOverCellKey(null);
                                                            }}
                                                            onClick={isViewOnlyTab ? undefined : () => (entry ? handleOpenEditDialog(entry) : handleOpenCreateDialog(staff, day.dateStr))}
                                                            title={isPlanningTab ? "Drag to exchange shift or off-day with any other cell" : undefined}
                                                            sx={{
                                                                cursor: isViewOnlyTab ? 'default' : isPlanningTab ? 'grab' : 'pointer',
                                                                '&:active': {
                                                                    cursor: isPlanningTab ? 'grabbing' : undefined,
                                                                },
                                                                borderRadius: 1.5,
                                                                p: 0.8,
                                                                minHeight: 46,
                                                                position: 'relative',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                backgroundColor: isDragTarget ? 'rgba(99, 102, 241, 0.15)' : template.bg,
                                                                border: isDragTarget
                                                                    ? '2px dashed #6366f1'
                                                                    : isBeingDragged
                                                                    ? '2px dashed #a5b4fc'
                                                                    : `1px solid ${template.border}`,
                                                                opacity: isBeingDragged ? 0.35 : 1,
                                                                transform: isDragTarget ? 'scale(1.05)' : undefined,
                                                                boxShadow: isDragTarget ? '0 0 12px rgba(99, 102, 241, 0.45)' : undefined,
                                                                transition: 'all 0.15s ease',
                                                                ...(!isViewOnlyTab && {
                                                                    '&:hover': {
                                                                        transform: isDragTarget ? 'scale(1.05)' : 'translateY(-2px)',
                                                                        boxShadow: isDragTarget ? '0 0 12px rgba(99, 102, 241, 0.45)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                                    },
                                                                }),
                                                            }}
                                                        >
                                                            {shift === 'Off' ? (
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{ fontWeight: 800, color: template.color, fontSize: '0.8rem', letterSpacing: 0.5 }}
                                                                >
                                                                    Off
                                                                </Typography>
                                                            ) : (
                                                                <>
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{ fontWeight: 800, color: template.color, display: 'block', fontSize: '0.72rem', lineHeight: 1.2 }}
                                                                    >
                                                                        {template.label}
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            fontSize: '0.72rem',
                                                                            fontWeight: 700,
                                                                            color: template.color,
                                                                            opacity: 0.95,
                                                                            display: 'block',
                                                                            mt: 0.25,
                                                                        }}
                                                                    >
                                                                        {formatShiftTimeDisplay(entry?.startTime, entry?.endTime, entry?.notes)}
                                                                    </Typography>
                                                                </>
                                                            )}
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
                    {selectedEntry
                        ? (tabValue === 0
                            ? (ccSubTab === 2 ? 'Edit Temporarily Customized Shift' : ccSubTab === 1 ? 'Edit Planning Shift' : 'Edit Shift Assignment')
                            : 'Edit Admin Shift')
                        : (tabValue === 0
                            ? (ccSubTab === 2 ? 'Assign Temporary Customization' : ccSubTab === 1 ? 'Assign Future Planning Shift' : 'Assign Call Center Shift')
                            : 'Assign Admin Shift')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {tabValue === 0 && (ccSubTab === 1 || ccSubTab === 2) && (
                            <Chip
                                label={ccSubTab === 2 ? "Temporarily Customized Shift - Isolated from Main Schedule" : "Planning Draft Mode - Isolated from Main Schedule"}
                                size="small"
                                color={ccSubTab === 2 ? "warning" : "secondary"}
                                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                            />
                        )}

                        <FormControl fullWidth size="small">
                            <InputLabel>Staff Member (E NO)</InputLabel>
                            <Select
                                value={formStaffENo}
                                label="Staff Member (E NO)"
                                onChange={(e) => setFormStaffENo(e.target.value)}
                            >
                                {currentSectionStaff.map((s) => (
                                    <MenuItem key={`${s.eNo}_${s.name}`} value={s.eNo}>
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
                                <MenuItem value="Morning">Morning Shift (06:00 AM - 03:00 PM)</MenuItem>
                                <MenuItem value="Evening">Evening Shift (10:00 AM - 10:00 PM)</MenuItem>
                                <MenuItem value="FullDay">Full Day Shift (07:00 AM - 10:00 PM)</MenuItem>
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
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            {(tabValue === 0 && (ccSubTab === 1 || ccSubTab === 2) && selectedEntry.isCustomized) ? 'Revert to Main Schedule' : 'Delete'}
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
                                background: tabValue === 0 && ccSubTab === 2
                                    ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                                    : tabValue === 0 && ccSubTab === 1
                                    ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            }}
                        >
                            {tabValue === 0 ? (ccSubTab === 2 ? 'Save Customization' : ccSubTab === 1 ? 'Save Planning Shift' : 'Save Shift') : 'Save Shift'}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

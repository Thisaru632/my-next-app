'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import RouteViewer from '@/components/RouteViewer';
import { useTheme } from '@mui/material/styles';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Tooltip,
  Snackbar,
  Popover,
} from '@mui/material';
import { API_ENDPOINTS } from '@/config/api';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationOnIcon,
  DirectionsCar as DirectionsCarIcon,
  People as PeopleIcon,
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Cancel as CancelIcon,
  PhoneMissed as PhoneMissedIcon,
  Send as SendIcon,
  AssignmentInd as AssignmentIcon,
  TableChart as TableChartIcon,
  Map as MapIcon,
  Delete as DeleteIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';

// Types
interface Lead {
  id: string;
  leadDate: string;
  fromLocation: string;
  toLocation: string;
  destinations?: string[];
  status: string;       // display status
  rawStatus: string;    // raw backend status (for contacts: new / read / responded)
  employeeName: string;
  formType: string;
  source: string;
  customerName: string;
  tourDate: string;
  numberOfPassengers: number;
  numberOfDays?: number;
  vehicleName: string;
  message?: string;
  customerPhone?: string;
  customerEmail?: string;
  customId?: string;
  isViewed?: boolean;
  matchedPackage?: any;
  remark?: string;
  additionalPhones?: string[];
  customerRemark?: string;
  staffRemark?: string;
  promoCode?: string;
  discount?: number;
  routeDistance?: number;
  routeDuration?: number;
  additionalHours?: number;
  totalPrice?: number;
  provinceAdjustment?: number;
  seasonalAdjustment?: number;
  discountPercentage?: number;
  nightSurcharge?: number;
}

// Mock data
// Mock data removed in favor of API fetching

// Helper function to format date
const formatDate = (dateString: string, includeTime = false, isUtc = false): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const month = isUtc ? date.getUTCMonth() : date.getMonth();
  const day = isUtc ? date.getUTCDate() : date.getDate();
  const year = isUtc ? date.getUTCFullYear() : date.getFullYear();
  
  const base = `${months[month]} ${day}, ${year}`;
  if (!includeTime) return base;
  
  let hours = isUtc ? date.getUTCHours() : date.getHours();
  const minutes = (isUtc ? date.getUTCMinutes() : date.getMinutes()).toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${base} | ${hours}:${minutes} ${ampm}`;
};

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Confirmed':
    case 'responded':
      return { color: '#10b981', bgColor: '#d1fae5', label: status === 'responded' ? 'Responded' : 'Confirmed', IconComponent: CheckCircleIcon };
    case 'Pending':
      return { color: '#f59e0b', bgColor: '#fef3c7', label: 'Pending', IconComponent: HourglassEmptyIcon };
    case 'Sent Inquiry':
      return { color: '#8b5cf6', bgColor: '#ede9fe', label: 'Sent Inquiry', IconComponent: SendIcon };
    case 'new':
      return { color: '#3b82f6', bgColor: '#dbeafe', label: 'New', IconComponent: HourglassEmptyIcon };
    case 'read':
      return { color: '#0ea5e9', bgColor: '#e0f2fe', label: 'Read', IconComponent: CheckCircleIcon };
    case 'Rejected':
    case 'Cancelled':
    case 'archived':
      return { color: '#ef4444', bgColor: '#fee2e2', label: status === 'archived' ? 'Archived' : status, IconComponent: CancelIcon };
    case 'Not Contacted':
      return { color: '#6366f1', bgColor: '#e0e7ff', label: 'Not Contacted', IconComponent: PhoneMissedIcon };
    case 'Ignored':
      return { color: '#64748b', bgColor: '#f1f5f9', label: 'Ignored', IconComponent: CloseIcon };
    default:
      return { color: '#64748b', bgColor: '#f1f5f9', label: status, IconComponent: HourglassEmptyIcon };
  }
};

// Helper: is this a contact-based lead (Complaint / General Inquiry / Feedback)
const isContactLead = (lead: Lead | null) =>
  lead?.source === 'Contact Us';

const LeadInfoPage: React.FC = () => {
  const theme = useTheme();
  const { mode } = useThemeContext();
  const [routePopoverAnchor, setRoutePopoverAnchor] = useState<HTMLButtonElement | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [formTypeFilter, setFormTypeFilter] = useState<string>('All');
  const [employeeFilter, setEmployeeFilter] = useState<string>('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [viewMapLead, setViewMapLead] = useState<Lead | null>(null);
  const [openRouteViewer, setOpenRouteViewer] = useState(false);
  const [staffRemark, setStaffRemark] = useState<string>('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const searchParams = useSearchParams();
  const urlStatus = searchParams.get('status');

  useEffect(() => {
    const userStr = localStorage.getItem('staffUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing staff user:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (urlStatus && ['All', 'Confirmed', 'Pending', 'Sent Inquiry', 'Rejected', 'Cancelled', 'Ignored'].includes(urlStatus)) {
      setStatusFilter(urlStatus);
    }
  }, [urlStatus]);

  // Derive unique form types (Source) from leads for dropdown options
  const formTypeOptions = useMemo(() => {
    const types = Array.from(new Set(leads.map((lead) => lead.source).filter(Boolean)));
    return ['All', ...types];
  }, [leads]);

  // Derive unique employee names for filtering
  const employeeOptions = useMemo(() => {
    const names = Array.from(new Set(leads.map((lead) => lead.employeeName).filter(Boolean)));
    return ['All', 'Not Assigned', ...names];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    let filtered = leads;

    // Role-based visibility: Super admins/admins see all. 
    // Regular staff only see unassigned (new) leads and their own leads.
    if (currentUser && currentUser.role !== 'superadmin' && currentUser.role !== 'admin') {
      filtered = filtered.filter(
        (lead) => !lead.employeeName || lead.employeeName === (currentUser.fullName || currentUser.username)
      );
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (lead) =>
          (lead.id?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (lead.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (lead.fromLocation?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (lead.toLocation?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (lead.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }

    // Source (Form Type) filter
    if (formTypeFilter !== 'All') {
      filtered = filtered.filter((lead) => lead.source === formTypeFilter);
    }

    // Employee filter
    if (employeeFilter !== 'All') {
      if (employeeFilter === 'Not Assigned') {
        filtered = filtered.filter((lead) => !lead.employeeName);
      } else {
        filtered = filtered.filter((lead) => lead.employeeName === employeeFilter);
      }
    }

    // Tab filter
    const promoPageCodes = ['SENUWAGON', 'SENUALTO', 'SENUKDH', 'SENUBUS'];
    if (activeTab === 0) {
      filtered = filtered.filter(lead => 
        lead.source === 'Online Booking' && 
        (!lead.promoCode || !promoPageCodes.includes(lead.promoCode.toUpperCase()))
      );
    } else if (activeTab === 1) {
      filtered = filtered.filter(lead => 
        lead.source === 'Online Booking' && 
        lead.promoCode && 
        promoPageCodes.includes(lead.promoCode.toUpperCase())
      );
    } else if (activeTab === 2) {
      filtered = filtered.filter(lead => lead.formType === 'Complaint');
    } else if (activeTab === 3) {
      filtered = filtered.filter(lead => lead.formType === 'General Inquiry' || lead.formType === 'General Enquiry');
    } else if (activeTab === 4) {
      filtered = filtered.filter(lead => lead.formType === 'Feedback');
    }

    return filtered;
  }, [searchQuery, statusFilter, formTypeFilter, employeeFilter, leads, activeTab]);

  // Identify duplicate leads
  const duplicateLeadsIds = useMemo(() => {
    const ids = new Set<string>();
    const emailMap = new Map<string, string[]>();
    const phoneMap = new Map<string, string[]>();

    leads.forEach(l => {
      if (l.customerEmail && l.customerEmail !== 'N/A') {
        const email = l.customerEmail.toLowerCase().trim();
        if (!emailMap.has(email)) emailMap.set(email, []);
        emailMap.get(email)!.push(l.id);
      }
      if (l.customerPhone && l.customerPhone !== 'N/A') {
        const phone = l.customerPhone.replace(/[\s\-\(\)]/g, '');
        if (phone) {
          if (!phoneMap.has(phone)) phoneMap.set(phone, []);
          phoneMap.get(phone)!.push(l.id);
        }
      }
    });

    emailMap.forEach(idsList => {
      if (idsList.length > 1) idsList.forEach(id => ids.add(id));
    });
    phoneMap.forEach(idsList => {
      if (idsList.length > 1) idsList.forEach(id => ids.add(id));
    });

    return ids;
  }, [leads]);

  const isSuperAdmin = currentUser?.role === 'superadmin';

  // Load leads data
  useEffect(() => {
    // Mark all as read when visiting this page
    async function markAllRead() {
      try {
        await fetch(`${API_ENDPOINTS.AUTH}/notifications/mark-all-read`, { method: 'POST' });
      } catch (e) {
        console.error('Error marking all notifications as read:', e);
      }
    }

    async function fetchLeads() {
      try {
        const [bookingsRes, contactsRes] = await Promise.all([
          fetch(API_ENDPOINTS.BOOKINGS),
          fetch(API_ENDPOINTS.CONTACTS)
        ]);

        markAllRead(); // Call this immediately on page load

        let allLeads: Lead[] = [];

        if (bookingsRes.ok) {
          try {
            const bookingsData = await bookingsRes.json();
            console.log('[LEADS] Fetched raw bookings:', bookingsData.length, 'bookings');
            if (bookingsData.length > 0) {
              console.log('[LEADS] Sample booking promo:', bookingsData[0].promoCode, 'discount:', bookingsData[0].discount);
            }
            const mappedBookings = bookingsData.map((booking: any) => ({
              id: booking._id,
              leadDate: booking.createdAt,
              fromLocation: booking.pickupLocation || 'N/A',
              toLocation: booking.dropoffLocation || 'N/A',
              status: booking.status || 'Pending',
              rawStatus: booking.status || 'Pending',
              employeeName: booking.employeeName || '',
              formType: booking.tripType || 'Standard',
              source: 'Online Booking',
              customerName: booking.name,
              tourDate: booking.dateTime,
              numberOfPassengers: booking.maxPersons || 0,
              numberOfDays: booking.numberOfDays || (booking.tripType === 'Drop' ? 0 : 1),
              vehicleName: booking.vehicleName || 'N/A',
              message: booking.message,
              customerPhone: booking.telephone,
              customerEmail: booking.email,
              customId: booking.customId,
              isViewed: booking.isViewed || false,
              destinations: booking.destinations || [],
              matchedPackage: booking.matchedPackage || null,
              remark: booking.staffRemark || '',
              staffRemark: booking.staffRemark || '',
              customerRemark: booking.remark || '',
              additionalPhones: booking.additionalPhones || [],
              promoCode: booking.promoCode || '',
              discount: booking.discount || 0,
              routeDistance: booking.routeDistance || 0,
              routeDuration: booking.routeDuration || 0,
              additionalHours: booking.additionalHours || 0,
              totalPrice: booking.totalPrice || 0,
              provinceAdjustment: booking.provinceAdjustment || 0,
              seasonalAdjustment: booking.seasonalAdjustment || 0,
              nightSurcharge: booking.nightSurcharge || 0,
              discountPercentage: booking.discountPercentage || 0,
            }));
            allLeads = [...allLeads, ...mappedBookings];
          } catch (e) {
            console.error('Error parsing bookings JSON:', e);
          }
        }

        if (contactsRes.ok) {
          try {
            const contactsData = await contactsRes.json();
            const mappedContacts = (contactsData.contacts || []).map((contact: any) => ({
              id: contact._id,
              leadDate: contact.createdAt,
              fromLocation: 'Contact Form',
              toLocation: contact.reason || 'General Inquiry',
              // Preserve raw backend status for contacts so we can show correct actions
              rawStatus: contact.status || 'new',
              status: contact.status || 'new',
              employeeName: contact.employeeName || '',
              formType: contact.reason || 'General Inquiry',
              source: 'Contact Us',
              customerName: contact.fullName,
              tourDate: contact.preferredTravelDates || contact.createdAt,
              numberOfPassengers: contact.numberOfGuests || 0,
              vehicleName: 'N/A',
              message: contact.message,
              customerPhone: contact.phoneNumber,
              customerEmail: contact.email,
              customId: contact.customId,
              isViewed: contact.status !== 'new',
              staffRemark: contact.staffRemark || '',
              remark: contact.staffRemark || '',
            }));
            allLeads = [...allLeads, ...mappedContacts];
          } catch (e) {
            console.error('Error parsing contacts JSON:', e);
          }
        }

        // Sort by date descending
        allLeads.sort((a, b) =>
          new Date(b.leadDate).getTime() - new Date(a.leadDate).getTime()
        );

        setLeads(allLeads);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Handle lead action
  // For booking leads: action = 'Confirmed' | 'Rejected' | 'Pending' | 'Not Contacted'
  // For contact leads: action = 'new' | 'read' | 'responded' | 'archived'
  const handleLeadAction = async (action: string) => {
    if (!selectedLead) return;
    setActionLoading(true);
    try {
      const endpoint = selectedLead.source === 'Online Booking'
        ? `${API_ENDPOINTS.BOOKINGS}/${selectedLead.id}/status`
        : `${API_ENDPOINTS.CONTACTS}/${selectedLead.id}/status`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action, remark: staffRemark }),
      });

      if (response.ok) {
        // Update local state — for contacts rawStatus & status both track the backend value
        setLeads(prevLeads => prevLeads.map(l =>
          l.id === selectedLead.id
            ? { ...l, status: action, rawStatus: action, staffRemark: staffRemark, remark: staffRemark }
            : l
        ));
        setStaffRemark(''); // Clear remark after successful update
        handleCloseDialog();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('An error occurred while updating the lead status');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Pick Lead
  const handlePickLead = async (lead: Lead) => {
    if (!currentUser?.username) {
      alert('You must be logged in as a staff member to pick leads.');
      return;
    }

    if (lead.employeeName) {
      if (!confirm(`This lead is already assigned to ${lead.employeeName}. Do you want to re-assign it to yourself?`)) {
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = lead.source === 'Online Booking'
        ? `${API_ENDPOINTS.BOOKINGS}/${lead.id}/pick`
        : `${API_ENDPOINTS.CONTACTS}/${lead.id}/pick`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Assuming auth token might be needed in future
          // 'Authorization': `Bearer ${localStorage.getItem('staffToken')}`
        },
        body: JSON.stringify({ employeeName: currentUser.fullName || currentUser.username }),
      });

      if (response.ok) {
        // Update local state
        setLeads(prevLeads => prevLeads.map(l =>
          l.id === lead.id ? { ...l, employeeName: currentUser.fullName || currentUser.username } : l
        ));
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to pick lead');
      }
    } catch (error) {
      console.error('Error picking lead:', error);
      alert('An error occurred while picking the lead');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = (lead: Lead) => {
    if (!isSuperAdmin) {
      setSnackbarMessage('Only super admins can delete leads.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setLeadToDelete(lead);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    
    setLoading(true);
    try {
      const endpoint = leadToDelete.source === 'Online Booking'
        ? `${API_ENDPOINTS.BOOKINGS}/${leadToDelete.id}`
        : `${API_ENDPOINTS.CONTACTS}/${leadToDelete.id}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLeads(prevLeads => prevLeads.filter(l => l.id !== leadToDelete.id));
        setSnackbarMessage(`Lead ${leadToDelete.customId || leadToDelete.id} deleted successfully.`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        const data = await response.json();
        setSnackbarMessage(data.message || 'Failed to delete lead');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      setSnackbarMessage('An error occurred while deleting the lead');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setLeadToDelete(null);
    }
  };

  // Handle view button click
  const handleViewClick = async (lead: Lead) => {
    setSelectedLead(lead);
    setStaffRemark(lead.staffRemark || '');
    setOpenDialog(true);

    // Mark as viewed in backend
    try {
      const endpoint = lead.source === 'Online Booking'
        ? `${API_ENDPOINTS.BOOKINGS}/${lead.id}/viewed`
        : `${API_ENDPOINTS.CONTACTS}/${lead.id}`; // GET marks contact as read

      const res = await fetch(endpoint, {
        method: lead.source === 'Online Booking' ? 'PATCH' : 'GET'
      });

      if (res.ok) {
        // Update local state to remove the "new" indicator
        setLeads(prevLeads => prevLeads.map(l =>
          l.id === lead.id ? { ...l, isViewed: true, status: (lead.source === 'Contact Us' && lead.status === 'new') ? 'read' : l.status } : l
        ));
      }
    } catch (e) {
      console.error('Error marking lead as viewed:', e);
    }

    // Show message popup if message exists
    if (lead.message) {
      setTimeout(() => {
        setShowMessage(true);
      }, 300);
    }
  };

  const handleViewLeadDirections = (lead: Lead) => {
    setViewMapLead(lead);
    setOpenRouteViewer(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setShowMessage(false);
    setSelectedLead(null);
    setStaffRemark('');
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Shared dropdown sx styles
  const dropdownSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: 'background.default',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: 'background.paper',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
      },
      '&.Mui-focused': {
        backgroundColor: 'background.paper',
        boxShadow: '0 4px 16px rgba(59, 130, 246, 0.25)',
      },
    },
  };

  return (
    <Box sx={{ m: 0, p: 0 }}>
      {/* Page Title */}
      <Box
        sx={{
          mb: 4,
          pb: 2,
          borderBottom: '2px solid',
          borderImage: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
          borderImageSlice: 1,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.5rem', sm: '2rem' },
            background: mode === 'light'
              ? 'linear-gradient(135deg, #1e293b 0%, #475569 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          Lead Information
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: 'background.paper',
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', md: 'center' },
          }}
        >
          {/* Search Field */}
          <Box sx={{ flex: 2, width: '100%' }}>
            <TextField
              fullWidth
              placeholder="Search by Lead ID, Customer, Location, or Employee..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={dropdownSx}
            />
          </Box>

          {/* Status Dropdown */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <FormControl fullWidth sx={dropdownSx}>
              <InputLabel
                sx={{
                  color: '#94a3b8',
                  fontWeight: 600,
                  '&.Mui-focused': { color: '#3b82f6' },
                }}
              >
                Status
              </InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'background.default',
                  fontWeight: 600,
                  color: 'text.primary',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#94a3b8',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b82f6',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                      mt: 0.5,
                    },
                  },
                }}
              >
                {(activeTab === 0 || activeTab === 1
                  ? ['All', 'Confirmed', 'Pending', 'Sent Inquiry', 'Rejected', 'Cancelled']
                  : ['All', 'new', 'read', 'responded', 'archived']
                ).map(
                  (status) => (
                    <MenuItem
                      key={status}
                      value={status}
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        borderRadius: '8px',
                        mx: 0.5,
                        my: 0.25,
                        '&.Mui-selected': {
                          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                          color: '#2563eb',
                        },
                        '&:hover': {
                          background: 'action.hover',
                        },
                      }}
                    >
                      {status === 'new' ? 'New' :
                        status === 'read' ? 'Read' :
                          status === 'responded' ? 'Responded' :
                            status === 'archived' ? 'Archived' :
                              status}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Box>

          {/* Form Type Dropdown */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <FormControl fullWidth sx={dropdownSx}>
              <InputLabel
                sx={{
                  color: '#94a3b8',
                  fontWeight: 600,
                  '&.Mui-focused': { color: '#3b82f6' },
                }}
              >
                Form Type
              </InputLabel>
              <Select
                value={formTypeFilter}
                label="Form Type"
                onChange={(e) => {
                  setFormTypeFilter(e.target.value);
                  setPage(0);
                }}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'background.default',
                  fontWeight: 600,
                  color: 'text.primary',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#94a3b8',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b82f6',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                      mt: 0.5,
                    },
                  },
                }}
              >
                {formTypeOptions.map((type) => (
                  <MenuItem
                    key={type}
                    value={type}
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderRadius: '8px',
                      mx: 0.5,
                      my: 0.25,
                      '&.Mui-selected': {
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        color: '#2563eb',
                      },
                      '&:hover': {
                        background: '#f1f5f9',
                      },
                    }}
                  >
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Employee Filter Dropdown */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <FormControl fullWidth sx={dropdownSx}>
              <InputLabel
                sx={{
                  color: '#94a3b8',
                  fontWeight: 600,
                  '&.Mui-focused': { color: '#3b82f6' },
                }}
              >
                Followed By
              </InputLabel>
              <Select
                value={employeeFilter}
                label="Followed By"
                onChange={(e) => {
                  setEmployeeFilter(e.target.value);
                  setPage(0);
                }}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'background.default',
                  fontWeight: 600,
                  color: 'text.primary',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#94a3b8',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b82f6',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                      mt: 0.5,
                    },
                  },
                }}
              >
                {employeeOptions.map((name) => (
                  <MenuItem
                    key={name}
                    value={name}
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderRadius: '8px',
                      mx: 0.5,
                      my: 0.25,
                      '&.Mui-selected': {
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        color: '#2563eb',
                      },
                      '&:hover': {
                        background: '#f1f5f9',
                      },
                    }}
                  >
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Tabs Section */}
      <Box
        sx={{
          mb: 3,
          background: 'background.paper',
          borderRadius: '16px',
          p: 1,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            setPage(0);
            setStatusFilter('All');
            setEmployeeFilter('All');
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              height: 4,
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
            },
            '& .MuiTab-root': {
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.9375rem',
              minWidth: 140,
              minHeight: '60px',
              transition: 'all 0.2s ease',
              borderRadius: '8px',
              margin: '0 4px',
              '&:hover': {
                backgroundColor: 'action.hover',
                color: 'primary.main',
              },
              '& .MuiSvgIcon-root': {
                marginBottom: '4px !important',
              }
            },
          }}
        >
          <Tab icon={<AssignmentIcon />} label="Booking Leads" />
          <Tab icon={<LocalOfferIcon sx={{ color: activeTab === 1 ? '#f59e0b' : 'inherit' }} />} label="Promotions" />
          <Tab icon={<CancelIcon sx={{ color: activeTab === 2 ? '#ef4444' : 'inherit' }} />} label="Complaints" />
          <Tab icon={<MessageIcon sx={{ color: activeTab === 3 ? '#8b5cf6' : 'inherit' }} />} label="General Inquiries" />
          <Tab icon={<CheckCircleIcon sx={{ color: activeTab === 4 ? '#10b981' : 'inherit' }} />} label="Feedback" />
        </Tabs>
      </Box>

      {/* Leads Table */}
      <Paper
        sx={{
          background: 'background.paper',
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
            sx={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CircularProgress size={60} sx={{ color: '#3b82f6' }} />
          </Box>
        ) : (
          <>
            <TableContainer sx={{
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
              <Table sx={{ minWidth: 1000 }}>
                <TableHead>
                  <TableRow>
                    {/* Shared header cell sx */}
                    {(activeTab === 1
                      ? ['Lead No', 'Promotion Type', 'Name', 'Phone Number', 'Status', 'Action']
                      : [
                          'Lead ID',
                          'Lead Date & Time',
                          ...(activeTab === 0 ? ['From → To'] : []),
                          'Status',
                          'Employee',
                          'Type',
                          'Form Type',
                          'Action',
                        ]
                    ).map((header, idx) => (
                      <TableCell
                        key={header}
                        align={header === 'Action' ? 'center' : 'left'}
                        sx={{
                          background: mode === 'light'
                            ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                            : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: 'text.secondary',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '2px solid',
                          borderColor: 'divider',
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLeads
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((lead, index) => {
                      const statusStyle = getStatusColor(lead.status);
                      if (activeTab === 1) {
                        return (
                          <TableRow
                            key={lead.id}
                            sx={{
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: mode === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.02)',
                                transform: 'scale(1.001)',
                              },
                              '&:not(:last-child)': {
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                              },
                            }}
                          >
                            {/* Lead ID */}
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {!lead.isViewed && (
                                  <Tooltip title="New Lead">
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: '#ef4444',
                                        boxShadow: '0 0 8px #ef4444',
                                        flexShrink: 0
                                      }}
                                    />
                                  </Tooltip>
                                )}
                                {duplicateLeadsIds.has(lead.id) && (
                                  <Tooltip title="Potential Duplicate Lead">
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: '#f59e0b',
                                        boxShadow: '0 0 8px #f59e0b',
                                        flexShrink: 0
                                      }}
                                    />
                                  </Tooltip>
                                )}
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    color: '#3b82f6',
                                    fontSize: '0.9375rem',
                                  }}
                                >
                                  {lead.customId || lead.id}
                                </Typography>
                              </Box>
                            </TableCell>

                            {/* Promotion Type */}
                            <TableCell>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={{ fontSize: '0.9375rem', color: 'text.primary', fontWeight: 600 }}>
                                  {lead.vehicleName || 'N/A'}
                                </Typography>
                                {lead.promoCode && (
                                  <Chip
                                    label={lead.promoCode}
                                    size="small"
                                    sx={{
                                      alignSelf: 'flex-start',
                                      height: '18px',
                                      fontSize: '0.65rem',
                                      fontWeight: 800,
                                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                      color: '#92400e',
                                      border: '1px solid #f59e0b',
                                      '& .MuiChip-label': { px: 1 }
                                    }}
                                  />
                                )}
                              </Box>
                            </TableCell>

                            {/* Name */}
                            <TableCell>
                              <Typography sx={{ fontSize: '0.9375rem', color: 'text.primary', fontWeight: 600 }}>
                                {lead.customerName || 'N/A'}
                              </Typography>
                            </TableCell>

                            {/* Phone Number */}
                            <TableCell>
                              <Typography sx={{ fontSize: '0.9375rem', color: 'text.primary', fontWeight: 600 }}>
                                {lead.customerPhone || 'N/A'}
                              </Typography>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              <Chip
                                icon={<statusStyle.IconComponent sx={{ fontSize: 16 }} />}
                                label={statusStyle.label || lead.status}
                                sx={{
                                  background: `linear-gradient(135deg, ${statusStyle.bgColor} 0%, ${statusStyle.bgColor}cc 100%)`,
                                  color: statusStyle.color,
                                  fontWeight: 600,
                                  fontSize: '0.8125rem',
                                  borderRadius: '8px',
                                  height: '28px',
                                  '& .MuiChip-icon': {
                                    color: statusStyle.color,
                                  },
                                }}
                              />
                            </TableCell>

                            {/* Action */}
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                <IconButton
                                  onClick={() => handleViewClick(lead)}
                                  title="View Details"
                                  sx={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    color: '#ffffff',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                                    },
                                  }}
                                >
                                  <VisibilityIcon sx={{ fontSize: 20 }} />
                                </IconButton>

                                <IconButton
                                  onClick={() => handlePickLead(lead)}
                                  title={lead.employeeName ? `Already assigned to ${lead.employeeName}` : 'Pick Lead'}
                                  disabled={!!lead.employeeName}
                                  sx={{
                                    background: lead.employeeName
                                      ? (mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)')
                                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: lead.employeeName ? 'text.disabled' : '#ffffff',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    transition: 'all 0.3s ease',
                                    cursor: lead.employeeName ? 'not-allowed' : 'pointer',
                                    '&:hover': {
                                      background: lead.employeeName
                                        ? (mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)')
                                        : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                      transform: lead.employeeName ? 'none' : 'translateY(-2px)',
                                      boxShadow: lead.employeeName ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.4)',
                                    },
                                    '&.Mui-disabled': {
                                      background: mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)',
                                      color: 'text.disabled',
                                    },
                                  }}
                                >
                                  <AssignmentIcon sx={{ fontSize: 20 }} />
                                </IconButton>

                                {isSuperAdmin && (
                                  <IconButton
                                    onClick={() => handleDeleteLead(lead)}
                                    title="Delete Lead"
                                    sx={{
                                      background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                                      color: '#ffffff',
                                      borderRadius: '10px',
                                      padding: '8px',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                                      },
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 20 }} />
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return (
                        <TableRow
                          key={lead.id}
                          sx={{
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: mode === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.02)',
                              transform: 'scale(1.001)',
                            },
                            '&:not(:last-child)': {
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                            },
                          }}
                        >
                          {/* Lead ID */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {!lead.isViewed && (
                                <Tooltip title="New Lead">
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      backgroundColor: '#ef4444',
                                      boxShadow: '0 0 8px #ef4444',
                                      flexShrink: 0
                                    }}
                                  />
                                </Tooltip>
                              )}
                              {duplicateLeadsIds.has(lead.id) && (
                                <Tooltip title="Potential Duplicate Lead">
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      backgroundColor: '#f59e0b',
                                      boxShadow: '0 0 8px #f59e0b',
                                      flexShrink: 0
                                    }}
                                  />
                                </Tooltip>
                              )}
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  color: '#3b82f6',
                                  fontSize: '0.9375rem',
                                }}
                              >
                                {lead.customId || lead.id}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Lead Date */}
                          <TableCell>
                            <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', fontWeight: 500 }}>
                              {formatDate(lead.leadDate, true)}
                            </Typography>
                          </TableCell>

                          {/* From → To */}
                          {(activeTab === 0 || activeTab === 1) && (
                            <TableCell>
                              {lead.source !== 'Contact Us' && (
                                lead.formType === 'Return' ? (
                                  <Typography sx={{ fontSize: '0.9375rem', color: 'text.primary', fontWeight: 600 }}>
                                    {(() => {
                                      const getTwoWords = (str: string) => {
                                        if (!str) return '';
                                        const words = str.trim().split(/\s+/);
                                        return words.length > 2 ? words.slice(0, 2).join(' ') : str;
                                      };
                                      
                                      const pickup = getTwoWords(lead.fromLocation);
                                      const validDests = (lead.destinations || []).filter((d: string) => d.trim());
                                      
                                      if (validDests.length > 0) {
                                        const stops = validDests.map((d: string) => getTwoWords(d)).join(', ');
                                        return `${pickup} and ${stops}`;
                                      } else {
                                        const dest = getTwoWords(lead.toLocation);
                                        return `${pickup} and ${dest}`;
                                      }
                                    })()}
                                  </Typography>
                                ) : (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography
                                      sx={{ fontSize: '0.9375rem', color: 'text.primary', fontWeight: 600 }}
                                    >
                                      {lead.fromLocation}
                                    </Typography>
                                    <Typography sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>→</Typography>
                                    <Typography
                                      sx={{ fontSize: '0.9375rem', color: 'text.primary', fontWeight: 600 }}
                                    >
                                      {lead.toLocation}
                                    </Typography>
                                  </Box>
                                )
                              )}
                            </TableCell>
                          )}

                          {/* Status */}
                          <TableCell>
                            <Chip
                              icon={<statusStyle.IconComponent sx={{ fontSize: 16 }} />}
                              label={statusStyle.label || lead.status}
                              sx={{
                                background: `linear-gradient(135deg, ${statusStyle.bgColor} 0%, ${statusStyle.bgColor}cc 100%)`,
                                color: statusStyle.color,
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                                borderRadius: '8px',
                                height: '28px',
                                '& .MuiChip-icon': {
                                  color: statusStyle.color,
                                },
                              }}
                            />
                          </TableCell>

                          {/* Employee */}
                          <TableCell>
                            <Typography sx={{
                              fontSize: '0.9375rem',
                              color: lead.employeeName ? 'text.primary' : 'text.disabled',
                              fontWeight: lead.employeeName ? 500 : 400,
                              fontStyle: lead.employeeName ? 'normal' : 'italic',
                            }}>
                              {lead.employeeName || 'Not Assigned'}
                            </Typography>
                          </TableCell>

                          {/* Trip Type (renamed from Form Type) */}
                          <TableCell>
                            <Chip
                              label={lead.formType}
                              size="small"
                              sx={{
                                background: mode === 'light'
                                  ? 'linear-gradient(135deg, #475569 0%, #334155 100%)'
                                  : 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                                borderRadius: '6px',
                              }}
                            />
                          </TableCell>

                          {/* Form Type (new column) */}
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Chip
                                label={lead.source}
                                size="small"
                                sx={{
                                  background: lead.source === 'Online Booking'
                                    ? (mode === 'light' ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'rgba(59, 130, 246, 0.1)')
                                    : (mode === 'light' ? 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)' : 'rgba(124, 58, 237, 0.1)'),
                                  color: lead.source === 'Online Booking' ? (mode === 'light' ? '#2563eb' : '#60a5fa') : (mode === 'light' ? '#7c3aed' : '#a78bfa'),
                                  fontWeight: 600,
                                  fontSize: '0.8125rem',
                                  borderRadius: '6px',
                                }}
                              />
                              {lead.promoCode && (
                                <Chip
                                  label="PROMO"
                                  size="small"
                                  sx={{
                                    height: '18px',
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                    color: '#92400e',
                                    border: '1px solid #f59e0b',
                                    '& .MuiChip-label': { px: 1 }
                                  }}
                                />
                              )}
                            </Box>
                          </TableCell>

                          {/* Action */}
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <IconButton
                                onClick={() => handleViewClick(lead)}
                                title="View Details"
                                sx={{
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                  color: '#ffffff',
                                  borderRadius: '10px',
                                  padding: '8px',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                                  },
                                }}
                              >
                                <VisibilityIcon sx={{ fontSize: 20 }} />
                              </IconButton>

                              <IconButton
                                onClick={() => handlePickLead(lead)}
                                title={lead.employeeName ? `Already assigned to ${lead.employeeName}` : 'Pick Lead'}
                                disabled={!!lead.employeeName}
                                sx={{
                                  background: lead.employeeName
                                    ? (mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)')
                                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  color: lead.employeeName ? 'text.disabled' : '#ffffff',
                                  borderRadius: '10px',
                                  padding: '8px',
                                  transition: 'all 0.3s ease',
                                  cursor: lead.employeeName ? 'not-allowed' : 'pointer',
                                  '&:hover': {
                                    background: lead.employeeName
                                      ? (mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)')
                                      : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                    transform: lead.employeeName ? 'none' : 'translateY(-2px)',
                                    boxShadow: lead.employeeName ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.4)',
                                  },
                                  '&.Mui-disabled': {
                                    background: mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)',
                                    color: 'text.disabled',
                                  },
                                }}
                              >
                                <AssignmentIcon sx={{ fontSize: 20 }} />
                              </IconButton>

                              {isSuperAdmin && (
                                <IconButton
                                  onClick={() => handleDeleteLead(lead)}
                                  title="Delete Lead"
                                  sx={{
                                    background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                                    color: '#ffffff',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                                    },
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredLeads.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontWeight: 500,
                  color: 'text.secondary',
                },
              }}
            />
          </>
        )}
      </Paper>

      {/* Lead Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: 1200,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1.1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ fontSize: 22 }} />
            <span>Lead Details</span>
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              color: '#ffffff',
              p: 0.5,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5 }}>
          {selectedLead && (
            <Box>
              {/* Message Alert */}
              {showMessage && selectedLead.message && (
                <Alert
                  icon={<MessageIcon sx={{ fontSize: 18 }} />}
                  severity="info"
                  onClose={() => setShowMessage(false)}
                  sx={{
                    mb: 2,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    border: '1px solid #93c5fd',
                    py: 1,
                    '& .MuiAlert-icon': { color: '#3b82f6' },
                    '& .MuiAlert-message': { color: '#1e40af', fontWeight: 500, fontSize: '0.82rem' },
                  }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 0.25, fontSize: '0.82rem' }}>Customer Message:</Typography>
                  {selectedLead.message}
                </Alert>
              )}

              {activeTab === 1 ? (
                /* Promotion Tab: Display ONLY phone number, name, promotion type, and status */
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                    {/* Customer Name */}
                    <Box sx={{ p: 1.5, borderRadius: '10px', background: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                        <PersonIcon sx={{ color: '#3b82f6', fontSize: 16 }} />
                        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer Name</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                        {selectedLead.customerName}
                      </Typography>
                    </Box>

                    {/* Phone */}
                    {selectedLead.customerPhone && (
                      <Box sx={{ p: 1.5, borderRadius: '10px', background: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Phone</Typography>
                        <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                          {selectedLead.customerPhone}
                        </Typography>
                        {selectedLead.additionalPhones && selectedLead.additionalPhones.length > 0 && selectedLead.additionalPhones.map((phone, idx) => (
                          <Typography key={idx} sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary', mt: 0.5 }}>
                            {phone}
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {/* Promotion Type */}
                    <Box sx={{ p: 1.5, borderRadius: '10px', background: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                        <DirectionsCarIcon sx={{ color: '#ec4899', fontSize: 16 }} />
                        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Promotion Type</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                        {selectedLead.vehicleName}
                      </Typography>
                      {selectedLead.promoCode && (
                        <Chip
                          label={selectedLead.promoCode}
                          size="small"
                          sx={{
                            mt: 0.5,
                            height: '18px',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            color: '#92400e',
                            border: '1px solid #f59e0b',
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      )}
                    </Box>

                    {/* Status */}
                    <Box sx={{ p: 1.5, borderRadius: '10px', background: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                      <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Status</Typography>
                      {(() => {
                        const statusStyle = getStatusColor(selectedLead.status);
                        return (
                          <Chip
                            icon={<statusStyle.IconComponent sx={{ fontSize: 14 }} />}
                            label={statusStyle.label || selectedLead.status}
                            sx={{
                              background: mode === 'light'
                                ? `linear-gradient(135deg, ${statusStyle.bgColor} 0%, ${statusStyle.bgColor}cc 100%)`
                                : `linear-gradient(135deg, ${statusStyle.color}33 0%, ${statusStyle.color}1a 100%)`,
                              color: statusStyle.color,
                              fontWeight: 600,
                              fontSize: '0.78rem',
                              borderRadius: '6px',
                              height: '26px',
                              '& .MuiChip-icon': { color: statusStyle.color },
                            }}
                          />
                        );
                      })()}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1fr' }, gap: 3, mt: 2 }}>
                  
                  {/* Column 1 */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    height: '100%',
                    maxHeight: { xs: 'none', lg: '65vh' },
                    overflowY: 'auto',
                    pr: { xs: 0, lg: 1 },
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(0,0,0,0.1)',
                      borderRadius: '10px',
                    },
                    '&:hover::-webkit-scrollbar-thumb': {
                      background: 'rgba(0,0,0,0.2)',
                    }
                  }}>
                    
                    {/* Contact Details */ }
                    <Box sx={{ p: 2, borderRadius: '12px', background: mode === 'light' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 2, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <PersonIcon sx={{ fontSize: 18 }} /> Contact Details
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, rowGap: 2.5 }}>
                        {/* Lead ID */}
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>Lead ID</Typography>
                          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#3b82f6' }}>
                            {selectedLead.customId || selectedLead.id}
                          </Typography>
                        </Box>

                        {/* Customer Name */}
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>Customer Name</Typography>
                          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                            {selectedLead.customerName}
                          </Typography>
                        </Box>

                        {/* Phone */}
                        {selectedLead.customerPhone && (
                          <Box>
                            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>Phone No</Typography>
                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                              {selectedLead.customerPhone}
                            </Typography>
                            {selectedLead.additionalPhones && selectedLead.additionalPhones.length > 0 && selectedLead.additionalPhones.map((phone, idx) => (
                              <Typography key={idx} sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary', mt: 0.5 }}>
                                {phone}
                              </Typography>
                            ))}
                          </Box>
                        )}

                        {/* Email */}
                        {selectedLead.customerEmail && (
                          <Box>
                            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>Email</Typography>
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: 'text.primary', wordBreak: 'break-all' }}>
                              {selectedLead.customerEmail}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Trip Details */}
                    <Box sx={{ flexGrow: 1, p: 2, borderRadius: '12px', background: mode === 'light' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 2, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <DirectionsCarIcon sx={{ fontSize: 18 }} /> Trip Details
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, rowGap: 2.5 }}>
                        {/* Trip Type */}
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>Trip Type</Typography>
                          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                            {selectedLead.formType}
                          </Typography>
                        </Box>

                        {/* Day Count */}
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>Day Count</Typography>
                          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                            {selectedLead.numberOfDays ? `${selectedLead.numberOfDays} Days` : 'N/A'}
                          </Typography>
                        </Box>

                        {/* Lead Date */}
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>Lead Date</Typography>
                          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                            {formatDate(selectedLead.leadDate)}
                          </Typography>
                        </Box>

                        {/* Trip Start Time */}
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>Trip Start Time</Typography>
                          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                            {formatDate(selectedLead.tourDate, true, true)}
                          </Typography>
                        </Box>

                        {/* Number of Passengers */}
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>Passengers</Typography>
                          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                            {selectedLead.numberOfPassengers} {selectedLead.numberOfPassengers === 1 ? 'Person' : 'People'}
                          </Typography>
                        </Box>

                        {/* Vehicle Name */}
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>Vehicle</Typography>
                          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                            {selectedLead.vehicleName}
                          </Typography>
                        </Box>

                        {/* Customer Remark */}
                        {selectedLead.customerRemark && (
                          <Box sx={{ gridColumn: { sm: 'span 2' }, mt: 0.5, p: 1.5, borderRadius: '8px', background: mode === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.2)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                            <Typography sx={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Customer Remark</Typography>
                            <Typography sx={{ fontSize: '0.9rem', color: 'text.primary', fontStyle: 'italic' }}>
                              "{selectedLead.customerRemark}"
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Route Section — only for booking leads */}
                      {selectedLead.source !== 'Contact Us' && (
                      <Box sx={{ mt: 2, p: 1.5, borderRadius: '10px', background: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <LocationOnIcon sx={{ color: '#0ea5e9', fontSize: 16 }} />
                            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Route</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              size="small" 
                              onClick={(e) => setRoutePopoverAnchor(e.currentTarget)}
                              sx={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                color: '#f59e0b',
                                textTransform: 'uppercase',
                                background: 'rgba(245, 158, 11, 0.08)',
                                borderRadius: '6px',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                px: 1.5,
                                py: 0.5,
                                '&:hover': {
                                  background: '#f59e0b',
                                  color: '#ffffff',
                                }
                              }}
                            >
                              View Route
                            </Button>
                            <Button 
                              size="small" 
                              onClick={() => handleViewLeadDirections(selectedLead)}
                              startIcon={<MapIcon sx={{ fontSize: 16 }} />}
                              sx={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                color: '#0ea5e9',
                                textTransform: 'uppercase',
                                background: 'rgba(14, 165, 233, 0.08)',
                                borderRadius: '6px',
                                border: '1px solid rgba(14,165,233,0.3)',
                                px: 1.5,
                                py: 0.5,
                                '&:hover': {
                                  background: '#0ea5e9',
                                  color: '#ffffff',
                                }
                              }}
                            >
                              View Map
                            </Button>
                          </Box>
                        </Box>

                        {/* View All Locations Popover */}
                        <Popover
                          open={Boolean(routePopoverAnchor)}
                          anchorEl={routePopoverAnchor}
                          onClose={() => setRoutePopoverAnchor(null)}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                          PaperProps={{
                            sx: {
                              mt: 1,
                              p: 2,
                              borderRadius: '12px',
                              minWidth: 250,
                              maxWidth: 350,
                              maxHeight: 400,
                              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)'
                            }
                          }}
                        >
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, mb: 2, color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>All Locations</Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Box sx={{ width: 14, height: 14, borderRadius: '50%', background: '#22c55e', border: '2.5px solid white', boxShadow: '0 0 0 2px #22c55e', flexShrink: 0, mt: 0.25 }} />
                                {((selectedLead.destinations || []).filter((d: string) => d.trim()).length > 0 || selectedLead.toLocation) && (
                                  <Box sx={{ width: 2, flexGrow: 1, background: '#e2e8f0', my: 0.5, minHeight: '16px' }} />
                                )}
                              </Box>
                              <Box sx={{ pb: ((selectedLead.destinations || []).filter((d: string) => d.trim()).length > 0 || selectedLead.toLocation) ? 2 : 0 }}>
                                <Typography sx={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 700, textTransform: 'uppercase', mb: 0.25 }}>Pickup</Typography>
                                <Typography sx={{ fontSize: '0.85rem', color: 'text.primary', lineHeight: 1.3 }}>{selectedLead.fromLocation}</Typography>
                              </Box>
                            </Box>
                            {(selectedLead.destinations || []).filter((d: string) => d.trim()).map((dest: string, idx: number, arr: string[]) => (
                              <Box key={idx} sx={{ display: 'flex', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <Box sx={{ width: 14, height: 14, borderRadius: '50%', background: '#C9A961', border: '2.5px solid white', boxShadow: '0 0 0 2px #C9A961', flexShrink: 0, mt: 0.25 }} />
                                  {(idx < arr.length - 1 || selectedLead.toLocation) && (
                                    <Box sx={{ width: 2, flexGrow: 1, background: '#e2e8f0', my: 0.5, minHeight: '16px' }} />
                                  )}
                                </Box>
                                <Box sx={{ pb: (idx < arr.length - 1 || selectedLead.toLocation) ? 2 : 0 }}>
                                  <Typography sx={{ fontSize: '0.65rem', color: '#C9A961', fontWeight: 700, textTransform: 'uppercase', mb: 0.25 }}>Stop {idx + 1}</Typography>
                                  <Typography sx={{ fontSize: '0.85rem', color: 'text.primary', lineHeight: 1.3 }}>{dest}</Typography>
                                </Box>
                              </Box>
                            ))}
                            {selectedLead.toLocation && (
                              <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <Box sx={{ width: 14, height: 14, borderRadius: '50%', background: '#ef4444', border: '2.5px solid white', boxShadow: '0 0 0 2px #ef4444', flexShrink: 0, mt: 0.25 }} />
                                </Box>
                                <Box>
                                  <Typography sx={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', mb: 0.25 }}>Drop-off</Typography>
                                  <Typography sx={{ fontSize: '0.85rem', color: 'text.primary', lineHeight: 1.3 }}>{selectedLead.toLocation}</Typography>
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Popover>

                        {/* The route timeline is now inside the View Route popover */}
                      </Box>
                    )}
                    </Box>
                  </Box>

                  {/* Column 2 */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>

                  {/* Matched Package Details — only for booking leads */}
                  {selectedLead.source !== 'Contact Us' && selectedLead.matchedPackage && (
                    <Box sx={{ flexGrow: 1, p: 2, borderRadius: '12px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #b7e4c7' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <TableChartIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected Package Details</Typography>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: '8px', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(22,101,52,0.1)' }}>
                          <Typography sx={{ fontSize: '0.65rem', color: '#166534', fontWeight: 600, mb: 0.5, opacity: 0.8 }}>KM & HOURLY LIMIT</Typography>
                          <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#065f46' }}>
                            {selectedLead.matchedPackage.km} KM / {selectedLead.matchedPackage.hrs} HRS
                          </Typography>
                        </Box>
                        <Box sx={{ p: 1.5, borderRadius: '8px', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(22,101,52,0.1)' }}>
                          <Typography sx={{ fontSize: '0.65rem', color: '#166534', fontWeight: 600, mb: 0.5, opacity: 0.8 }}>BASE RATE (LKR)</Typography>
                          <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: '#166534' }}>
                            {selectedLead.matchedPackage.rateAmount?.toLocaleString()}
                          </Typography>
                        </Box>
                        {/* Detailed Calculation Process — only if route distance is available */}
                        {(selectedLead.routeDistance !== undefined && selectedLead.routeDistance > 0) ? (
                          <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed rgba(22,101,52,0.3)', gridColumn: 'span 2' }}>
                            <Typography sx={{ fontSize: '0.72rem', color: '#166534', fontWeight: 800, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Calculation Breakdown:
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontSize: '0.82rem', color: '#166534', fontWeight: 500 }}>
                                  Base {selectedLead.matchedPackage.km} KM Package:
                                </Typography>
                                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
                                  Rs. {selectedLead.matchedPackage.rateAmount?.toLocaleString()}
                                </Typography>
                              </Box>
                              
                              {(() => {
                                 const actualKm = Math.ceil(selectedLead.routeDistance / 1000);
                                 const pkgKm = selectedLead.matchedPackage.km;
                                 const extraKm = Math.max(0, actualKm - pkgKm);
                                 const kmRate = selectedLead.matchedPackage.extraKMRate || 0;
                                 const extraKmCost = extraKm * kmRate;

                                 let extraHours = selectedLead.additionalHours || 0;
                                 const hrRate = selectedLead.matchedPackage.extraHrRate1 || 0;
                                 let extraHrCost = extraHours * hrRate;

                                 if (extraHours === 0 && selectedLead.totalPrice > 0 && hrRate > 0) {
                                     const baseCost = selectedLead.matchedPackage.rateAmount || 0;
                                     const seasonalAdj = selectedLead.seasonalAdjustment || 0;
                                     const nightSurcharge = selectedLead.nightSurcharge || 0;
                                     const provinceAdj = selectedLead.provinceAdjustment || 0;
                                     const accountedPrice = baseCost + extraKmCost + seasonalAdj + nightSurcharge + provinceAdj;
                                     const diff = selectedLead.totalPrice - accountedPrice;
                                     
                                     if (diff > 0 && diff % hrRate === 0) {
                                         extraHrCost = diff;
                                         extraHours = diff / hrRate;
                                     }
                                 }

                                 return (
                                   <>
                                     {extraKm > 0 && (
                                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                         <Typography sx={{ fontSize: '0.82rem', color: '#166534', fontWeight: 500 }}>
                                           Extra Distance ({extraKm} KM × Rs. {kmRate}):
                                         </Typography>
                                         <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
                                           + Rs. {extraKmCost.toLocaleString()}
                                         </Typography>
                                       </Box>
                                     )}
                                     {extraHours > 0 && (
                                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                         <Typography sx={{ fontSize: '0.82rem', color: '#166534', fontWeight: 500 }}>
                                           Extra Hours ({extraHours} HRS × Rs. {hrRate}):
                                         </Typography>
                                         <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
                                           + Rs. {extraHrCost.toLocaleString()}
                                         </Typography>
                                       </Box>
                                     )}
                                   </>
                                 );
                              })()}

                              {/* Seasonal Adjustment */}
                              {selectedLead.seasonalAdjustment !== undefined && selectedLead.seasonalAdjustment > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography sx={{ fontSize: '0.82rem', color: '#166534', fontWeight: 500 }}>
                                    Seasonal Price Adjustment:
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
                                    + Rs. {selectedLead.seasonalAdjustment.toLocaleString()}
                                  </Typography>
                                </Box>
                              )}

                              {/* Night Surcharge */}
                              {selectedLead.nightSurcharge !== undefined && selectedLead.nightSurcharge > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography sx={{ fontSize: '0.82rem', color: '#166534', fontWeight: 500 }}>
                                    Night Surcharge:
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
                                    + Rs. {selectedLead.nightSurcharge.toLocaleString()}
                                  </Typography>
                                </Box>
                              )}

                              {/* Province Adjustment */}
                              {selectedLead.provinceAdjustment !== undefined && selectedLead.provinceAdjustment > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography sx={{ fontSize: '0.82rem', color: '#166534', fontWeight: 500 }}>
                                    Province Surcharge:
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
                                    + Rs. {selectedLead.provinceAdjustment.toLocaleString()}
                                  </Typography>
                                </Box>
                              )}

                              <Box sx={{ mt: 1, pt: 1, borderTop: '1.5px solid rgba(22,101,52,0.2)' }}>
                                {(() => {
                                  const actualKm = Math.ceil(selectedLead.routeDistance / 1000);
                                  const pkgKm = selectedLead.matchedPackage.km;
                                  const extraKm = Math.max(0, actualKm - pkgKm);
                                  const kmRate = selectedLead.matchedPackage.extraKMRate || 0;
                                  const extraKmCost = extraKm * kmRate;
                                  
                                  let extraHours = selectedLead.additionalHours || 0;
                                  const hrRate = selectedLead.matchedPackage.extraHrRate1 || 0;
                                  let extraHrCost = extraHours * hrRate;
                                  
                                  const baseCost = selectedLead.matchedPackage.rateAmount || 0;
                                  const seasonalAdj = selectedLead.seasonalAdjustment || 0;
                                  const nightSurcharge = selectedLead.nightSurcharge || 0;
                                  const provinceAdj = selectedLead.provinceAdjustment || 0;
                                  
                                  if (extraHours === 0 && selectedLead.totalPrice > 0 && hrRate > 0) {
                                      const accountedPrice = baseCost + extraKmCost + seasonalAdj + nightSurcharge + provinceAdj;
                                      const diff = selectedLead.totalPrice - accountedPrice;
                                      
                                      if (diff > 0 && diff % hrRate === 0) {
                                          extraHrCost = diff;
                                          extraHours = diff / hrRate;
                                      }
                                  }
                                  
                                  const tripPrice = baseCost + extraKmCost + extraHrCost + seasonalAdj + nightSurcharge + provinceAdj;
                                  const discountAmt = selectedLead.discount || 0;
                                  const finalPrice = (selectedLead.totalPrice || 0) > 0 ? (selectedLead.totalPrice || 0) : Math.max(0, tripPrice - discountAmt);

                                  return (
                                    <Box sx={{ width: '100%' }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: discountAmt > 0 ? 0.5 : 0 }}>
                                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#065f46' }}>
                                          Trip Price:
                                        </Typography>
                                        <Typography sx={{ fontSize: '1.0rem', fontWeight: 800, color: '#065f46' }}>
                                          Rs. {tripPrice.toLocaleString()}
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: discountAmt > 0 ? '#ef4444' : '#166534' }}>
                                          Discount {selectedLead.promoCode ? `(${selectedLead.promoCode})` : ''}:
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: discountAmt > 0 ? '#ef4444' : '#166534' }}>
                                          - Rs. {discountAmt.toLocaleString()}
                                        </Typography>
                                      </Box>

                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px dashed rgba(22,101,52,0.3)' }}>
                                        <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#065f46' }}>
                                          Final Price:
                                        </Typography>
                                        <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#065f46' }}>
                                          Rs. {finalPrice.toLocaleString()}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  );
                                })()}
                              </Box>
                              <Typography sx={{ fontSize: '0.85rem', color: '#065f46', mt: 1, fontWeight: 800, background: 'rgba(6, 95, 70, 0.08)', padding: '6px 10px', borderRadius: '6px', display: 'inline-block' }}>
                                * Total Distance: {Math.ceil(selectedLead.routeDistance / 1000)} KM | Total Hours: {selectedLead.matchedPackage.hrs} HRS
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed rgba(22,101,52,0.3)', textAlign: 'center', gridColumn: 'span 2' }}>
                            <Typography sx={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>
                              * Route distance and detailed mapping for this lead are not available in current record.
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                  </Box>

                  {/* Column 3 */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>

                  {/* Staff Remark Field */}
                  <Box sx={{ p: 2, borderRadius: '12px', background: mode === 'light' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 2, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <MessageIcon sx={{ fontSize: 18 }} /> Staff Remark (Optional)
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      disabled={!isSuperAdmin && (!!selectedLead.staffRemark || selectedLead.employeeName !== (currentUser?.fullName || currentUser?.username))}
                      placeholder={
                        isSuperAdmin
                          ? "Enter or edit staff remarks..."
                          : selectedLead.employeeName !== (currentUser?.fullName || currentUser?.username)
                            ? "You must pick this lead before entering remarks."
                            : !!selectedLead.staffRemark
                              ? "Remark is locked and cannot be edited."
                              : "Enter any internal remarks or notes here..."
                      }
                      value={staffRemark}
                      onChange={(e) => setStaffRemark(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          backgroundColor: (!!selectedLead.staffRemark || selectedLead.employeeName !== (currentUser?.fullName || currentUser?.username))
                            ? (mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)')
                            : (mode === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.02)'),
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: (!!selectedLead.staffRemark || selectedLead.employeeName !== (currentUser?.fullName || currentUser?.username))
                              ? (mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)')
                              : (mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)'),
                          },
                          '&.Mui-focused': {
                            backgroundColor: mode === 'light' ? '#ffffff' : 'rgba(255,255,255,0.05)',
                          }
                        },
                        '& .Mui-disabled': {
                          WebkitTextFillColor: mode === 'light' ? '#475569' : '#94a3b8',
                          cursor: 'not-allowed'
                        }
                      }}
                    />
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        onClick={() => handleLeadAction(selectedLead.status)}
                        disabled={
                          actionLoading ||
                          (!isSuperAdmin && (!!selectedLead.staffRemark || selectedLead.employeeName !== (currentUser?.fullName || currentUser?.username))) ||
                          staffRemark === (selectedLead.staffRemark || '')
                        }
                        sx={{
                          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                          borderRadius: '10px',
                          fontWeight: 600,
                          textTransform: 'none',
                          boxShadow: '0 4px 14px rgba(30, 41, 59, 0.3)',
                          px: 3,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
                            boxShadow: '0 6px 20px rgba(30, 41, 59, 0.4)',
                          },
                          '&:disabled': { background: '#e2e8f0', color: '#94a3b8', boxShadow: 'none' },
                        }}
                      >
                        {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Save Remark'}
                      </Button>
                    </Box>
                  </Box>

                  {/* Staff Section (Moved to Bottom) */}
                  <Box sx={{ flexGrow: 1, p: 2, borderRadius: '12px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <AssignmentIcon sx={{ fontSize: 18 }} /> Staff Section
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                      {/* Status */}
                      <Box sx={{ p: 1.5, borderRadius: '10px', background: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Status</Typography>
                        {(() => {
                          const statusStyle = getStatusColor(selectedLead.status);
                          return (
                            <Chip
                              icon={<statusStyle.IconComponent sx={{ fontSize: 14 }} />}
                              label={statusStyle.label || selectedLead.status}
                              sx={{
                                background: mode === 'light'
                                  ? `linear-gradient(135deg, ${statusStyle.bgColor} 0%, ${statusStyle.bgColor}cc 100%)`
                                  : `linear-gradient(135deg, ${statusStyle.color}33 0%, ${statusStyle.color}1a 100%)`,
                                color: statusStyle.color,
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                borderRadius: '6px',
                                height: '26px',
                                '& .MuiChip-icon': { color: statusStyle.color },
                              }}
                            />
                          );
                        })()}
                      </Box>

                      {/* Followed By */}
                      <Box sx={{ p: 1.5, borderRadius: '10px', background: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Followed By</Typography>
                        <Typography sx={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: selectedLead.employeeName ? 'text.primary' : 'text.disabled',
                          fontStyle: selectedLead.employeeName ? 'normal' : 'italic',
                        }}>
                          {selectedLead.employeeName || 'Not Assigned'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Super Admin Controls (Nested) */}
                    {isSuperAdmin && (
                      <Box sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: '1px solid rgba(139, 92, 246, 0.2)'
                      }}>
                        <Typography sx={{
                          fontSize: '0.72rem',
                          color: '#3b82f6',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <AssignmentIcon sx={{ fontSize: 16 }} />
                          Super Admin Controls
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ fontSize: '0.875rem' }}>Update Status</InputLabel>
                            <Select
                              value={selectedLead.status}
                              label="Update Status"
                              onChange={(e) => handleLeadAction(e.target.value)}
                              sx={{
                                borderRadius: '10px',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                backgroundColor: mode === 'light' ? '#ffffff' : 'rgba(0,0,0,0.2)'
                              }}
                            >
                              {(isContactLead(selectedLead)
                                ? ['new', 'read', 'responded', 'archived', 'Ignored']
                                : ['Confirmed', 'Pending', 'Sent Inquiry', 'Rejected', 'Cancelled', 'Ignored']
                              ).map((status) => (
                                <MenuItem key={status} value={status} sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                  {status === 'new' ? 'New' :
                                    status === 'read' ? 'Read' :
                                      status === 'responded' ? 'Responded' :
                                        status === 'archived' ? 'Archived' :
                                          status}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>


                        </Box>
                      </Box>
                    )}
                  </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 2,
            py: 1,
            background: 'background.default',
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            {/* ── CONTACT LEADS (Complaint / General Inquiry / Feedback) ── */}
            {isContactLead(selectedLead) && (
              <>
                {/* Mark as New — available when status is read / responded / archived */}
                {selectedLead?.status !== 'new' && (
                  <Button
                    onClick={() => handleLeadAction('new')}
                    disabled={actionLoading || selectedLead?.employeeName !== (currentUser?.fullName || currentUser?.username)}
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      borderRadius: '12px',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.9375rem',
                      px: 3,
                      py: 0.75,
                      boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        boxShadow: '0 6px 20px rgba(59,130,246,0.5)',
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': { background: '#e2e8f0', color: '#94a3b8' },
                    }}
                  >
                    {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Mark as New'}
                  </Button>
                )}

                {/* Mark as Read — available when status is new */}
                {selectedLead?.status !== 'read' && (
                  <Button
                    onClick={() => handleLeadAction('read')}
                    disabled={actionLoading || selectedLead?.employeeName !== (currentUser?.fullName || currentUser?.username)}
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                      borderRadius: '12px',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.9375rem',
                      px: 3,
                      py: 0.75,
                      boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        boxShadow: '0 6px 20px rgba(14,165,233,0.5)',
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': { background: '#e2e8f0', color: '#94a3b8' },
                    }}
                  >
                    {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Mark as Read'}
                  </Button>
                )}

                {/* Mark as Responded — available when status is new or read */}
                {selectedLead?.status !== 'responded' && (
                  <Button
                    onClick={() => handleLeadAction('responded')}
                    disabled={actionLoading || selectedLead?.employeeName !== (currentUser?.fullName || currentUser?.username)}
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '12px',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.9375rem',
                      px: 3,
                      py: 0.75,
                      boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        boxShadow: '0 6px 20px rgba(16,185,129,0.5)',
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': { background: '#e2e8f0', color: '#94a3b8' },
                    }}
                  >
                    {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Mark as Responded'}
                  </Button>
                )}

                {/* Archive — available when not already archived */}
                {selectedLead?.status !== 'archived' && (
                  <Button
                    onClick={() => handleLeadAction('archived')}
                    disabled={actionLoading || selectedLead?.employeeName !== (currentUser?.fullName || currentUser?.username)}
                    variant="outlined"
                    sx={{
                      borderColor: '#ef4444',
                      borderWidth: '2px',
                      color: '#ef4444',
                      borderRadius: '12px',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.9375rem',
                      px: 3,
                      py: 0.75,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#dc2626',
                        borderWidth: '2px',
                        backgroundColor: '#fee2e2',
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': { borderColor: '#e2e8f0', color: '#94a3b8' },
                    }}
                  >
                    {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Archive'}
                  </Button>
                )}
              </>
            )}

            {/* ── BOOKING LEADS — Confirm / Sent Inquiry / Reject workflow ── */}
            {!isContactLead(selectedLead) && (
              <>
                {/* Pending — shown when not already Pending */}
                {selectedLead?.status !== 'Pending' && selectedLead?.status !== 'Confirmed' && selectedLead?.status !== 'Cancelled' && selectedLead?.status !== 'Sent Inquiry' && (
                  <Button
                    onClick={() => handleLeadAction('Pending')}
                    disabled={actionLoading || selectedLead?.employeeName !== (currentUser?.fullName || currentUser?.username)}
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      borderRadius: '12px', fontWeight: 600, textTransform: 'none',
                      fontSize: '0.9375rem', px: 3, py: 1.5,
                      boxShadow: '0 4px 14px rgba(245,158,11,0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', transform: 'translateY(-2px)' },
                      '&:disabled': { background: '#e2e8f0', color: '#94a3b8' },
                    }}
                  >
                    {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Mark as Pending'}
                  </Button>
                )}

                {/* Sent Inquiry — shown when status is Pending */}
                {selectedLead?.status !== 'Confirmed' && selectedLead?.status !== 'Cancelled' && selectedLead?.status !== 'Sent Inquiry' && (
                  <Button
                    onClick={() => handleLeadAction('Sent Inquiry')}
                    disabled={actionLoading || selectedLead?.employeeName !== (currentUser?.fullName || currentUser?.username)}
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      borderRadius: '12px', fontWeight: 600, textTransform: 'none',
                      fontSize: '0.9375rem', px: 3, py: 1.5,
                      boxShadow: '0 4px 14px rgba(139,92,246,0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', transform: 'translateY(-2px)' },
                      '&:disabled': { background: '#e2e8f0', color: '#94a3b8' },
                    }}
                  >
                    {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Sent Inquiry'}
                  </Button>
                )}

                {/* Confirm — shown when not already Confirmed */}
                {!isSuperAdmin && selectedLead?.status !== 'Confirmed' && selectedLead?.status !== 'Cancelled' && (
                  <Button
                    onClick={() => handleLeadAction('Confirmed')}
                    disabled={actionLoading || selectedLead?.employeeName !== (currentUser?.fullName || currentUser?.username)}
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '12px', fontWeight: 600, textTransform: 'none',
                      fontSize: '0.9375rem', px: 3, py: 1.5,
                      boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', transform: 'translateY(-2px)' },
                      '&:disabled': { background: '#e2e8f0', color: '#94a3b8' },
                    }}
                  >
                    {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Confirm'}
                  </Button>
                )}

                {/* Reject — shown when not already Cancelled */}
                {!isSuperAdmin && selectedLead?.status !== 'Cancelled' && selectedLead?.status !== 'Confirmed' && (
                  <Button
                    onClick={() => handleLeadAction('Cancelled')}
                    disabled={actionLoading || selectedLead?.employeeName !== (currentUser?.fullName || currentUser?.username)}
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      borderRadius: '12px', fontWeight: 600, textTransform: 'none',
                      fontSize: '0.9375rem', px: 3, py: 1.5,
                      boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': { background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', transform: 'translateY(-2px)' },
                      '&:disabled': { background: '#e2e8f0', color: '#94a3b8' },
                    }}
                  >
                    {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Reject'}
                  </Button>
                )}
              </>
            )}

            <Box sx={{ flex: 1 }} />

            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              disabled={actionLoading}
              sx={{
                borderColor: '#cbd5e1',
                borderWidth: '2px',
                color: '#475569',
                borderRadius: '12px',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.9375rem',
                px: 4,
                py: 1.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#94a3b8',
                  borderWidth: '2px',
                  backgroundColor: '#f1f5f9',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(100, 116, 139, 0.15)',
                },
                '&:disabled': {
                  borderColor: '#e2e8f0',
                  color: '#cbd5e1',
                },
              }}
            >
              Close
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Internal Route Viewer */}
      {openRouteViewer && viewMapLead && (
        <RouteViewer
          open={openRouteViewer}
          onClose={() => {
            setOpenRouteViewer(false);
            setViewMapLead(null);
          }}
          origin={viewMapLead.fromLocation}
          destination={viewMapLead.toLocation}
          waypoints={viewMapLead.destinations}
          apiKey="AIzaSyD-hNAm1fnevgihbvtPVY8O0SuzOzK_Msc"
        />
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '8px',
            maxWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CancelIcon sx={{ fontSize: 24 }} /> Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.95rem', mt: 1 }}>
            Are you sure you want to delete lead <strong>{leadToDelete?.customId || leadToDelete?.id}</strong>? This action cannot be undone and will permanently remove all associated data.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)} 
            variant="outlined"
            sx={{ 
              borderRadius: '10px', 
              textTransform: 'none', 
              fontWeight: 600, 
              px: 3,
              borderColor: 'divider',
              color: 'text.secondary'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteLead} 
            variant="contained" 
            color="error"
            disabled={loading}
            sx={{ 
              borderRadius: '10px', 
              textTransform: 'none', 
              fontWeight: 600, 
              px: 3,
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%', borderRadius: '12px', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box >
  );
};

export default LeadInfoPage;
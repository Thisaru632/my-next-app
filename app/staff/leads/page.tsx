'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import { useTheme } from '@mui/material/styles';
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
  vehicleName: string;
  message?: string;
  customerPhone?: string;
  customerEmail?: string;
  customId?: string;
  isViewed?: boolean;
}

// Mock data
// Mock data removed in favor of API fetching

// Helper function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
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
    if (activeTab === 0) {
      filtered = filtered.filter(lead => lead.source === 'Online Booking');
    } else if (activeTab === 1) {
      filtered = filtered.filter(lead => lead.formType === 'Complaint');
    } else if (activeTab === 2) {
      filtered = filtered.filter(lead => lead.formType === 'General Inquiry' || lead.formType === 'General Enquiry');
    } else if (activeTab === 3) {
      filtered = filtered.filter(lead => lead.formType === 'Feedback');
    }

    return filtered;
  }, [searchQuery, statusFilter, formTypeFilter, employeeFilter, leads, activeTab]);

  // Load leads data
  useEffect(() => {
    // Mark all as read when visiting this page
    const markAllRead = async () => {
      try {
        await fetch(`${API_ENDPOINTS.AUTH}/notifications/mark-all-read`, { method: 'POST' });
      } catch (e) {
        console.error('Error marking all notifications as read:', e);
      }
    };

    const fetchLeads = async () => {
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
              vehicleName: booking.vehicleName || 'N/A',
              message: booking.message,
              customerPhone: booking.telephone,
              customerEmail: booking.email,
              customId: booking.customId,
              isViewed: booking.isViewed || false,
              destinations: booking.destinations || [],
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
        body: JSON.stringify({ status: action }),
      });

      if (response.ok) {
        // Update local state — for contacts rawStatus & status both track the backend value
        setLeads(prevLeads => prevLeads.map(l =>
          l.id === selectedLead.id
            ? { ...l, status: action, rawStatus: action }
            : l
        ));
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

  // Handle view button click
  const handleViewClick = async (lead: Lead) => {
    setSelectedLead(lead);
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

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setShowMessage(false);
    setSelectedLead(null);
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
                {(activeTab === 0
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
          <Tab icon={<CancelIcon sx={{ color: activeTab === 1 ? '#ef4444' : 'inherit' }} />} label="Complaints" />
          <Tab icon={<MessageIcon sx={{ color: activeTab === 2 ? '#8b5cf6' : 'inherit' }} />} label="General Inquiries" />
          <Tab icon={<CheckCircleIcon sx={{ color: activeTab === 3 ? '#10b981' : 'inherit' }} />} label="Feedback" />
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
                    {[
                      'Lead ID',
                      'Lead Date',
                      ...(activeTab === 0 ? ['From → To'] : []),
                      'Status',
                      'Employee',
                      'Type',
                      'Form Type',
                      'Action',
                    ].map((header, idx) => (
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
                            <Typography sx={{ fontSize: '0.9375rem', color: 'text.primary' }}>
                              {formatDate(lead.leadDate)}
                            </Typography>
                          </TableCell>

                          {/* From → To */}
                          {activeTab === 0 && (
                            <TableCell>
                              {lead.source !== 'Contact Us' && (
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
                                background: mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)',
                                color: mode === 'light' ? '#64748b' : '#94a3b8',
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                                borderRadius: '6px',
                              }}
                            />
                          </TableCell>

                          {/* Form Type (new column) */}
                          <TableCell>
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
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: 560,
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

              {/* Lead Information Grid */}
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

                {/* Lead ID */}
                <Box sx={{ p: 1.5, borderRadius: '10px', background: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Lead ID</Typography>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#3b82f6' }}>
                    {selectedLead.customId || selectedLead.id}
                  </Typography>
                </Box>

                {/* Lead Date */}
                <Box sx={{ p: 1.5, borderRadius: '10px', background: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                    <CalendarIcon sx={{ color: '#8b5cf6', fontSize: 16 }} />
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Lead Date</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                    {formatDate(selectedLead.leadDate)}
                  </Typography>
                </Box>

                {/* Tour Date */}
                <Box sx={{ p: 1.5, borderRadius: '10px', background: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                    <CalendarIcon sx={{ color: '#10b981', fontSize: 16 }} />
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tour Date</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                    {formatDate(selectedLead.tourDate)}
                  </Typography>
                </Box>

                {/* Number of Passengers */}
                <Box sx={{ p: 1.5, borderRadius: '10px', background: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                    <PeopleIcon sx={{ color: '#f59e0b', fontSize: 16 }} />
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Passengers</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                    {selectedLead.numberOfPassengers} {selectedLead.numberOfPassengers === 1 ? 'Person' : 'People'}
                  </Typography>
                </Box>

                {/* Vehicle Name */}
                <Box sx={{ p: 1.5, borderRadius: '10px', background: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                    <DirectionsCarIcon sx={{ color: '#ec4899', fontSize: 16 }} />
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vehicle</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                    {selectedLead.vehicleName}
                  </Typography>
                </Box>

                {/* Phone */}
                {selectedLead.customerPhone && (
                  <Box sx={{ p: 1.5, borderRadius: '10px', background: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Phone</Typography>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}>
                      {selectedLead.customerPhone}
                    </Typography>
                  </Box>
                )}

                {/* Email */}
                {selectedLead.customerEmail && (
                  <Box sx={{ p: 1.5, borderRadius: '10px', background: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Email</Typography>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: 'text.primary', wordBreak: 'break-all' }}>
                      {selectedLead.customerEmail}
                    </Typography>
                  </Box>
                )}

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

              {/* Route Section — only for booking leads */}
              {selectedLead.source !== 'Contact Us' && (
                <Box sx={{ mt: 2, p: 1.5, borderRadius: '10px', background: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
                    <LocationOnIcon sx={{ color: '#0ea5e9', fontSize: 16 }} />
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Route</Typography>
                  </Box>

                  {/* Horizontal left-to-right timeline */}
                  <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', minWidth: 'max-content', pt: 0.5 }}>

                      {/* PICKUP */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 90 }}>
                        <Typography sx={{ fontSize: '0.62rem', color: '#22c55e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5, whiteSpace: 'nowrap' }}>Pickup</Typography>
                        <Box sx={{ width: 22, height: 22, borderRadius: '50%', background: '#22c55e', border: '2.5px solid', borderColor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 3px #22c55e33', flexShrink: 0 }}>
                          <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary', mt: 0.5, textAlign: 'center', maxWidth: 85, wordBreak: 'break-word', lineHeight: 1.3 }}>{selectedLead.fromLocation}</Typography>
                      </Box>

                      {/* Connector after pickup */}
                      <Box sx={{ width: 36, height: 2, background: (selectedLead.destinations || []).filter((d: string) => d.trim()).length > 0 ? 'linear-gradient(to right, #22c55e, #C9A961)' : 'linear-gradient(to right, #22c55e, #ef4444)', borderRadius: '2px', mt: '10px', flexShrink: 0 }} />

                      {/* INTERMEDIATE STOPS */}
                      {(selectedLead.destinations || []).filter((d: string) => d.trim()).map((dest: string, idx: number, arr: string[]) => (
                        <Box key={idx} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 90 }}>
                            <Typography sx={{ fontSize: '0.62rem', color: '#C9A961', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5, whiteSpace: 'nowrap' }}>Stop {idx + 1}</Typography>
                            <Box sx={{ width: 22, height: 22, borderRadius: '50%', background: '#C9A961', border: '2.5px solid', borderColor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 3px #C9A96133', flexShrink: 0 }}>
                              <Typography sx={{ fontSize: '0.55rem', color: 'white', fontWeight: 700, lineHeight: 1 }}>{idx + 1}</Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary', mt: 0.5, textAlign: 'center', maxWidth: 85, wordBreak: 'break-word', lineHeight: 1.3 }}>{dest}</Typography>
                          </Box>
                          {/* Connector after each stop */}
                          <Box sx={{ width: 36, height: 2, background: idx === arr.length - 1 ? 'linear-gradient(to right, #C9A961, #ef4444)' : 'linear-gradient(to right, #C9A961, #C9A961)', borderRadius: '2px', mt: '10px', flexShrink: 0 }} />
                        </Box>
                      ))}

                      {/* DROPOFF */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 90 }}>
                        <Typography sx={{ fontSize: '0.62rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5, whiteSpace: 'nowrap' }}>Drop-off</Typography>
                        <Box sx={{ width: 22, height: 22, borderRadius: '50%', background: '#ef4444', border: '2.5px solid', borderColor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 3px #ef444433', flexShrink: 0 }}>
                          <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary', mt: 0.5, textAlign: 'center', maxWidth: 85, wordBreak: 'break-word', lineHeight: 1.3 }}>{selectedLead.toLocation}</Typography>
                      </Box>

                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            background: 'background.default',
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          {/* ── CONTACT LEADS (Complaint / General Inquiry / Feedback) ── */}
          {isContactLead(selectedLead) && (
            <>
              {/* Mark as New — available when status is read / responded / archived */}
              {selectedLead?.status !== 'new' && (
                <Button
                  onClick={() => handleLeadAction('new')}
                  disabled={actionLoading}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderRadius: '12px',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.9375rem',
                    px: 3,
                    py: 1.5,
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
                  disabled={actionLoading}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    borderRadius: '12px',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.9375rem',
                    px: 3,
                    py: 1.5,
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
                  disabled={actionLoading}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '12px',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.9375rem',
                    px: 3,
                    py: 1.5,
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
                  disabled={actionLoading}
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
                    py: 1.5,
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
              {selectedLead?.status !== 'Pending' && selectedLead?.status !== 'Confirmed' && selectedLead?.status !== 'Cancelled' && (
                <Button
                  onClick={() => handleLeadAction('Pending')}
                  disabled={actionLoading}
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
              {selectedLead?.status !== 'Confirmed' && selectedLead?.status !== 'Cancelled' && (
                <Button
                  onClick={() => handleLeadAction('Sent Inquiry')}
                  disabled={actionLoading}
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
              {selectedLead?.status !== 'Confirmed' && selectedLead?.status !== 'Cancelled' && (
                <Button
                  onClick={() => handleLeadAction('Confirmed')}
                  disabled={actionLoading}
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
              {selectedLead?.status !== 'Cancelled' && selectedLead?.status !== 'Confirmed' && (
                <Button
                  onClick={() => handleLeadAction('Cancelled')}
                  disabled={actionLoading}
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
        </DialogActions>
      </Dialog>
    </Box >
  );
};

export default LeadInfoPage;
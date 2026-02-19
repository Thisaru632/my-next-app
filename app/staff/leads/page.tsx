'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  AssignmentInd as AssignmentIcon,
} from '@mui/icons-material';

// Types
interface Lead {
  id: string;
  leadDate: string;
  fromLocation: string;
  toLocation: string;
  status: string;
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
      return { color: '#10b981', bgColor: '#d1fae5', IconComponent: CheckCircleIcon };
    case 'Pending':
      return { color: '#f59e0b', bgColor: '#fef3c7', IconComponent: HourglassEmptyIcon };
    case 'Rejected':
    case 'Cancelled':
      return { color: '#ef4444', bgColor: '#fee2e2', IconComponent: CancelIcon };
    case 'Not Contacted':
      return { color: '#8b5cf6', bgColor: '#ede9fe', IconComponent: PhoneMissedIcon };
    case 'Not Followed Yet':
      return { color: '#ec4899', bgColor: '#fce7f3', IconComponent: HourglassEmptyIcon };
    default:
      return { color: '#64748b', bgColor: '#f1f5f9', IconComponent: HourglassEmptyIcon };
  }
};

const LeadInfoPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [formTypeFilter, setFormTypeFilter] = useState<string>('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  // Use useMemo to compute filtered leads without causing cascading renders
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

    return filtered;
  }, [searchQuery, statusFilter, formTypeFilter, leads]);

  // Load leads data
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const [bookingsRes, contactsRes] = await Promise.all([
          fetch(API_ENDPOINTS.BOOKINGS),
          fetch(API_ENDPOINTS.CONTACTS)
        ]);

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
              toLocation: contact.reason || 'General Enquiry',
              status: contact.status === 'new' ? 'Pending' : (['Confirmed', 'Rejected', 'Cancelled'].includes(contact.status) ? contact.status : 'Confirmed'),
              employeeName: contact.employeeName || '',
              formType: contact.reason || 'General Enquiry',
              source: 'Contact Us',
              customerName: contact.fullName,
              tourDate: contact.preferredTravelDates || contact.createdAt,
              numberOfPassengers: contact.numberOfGuests || 0,
              vehicleName: 'N/A',
              message: contact.message,
              customerPhone: contact.phoneNumber,
              customerEmail: contact.email,
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

  // Handle lead action (Pending, Not Contacted, Rejected, Confirm)
  const handleLeadAction = async (action: string) => {
    if (!selectedLead) return;
    setActionLoading(true);
    try {
      const endpoint = selectedLead.source === 'Online Booking'
        ? `${API_ENDPOINTS.BOOKINGS}/${selectedLead.id}/status`
        : `${API_ENDPOINTS.CONTACTS}/${selectedLead.id}/status`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action }),
      });

      if (response.ok) {
        // Update local state
        setLeads(prevLeads => prevLeads.map(l =>
          l.id === selectedLead.id ? { ...l, status: action } : l
        ));
        handleCloseDialog();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update lead status');
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
  const handleViewClick = (lead: Lead) => {
    setSelectedLead(lead);
    setOpenDialog(true);
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
      backgroundColor: '#f8fafc',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
      },
      '&.Mui-focused': {
        backgroundColor: '#ffffff',
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
            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
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
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
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
                  backgroundColor: '#f8fafc',
                  fontWeight: 600,
                  color: '#334155',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0',
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
                {['All', 'Confirmed', 'Pending', 'Rejected', 'Cancelled', 'Not Contacted', 'Not Followed Yet'].map(
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
                          background: '#f1f5f9',
                        },
                      }}
                    >
                      {status}
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
                  backgroundColor: '#f8fafc',
                  fontWeight: 600,
                  color: '#334155',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0',
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
        </Box>
      </Paper>

      {/* Leads Table */}
      <Paper
        sx={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
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
            <TableContainer sx={{ overflowX: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {/* Shared header cell sx */}
                    {[
                      'Lead ID',
                      'Lead Date',
                      'From → To',
                      'Status',
                      'Employee',
                      'Trip Type',   // renamed from "Form Type"
                      'Form Type',   // new column
                      'Action',
                    ].map((header, idx) => (
                      <TableCell
                        key={header}
                        align={header === 'Action' ? 'center' : 'left'}
                        sx={{
                          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '2px solid #e2e8f0',
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
                              backgroundColor: '#f8fafc',
                              transform: 'scale(1.001)',
                            },
                            '&:not(:last-child)': {
                              borderBottom: '1px solid #f1f5f9',
                            },
                          }}
                        >
                          {/* Lead ID */}
                          <TableCell>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                color: '#3b82f6',
                                fontSize: '0.9375rem',
                              }}
                            >
                              {lead.id}
                            </Typography>
                          </TableCell>

                          {/* Lead Date */}
                          <TableCell>
                            <Typography sx={{ fontSize: '0.9375rem', color: '#334155' }}>
                              {formatDate(lead.leadDate)}
                            </Typography>
                          </TableCell>

                          {/* From → To */}
                          <TableCell>
                            {lead.source !== 'Contact Us' && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography
                                  sx={{ fontSize: '0.9375rem', color: '#334155', fontWeight: 600 }}
                                >
                                  {lead.fromLocation}
                                </Typography>
                                <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>→</Typography>
                                <Typography
                                  sx={{ fontSize: '0.9375rem', color: '#334155', fontWeight: 600 }}
                                >
                                  {lead.toLocation}
                                </Typography>
                              </Box>
                            )}
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Chip
                              icon={<statusStyle.IconComponent sx={{ fontSize: 16 }} />}
                              label={lead.status}
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
                              color: lead.employeeName ? '#334155' : '#94a3b8',
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
                                background: '#f1f5f9',
                                color: '#64748b',
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
                                  ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
                                  : 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
                                color: lead.source === 'Online Booking' ? '#2563eb' : '#7c3aed',
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
                                    ? '#f1f5f9'
                                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  color: lead.employeeName ? '#94a3b8' : '#ffffff',
                                  borderRadius: '10px',
                                  padding: '8px',
                                  transition: 'all 0.3s ease',
                                  cursor: lead.employeeName ? 'not-allowed' : 'pointer',
                                  '&:hover': {
                                    background: lead.employeeName
                                      ? '#f1f5f9'
                                      : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                    transform: lead.employeeName ? 'none' : 'translateY(-2px)',
                                    boxShadow: lead.employeeName ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.4)',
                                  },
                                  '&.Mui-disabled': {
                                    background: '#f1f5f9',
                                    color: '#94a3b8',
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
                borderTop: '1px solid #f1f5f9',
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontWeight: 500,
                  color: '#64748b',
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
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PersonIcon sx={{ fontSize: 32 }} />
            <span>Lead Details</span>
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              color: '#ffffff',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {selectedLead && (
            <Box>
              {/* Message Alert */}
              {showMessage && selectedLead.message && (
                <Alert
                  icon={<MessageIcon sx={{ fontSize: 24 }} />}
                  severity="info"
                  onClose={() => setShowMessage(false)}
                  sx={{
                    mb: 3,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    border: '1px solid #93c5fd',
                    '& .MuiAlert-icon': {
                      color: '#3b82f6',
                    },
                    '& .MuiAlert-message': {
                      color: '#1e40af',
                      fontWeight: 500,
                    },
                  }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Customer Message:</Typography>
                  {selectedLead.message}
                </Alert>
              )}

              {/* Lead Information Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                {/* Customer Name */}
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
                      Customer Name
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                    {selectedLead.customerName}
                  </Typography>
                </Box>

                {/* Lead ID */}
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, mb: 1 }}>
                    Lead ID
                  </Typography>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#3b82f6' }}>
                    {selectedLead.id}
                  </Typography>
                </Box>

                {/* Lead Date */}
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
                      Lead Date
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                    {formatDate(selectedLead.leadDate)}
                  </Typography>
                </Box>

                {/* Tour Date */}
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarIcon sx={{ color: '#10b981', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
                      Tour Date
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                    {formatDate(selectedLead.tourDate)}
                  </Typography>
                </Box>

                {/* Number of Passengers */}
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PeopleIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
                      Number of Passengers
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                    {selectedLead.numberOfPassengers} {selectedLead.numberOfPassengers === 1 ? 'Person' : 'People'}
                  </Typography>
                </Box>

                {/* Vehicle Name */}
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DirectionsCarIcon sx={{ color: '#ec4899', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
                      Vehicle Name
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                    {selectedLead.vehicleName}
                  </Typography>
                </Box>

                {/* From Location */}
                {selectedLead.source !== 'Contact Us' && (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOnIcon sx={{ color: '#0ea5e9', fontSize: 20 }} />
                      <Typography sx={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
                        From Location
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                      {selectedLead.fromLocation}
                    </Typography>
                  </Box>
                )}

                {/* To Location */}
                {selectedLead.source !== 'Contact Us' && (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOnIcon sx={{ color: '#14b8a6', fontSize: 20 }} />
                      <Typography sx={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
                        To Location
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                      {selectedLead.toLocation}
                    </Typography>
                  </Box>
                )}

                {/* Contact Information */}
                {selectedLead.customerPhone && (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, mb: 1 }}>
                      Phone Number
                    </Typography>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                      {selectedLead.customerPhone}
                    </Typography>
                  </Box>
                )}

                {selectedLead.customerEmail && (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, mb: 1 }}>
                      Email Address
                    </Typography>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                      {selectedLead.customerEmail}
                    </Typography>
                  </Box>
                )}

                {/* Status and Employee */}
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, mb: 1 }}>
                    Status
                  </Typography>
                  {(() => {
                    const statusStyle = getStatusColor(selectedLead.status);
                    return (
                      <Chip
                        icon={<statusStyle.IconComponent sx={{ fontSize: 16 }} />}
                        label={selectedLead.status}
                        sx={{
                          background: `linear-gradient(135deg, ${statusStyle.bgColor} 0%, ${statusStyle.bgColor}cc 100%)`,
                          color: statusStyle.color,
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          borderRadius: '8px',
                          height: '32px',
                          '& .MuiChip-icon': {
                            color: statusStyle.color,
                          },
                        }}
                      />
                    );
                  })()}
                </Box>

                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, mb: 1 }}>
                    Followed By
                  </Typography>
                  <Typography sx={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: selectedLead.employeeName ? '#1e293b' : '#94a3b8',
                    fontStyle: selectedLead.employeeName ? 'normal' : 'italic',
                  }}>
                    {selectedLead.employeeName || 'Not Assigned'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            gap: 1.5,
          }}
        >
          {selectedLead?.status === 'Not Followed Yet' && (
            <>
              <Button
                onClick={() => handleLeadAction('Pending')}
                disabled={actionLoading}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  px: 3,
                  py: 1.5,
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    boxShadow: '0 6px 20px rgba(245, 158, 11, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: '#e2e8f0',
                    color: '#94a3b8',
                  },
                }}
              >
                {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Mark as Pending'}
              </Button>
              <Button
                onClick={() => handleLeadAction('Not Contacted')}
                disabled={actionLoading}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  px: 3,
                  py: 1.5,
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: '#e2e8f0',
                    color: '#94a3b8',
                  },
                }}
              >
                {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Not Contacted'}
              </Button>
              <Button
                onClick={() => handleLeadAction('Rejected')}
                disabled={actionLoading}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  px: 3,
                  py: 1.5,
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: '#e2e8f0',
                    color: '#94a3b8',
                  },
                }}
              >
                {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Reject'}
              </Button>
            </>
          )}

          {(selectedLead?.status === 'Not Contacted' || selectedLead?.status === 'Pending') && (
            <>
              <Button
                onClick={() => handleLeadAction('Rejected')}
                disabled={actionLoading}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  px: 3,
                  py: 1.5,
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: '#e2e8f0',
                    color: '#94a3b8',
                  },
                }}
              >
                {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Reject'}
              </Button>
              <Button
                onClick={() => handleLeadAction('Confirmed')}
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
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: '#e2e8f0',
                    color: '#94a3b8',
                  },
                }}
              >
                {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Confirm'}
              </Button>
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
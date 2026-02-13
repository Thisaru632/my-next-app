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
} from '@mui/material';
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
} from '@mui/icons-material';

// Types
interface Lead {
  id: string;
  leadDate: string;
  fromLocation: string;
  toLocation: string;
  status: 'Confirmed' | 'Pending' | 'Rejected' | 'Not Contacted' | 'Not Followed Yet';
  employeeName: string;
  formType: string;
  customerName: string;
  tourDate: string;
  numberOfPassengers: number;
  vehicleName: string;
  message?: string;
  customerPhone?: string;
  customerEmail?: string;
}

// Mock data
const mockLeads: Lead[] = [
  {
    id: 'LD-2024-001',
    leadDate: '2024-02-10',
    fromLocation: 'Colombo',
    toLocation: 'Kandy',
    status: 'Confirmed',
    employeeName: 'Sarah Johnson',
    formType: 'Online Booking',
    customerName: 'John Smith',
    tourDate: '2024-02-20',
    numberOfPassengers: 4,
    vehicleName: 'Toyota Hiace',
    message: 'Need child seats for 2 kids. Prefer early morning departure.',
    customerPhone: '+94 77 123 4567',
    customerEmail: 'john.smith@email.com',
  },
  {
    id: 'LD-2024-002',
    leadDate: '2024-02-11',
    fromLocation: 'Galle',
    toLocation: 'Ella',
    status: 'Pending',
    employeeName: 'Michael Chen',
    formType: 'Phone Inquiry',
    customerName: 'Emma Wilson',
    tourDate: '2024-02-25',
    numberOfPassengers: 2,
    vehicleName: 'Toyota Corolla',
    customerPhone: '+94 71 234 5678',
    customerEmail: 'emma.w@email.com',
  },
  {
    id: 'LD-2024-003',
    leadDate: '2024-02-11',
    fromLocation: 'Negombo',
    toLocation: 'Sigiriya',
    status: 'Confirmed',
    employeeName: 'Emily Davis',
    formType: 'Website Form',
    customerName: 'David Brown',
    tourDate: '2024-02-22',
    numberOfPassengers: 6,
    vehicleName: 'Toyota KDH Van',
    message: 'Group tour with photography equipment. Need extra space.',
    customerPhone: '+94 76 345 6789',
    customerEmail: 'd.brown@email.com',
  },
  {
    id: 'LD-2024-004',
    leadDate: '2024-02-12',
    fromLocation: 'Colombo',
    toLocation: 'Nuwara Eliya',
    status: 'Not Contacted',
    employeeName: 'David Martinez',
    formType: 'Online Booking',
    customerName: 'Lisa Anderson',
    tourDate: '2024-02-28',
    numberOfPassengers: 3,
    vehicleName: 'SUV',
    customerPhone: '+94 75 456 7890',
    customerEmail: 'lisa.a@email.com',
  },
  {
    id: 'LD-2024-005',
    leadDate: '2024-02-12',
    fromLocation: 'Bentota',
    toLocation: 'Yala',
    status: 'Rejected',
    employeeName: 'Jessica Taylor',
    formType: 'Email Inquiry',
    customerName: 'Robert Taylor',
    tourDate: '2024-02-26',
    numberOfPassengers: 5,
    vehicleName: 'Van',
    message: 'Customer found alternative transportation.',
    customerPhone: '+94 77 567 8901',
    customerEmail: 'r.taylor@email.com',
  },
  {
    id: 'LD-2024-006',
    leadDate: '2024-02-13',
    fromLocation: 'Colombo',
    toLocation: 'Jaffna',
    status: 'Pending',
    employeeName: 'Robert Anderson',
    formType: 'Phone Inquiry',
    customerName: 'Maria Garcia',
    tourDate: '2024-03-01',
    numberOfPassengers: 2,
    vehicleName: 'Car',
    customerPhone: '+94 71 678 9012',
    customerEmail: 'm.garcia@email.com',
  },
  {
    id: 'LD-2024-007',
    leadDate: '2024-02-13',
    fromLocation: 'Trincomalee',
    toLocation: 'Anuradhapura',
    status: 'Confirmed',
    employeeName: 'Jennifer Wilson',
    formType: 'Website Form',
    customerName: 'Ahmed Hassan',
    tourDate: '2024-02-24',
    numberOfPassengers: 4,
    vehicleName: 'Toyota Hiace',
    message: 'Visiting ancient sites. Need guide recommendations.',
    customerPhone: '+94 76 789 0123',
    customerEmail: 'a.hassan@email.com',
  },
  {
    id: 'LD-2024-008',
    leadDate: '2024-02-13',
    fromLocation: 'Kandy',
    toLocation: 'Colombo Airport',
    status: 'Not Followed Yet',
    employeeName: '', // Not assigned yet
    formType: 'Online Booking',
    customerName: 'Sophie Martin',
    tourDate: '2024-02-27',
    numberOfPassengers: 1,
    vehicleName: 'Car',
    customerPhone: '+94 77 890 1234',
    customerEmail: 's.martin@email.com',
  },
  {
    id: 'LD-2024-009',
    leadDate: '2024-02-13',
    fromLocation: 'Matara',
    toLocation: 'Mirissa',
    status: 'Not Followed Yet',
    employeeName: '', // Not assigned yet
    formType: 'Website Form',
    customerName: 'Jennifer Lee',
    tourDate: '2024-03-05',
    numberOfPassengers: 2,
    vehicleName: 'Car',
    message: 'Interested in whale watching tour. Need early morning pickup.',
    customerPhone: '+94 72 901 2345',
    customerEmail: 'j.lee@email.com',
  },
  {
    id: 'LD-2024-010',
    leadDate: '2024-02-14',
    fromLocation: 'Colombo',
    toLocation: 'Galle',
    status: 'Not Contacted',
    employeeName: 'Sarah Johnson',
    formType: 'Phone Inquiry',
    customerName: 'Thomas White',
    tourDate: '2024-03-08',
    numberOfPassengers: 4,
    vehicleName: 'SUV',
    customerPhone: '+94 77 012 3456',
    customerEmail: 't.white@email.com',
  },
];

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
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
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Use useMemo to compute filtered leads without causing cascading renders
  const filteredLeads = useMemo(() => {
    let filtered = leads;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (lead) =>
          lead.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.toLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }

    return filtered;
  }, [searchQuery, statusFilter, leads]);

  // Load leads data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLeads(mockLeads);
      setLoading(false);
    }, 800);
  }, []);

  // Handle lead action (Pending, Not Contacted, Rejected, Confirm)
  const handleLeadAction = async (action: string) => {
    setActionLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log(`Lead ${selectedLead?.id} action: ${action}`);
      // Here you would make your API call to update the lead status
      // Example: await updateLeadStatus(selectedLead?.id, action);
      setActionLoading(false);
      handleCloseDialog();
      // Optionally refresh the leads list
      // fetchLeads();
    }, 1000);
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
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: 1, width: '100%' }}>
            <TextField
              fullWidth
              placeholder="Search by Lead ID, Customer, Location, or Employee..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0); // Reset to first page
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
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
              }}
            />
          </Box>
          <Box sx={{ flex: 1, width: '100%' }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['All', 'Confirmed', 'Pending', 'Rejected', 'Not Contacted', 'Not Followed Yet'].map(
                (status) => (
                  <Chip
                    key={status}
                    label={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setPage(0); // Reset to first page
                    }}
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      ...(statusFilter === status
                        ? {
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#ffffff',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                          }
                        : {
                            background: '#f1f5f9',
                            color: '#475569',
                            '&:hover': {
                              background: '#e2e8f0',
                              transform: 'translateY(-2px)',
                            },
                          }),
                    }}
                  />
                )
              )}
            </Box>
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
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
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
                      Lead ID
                    </TableCell>
                    <TableCell
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
                      Lead Date
                    </TableCell>
                    <TableCell
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
                      From → To
                    </TableCell>
                    <TableCell
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
                      Status
                    </TableCell>
                    <TableCell
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
                      Employee
                    </TableCell>
                    <TableCell
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
                      Form Type
                    </TableCell>
                    <TableCell
                      align="center"
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
                      Action
                    </TableCell>
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
                          <TableCell>
                            <Typography sx={{ fontSize: '0.9375rem', color: '#334155' }}>
                              {formatDate(lead.leadDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
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
                          <TableCell align="center">
                            <IconButton
                              onClick={() => handleViewClick(lead)}
                              sx={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: '#ffffff',
                                borderRadius: '10px',
                                padding: '8px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
                                },
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: 20 }} />
                            </IconButton>
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

                {/* To Location */}
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
    </Box>
  );
};

export default LeadInfoPage;
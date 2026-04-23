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
  CircularProgress,
  InputAdornment,
  TablePagination,
  Grid,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  DirectionsBus as BusIcon,
  WhatsApp as WhatsAppIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';

import { API_ENDPOINTS, API_BASE_URL } from '@/config/api';

interface VehicleRegistration {
  _id: string;
  driverName: string;
  whatsappNo: string;
  busLocation: string;
  busImages: string[];
  status: 'Pending' | 'Approved' | 'Rejected' | 'Registered';

  createdAt: string;
}

const VehicleRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState<VehicleRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReg, setSelectedReg] = useState<VehicleRegistration | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');


  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.VEHICLE_REGISTRATIONS);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setStatusUpdating(true);
      // We haven't implemented PATCH route in backend yet, so I'll need to add it 
      // OR mock success if I'm purely doing UI here.
      // Actually, I'll add the PATCH route to backend after this.
      const response = await fetch(`${API_ENDPOINTS.VEHICLE_REGISTRATIONS}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setRegistrations(prev => prev.map(reg => reg._id === id ? { ...reg, status: newStatus as any } : reg));
        if (selectedReg && selectedReg._id === id) {
          setSelectedReg({ ...selectedReg, status: newStatus as any });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.VEHICLE_REGISTRATIONS}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRegistrations(prev => prev.filter(reg => reg._id !== id));
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
    }
  };


  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const matchesSearch = reg.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           reg.whatsappNo.includes(searchQuery) ||
                           reg.busLocation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || reg.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [registrations, searchQuery, statusFilter]);


  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" size="small" />;
      case 'Rejected':
        return <Chip icon={<CancelIcon />} label="Rejected" color="error" size="small" />;
      case 'Registered':
        return <Chip icon={<VerifiedIcon />} label="Registered" color="info" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534' }} />;
      default:
        return <Chip icon={<HourglassEmptyIcon />} label="Pending" color="warning" size="small" />;
    }

  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 2, color: 'white' }}>
            <BusIcon />
          </Box>
          <Typography variant="h5" fontWeight="bold">Vehicle Registrations</Typography>
        </Box>
      </Box>

      {/* Filters & Search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search by name, phone or location..."
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="disabled" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
            <MenuItem value="Registered">Registered</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>

          Total Registrations: <strong>{filteredRegistrations.length}</strong>
        </Typography>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography sx={{ mt: 2 }}>Loading registrations...</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Driver Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>WhatsApp No</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Submission Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRegistrations
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((reg) => (
                    <TableRow key={reg._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{reg.driverName}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WhatsAppIcon sx={{ fontSize: 16, color: '#25D366' }} />
                          {reg.whatsappNo}
                        </Box>
                      </TableCell>
                      <TableCell>{reg.busLocation}</TableCell>
                      <TableCell>{formatDate(reg.createdAt)}</TableCell>
                      <TableCell>{getStatusChip(reg.status)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton 
                            onClick={() => {
                              setSelectedReg(reg);
                              setOpenDialog(true);
                            }}
                            color="primary"
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            onClick={() => handleDelete(reg._id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>

                      </TableCell>
                    </TableRow>
                  ))}
                {filteredRegistrations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">No registrations found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRegistrations.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </TableContainer>

      {/* Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        {selectedReg && (
          <>
            <DialogTitle component="div" sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">Driver Details</Typography>
              <IconButton onClick={() => setOpenDialog(false)}>
                <CancelIcon />
              </IconButton>
            </DialogTitle>

            <Divider />
            <DialogContent sx={{ p: 4, bgcolor: '#fafafa' }}>
              <Grid container spacing={4}>
                {/* Left: Info */}
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Driver Name</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.light', color: 'primary.contrastText', display: 'flex' }}>
                          <CheckCircleIcon size={20} />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>{selectedReg.driverName}</Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>WhatsApp Contact</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                        <WhatsAppIcon sx={{ color: '#25D366' }} />
                        <Typography variant="body1" fontWeight={600}>{selectedReg.whatsappNo}</Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Location</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                        <LocationIcon color="action" />
                        <Typography variant="body1" fontWeight={600}>{selectedReg.busLocation}</Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Submission Date</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                        <CalendarIcon color="action" />
                        <Typography variant="body2">{formatDate(selectedReg.createdAt)}</Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold', mb: 1, display: 'block' }}>Current Status</Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {getStatusChip(selectedReg.status)}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Update Status</Typography>
                      <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                        <Button 
                          variant="contained" 
                          color="success" 
                          size="small"
                          disabled={selectedReg.status === 'Approved' || statusUpdating}
                          onClick={() => handleStatusUpdate(selectedReg._id, 'Approved')}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          disabled={selectedReg.status === 'Rejected' || statusUpdating}
                          onClick={() => handleStatusUpdate(selectedReg._id, 'Rejected')}
                        >
                          Reject
                        </Button>
                        <Button 
                          variant="contained" 
                          color="info" 
                          size="small"
                          disabled={selectedReg.status === 'Registered' || statusUpdating}
                          onClick={() => handleStatusUpdate(selectedReg._id, 'Registered')}
                          startIcon={<VerifiedIcon />}
                          sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                        >
                          Mark as Registered
                        </Button>

                      </Box>
                    </Box>
                  </Box>
                </Grid>

                {/* Right: Images */}
                <Grid item xs={12} md={7}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.75rem' }}>
                    Uploaded Bus Images ({selectedReg.busImages.length})
                  </Typography>
                  <Box 
                    sx={{ 
                      mt: 1.5, 
                      p: 2, 
                      bgcolor: 'white', 
                      borderRadius: 3, 
                      border: '1px solid #eee',
                      height: '400px',
                      overflowY: 'auto'
                    }}
                  >
                    <Grid container spacing={2}>
                      {selectedReg.busImages.length > 0 ? selectedReg.busImages.map((img, idx) => (
                        <Grid item xs={6} key={idx}>
                          <Box 
                            sx={{ 
                              position: 'relative', 
                              aspectRatio: '4/3', 
                              borderRadius: 2, 
                              overflow: 'hidden',
                              bgcolor: '#eee',
                              cursor: 'pointer',
                              '&:hover img': { transform: 'scale(1.05)' }
                            }}
                            onClick={() => window.open(`${API_BASE_URL}${img}`, '_blank')}
                          >
                            <img 
                              src={`${API_BASE_URL}${img}`} 
                              alt={`Bus photo ${idx + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                            />
                          </Box>
                        </Grid>
                      )) : (
                        <Grid item xs={12}>
                          <Box sx={{ textAlign: 'center', py: 8, color: 'text.disabled' }}>
                            <Typography variant="body2">No images uploaded</Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default VehicleRegistrationsPage;

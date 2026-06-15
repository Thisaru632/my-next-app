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
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

import { API_ENDPOINTS, API_BASE_URL } from '@/config/api';

interface SuperTeamMember {
  _id: string;
  ownerName: string;
  ownerNIC: string;
  ownerPhone: string;
  ownerDate: string;
  ownerNicFrontImage: string;
  ownerNicBackImage: string;
  driverName: string;
  driverNIC: string;
  driverPhone: string;
  driverLicenseNo: string;
  driverDate: string;
  driverDocFrontImage: string;
  driverDocBackImage: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

const SuperTeamPage = () => {
  const [members, setMembers] = useState<SuperTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<SuperTeamMember | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.SUPER_TEAM);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error fetching super team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            member.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            member.ownerPhone.includes(searchQuery) ||
                            member.driverPhone.includes(searchQuery);
      const matchesStatus = statusFilter === 'All' || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchQuery, statusFilter]);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" size="small" />;
      case 'Rejected':
        return <Chip icon={<CancelIcon />} label="Rejected" color="error" size="small" />;
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

  const handleStatusChange = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      const response = await fetch(`${API_ENDPOINTS.SUPER_TEAM}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setMembers(members.map(member => 
          member._id === id ? { ...member, status: newStatus } : member
        ));
        setSelectedMember(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 2, color: 'white' }}>
            <BusIcon />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">Super Team Members</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ bgcolor: '#f1f5f9', px: 1.5, py: 0.5, borderRadius: 1 }}>
                https://senutours.lk/super-team
              </Typography>
              <Tooltip title="Copy Link">
                <IconButton size="small" onClick={() => {
                  navigator.clipboard.writeText('https://senutours.lk/super-team');
                  alert('Link copied to clipboard!');
                }}>
                  <ShareIcon fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Filters & Search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search by owner/driver name or phone..."
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
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          Total Submissions: <strong>{filteredMembers.length}</strong>
        </Typography>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography sx={{ mt: 2 }}>Loading submissions...</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Owner ID No</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Owner Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Owner Contact No</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Submission Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((member) => (
                    <TableRow key={member._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{member.ownerNIC}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{member.ownerName}</TableCell>
                      <TableCell>{member.ownerPhone}</TableCell>
                      <TableCell>{formatDate(member.createdAt)}</TableCell>
                      <TableCell>{getStatusChip(member.status)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton 
                            onClick={() => {
                              setSelectedMember(member);
                              setOpenDialog(true);
                            }}
                            color="primary"
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">No submissions found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredMembers.length}
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
        {selectedMember && (
          <>
            <DialogTitle component="div" sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">Super Team Membership Details</Typography>
              <IconButton onClick={() => setOpenDialog(false)}>
                <CancelIcon />
              </IconButton>
            </DialogTitle>

            <Divider />
            <DialogContent sx={{ p: 4, bgcolor: '#fafafa' }}>
              <Grid container spacing={4}>
                
                {/* Owner Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', height: '100%' }}>
                  <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ mb: 2.5, textTransform: 'uppercase' }}>
                    Vehicle Owner's Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" sx={{ width: 150, color: 'text.secondary', fontWeight: 'bold' }}>Name</Typography>
                      <Typography variant="body2" fontWeight="500">{selectedMember.ownerName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" sx={{ width: 150, color: 'text.secondary', fontWeight: 'bold' }}>NIC</Typography>
                      <Typography variant="body2" fontWeight="500">{selectedMember.ownerNIC}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" sx={{ width: 150, color: 'text.secondary', fontWeight: 'bold' }}>Phone</Typography>
                      <Typography variant="body2" fontWeight="500">{selectedMember.ownerPhone}</Typography>
                    </Box>

                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 2 }}>
                    UPLOADED OWNER DOCUMENTS
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">NIC (Front)</Typography>
                      <Box sx={{ position: 'relative', height: '100px', borderRadius: 2, overflow: 'hidden', bgcolor: '#f1f5f9', mt: 1, cursor: 'pointer', border: '1px solid #cbd5e1', '&:hover': { borderColor: 'primary.main', opacity: 0.8 } }} onClick={() => window.open(`${API_BASE_URL}${selectedMember.ownerNicFrontImage}`, '_blank')}>
                        <img src={`${API_BASE_URL}${selectedMember.ownerNicFrontImage}`} alt="Owner NIC Front" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">NIC (Back)</Typography>
                      <Box sx={{ position: 'relative', height: '100px', borderRadius: 2, overflow: 'hidden', bgcolor: '#f1f5f9', mt: 1, cursor: 'pointer', border: '1px solid #cbd5e1', '&:hover': { borderColor: 'primary.main', opacity: 0.8 } }} onClick={() => window.open(`${API_BASE_URL}${selectedMember.ownerNicBackImage}`, '_blank')}>
                        <img src={`${API_BASE_URL}${selectedMember.ownerNicBackImage}`} alt="Owner NIC Back" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                </Grid>

                {/* Driver Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ p: 3, bgcolor: '#f0fdf4', borderRadius: 3, border: '1px solid #bbf7d0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', height: '100%' }}>
                  <Typography variant="subtitle1" color="success.main" fontWeight="bold" sx={{ mb: 2.5, textTransform: 'uppercase' }}>
                    Driver's Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" sx={{ width: 150, color: 'text.secondary', fontWeight: 'bold' }}>Name</Typography>
                      <Typography variant="body2" fontWeight="500">{selectedMember.driverName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" sx={{ width: 150, color: 'text.secondary', fontWeight: 'bold' }}>NIC</Typography>
                      <Typography variant="body2" fontWeight="500">{selectedMember.driverNIC}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" sx={{ width: 150, color: 'text.secondary', fontWeight: 'bold' }}>Phone</Typography>
                      <Typography variant="body2" fontWeight="500">{selectedMember.driverPhone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" sx={{ width: 150, color: 'text.secondary', fontWeight: 'bold' }}>License No</Typography>
                      <Typography variant="body2" fontWeight="500">{selectedMember.driverLicenseNo}</Typography>
                    </Box>

                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 2 }}>
                    UPLOADED DRIVER DOCUMENTS
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">License/NIC (Front)</Typography>
                      <Box sx={{ position: 'relative', height: '100px', borderRadius: 2, overflow: 'hidden', bgcolor: '#f1f5f9', mt: 1, cursor: 'pointer', border: '1px solid #cbd5e1', '&:hover': { borderColor: 'primary.main', opacity: 0.8 } }} onClick={() => window.open(`${API_BASE_URL}${selectedMember.driverDocFrontImage}`, '_blank')}>
                        <img src={`${API_BASE_URL}${selectedMember.driverDocFrontImage}`} alt="Driver Doc Front" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">License/NIC (Back)</Typography>
                      <Box sx={{ position: 'relative', height: '100px', borderRadius: 2, overflow: 'hidden', bgcolor: '#f1f5f9', mt: 1, cursor: 'pointer', border: '1px solid #cbd5e1', '&:hover': { borderColor: 'primary.main', opacity: 0.8 } }} onClick={() => window.open(`${API_BASE_URL}${selectedMember.driverDocBackImage}`, '_blank')}>
                        <img src={`${API_BASE_URL}${selectedMember.driverDocBackImage}`} alt="Driver Doc Back" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                </Grid>

              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, px: 4, display: 'flex', justifyContent: 'space-between', bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <Box>
                {selectedMember.status === 'Pending' ? (
                  <>
                    <Button 
                      variant="contained" 
                      color="success" 
                      sx={{ mr: 1.5, fontWeight: 'bold' }}
                      onClick={() => handleStatusChange(selectedMember._id, 'Approved')}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="contained" 
                      color="error"
                      sx={{ fontWeight: 'bold' }}
                      onClick={() => handleStatusChange(selectedMember._id, 'Rejected')}
                    >
                      Reject
                    </Button>
                  </>
                ) : (
                  <Chip 
                    label={`Current Status: ${selectedMember.status}`} 
                    color={selectedMember.status === 'Approved' ? 'success' : 'error'} 
                    variant="outlined" 
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
              </Box>
              <Button onClick={() => setOpenDialog(false)} variant="outlined">Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SuperTeamPage;

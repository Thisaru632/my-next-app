'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  styled,
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Cancel as CancelIcon,
  PhoneMissed as PhoneMissedIcon,
  EventBusy as EventBusyIcon,
  CardGiftcard as CardGiftcardIcon,
  BookOnline as BookOnlineIcon,
  EventAvailable as EventAvailableIcon,
} from '@mui/icons-material';
import { API_ENDPOINTS } from '@/config/api';

interface LeadStats {
  totalLeads: number;
  confirmedLeads: number;
  pendingLeads: number;
  rejectedLeads: number;
  notContactedLeads: number;
  notFollowedYet: number;
}

interface PackageStats {
  totalPackages: number;
  packageBookings: number;
  canceledBookings: number;
}

interface EmployeePerformance {
  name: string;
  email: string;
  isOnline: boolean;
  lastLogout: string | null;
  total: number;
  confirmed: number;
  pending: number;
  rejected: number;
  notContacted: number;
  rate: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

// Helper function to format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format date for display
const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bgColor }) => {
  return (
    <Card
      sx={{
        height: '100%',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'rgba(226, 232, 240, 0.8)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color}, ${color}90)`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 20px 40px -12px ${color}30`,
          borderColor: `${color}40`,
          '&::before': {
            opacity: 1,
          },
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                fontWeight: 500,
                fontSize: '0.875rem',
                letterSpacing: '0.02em',
                mb: 1.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: color,
                fontSize: '2.25rem',
                lineHeight: 1,
              }}
            >
              {(value ?? 0).toLocaleString()}
            </Typography>
          </Box>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}80 100%)`,
              borderRadius: '12px',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${color}20`,
            }}
          >
            {React.cloneElement(icon as React.ReactElement, {
              // sx: { fontSize: 32, color: color },
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const StyledTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  '& thead': {
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  },
  '& th': {
    padding: '16px 20px',
    textAlign: 'left',
    fontWeight: 700,
    fontSize: '0.875rem',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #e2e8f0',
  },
  '& tbody tr': {
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#f8fafc',
    },
    '&:not(:last-child)': {
      borderBottom: '1px solid #f1f5f9',
    },
  },
  '& td': {
    padding: '16px 20px',
    fontSize: '0.9375rem',
    color: '#334155',
  },
});

const AdminDashboard: React.FC = () => {
  const today = new Date();
  const [startDate, setStartDate] = useState<string>(formatDate(today));
  const [endDate, setEndDate] = useState<string>(formatDate(today));
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<LeadStats>({
    totalLeads: 0,
    confirmedLeads: 0,
    pendingLeads: 0,
    rejectedLeads: 0,
    notContactedLeads: 0,
    notFollowedYet: 0,
  });
  const [packageStats, setPackageStats] = useState<PackageStats>({
    totalPackages: 0,
    packageBookings: 0,
    canceledBookings: 0,
  });
  const [performanceData, setPerformanceData] = useState<EmployeePerformance[]>([]);

  useEffect(() => {
    fetchPerformanceData(startDate, endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const fetchPerformanceData = async (start: string, end: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/employees?startDate=${start}&endDate=${end}`);
      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data.performance);
        setStats(data.stats);
        setPackageStats(data.packageStats);
      } else {
        console.error('Failed to fetch performance data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (startDate && endDate) {
      fetchPerformanceData(startDate, endDate);
    }
  };

  const handleReset = () => {
    const todayFormatted = formatDate(new Date());
    setStartDate(todayFormatted);
    setEndDate(todayFormatted);
    fetchPerformanceData(todayFormatted, todayFormatted);
  };

  const leadStatCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: <PeopleIcon />,
      color: '#3b82f6',
      bgColor: '#dbeafe',
    },
    {
      title: 'Confirmed Leads',
      value: stats.confirmedLeads,
      icon: <CheckCircleIcon />,
      color: '#10b981',
      bgColor: '#d1fae5',
    },
    {
      title: 'Pending Leads',
      value: stats.pendingLeads,
      icon: <HourglassEmptyIcon />,
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
    {
      title: 'Rejected Leads',
      value: stats.rejectedLeads,
      icon: <CancelIcon />,
      color: '#ef4444',
      bgColor: '#fee2e2',
    },
    {
      title: 'Not Contacted',
      value: stats.notContactedLeads,
      icon: <PhoneMissedIcon />,
      color: '#8b5cf6',
      bgColor: '#ede9fe',
    },
    {
      title: 'Not Followed Yet',
      value: stats.notFollowedYet,
      icon: <EventBusyIcon />,
      color: '#ec4899',
      bgColor: '#fce7f3',
    },
  ];

  const packageStatCards = [
    {
      title: 'Total Packages',
      value: packageStats.totalPackages,
      icon: <CardGiftcardIcon />,
      color: '#0ea5e9',
      bgColor: '#e0f2fe',
    },
    {
      title: 'Package Bookings',
      value: packageStats.packageBookings,
      icon: <BookOnlineIcon />,
      color: '#14b8a6',
      bgColor: '#ccfbf1',
    },
    {
      title: 'Canceled Bookings',
      value: packageStats.canceledBookings,
      icon: <EventAvailableIcon />,
      color: '#f97316',
      bgColor: '#ffedd5',
    },
  ];

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
          Dashboard
        </Typography>
      </Box>

      {/* Date Range Filter */}
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
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 3,
            color: '#334155',
            fontSize: '1.125rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&::before': {
              content: '""',
              width: '4px',
              height: '24px',
              background: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '2px',
            },
          }}
        >
          Filter by Date Range
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
            '& > *': {
              flex: '1 1 220px',
              minWidth: 0,
            },
            '@media (max-width: 600px)': {
              flexDirection: 'column',
              '& > *': {
                flex: '1 1 100%',
              },
            },
          }}
        >
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.25)',
                },
              },
            }}
          />
          <TextField
            label="End Date"
            type="date"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.25)',
                },
              },
            }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleFilter}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '12px',
              height: '40px',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9375rem',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
                transform: 'translateY(-2px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Apply Filter'}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleReset}
            disabled={loading}
            sx={{
              borderColor: '#cbd5e1',
              borderWidth: '2px',
              color: '#475569',
              borderRadius: '12px',
              height: '40px',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9375rem',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#94a3b8',
                borderWidth: '2px',
                backgroundColor: '#f1f5f9',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(100, 116, 139, 0.15)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            Reset to Today
          </Button>
        </Box>
      </Paper>

      {/* Lead Statistics Section */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 3,
            color: '#1e293b',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            '&::before': {
              content: '""',
              width: '6px',
              height: '28px',
              background: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '3px',
            },
          }}
        >
          Lead Statistics
        </Typography>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
            sx={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
            }}
          >
            <CircularProgress
              size={60}
              sx={{
                color: '#3b82f6',
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr',
              },
              gap: 3,
            }}
          >
            {leadStatCards.map((card, index) => (
              <Box key={index}>
                <StatCard
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  color={card.color}
                  bgColor={card.bgColor}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Package Statistics Section */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 3,
            color: '#1e293b',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            '&::before': {
              content: '""',
              width: '6px',
              height: '28px',
              background: 'linear-gradient(180deg, #0ea5e9 0%, #14b8a6 100%)',
              borderRadius: '3px',
            },
          }}
        >
          Package Statistics
        </Typography>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="300px"
            sx={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
            }}
          >
            <CircularProgress
              size={60}
              sx={{
                color: '#0ea5e9',
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr',
              },
              gap: 3,
            }}
          >
            {packageStatCards.map((card, index) => (
              <Box key={index}>
                <StatCard
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  color={card.color}
                  bgColor={card.bgColor}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Individual Performance Table Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 3,
            color: '#1e293b',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            '&::before': {
              content: '""',
              width: '6px',
              height: '28px',
              background: 'linear-gradient(180deg, #6366f1 0%, #a855f7 100%)',
              borderRadius: '3px',
            },
          }}
        >
          Individual Performance
        </Typography>

        <Paper
          sx={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ overflowX: 'auto' }}>
            <StyledTable>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Login Status</th>
                  <th>Total Leads</th>
                  <th>Confirmed</th>
                  <th>Pending</th>
                  <th>Rejected</th>
                  <th>Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((employee, index) => (
                  <tr key={index}>
                    <td>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            background: `linear-gradient(135deg, ${CHART_COLORS[index % CHART_COLORS.length]}20 0%, ${CHART_COLORS[index % CHART_COLORS.length]}40 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        >
                          {employee.name ? employee.name.split(' ').map((n: string) => n[0]).join('') : '?'}
                        </Box>
                        <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {employee.name}
                        </Typography>
                      </Box>
                    </td>
                    {/* Login Status */}
                    <td>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '20px',
                            width: 'fit-content',
                            background: employee.isOnline
                              ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                              : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                          }}
                        >
                          {/* Animated dot */}
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: employee.isOnline ? '#10b981' : '#94a3b8',
                              boxShadow: employee.isOnline
                                ? '0 0 0 2px #d1fae5, 0 0 8px #10b98180'
                                : 'none',
                              animation: employee.isOnline ? 'pulse 2s infinite' : 'none',
                              '@keyframes pulse': {
                                '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.5)' },
                                '70%': { boxShadow: '0 0 0 6px rgba(16, 185, 129, 0)' },
                                '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
                              },
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: '0.8125rem',
                              fontWeight: 700,
                              color: employee.isOnline ? '#059669' : '#64748b',
                            }}
                          >
                            {employee.isOnline ? 'Online' : 'Offline'}
                          </Typography>
                        </Box>
                        {!employee.isOnline && employee.lastLogout && (
                          <Typography
                            sx={{
                              fontSize: '0.75rem',
                              color: '#94a3b8',
                              fontWeight: 500,
                              pl: 0.5,
                            }}
                          >
                            Last seen:{' '}
                            {new Date(employee.lastLogout).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        )}
                        {!employee.isOnline && !employee.lastLogout && (
                          <Typography sx={{ fontSize: '0.75rem', color: '#cbd5e1', pl: 0.5 }}>
                            Never logged in
                          </Typography>
                        )}
                      </Box>
                    </td>
                    <td>
                      <Typography sx={{ fontWeight: 700, color: '#3b82f6' }}>
                        {employee.total}
                      </Typography>
                    </td>
                    <td>
                      <Typography sx={{ fontWeight: 600, color: '#10b981' }}>
                        {employee.confirmed}
                      </Typography>
                    </td>
                    <td>
                      <Typography sx={{ fontWeight: 600, color: '#f59e0b' }}>
                        {employee.pending}
                      </Typography>
                    </td>
                    <td>
                      <Typography sx={{ fontWeight: 600, color: '#ef4444' }}>
                        {employee.rejected}
                      </Typography>
                    </td>
                    <td>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1,
                          padding: '4px 12px',
                          borderRadius: '8px',
                          background: employee.rate >= 45
                            ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                            : employee.rate >= 40
                              ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                              : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: employee.rate >= 45
                              ? '#059669'
                              : employee.rate >= 40
                                ? '#d97706'
                                : '#dc2626',
                          }}
                        >
                          {employee.rate.toFixed(1)}%
                        </Typography>
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </Box>
        </Paper>
      </Box>

      {/* Additional Info */}
      <Box
        mt={4}
        sx={{
          p: 2,
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '12px',
          border: '1px solid rgba(226, 232, 240, 0.6)',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            fontWeight: 500,
            fontSize: '0.875rem',
            textAlign: 'center',
          }}
        >
          Showing data from {formatDisplayDate(startDate)} to {formatDisplayDate(endDate)}
        </Typography>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
'use client';

import React, { useState, useEffect } from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
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
  Fab,
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Cancel as CancelIcon,
  Send as SendIcon,
  CardGiftcard as CardGiftcardIcon,
  BookOnline as BookOnlineIcon,
  EventAvailable as EventAvailableIcon,
  Book as BookIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { API_ENDPOINTS } from '@/config/api';
import NotebookModal from '@/components/admin/NotebookModal';

interface LeadStats {
  totalLeads: number;
  confirmedLeads: number;
  pendingLeads: number;
  rejectedLeads: number;
  sentInquiries: number;
  ignoredLeads: number;
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
  sentInquiries: number;
  rejected: number;
  ignored: number;
  rate: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  onClick?: () => void;
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

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bgColor, onClick }) => {
  const { mode } = useThemeContext();
  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        background: 'background.paper',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
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
                color: 'text.secondary',
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
              background: mode === 'light'
                ? `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}80 100%)`
                : `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
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
    </Card >
  );
};

const StyledTable = styled('table')(({ theme }) => ({
  width: '100%',
  borderCollapse: 'collapse',
  '& thead': {
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  },
  '& th': {
    padding: '16px 20px',
    textAlign: 'left',
    fontWeight: 700,
    fontSize: '0.875rem',
    color: 'text.secondary',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid',
    borderColor: 'divider',
  },
  '& tbody tr': {
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'action.hover',
    },
    '&:not(:last-child)': {
      borderBottom: '1px solid',
      borderColor: 'divider',
    },
  },
  '& td': {
    padding: '16px 20px',
    fontSize: '0.9375rem',
    color: 'text.primary',
  },
}));

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { mode } = useThemeContext();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<LeadStats>({
    totalLeads: 0,
    confirmedLeads: 0,
    pendingLeads: 0,
    rejectedLeads: 0,
    sentInquiries: 0,
    ignoredLeads: 0,
  });
  const [packageStats, setPackageStats] = useState<PackageStats>({
    totalPackages: 0,
    packageBookings: 0,
    canceledBookings: 0,
  });
  const [performanceData, setPerformanceData] = useState<EmployeePerformance[]>([]);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);

  useEffect(() => {
    // Fetch ALL data on first load (no date restriction)
    fetchPerformanceData('', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPerformanceData = async (start: string, end: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_ENDPOINTS.AUTH}/employees`;
      const params = [];
      if (start) params.push(`startDate=${start}`);
      if (end) params.push(`endDate=${end}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data.performance || []);
        setStats(data.stats || { totalLeads: 0, confirmedLeads: 0, pendingLeads: 0, rejectedLeads: 0, sentInquiries: 0, ignoredLeads: 0 });
        setPackageStats(data.packageStats || { totalPackages: 0, packageBookings: 0, canceledBookings: 0 });
      } else {
        setError(`Failed to load data: ${response.statusText}`);
        console.error('Failed to fetch performance data:', response.statusText);
      }
    } catch (error) {
      setError('Could not connect to server. Please check that the backend is running.');
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchPerformanceData(startDate, endDate);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    fetchPerformanceData('', '');
  };
  const leadStatCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: <PeopleIcon />,
      color: '#3b82f6',
      bgColor: '#dbeafe',
      status: 'All',
    },
    {
      title: 'Confirmed Leads',
      value: stats.confirmedLeads,
      icon: <CheckCircleIcon />,
      color: '#10b981',
      bgColor: '#d1fae5',
      status: 'Confirmed',
    },
    {
      title: 'Pending Leads',
      value: stats.pendingLeads,
      icon: <HourglassEmptyIcon />,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      status: 'Pending',
    },
    {
      title: 'Rejected Leads',
      value: stats.rejectedLeads,
      icon: <CancelIcon />,
      color: '#ef4444',
      bgColor: '#fee2e2',
      status: 'Rejected',
    },
    {
      title: 'Sent Inquiries',
      value: stats.sentInquiries,
      icon: <SendIcon />,
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      status: 'Sent Inquiry',
    },
    {
      title: 'Ignored Leads',
      value: stats.ignoredLeads,
      icon: <BlockIcon />,
      color: '#64748b',
      bgColor: '#f1f5f9',
      status: 'Ignored',
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
            background: mode === 'light'
              ? 'linear-gradient(135deg, #1e293b 0%, #475569 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
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
          background: 'background.paper',
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: 'text.primary',
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

        {/* Quick filters */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
          {[
            { label: 'All Time', start: '', end: '' },
            { label: 'Today', start: formatDate(new Date()), end: formatDate(new Date()) },
            {
              label: 'This Week',
              start: formatDate(new Date(new Date().setDate(new Date().getDate() - 6))),
              end: formatDate(new Date()),
            },
            {
              label: 'This Month',
              start: formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
              end: formatDate(new Date()),
            },
          ].map((q) => (
            <Button
              key={q.label}
              size="small"
              variant={
                startDate === q.start && endDate === q.end ? 'contained' : 'outlined'
              }
              onClick={() => {
                setStartDate(q.start);
                setEndDate(q.end);
                fetchPerformanceData(q.start, q.end);
              }}
              disabled={loading}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                px: 2,
                ...(startDate === q.start && endDate === q.end
                  ? {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                    border: 'none',
                  }
                  : {
                    borderColor: 'divider',
                    color: 'text.secondary',
                    '&:hover': { borderColor: 'text.primary', backgroundColor: 'action.hover' },
                  }),
              }}
            >
              {q.label}
            </Button>
          ))}
        </Box>

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
            placeholder="Leave blank for all time"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: 'background.paper',
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
            placeholder="Leave blank for all time"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: 'background.paper',
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
              borderColor: 'divider',
              borderWidth: '2px',
              color: 'text.secondary',
              borderRadius: '12px',
              height: '40px',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9375rem',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'text.primary',
                borderWidth: '2px',
                backgroundColor: 'action.hover',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(100, 116, 139, 0.15)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            All Time
          </Button>
        </Box>

        {/* Error message */}
        {error && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              border: '1px solid #fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography sx={{ color: '#dc2626', fontWeight: 600, fontSize: '0.875rem' }}>
              ⚠️ {error}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Booking Lead Statistics Section */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 0.5,
              '&::before': {
                content: '""',
                width: '6px',
                height: '28px',
                background: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '3px',
              },
            }}
          >
            Booking Lead Statistics
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem', pl: '14px' }}
          >
            Online booking leads only — contact form inquiries are excluded
          </Typography>
        </Box>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
            sx={{
              background: 'action.disabledBackground',
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
                  onClick={() => router.push(`/staff/leads?status=${card.status}`)}
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
            color: 'text.primary',
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
              background: 'action.disabledBackground',
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
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 0.5,
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
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem', pl: '14px' }}
          >
            Staff performance based on booking leads only
          </Typography>
        </Box>

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
          <Box sx={{
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'divider',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'background.default',
            },
            '@media (max-width: 600px)': {
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#3b82f6',
              }
            }
          }}>
            <StyledTable>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Login Status</th>
                  <th>Total Leads</th>
                  <th>Confirmed</th>
                  <th>Sent Inquiries</th>
                  <th>Rejected</th>
                  <th>Ignored</th>
                  <th>Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '48px 20px', color: 'text.disabled' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>No staff data found</div>
                      <div style={{ fontSize: '0.875rem' }}>No employees or leads match the selected date range.</div>
                    </td>
                  </tr>
                )}
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
                        <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
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
                              ? (theme.palette.mode === 'light' ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'rgba(16, 185, 129, 0.15)')
                              : (theme.palette.mode === 'light' ? 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' : 'rgba(148, 163, 184, 0.15)'),
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
                              color: employee.isOnline
                                ? (theme.palette.mode === 'light' ? '#059669' : '#34d399')
                                : 'text.secondary',
                            }}
                          >
                            {employee.isOnline ? 'Online' : 'Offline'}
                          </Typography>
                        </Box>
                        {!employee.isOnline && employee.lastLogout && (
                          <Typography
                            sx={{
                              fontSize: '0.75rem',
                              color: 'text.disabled',
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
                      <Typography sx={{ fontWeight: 600, color: '#8b5cf6' }}>
                        {employee.sentInquiries}
                      </Typography>
                    </td>
                    <td>
                      <Typography sx={{ fontWeight: 600, color: '#ef4444' }}>
                        {employee.rejected}
                      </Typography>
                    </td>
                    <td>
                      <Typography sx={{ fontWeight: 600, color: '#64748b' }}>
                        {employee.ignored}
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
          {startDate && endDate
            ? `Showing data from ${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`
            : 'Showing all-time data'}
        </Typography>
      </Box>

      {/* Notebook Floating Action Button */}
      <Fab
        aria-label="notebook"
        onClick={() => setIsNotebookOpen(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 32 },
          right: { xs: 16, md: 32 },
          color: '#fff',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
          transition: 'transform 0.2s',
          zIndex: 1000,
          '&:hover': {
            transform: 'scale(1.05) translateY(-4px)',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          }
        }}
      >
        <BookIcon />
      </Fab>

      <NotebookModal open={isNotebookOpen} onClose={() => setIsNotebookOpen(false)} />
    </Box>
  );
};

export default AdminDashboard;
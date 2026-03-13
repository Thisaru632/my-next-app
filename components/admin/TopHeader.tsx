'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Badge,
    Avatar,
    Menu,
    MenuItem,
    Tooltip,
    Divider,
    ListItemIcon,
    Button,
    CircularProgress,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Menu as MenuIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useThemeContext } from '@/context/ThemeContext';
import { useTheme } from '@mui/material/styles';

import { API_ENDPOINTS } from '@/config/api';

const DRAWER_WIDTH = 260;

interface TopHeaderProps {
    onMenuClick?: () => void;
    showMenuIcon?: boolean;
}

const TopHeader: React.FC<TopHeaderProps> = ({ onMenuClick, showMenuIcon }) => {
    const router = useRouter();
    const theme = useTheme();
    const { mode, toggleColorMode } = useThemeContext();
    const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [user, setUser] = useState<{ fullName?: string; username: string; email: string } | null>(null);
    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [notifLoading, setNotifLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_ENDPOINTS.AUTH}/notifications/count`);
            if (res.ok) {
                const data = await res.json();
                setNotificationCount(data.total);
            }
        } catch (e) {
            // Silence "Failed to fetch" to avoid console noise when server is down
            if (e instanceof TypeError && e.message === 'Failed to fetch') return;
            console.error('Error fetching notifications:', e);
        }
    };

    const fetchNotificationList = async () => {
        setNotifLoading(true);
        try {
            const res = await fetch(`${API_ENDPOINTS.AUTH}/notifications`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (e) {
            if (e instanceof TypeError && e.message === 'Failed to fetch') return;
            console.error('Error fetching notification list:', e);
        } finally {
            setNotifLoading(false);
        }
    };

    useEffect(() => {
        const userStr = localStorage.getItem('staffUser');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
                
                // Only poll if authenticated
                fetchNotifications();
                const interval = setInterval(fetchNotifications, 30000);
                return () => clearInterval(interval);
            } catch (e) {
                console.error('Error parsing user:', e);
            }
        }
    }, []);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
        setNotifAnchorEl(event.currentTarget);
        fetchNotificationList();
    };

    const handleNotifClose = () => {
        setNotifAnchorEl(null);
    };

    const handleMarkAllRead = async () => {
        try {
            const res = await fetch(`${API_ENDPOINTS.AUTH}/notifications/mark-all-read`, {
                method: 'POST'
            });
            if (res.ok) {
                setNotificationCount(0);
                setNotifications([]);
                handleNotifClose();
            }
        } catch (e) {
            console.error('Error marking all read:', e);
        }
    };

    const handleLogout = async () => {
        try {
            if (user) {
                await fetch(`${API_ENDPOINTS.AUTH}/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, username: user.username }),
                });
            }
        } catch (e) { }
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffUser');
        router.push('/staff/login');
    };

    const formatNotifTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <AppBar
            position="sticky"
            sx={{
                width: '100%',
                backgroundColor: 'background.paper',
                color: 'text.primary',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                borderBottom: '1px solid',
                borderColor: 'divider',
                zIndex: (theme) => theme.zIndex.drawer + 0,
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
                {/* Left Section: Mobile Menu Icon or Page title */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {showMenuIcon && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={onMenuClick}
                            sx={{ mr: 2, display: { md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Link href="/staff" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                display: { xs: showMenuIcon ? 'none' : 'block', sm: 'block' },
                                cursor: 'pointer'
                            }}
                        >
                            <Image
                                src="/senu tours 3d.png"
                                alt="Senu Tours Logo"
                                width={60}
                                height={20}
                                priority
                                style={{ objectFit: 'contain' }}
                            />
                        </Box>
                    </Link>
                </Box>

                {/* Right Section: Theme Toggle, Notification & Profile */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                    {/* Theme Toggle Button */}
                    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                        <IconButton
                            onClick={toggleColorMode}
                            sx={{
                                backgroundColor: mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)',
                                '&:hover': { backgroundColor: mode === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)' },
                                transition: 'all 0.2s',
                            }}
                        >
                            {mode === 'light' ? (
                                <DarkModeIcon sx={{ color: '#64748b' }} />
                            ) : (
                                <LightModeIcon sx={{ color: '#fbbf24' }} />
                            )}
                        </IconButton>
                    </Tooltip>

                    {/* Notification Button */}
                    <Tooltip title={`${notificationCount} New Leads`}>
                        <IconButton
                            onClick={handleNotifOpen}
                            sx={{
                                backgroundColor: mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)',
                                '&:hover': { backgroundColor: mode === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)' },
                                transition: 'all 0.2s',
                            }}
                        >
                            <Badge badgeContent={notificationCount} color="error">
                                <NotificationsIcon sx={{ color: mode === 'light' ? '#64748b' : '#94a3b8' }} />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={notifAnchorEl}
                        open={Boolean(notifAnchorEl)}
                        onClose={handleNotifClose}
                        PaperProps={{
                            sx: {
                                mt: 1.5,
                                width: 320,
                                maxHeight: 480,
                                borderRadius: '16px',
                                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                                border: '1px solid',
                                borderColor: 'divider',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: mode === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.02)' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Notifications</Typography>
                            {notificationCount > 0 && (
                                <Typography
                                    variant="caption"
                                    onClick={handleMarkAllRead}
                                    sx={{
                                        color: 'primary.main',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Mark all as read
                                </Typography>
                            )}
                        </Box>
                        <Divider />
                        <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                            {notifLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box>
                            ) : notifications.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <NotificationsIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                                    <Typography variant="body2" color="text.secondary">No new notifications</Typography>
                                </Box>
                            ) : (
                                notifications.map((notif: any) => (
                                    <MenuItem
                                        key={notif.id}
                                        onClick={() => {
                                            router.push('/staff/leads');
                                            handleNotifClose();
                                        }}
                                        sx={{
                                            py: 1.5,
                                            px: 2,
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            whiteSpace: 'normal',
                                            gap: 0.5,
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.25 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: notif.type === 'booking' ? 'primary.main' : 'secondary.main' }}>
                                                {notif.title}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                                {formatNotifTime(notif.createdAt)}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{notif.subtitle}</Typography>
                                    </MenuItem>
                                ))
                            )}
                        </Box>
                        <Divider />
                        <Box sx={{ p: 1 }}>
                            <Button
                                fullWidth
                                onClick={() => {
                                    router.push('/staff/leads');
                                    handleNotifClose();
                                }}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                View All Leads
                            </Button>
                        </Box>
                    </Menu>

                    <Divider orientation="vertical" flexItem sx={{ my: 1.5, mx: 0.5 }} />

                    {/* User Info & Profile Menu */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: 'pointer',
                            p: 0.5,
                            pr: 1.5,
                            borderRadius: '12px',
                            transition: 'all 0.2s',
                            '&:hover': {
                                backgroundColor: mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)',
                            },
                        }}
                        onClick={handleMenuOpen}
                    >
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                            <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}
                            >
                                {user?.fullName || user?.username || 'Staff User'}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontWeight: 500 }}
                            >
                                {user?.username ? `@${user.username}` : 'Administrator'}
                            </Typography>
                        </Box>
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                            }}
                        >
                            {(user?.fullName || user?.username || 'S')[0].toUpperCase()}
                        </Avatar>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        onClick={handleMenuClose}
                        PaperProps={{
                            sx: {
                                mt: 1.5,
                                width: 200,
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                                border: '1px solid',
                                borderColor: 'divider',
                                p: 1,
                                backgroundColor: 'background.paper',
                                color: 'text.primary',
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem
                            onClick={() => router.push('/staff/profile')}
                            sx={{ borderRadius: '8px', mb: 0.5 }}
                        >
                            <ListItemIcon>
                                <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            Profile
                        </MenuItem>
                        <MenuItem
                            onClick={() => router.push('/staff/settings')}
                            sx={{ borderRadius: '8px', mb: 0.5 }}
                        >
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            Settings
                        </MenuItem>
                        <Divider sx={{ my: 1 }} />
                        <MenuItem
                            onClick={handleLogout}
                            sx={{
                                borderRadius: '8px',
                                color: '#ef4444',
                                '&:hover': { backgroundColor: '#fee2e2' },
                            }}
                        >
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar >
    );
};

export default TopHeader;

'use client';
import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Divider,
    Typography,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Article as ArticleIcon,
    Logout as LogoutIcon,
    ManageAccounts as ManageAccountsIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { API_ENDPOINTS } from '@/config/api';

const DRAWER_WIDTH = 260;

interface MenuItem {
    text: string;
    icon: React.ReactNode;
    path: string;
}

const AdminSidebar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems: MenuItem[] = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/staff' },
        { text: 'Lead Info', icon: <PeopleIcon />, path: '/staff/leads' },
        { text: 'CMS', icon: <ArticleIcon />, path: '/staff/cms' },
        { text: 'User Manage', icon: <ManageAccountsIcon />, path: '/staff/user_manage' }, // ✅ New tab
    ];

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    const handleLogout = async () => {
        try {
            const userStr = localStorage.getItem('staffUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                await fetch(`${API_ENDPOINTS.AUTH}/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, username: user.username }),
                });
            }
        } catch (e) {
            // Proceed with logout even if API call fails
        }
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffUser');
        router.push('/staff/login');
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: '#1e293b',
                    color: '#fff',
                },
            }}
        >
            {/* Header/Logo Section */}
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" color="#fff">
                    Admin Portal
                </Typography>
            </Box>

            <Divider sx={{ borderColor: '#334155' }} />

            {/* Main Menu Items */}
            <List sx={{ px: 2, py: 1, flexGrow: 1 }}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => handleNavigation(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    backgroundColor: isActive ? '#3b82f6' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: isActive ? '#2563eb' : '#334155',
                                    },
                                    transition: 'all 0.2s',
                                }}
                            >
                                <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* Logout Section at Bottom */}
            <Divider sx={{ borderColor: '#334155' }} />
            <List sx={{ px: 2, py: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 2,
                            '&:hover': { backgroundColor: '#334155' },
                            transition: 'all 0.2s',
                        }}
                    >
                        <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Logout"
                            primaryTypographyProps={{ fontSize: 14 }}
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default AdminSidebar;
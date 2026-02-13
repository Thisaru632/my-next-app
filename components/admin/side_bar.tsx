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
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';

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
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
    // Example: Clear session, tokens, etc.
    // router.push('/login');
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
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          zIndex: 1200,
          border: 'none', // Remove default border
          margin: 0, // Remove any margin
          padding: 0, // Remove any padding
        },
      }}
    >
      {/* Header/Logo Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="#60a5fa">
          Admin Portal
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#334155' }} />

      {/* Main Menu Items */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List sx={{ px: 1, py: 2 }}>
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
                  <ListItemIcon
                    sx={{
                      color: isActive ? '#ffffff' : '#94a3b8',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#ffffff' : '#e2e8f0',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Logout Section at Bottom */}
      <Box sx={{ mt: 'auto' }}>
        <Divider sx={{ borderColor: '#334155' }} />
        <List sx={{ px: 1, py: 2 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#dc2626',
                },
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon sx={{ color: '#f87171', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  color: '#fee2e2',
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;
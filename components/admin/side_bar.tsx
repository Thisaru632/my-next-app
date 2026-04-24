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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Badge,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Article as ArticleIcon,
    Logout as LogoutIcon,
    ManageAccounts as ManageAccountsIcon,
    Payments as PaymentsIcon,
    LocalOffer as LocalOfferIcon,
    MenuBook as MenuBookIcon,
    FileUpload as FileUploadIcon,
    LocationCity as LocationCityIcon,
    LocalTaxi as LocalTaxiIcon,
    DirectionsBus as DirectionsBusIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';

import { API_ENDPOINTS } from '@/config/api';

const DRAWER_WIDTH = 260;

interface MenuItem {
    text: string;
    icon: React.ReactNode;
    path: string;
    key?: string;
}

interface AdminSidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
    isMobile?: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ mobileOpen, onClose, isMobile }) => {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems: MenuItem[] = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/staff', key: 'dashboard' },
        { text: 'Lead Info', icon: <PeopleIcon />, path: '/staff/leads', key: 'leads' },
        { text: 'CMS', icon: <ArticleIcon />, path: '/staff/cms', key: 'cms' },
        { text: 'User Manage', icon: <ManageAccountsIcon />, path: '/staff/user_manage', key: 'userManagement' },
        { text: 'Web Users', icon: <PeopleIcon />, path: '/staff/web_users', key: 'userManagement' }, // Share permission with user management
        { text: 'Rate Card Manage', icon: <PaymentsIcon />, path: '/staff/rate_card_manage', key: 'rateCardManage' },
        { text: 'Staff Guide', icon: <MenuBookIcon />, path: '/staff/staff-guide', key: 'dashboard' }, // Always allow if they have dashboard access
        { text: 'Manage Guides', icon: <FileUploadIcon />, path: '/staff/staff-guide/manage', key: 'staffGuideManage' },
        { text: 'Vehicle Registrations', icon: <DirectionsBusIcon />, path: '/staff/vehicle-registrations', key: 'leads' },
        { text: 'Cab Service', icon: <LocalTaxiIcon />, path: '/staff/cab-service', key: 'cabService' },
    ];


    const [allowedItems, setAllowedItems] = React.useState<MenuItem[]>([]);
    const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
    const [pendingRegCount, setPendingRegCount] = React.useState(0);
    const [unpickedLeadsCount, setUnpickedLeadsCount] = React.useState(0);

    const fetchPendingCount = async () => {
        try {
            const response = await fetch(`${API_ENDPOINTS.VEHICLE_REGISTRATIONS}/pending-count`);
            if (response.ok) {
                const data = await response.json();
                setPendingRegCount(data.count || 0);
            }
        } catch (error) {}
    };

    const fetchUnpickedCount = async () => {
        try {
            const response = await fetch(`${API_ENDPOINTS.BOOKINGS}/unpicked-count`);
            if (response.ok) {
                const data = await response.json();
                setUnpickedLeadsCount(data.count || 0);
            }
        } catch (error) {}
    };

    React.useEffect(() => {
        fetchPendingCount();
        fetchUnpickedCount();
        const interval = setInterval(() => {
            fetchPendingCount();
            fetchUnpickedCount();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        const userStr = localStorage.getItem('staffUser');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role === 'superadmin') {
                    setAllowedItems(menuItems);
                } else if (user.permissions) {
                    const filtered = menuItems.filter(item => user.permissions[item.key as keyof typeof user.permissions]);
                    setAllowedItems(filtered);
                } else {
                    // Fallback for older users without permissions object
                    setAllowedItems(menuItems.filter(i => i.key === 'dashboard'));
                }
            } catch (e) {
                console.error('Error parsing user for sidebar:', e);
            }
        }
    }, []);

    const handleNavigation = (path: string) => {
        router.push(path);
        if (isMobile && onClose) onClose();
    };

    const drawerContent = (
        <>
            {/* Header/Logo Section */}
            <Box sx={{
                p: 3,
                textAlign: 'center',
                borderBottom: '2px solid',
                borderImage: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
                borderImageSlice: 1,
            }}>
                <Typography variant="h6" fontWeight="bold" color="inherit" sx={{ letterSpacing: '0.05em' }}>
                    Admin Portal
                </Typography>
            </Box>

            {/* Main Menu Items */}
            <List sx={{ px: 2, py: 1, flexGrow: 1 }}>
                {allowedItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => handleNavigation(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    backgroundColor: isActive ? 'primary.main' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                                    },
                                    transition: 'all 0.2s',
                                }}
                            >
                                <ListItemIcon sx={{ color: 'inherit', minWidth: 40, opacity: isActive ? 1 : 0.7 }}>
                                    {item.text === 'Vehicle Registrations' ? (
                                        <Badge badgeContent={pendingRegCount} color="error">
                                            {item.icon}
                                        </Badge>
                                    ) : item.text === 'Lead Info' ? (
                                        <Badge badgeContent={unpickedLeadsCount} color="error">
                                            {item.icon}
                                        </Badge>
                                    ) : (
                                        item.icon
                                    )}
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
            <Divider sx={{ borderColor: 'divider' }} />
            <List sx={{ px: 2, py: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => setLogoutDialogOpen(true)}
                        sx={{
                            borderRadius: 2,
                            '&:hover': { backgroundColor: 'action.hover' },
                            transition: 'all 0.2s',
                        }}
                    >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 40, opacity: 0.7 }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Logout"
                            primaryTypographyProps={{ fontSize: 14 }}
                        />
                    </ListItemButton>
                </ListItem>
            </List>

            {/* Logout Confirmation Dialog */}
            <Dialog
                open={logoutDialogOpen}
                onClose={() => setLogoutDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        padding: 1,
                        backgroundColor: 'background.paper',
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>Confirm Logout</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to log out of your account?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ padding: 2 }}>
                    <Button onClick={() => setLogoutDialogOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={async () => {
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
                            } catch (e) { }
                            localStorage.removeItem('staffToken');
                            localStorage.removeItem('staffUser');
                            router.push('/staff/login');
                            setLogoutDialogOpen(false);
                        }}
                        variant="contained"
                        color="error"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            bgcolor: '#ef4444',
                            '&:hover': { bgcolor: '#dc2626' }
                        }}
                    >
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );

    return (
        <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                        borderRight: '1px solid',
                        borderColor: 'divider'
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default AdminSidebar;
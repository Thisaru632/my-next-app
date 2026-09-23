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
    Collapse,
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
    ExpandLess,
    ExpandMore,
    Link as LinkIcon,
    Gavel as GavelIcon,
    AccessTime as AccessTimeIcon,
    Assignment as AssignmentIcon,
    CalendarMonth as CalendarMonthIcon,
    EventNote as EventNoteIcon,
    Inventory as InventoryIcon,
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
        { text: 'Clock in /out', icon: <AccessTimeIcon />, path: '/staff/clock-in-out', key: 'dashboard' },
        { text: 'View My Attendance', icon: <AssignmentIcon />, path: '/staff/my-attendance', key: 'dashboard' },
        { text: 'Lead Info', icon: <PeopleIcon />, path: '/staff/leads', key: 'leads' },
        { text: 'CMS', icon: <ArticleIcon />, path: '/staff/cms', key: 'cms' },
        { text: 'User Manage', icon: <ManageAccountsIcon />, path: '/staff/user_manage', key: 'userManagement' },
        { text: 'Web Users', icon: <PeopleIcon />, path: '/staff/web_users', key: 'userManagement' }, // Share permission with user management
        { text: 'Rate Card Manage', icon: <PaymentsIcon />, path: '/staff/rate_card_manage', key: 'rateCardManage' },
        { text: 'Staff Guide', icon: <MenuBookIcon />, path: '/staff/staff-guide', key: 'dashboard' }, // Always allow if they have dashboard access
        { text: 'Manage Guides', icon: <FileUploadIcon />, path: '/staff/staff-guide/manage', key: 'staffGuideManage' },
        { text: 'Vehicle Registrations', icon: <DirectionsBusIcon />, path: '/staff/vehicle-registrations', key: 'vehicleRegistration' },
        { text: 'Super Team', icon: <DirectionsBusIcon />, path: '/staff/super-team', key: 'dashboard' },
        { text: 'Cab Service', icon: <LocalTaxiIcon />, path: '/staff/cab-service', key: 'cabService' },
        { text: 'Office Assets Manage', icon: <InventoryIcon />, path: '/staff/office-assets-manage', key: 'dashboard' },
        { text: 'Attendance Sheet', icon: <AssignmentIcon />, path: '/staff/attendance-sheet', key: 'hrSection' },
        { text: 'Staff Working Schedule', icon: <CalendarMonthIcon />, path: '/staff/working-schedule', key: 'hrSection' },
        { text: 'Leave Management', icon: <EventNoteIcon />, path: '/staff/leave-management', key: 'hrSection' },
        { text: 'Links', icon: <LinkIcon />, path: '/staff/links', key: 'dashboard' },
        { text: 'Tenders', icon: <GavelIcon />, path: 'https://tender-monitoring-tau.vercel.app/', key: 'dashboard' },
    ];


    const [allowedItems, setAllowedItems] = React.useState<MenuItem[]>([]);
    const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
    const [pendingRegCount, setPendingRegCount] = React.useState(0);
    const [unpickedLeadsCount, setUnpickedLeadsCount] = React.useState(0);
    const [webPortalOpen, setWebPortalOpen] = React.useState(true);
    const [adminPortalOpen, setAdminPortalOpen] = React.useState(true);
    const [myAttendanceOpen, setMyAttendanceOpen] = React.useState(true);
    const [hrOpen, setHrOpen] = React.useState(true);
    const [assetManagementOpen, setAssetManagementOpen] = React.useState(true);

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
        }, 60000);
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
        if (path.startsWith('http')) {
            window.open(path, '_blank');
        } else {
            router.push(path);
        }
        if (isMobile && onClose) onClose();
    };

    const webPortalItems = ['Dashboard', 'Lead Info', 'CMS', 'Web Users', 'Rate Card Manage', 'Super Team'];
    const myAttendanceItems = ['Clock in /out', 'View My Attendance', 'My Attendance'];
    const hrItems = ['Attendance Sheet', 'Staff Working Schedule', 'Leave Management'];
    const assetManagementItems = ['Vehicle Registrations', 'Cab Service', 'Office Assets Manage'];

    const renderMenuItem = (item: MenuItem) => {
        const isActive = pathname === item.path;
        return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                        borderRadius: '8px',
                        py: 0.75,
                        px: 1.5,
                        backgroundColor: isActive ? 'action.selected' : 'transparent',
                        '&:hover': {
                            backgroundColor: isActive ? 'action.selected' : 'action.hover',
                        },
                        transition: 'all 0.15s ease-in-out',
                    }}
                >
                    <ListItemIcon
                        sx={{
                            color: isActive ? 'primary.main' : 'text.secondary',
                            minWidth: 32,
                            '& .MuiSvgIcon-root': { fontSize: 18 }
                        }}
                    >
                        {item.text === 'Vehicle Registrations' ? (
                            <Badge badgeContent={pendingRegCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16, px: 0.5 } }}>
                                {item.icon}
                            </Badge>
                        ) : item.text === 'Lead Info' ? (
                            <Badge badgeContent={unpickedLeadsCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16, px: 0.5 } }}>
                                {item.icon}
                            </Badge>
                        ) : (
                            item.icon
                        )}
                    </ListItemIcon>
                    <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                            fontSize: '13.5px',
                            fontWeight: isActive ? 600 : 450,
                            color: isActive ? 'primary.main' : 'text.primary',
                            letterSpacing: '-0.01em',
                        }}
                    />
                </ListItemButton>
            </ListItem>
        );
    };

    const drawerContent = (
        <>
            {/* Header/Logo Section */}
            <Box sx={{
                p: 2.5,
                textAlign: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}>
                <Typography variant="h6" fontWeight="700" color="inherit" sx={{ fontSize: '1rem', letterSpacing: '0.02em' }}>
                    Admin Portal
                </Typography>
            </Box>

            {/* Main Menu Items */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
                <ListItemButton onClick={() => setWebPortalOpen(!webPortalOpen)} sx={{ py: 0.75, px: 2, borderRadius: '8px', mx: 1, mb: 0.25, justifyContent: 'space-between' }}>
                    <ListItemText 
                        primary="Web Portal" 
                        primaryTypographyProps={{ fontSize: '13.5px', color: 'text.primary', fontWeight: 600, letterSpacing: '-0.01em' }} 
                    />
                    {webPortalOpen ? <ExpandLess sx={{ color: 'text.secondary', fontSize: 18 }} /> : <ExpandMore sx={{ color: 'text.secondary', fontSize: 18 }} />}
                </ListItemButton>
                <Collapse in={webPortalOpen} timeout="auto" unmountOnExit>
                    <List sx={{ px: 1.5, pt: 0, pb: 0.5 }}>
                        {allowedItems
                            .filter(item => webPortalItems.includes(item.text))
                            .map(renderMenuItem)}
                    </List>
                </Collapse>

                <Divider sx={{ my: 1, mx: 2 }} />

                <ListItemButton onClick={() => setAdminPortalOpen(!adminPortalOpen)} sx={{ py: 0.75, px: 2, borderRadius: '8px', mx: 1, mb: 0.25, justifyContent: 'space-between' }}>
                    <ListItemText 
                        primary="Admin Portal" 
                        primaryTypographyProps={{ fontSize: '13.5px', color: 'text.primary', fontWeight: 600, letterSpacing: '-0.01em' }} 
                    />
                    {adminPortalOpen ? <ExpandLess sx={{ color: 'text.secondary', fontSize: 18 }} /> : <ExpandMore sx={{ color: 'text.secondary', fontSize: 18 }} />}
                </ListItemButton>
                <Collapse in={adminPortalOpen} timeout="auto" unmountOnExit>
                    <List sx={{ px: 1.5, pt: 0, pb: 0.5 }}>
                        {allowedItems
                            .filter(item => !webPortalItems.includes(item.text) && !hrItems.includes(item.text) && !myAttendanceItems.includes(item.text) && !assetManagementItems.includes(item.text))
                            .map(renderMenuItem)}

                        {/* Asset Management Dropdown Section inside Admin Portal */}
                        {allowedItems.some(item => assetManagementItems.includes(item.text)) && (
                            <>
                                <ListItemButton onClick={() => setAssetManagementOpen(!assetManagementOpen)} sx={{ py: 0.5, px: 1.5, borderRadius: '8px', mt: 0.5, mb: 0.25, backgroundColor: 'action.hover' }}>
                                    <ListItemText 
                                        primary="Asset Management" 
                                        primaryTypographyProps={{ fontSize: '13px', color: 'primary.main', fontWeight: 600 }} 
                                    />
                                    {assetManagementOpen ? <ExpandLess sx={{ color: 'primary.main', fontSize: 18 }} /> : <ExpandMore sx={{ color: 'primary.main', fontSize: 18 }} />}
                                </ListItemButton>
                                <Collapse in={assetManagementOpen} timeout="auto" unmountOnExit>
                                    <List sx={{ pl: 1, pt: 0, pb: 0 }}>
                                        {allowedItems
                                            .filter(item => assetManagementItems.includes(item.text))
                                            .map(renderMenuItem)}
                                    </List>
                                </Collapse>
                            </>
                        )}

                        {/* My Attendance Dropdown Section inside Admin Portal */}
                        {allowedItems.some(item => myAttendanceItems.includes(item.text)) && (
                            <>
                                <ListItemButton onClick={() => setMyAttendanceOpen(!myAttendanceOpen)} sx={{ py: 0.5, px: 1.5, borderRadius: '8px', mt: 0.5, mb: 0.25, backgroundColor: 'action.hover' }}>
                                    <ListItemText 
                                        primary="My Attendance" 
                                        primaryTypographyProps={{ fontSize: '13px', color: 'primary.main', fontWeight: 600 }} 
                                    />
                                    {myAttendanceOpen ? <ExpandLess sx={{ color: 'primary.main', fontSize: 18 }} /> : <ExpandMore sx={{ color: 'primary.main', fontSize: 18 }} />}
                                </ListItemButton>
                                <Collapse in={myAttendanceOpen} timeout="auto" unmountOnExit>
                                    <List sx={{ pl: 1, pt: 0, pb: 0 }}>
                                        {allowedItems
                                            .filter(item => myAttendanceItems.includes(item.text))
                                            .map(renderMenuItem)}
                                    </List>
                                </Collapse>
                            </>
                        )}

                        {/* HR Dropdown Section inside Admin Portal */}
                        {allowedItems.some(item => hrItems.includes(item.text)) && (
                            <>
                                <ListItemButton onClick={() => setHrOpen(!hrOpen)} sx={{ py: 0.5, px: 1.5, borderRadius: '8px', mt: 0.5, mb: 0.25, backgroundColor: 'action.hover' }}>
                                    <ListItemText 
                                        primary="HR Section" 
                                        primaryTypographyProps={{ fontSize: '13px', color: 'primary.main', fontWeight: 600 }} 
                                    />
                                    {hrOpen ? <ExpandLess sx={{ color: 'primary.main', fontSize: 18 }} /> : <ExpandMore sx={{ color: 'primary.main', fontSize: 18 }} />}
                                </ListItemButton>
                                <Collapse in={hrOpen} timeout="auto" unmountOnExit>
                                    <List sx={{ pl: 1, pt: 0, pb: 0 }}>
                                        {allowedItems
                                            .filter(item => hrItems.includes(item.text))
                                            .map(renderMenuItem)}
                                    </List>
                                </Collapse>
                            </>
                        )}
                    </List>
                </Collapse>
            </Box>

            {/* Logout Section at Bottom */}
            <Divider sx={{ borderColor: 'divider' }} />
            <List sx={{ px: 1.5, py: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => setLogoutDialogOpen(true)}
                        sx={{
                            borderRadius: '8px',
                            py: 0.75,
                            px: 1.5,
                            '&:hover': { backgroundColor: 'action.hover' },
                            transition: 'all 0.2s',
                        }}
                    >
                        <ListItemIcon sx={{ color: 'text.secondary', minWidth: 32, '& .MuiSvgIcon-root': { fontSize: 18 } }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Logout"
                            primaryTypographyProps={{ fontSize: '13.5px', fontWeight: 500, color: 'text.primary' }}
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
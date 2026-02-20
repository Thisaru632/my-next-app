'use client';

import { ReactNode, useEffect, useState } from "react";
import { Box, CssBaseline, CircularProgress, IconButton, AppBar, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import AdminSidebar from "@/components/admin/side_bar";
import { usePathname, useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api";

const DRAWER_WIDTH = 260;

export default function StaffLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isAuthPage = pathname === '/staff/login' || pathname === '/staff/signup';

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    useEffect(() => {
        const token = localStorage.getItem('staffToken');

        if (!token && !isAuthPage) {
            router.push('/staff/login');
        } else if (token && isAuthPage) {
            router.push('/staff');
        } else {
            setIsAuthenticated(!!token);
            setLoading(false);

            if (token && !isAuthPage) {
                try {
                    const userStr = localStorage.getItem('staffUser');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        fetch(`${API_ENDPOINTS.AUTH}/mark-online`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: user.email, username: user.username }),
                        }).catch(() => { });
                    }
                } catch (e) { }
            }
        }
    }, [pathname, router, isAuthPage]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#f1f5f9' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isAuthPage) {
        return (
            <>
                <CssBaseline />
                {children}
            </>
        );
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
            <CssBaseline />

            {/* Mobile Header */}
            {isMobile && (
                <AppBar
                    position="fixed"
                    sx={{
                        backgroundColor: '#ffffff',
                        color: '#1e293b',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        zIndex: theme.zIndex.drawer + 1
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div" fontWeight="600">
                            Senu Cabs
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}

            <AdminSidebar
                mobileOpen={mobileOpen}
                onClose={handleDrawerToggle}
                isMobile={isMobile}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2.5, md: 4 },
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    mt: { xs: 8, md: 0 },
                    minHeight: '100vh',
                    boxSizing: 'border-box',
                    overflowX: 'hidden'
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
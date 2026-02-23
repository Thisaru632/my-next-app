'use client';

import { ReactNode, useEffect, useState } from "react";
import { Box, CssBaseline, CircularProgress, IconButton, AppBar, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import AdminSidebar from "@/components/admin/side_bar";
import TopHeader from "@/components/admin/TopHeader";
import BookingNotification from "@/components/admin/BookingNotification";
import { usePathname, useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api";
import { ThemeContextProvider } from "@/context/ThemeContext";
import { useThemeContext } from "@/context/ThemeContext";

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


    return (
        <ThemeContextProvider>
            {loading ? (
                <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
                    <CircularProgress />
                </Box>
            ) : isAuthPage ? (
                <>
                    <CssBaseline />
                    {children}
                </>
            ) : (
                <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
                    <CssBaseline />

                    <AdminSidebar
                        mobileOpen={mobileOpen}
                        onClose={handleDrawerToggle}
                        isMobile={isMobile}
                    />

                    <Box
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '100vh',
                            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }
                        }}
                    >
                        <TopHeader
                            showMenuIcon={isMobile}
                            onMenuClick={handleDrawerToggle}
                        />

                        <Box
                            component="main"
                            sx={{
                                p: { xs: 2.5, md: 4 },
                                flexGrow: 1,
                                boxSizing: 'border-box',
                                overflowX: 'hidden',
                                backgroundColor: 'background.default'
                            }}
                        >
                            <BookingNotification />
                            {children}
                        </Box>
                    </Box>
                </Box>
            )}
        </ThemeContextProvider>
    );
}
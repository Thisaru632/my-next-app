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
    const isPublicPage = isAuthPage || pathname === '/staff/clock-in-out';

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
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
            console.error('Failed to notify backend of logout:', e);
        }
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffUser');
        localStorage.removeItem('staffTokenExpiry');
        router.push('/staff/login');
    };

    useEffect(() => {
        const token = localStorage.getItem('staffToken');
        const isAuth = pathname === '/staff/login' || pathname === '/staff/signup';
        const isPublic = isAuth || pathname === '/staff/clock-in-out';

        // Initial session check: allow public pages including clock-in-out without token
        if (!token && !isPublic) {
            router.push('/staff/login');
            return;
        }

        if (token && isAuth) {
            router.push('/staff');
            return;
        }

        setIsAuthenticated(!!token);
        setLoading(false);

        if (token && !isAuth) {
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
    }, [pathname, router]);

    // --- Idle Timeout Logic (Dynamic Based on Role) ---
    // Disabled to stop auto logout process
    /*
    useEffect(() => {
        if (isAuthPage || !isAuthenticated) return;

        let timeoutId: NodeJS.Timeout;
        
        // Get role from user data
        const userStr = localStorage.getItem('staffUser');
        const user = userStr ? JSON.parse(userStr) : null;
        const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
        
        // 4 Hours for Admin/SuperAdmin, 1 Hour for Staff
        const IDLE_TIME = isAdmin ? 4 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000;

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                console.log("Session expired due to inactivity");
                handleLogout();
            }, IDLE_TIME);
        };

        // Events to track user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        // Initial timer setup
        resetTimer();

        // Add listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [isAuthenticated, isAuthPage]);
    */

    // --- Heartbeat Logic (Every 1 minute) ---
    useEffect(() => {
        if (isAuthPage || !isAuthenticated) return;

        const sendHeartbeat = () => {
            try {
                const userStr = localStorage.getItem('staffUser');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    fetch(`${API_ENDPOINTS.AUTH}/heartbeat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: user.email, username: user.username }),
                    }).catch(() => { });
                }
            } catch (e) { }
        };

        // Initial heartbeat
        sendHeartbeat();

        const heartbeatInterval = setInterval(sendHeartbeat, 60000); // 1 minute
        return () => clearInterval(heartbeatInterval);
    }, [isAuthenticated, isAuthPage]);

    const hideLayout = isAuthPage || (pathname === '/staff/clock-in-out' && !isAuthenticated);

    return (
        <ThemeContextProvider>
            {loading ? (
                <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
                    <CircularProgress />
                </Box>
            ) : hideLayout ? (
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
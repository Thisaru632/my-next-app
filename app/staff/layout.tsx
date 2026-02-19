'use client';

import { ReactNode, useEffect, useState } from "react";
import { Box, CssBaseline, CircularProgress } from "@mui/material";
import AdminSidebar from "@/components/admin/side_bar";
import { usePathname, useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api";

const DRAWER_WIDTH = 80;

export default function StaffLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const isAuthPage = pathname === '/staff/login' || pathname === '/staff/signup';

    useEffect(() => {
        const token = localStorage.getItem('staffToken');

        if (!token && !isAuthPage) {
            router.push('/staff/login');
        } else if (token && isAuthPage) {
            router.push('/staff');
        } else {
            setIsAuthenticated(!!token);
            setLoading(false);

            // Mark the current user as online on every page load
            if (token && !isAuthPage) {
                try {
                    const userStr = localStorage.getItem('staffUser');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        fetch(`${API_ENDPOINTS.AUTH}/mark-online`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: user.email, username: user.username }),
                        }).catch(() => { }); // Silent fail — non-critical
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
        <>
            <CssBaseline />
            <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
                <AdminSidebar />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        paddingTop: '24px',
                        paddingRight: '24px',
                        paddingBottom: '24px',
                        paddingLeft: 0,
                        marginLeft: `${DRAWER_WIDTH}px`,
                        width: `calc(100% - ${DRAWER_WIDTH}px)`,
                        minHeight: '100vh',
                        boxSizing: 'border-box',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </>
    );
}
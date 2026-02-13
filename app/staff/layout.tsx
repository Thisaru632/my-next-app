import type { ReactNode } from "react";
import { Box, CssBaseline } from "@mui/material";
import AdminSidebar from "@/components/admin/side_bar";

const DRAWER_WIDTH = 80;

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
        <AdminSidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            paddingTop: '24px',      // Top padding
            paddingRight: '24px',    // Right padding
            paddingBottom: '24px',   // Bottom padding
            paddingLeft: 0,          // NO left padding
            marginLeft: `${DRAWER_WIDTH}px`,  // Position next to sidebar
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
import type { ReactNode } from "react";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import EmotionCache from "./all_packages/Emotioncache";
import ThemeRegistry from "./all_packages/Themeregistry";
import WhatsAppButton from "@/components/WhatsAppButton";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import { UserProvider } from "@/context/UserContext";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0d9488" />
        <link rel="apple-touch-icon" href="/senu tours 3d.png" />
      </head>
      <body>
        <UserProvider>
          <EmotionCache>
            <ThemeRegistry>
              <PWAInstallBanner />
              <ConditionalNavbar />
              <main>{children}</main>
              <WhatsAppButton />
            </ThemeRegistry>
          </EmotionCache>
        </UserProvider>
      </body>
    </html>
  );
}
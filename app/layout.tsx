import type { ReactNode } from "react";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import EmotionCache from "./all_packages/Emotioncache";
import ThemeRegistry from "./all_packages/Themeregistry";
import WhatsAppButton from "@/components/WhatsAppButton";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import ManifestSwitcher from "@/components/ManifestSwitcher";
import { UserProvider } from "@/context/UserContext";
import { PWAProvider } from "@/context/PWAContext";
import LoadingScreen from "@/components/LoadingScreen";
import "./globals.css";

export const metadata = {
  title: "Senu Tours — Excellence Redefined",
  description: "Premium destination travel and tour agency in Sri Lanka. Exceptional journeys tailored to your profile.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  themeColor: "#071d24",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ManifestSwitcher />
      </head>
      <body>
        <UserProvider>
          <PWAProvider>
            <EmotionCache>
              <ThemeRegistry>
                <LoadingScreen />
                <PWAInstallBanner />
                <ConditionalNavbar />
                <main>{children}</main>
                <WhatsAppButton />
              </ThemeRegistry>
            </EmotionCache>
          </PWAProvider>
        </UserProvider>
      </body>
    </html>
  );
}
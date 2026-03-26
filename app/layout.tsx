import type { ReactNode } from "react";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import EmotionCache from "./all_packages/Emotioncache";
import ThemeRegistry from "./all_packages/Themeregistry";
import WhatsAppButton from "@/components/WhatsAppButton";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import { UserProvider } from "@/context/UserContext";
import LoadingScreen from "@/components/LoadingScreen";
import "./globals.css";

export const metadata = {
  title: "Senu Tours — Excellence Redefined",
  description: "Premium destination travel and tour agency in Sri Lanka. Exceptional journeys tailored to your profile.",
  icons: {
    icon: "/senu%20tours%203d.png",
    apple: "/senu%20tours%203d.png",
  },
  themeColor: "#071d24",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <UserProvider>
          <EmotionCache>
            <ThemeRegistry>
              <LoadingScreen />
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
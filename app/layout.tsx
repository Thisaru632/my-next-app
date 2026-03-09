import type { ReactNode } from "react";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import EmotionCache from "./all_packages/Emotioncache";
import ThemeRegistry from "./all_packages/Themeregistry";
import WhatsAppButton from "@/components/WhatsAppButton";
import { UserProvider } from "@/context/UserContext";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <EmotionCache>
            <ThemeRegistry>
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
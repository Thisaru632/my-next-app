import type { ReactNode } from "react";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import EmotionCache from "./all_packages/Emotioncache";
import ThemeRegistry from "./all_packages/Themeregistry";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EmotionCache>
          <ThemeRegistry>
            <ConditionalNavbar />
            <main>{children}</main>
            <WhatsAppButton />
          </ThemeRegistry>
        </EmotionCache>
      </body>
    </html>
  );
}
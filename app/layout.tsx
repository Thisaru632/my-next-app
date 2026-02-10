import type { ReactNode } from "react";
import Navbar from "@/components/header";
import EmotionCache from "./all_packages/Emotioncache";
import ThemeRegistry from "./all_packages/Themeregistry";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EmotionCache>
          <ThemeRegistry>
            <Navbar />
            <main>{children}</main>
          </ThemeRegistry>
        </EmotionCache>
      </body>
    </html>
  );
}
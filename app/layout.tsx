import type { ReactNode } from "react";
import Script from "next/script";
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GZ4C7X9CW9"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-GZ4C7X9CW9');
          `}
        </Script>
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2258619591220145');
            fbq('track', 'PageView');
          `}
        </Script>

      </head>
      <body>
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }} 
            src="https://www.facebook.com/tr?id=2258619591220145&ev=PageView&noscript=1" 
          />
        </noscript>
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
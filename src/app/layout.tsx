import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { OfflineBanner } from "@/components/layout/offline-banner";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AniVault",
  description: "Social anime tracking for your crew",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AniVault",
  },
};

export const viewport: Viewport = {
  themeColor: "#06060C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} h-full`}
      style={{ background: "#06060C" }}
    >
      <body className="min-h-full flex flex-col items-center" style={{ background: "#0a0a14" }}>
        <div className="app-container w-full">
          <OfflineBanner />
          {children}
        </div>
      </body>
    </html>
  );
}

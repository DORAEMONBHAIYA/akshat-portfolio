import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Akshat Gupta | AI/ML Engineer & Full-Stack Developer",
  description:
    "Portfolio of Akshat Gupta - B.Tech CSE (AI & ML) | Building intelligent systems with Deep Learning, NLP, and Computer Vision",
  keywords: [
    "AI Engineer",
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "Computer Vision",
    "Portfolio",
    "Full-Stack Developer",
  ],
  authors: [{ name: "Akshat Gupta" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster richColors position="top-right" />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

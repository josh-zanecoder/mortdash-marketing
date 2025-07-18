'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";
import Footer from "@/components/Footer";
import { usePathname } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isUnauthorizedPage = pathname === '/unauthorized';

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/mortdash_logo.jpeg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {!isUnauthorizedPage && <HeaderWrapper />}
        <main>{children}</main>
        {!isUnauthorizedPage && <Footer />}
      </body>
    </html>
  );
}

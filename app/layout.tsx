import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { BalanceProvider } from '@/context/BalanceContext'; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Axia Coffee",
  description: "Sistema de gestión para Axia Coffee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* 1. Agregamos suppressHydrationWarning aquí */
    <html lang="es" suppressHydrationWarning>
      <body
        /* 2. Agregamos suppressHydrationWarning también en el body */
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <BalanceProvider>
            {children}
          </BalanceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TextileOS - The Textile Industry's Operating System",
  description:
    "Complete textile ERP system. From fiber to fashion, from brand to factory floor. One platform.",
  keywords: [
    "textile",
    "ERP",
    "garment",
    "production",
    "quality",
    "inventory",
    "factory",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

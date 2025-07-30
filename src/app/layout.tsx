import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FM Studios Invoice Generator",
    template: "%s | FM Studios Invoice Generator",
  },
  description: "A modern tool to generate, manage, and preview invoices for FM Studios.",
  openGraph: {
    title: "FM Studios Invoice Generator",
    description: "A modern tool to generate, manage, and preview invoices for FM Studios.",
    url: "https://fm-invoice-generator.com/", // Change to your real domain if needed
    siteName: "FM Studios Invoice Generator",
    images: [
      {
        url: "https://i.ibb.co/BH6FQDXf/Screenshot-2025-07-30-191859.jpg",
        width: 1200,
        height: 630,
        alt: "FM Studios Invoice Generator Thumbnail",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FM Studios Invoice Generator",
    description: "A modern tool to generate, manage, and preview invoices for FM Studios.",
    images: ["https://i.ibb.co/BH6FQDXf/Screenshot-2025-07-30-191859.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "Meet My Agent — Find a real estate agent who actually fits you",
  description: "Answer 6 quick questions and get matched with a real estate agent based on your personality and communication style. Not ad spend.",
  openGraph: {
    title: "Meet My Agent — Find a real estate agent who actually fits you",
    description: "Answer 6 quick questions and get matched with a real estate agent based on your personality and communication style.",
    url: "https://www.meetmyagent.app",
    siteName: "Meet My Agent",
    images: [
      {
        url: "https://www.meetmyagent.app/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

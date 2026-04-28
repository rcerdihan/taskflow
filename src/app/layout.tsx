import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TaskFlow | Premium Kanban",
  description: "A beautiful, premium Kanban board built with Next.js and dnd-kit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.variable} min-h-full flex flex-col antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

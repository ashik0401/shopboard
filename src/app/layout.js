"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={` ${geistSans.variable} ${geistMono.variable} antialiased bg-gray-500 min-h-screen`}>
        <QueryClientProvider client={queryClient}>
          <Toaster position="top-right" />
          <Navbar />
          <div className="lg:w-11/12 mx-auto">
            {children}
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}

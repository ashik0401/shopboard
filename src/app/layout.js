
"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/redux/store";
import AuthProvider from "./auth/authProvider";
import { Provider } from "react-redux";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if(!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  if(theme === 'dark') document.documentElement.classList.add('dark');
                } catch(e){}
              })();
            `,
          }}
        />
      </head>
      <body className={`bg-white dark:bg-black ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <Provider store={store}>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <Toaster position="top-right" />
              <Navbar />
              <div className="lg:w-11/12 mx-auto">{children}</div>
            </QueryClientProvider>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}

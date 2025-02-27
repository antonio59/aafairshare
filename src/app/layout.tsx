import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AA FairShare - Split Expenses Fairly",
  description: "Track and split expenses with friends and family",
  icons: {
    icon: '/favicon.ico',
  },
};

// Inject environment variables for client-side access
function EnvironmentVariables() {
  // Safely get Supabase URL and ANON KEY from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Create a safe script to inject these variables
  const envScript = `
    window.env = {
      NEXT_PUBLIC_SUPABASE_URL: "${supabaseUrl}",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "${supabaseAnonKey}"
    };
    console.log("Environment variables injected:", { 
      url: window.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set", 
      key: window.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set" 
    });
  `;
  
  return (
    <Script id="environment-variables" strategy="beforeInteractive">
      {envScript}
    </Script>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <EnvironmentVariables />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <div className="pt-16 pb-20">
            {children}
          </div>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}

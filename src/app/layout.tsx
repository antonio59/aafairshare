import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import Navbar from '@/components/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Default Supabase credentials from lib/supabase.ts
const DEFAULT_SUPABASE_URL = 'https://ilrnhmnkstnglkrsirjq.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscm5obW5rc3RuZ2xrcnNpcmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzNzc2MjQsImV4cCI6MjA0Nzk1MzYyNH0.bG4rbyHXEmW38Vb1eT6BBgXiPmtDzgf4FHIImqqJY8c';

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Ensure URL has a protocol
let finalSupabaseUrl = supabaseUrl;
if (finalSupabaseUrl && !finalSupabaseUrl.startsWith('http://') && !finalSupabaseUrl.startsWith('https://')) {
  finalSupabaseUrl = `https://${finalSupabaseUrl}`;
}

// Validate URL format
try {
  new URL(finalSupabaseUrl);
  console.log('Layout: Valid Supabase URL being injected:', finalSupabaseUrl);
} catch (error) {
  console.error('Layout: Invalid Supabase URL format:', finalSupabaseUrl);
  finalSupabaseUrl = DEFAULT_SUPABASE_URL;
  console.log('Layout: Falling back to DEFAULT Supabase URL');
}

export const metadata: Metadata = {
  title: 'AA Fair Share',
  description: 'Track and split expenses between Andres and Antonio',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inject environment variables into window.env */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize window.env with Supabase credentials
              window.env = {
                NEXT_PUBLIC_SUPABASE_URL: "${finalSupabaseUrl}",
                NEXT_PUBLIC_SUPABASE_ANON_KEY: "${supabaseAnonKey}"
              };
              console.log("Environment variables injected into window.env:", window.env.NEXT_PUBLIC_SUPABASE_URL);
            `
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

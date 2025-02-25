import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AA Fair Share',
  description: 'Track and split expenses fairly',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = {
              NEXT_PUBLIC_SUPABASE_URL: "${process.env.NEXT_PUBLIC_SUPABASE_URL}",
              NEXT_PUBLIC_SUPABASE_ANON_KEY: "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}"
            }`
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

import { Metadata } from "next";
import "./globals.css";
// Import font CSS manually to avoid Next.js font conflicts with SWC
import "@/styles/fonts.css";
// Import the client wrapper component
import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";

export const metadata: Metadata = {
  title: 'AAFairShare',
  description: 'Expense splitting application',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-geist antialiased">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}

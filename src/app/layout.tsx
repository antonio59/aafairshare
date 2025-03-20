import { Metadata } from "next";
import "./globals.css";
// Import font CSS manually to avoid Next.js font conflicts with Babel
import "@/styles/fonts.css";
// Import the client wrapper component
import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";

export const metadata: Metadata = {
  title: 'AA FairShare',
  description: 'Expense splitting application',
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

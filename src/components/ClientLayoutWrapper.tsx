'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Use dynamic import with ssr: false for client-only components
const ClientLayout = dynamic(() => import("./ClientLayout"), { 
  ssr: false 
});

interface ClientLayoutWrapperProps {
  children: ReactNode;
}

export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  return <ClientLayout>{children}</ClientLayout>;
}

'use client';

import dynamic from 'next/dynamic';

// Import the component dynamically with ssr disabled
const SettlementsSummary = dynamic(
  () => import('@/components/SettlementsSummary'),
  { ssr: false }
);

export default function SettlementsClientWrapper() {
  return <SettlementsSummary />;
}

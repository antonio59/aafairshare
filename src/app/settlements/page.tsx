'use client';

import SettlementsSummary from '@/components/SettlementsSummary';

export default function SettlementsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Settlements</h1>
      <SettlementsSummary />
    </div>
  );
}
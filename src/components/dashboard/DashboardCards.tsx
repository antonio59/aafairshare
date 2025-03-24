import { 
  BarChart3, 
  CreditCard, 
  PoundSterling, 
  Users 
} from 'lucide-react';
import React from 'react';

import { formatCurrency } from '@/utils/formatters';

interface DashboardCardsProps {
  totalExpenses: number;
  totalSpent: number;
  totalSettlements: number;
  totalUsers: number;
}

export function DashboardCards({ 
  totalExpenses, 
  totalSpent, 
  totalSettlements, 
  totalUsers 
}: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Total Expenses</span>
          <PoundSterling className="stat-icon" />
        </div>
        <div className="stat-content">
          <span className="stat-value">{totalExpenses}</span>
          <span className="stat-description">Expenses recorded</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Total Spent</span>
          <CreditCard className="stat-icon" />
        </div>
        <div className="stat-content">
          <span className="stat-value">{formatCurrency(totalSpent)}</span>
          <span className="stat-description">All time spending</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Pending Settlements</span>
          <BarChart3 className="stat-icon" />
        </div>
        <div className="stat-content">
          <span className="stat-value">{totalSettlements}</span>
          <span className="stat-description">Awaiting settlement</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Friends</span>
          <Users className="stat-icon" />
        </div>
        <div className="stat-content">
          <span className="stat-value">{totalUsers || 0}</span>
          <span className="stat-description">Sharing expenses with you</span>
        </div>
      </div>
    </div>
  );
}

declare module './features/shared/components' {
  export const Header: React.FC<{ onNewExpense: () => void }>;
  export const Footer: React.FC;
  export const MobileEnhancedNavigation: React.FC;
}

declare module './features/expenses/components' {
  export const MonthlyExpenses: React.FC<{
    onViewMore: () => void;
    refreshTrigger: number;
    onNewExpense: () => void;
  }>;
  export const NewExpenseModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onExpenseCreated: () => void;
  }>;
  export const ExpenseDetailPage: React.FC;
}

declare module './features/settlements/components' {
  export const SettlementsPage: React.FC;
}

declare module './features/analytics/components' {
  export const AnalyticsPage: React.FC;
}

declare module './features/settings/components' {
  export const SettingsPage: React.FC;
  export const CategoryManagementPage: React.FC;
}

declare module './features/auth/components' {
  export const AuthPage: React.FC;
  export const ProtectedRoute: React.FC<{ children: React.ReactNode }>;
}

declare module './core/contexts/AuthContext' {
  export const AuthProvider: React.FC<{ children: React.ReactNode }>;
}

declare module './core/contexts/CurrencyContext' {
  export const CurrencyProvider: React.FC<{ children: React.ReactNode }>;
} 
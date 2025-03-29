
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;  // Alterado de Date para string para compatibilidade com Supabase
  type: 'income' | 'expense';
  category?: string;
  is_recurring: boolean;
  recurring_period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  installment_current?: number;
  installment_total?: number;
  account_id?: string;
  user_id?: string;
}

export interface BalanceSummary {
  totalBalance: number;
  income: number;
  expenses: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  is_default?: boolean;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'other';
  color?: string;
}

export interface BudgetSummary {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface Report {
  type: 'income' | 'expense' | 'all';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate?: Date;
  endDate?: Date;
  groupBy: 'category' | 'date' | 'account';
  data: any[];
}

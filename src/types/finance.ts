
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;  // Kept as string for compatibility with Supabase
  type: 'income' | 'expense';
  category?: string;
  is_recurring: boolean;
  recurring_period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  installment_current?: number;
  installment_total?: number;
  account_id?: string;  // Properly defined account_id
  user_id?: string;
  due_date?: string;  // Data de vencimento
  payment_status?: 'pending' | 'paid' | 'overdue';  // Status de pagamento
}

export interface BalanceSummary {
  totalBalance: number;
  income: number;
  expenses: number;
  pendingExpenses: number;  // Despesas pendentes
  overdueExpenses: number;  // Despesas atrasadas
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
  type: string; // String type for flexibility with Supabase data
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

// Nova interface para previsão financeira
export interface FinancialForecast {
  month: string;
  expectedIncome: number;
  expectedExpenses: number;
  expectedBalance: number;
}

// Nova interface para metas financeiras
export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  progress: number;
}

// Nova interface para alertas financeiros
export interface FinancialAlert {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'danger';
  date: string;
  isRead: boolean;
}

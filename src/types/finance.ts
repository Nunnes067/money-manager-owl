
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: Date;
  type: 'income' | 'expense';
  category?: string;
  isRecurring: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  installment?: {
    current: number;
    total: number;
  } | null;
}

export interface BalanceSummary {
  totalBalance: number;
  income: number;
  expenses: number;
}


import { useState, useEffect } from 'react';
import { Transaction, BalanceSummary } from '@/types/finance';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BalanceCard } from '@/components/finance/BalanceCard';
import { TransactionList } from '@/components/finance/TransactionList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: uuidv4(),
    description: 'Salário',
    amount: 3500,
    date: new Date('2023-09-05'),
    type: 'income',
    category: 'Salário',
    isRecurring: true,
    recurringPeriod: 'monthly',
    installment: null
  },
  {
    id: uuidv4(),
    description: 'Aluguel',
    amount: -1200,
    date: new Date('2023-09-10'),
    type: 'expense',
    category: 'Moradia',
    isRecurring: true,
    recurringPeriod: 'monthly',
    installment: null
  },
  {
    id: uuidv4(),
    description: 'Supermercado',
    amount: -450,
    date: new Date('2023-09-15'),
    type: 'expense',
    category: 'Alimentação',
    isRecurring: false,
    installment: null
  },
  {
    id: uuidv4(),
    description: 'Notebook',
    amount: -800,
    date: new Date('2023-09-20'),
    type: 'expense',
    category: 'Eletrônicos',
    isRecurring: false,
    installment: {
      current: 1,
      total: 5
    }
  },
  {
    id: uuidv4(),
    description: 'Freelance design',
    amount: 800,
    date: new Date('2023-09-22'),
    type: 'income',
    category: 'Freelance',
    isRecurring: false,
    installment: null
  }
];

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    // Try to load from localStorage on initial render
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : DEFAULT_TRANSACTIONS;
  });
  
  const [balanceSummary, setBalanceSummary] = useState<BalanceSummary>({
    totalBalance: 0,
    income: 0,
    expenses: 0
  });

  // Update balance summary whenever transactions change
  useEffect(() => {
    // Save to localStorage whenever transactions change
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    const summary = transactions.reduce((acc, transaction) => {
      const amount = transaction.amount;
      
      if (amount > 0) {
        acc.income += amount;
      } else {
        acc.expenses += Math.abs(amount);
      }
      
      acc.totalBalance += amount;
      return acc;
    }, {
      totalBalance: 0,
      income: 0,
      expenses: 0
    });
    
    setBalanceSummary(summary);
  }, [transactions]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
  };

  // Filter transactions by type
  const incomeTransactions = transactions.filter(t => t.amount > 0);
  const expenseTransactions = transactions.filter(t => t.amount < 0);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-6 relative">
          <BalanceCard balanceSummary={balanceSummary} />
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="income">Receitas</TabsTrigger>
            <TabsTrigger value="expense">Despesas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <TransactionList transactions={transactions} />
          </TabsContent>
          
          <TabsContent value="income">
            <TransactionList transactions={incomeTransactions} />
          </TabsContent>
          
          <TabsContent value="expense">
            <TransactionList transactions={expenseTransactions} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Index;

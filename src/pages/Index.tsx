
import { useState, useEffect } from 'react';
import { Transaction, BalanceSummary } from '@/types/finance';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BalanceCard } from '@/components/finance/BalanceCard';
import { TransactionList } from '@/components/finance/TransactionList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { fetchTransactions } from '@/services/financeService';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [balanceSummary, setBalanceSummary] = useState<BalanceSummary>({
    totalBalance: 0,
    income: 0,
    expenses: 0
  });

  const { data: transactions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions
  });

  // Atualizar resumo de saldo quando as transações forem carregadas
  useEffect(() => {
    if (transactions.length) {
      const summary = transactions.reduce((acc: BalanceSummary, transaction: Transaction) => {
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
    }
  }, [transactions]);

  // Filtrar transações por tipo
  const incomeTransactions = transactions.filter((t: Transaction) => t.amount > 0);
  const expenseTransactions = transactions.filter((t: Transaction) => t.amount < 0);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-destructive/20 p-4 rounded-lg text-center">
            <p className="text-destructive font-medium">Erro ao carregar transações. Tente novamente.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
            <TransactionList 
              transactions={transactions} 
              onTransactionDelete={() => refetch()}
            />
          </TabsContent>
          
          <TabsContent value="income">
            <TransactionList 
              transactions={incomeTransactions} 
              onTransactionDelete={() => refetch()}
            />
          </TabsContent>
          
          <TabsContent value="expense">
            <TransactionList 
              transactions={expenseTransactions} 
              onTransactionDelete={() => refetch()}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Index;

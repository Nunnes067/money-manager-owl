import { useState, useEffect, useMemo } from 'react';
import { Transaction, BalanceSummary, FinancialAlert } from '@/types/finance';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BalanceCard } from '@/components/finance/BalanceCard';
import { TransactionList } from '@/components/finance/TransactionList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { fetchTransactions } from '@/services/financeService';
import { Loader2, AlertTriangle, Calendar, TrendingUp, PiggyBank } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format, isAfter, isBefore, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';
import { UserProposals } from '@/components/proposal/UserProposals';

const Index = () => {
  const [balanceSummary, setBalanceSummary] = useState<BalanceSummary>({
    totalBalance: 0,
    income: 0,
    expenses: 0,
    pendingExpenses: 0,
    overdueExpenses: 0
  });
  
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);

  const { data: transactions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions
  });

  useEffect(() => {
    if (transactions.length) {
      const now = new Date();
      const sevenDaysLater = addDays(now, 7);
      const newAlerts: FinancialAlert[] = [];
      
      transactions.forEach((transaction: Transaction) => {
        if (transaction.type === 'expense' && transaction.due_date) {
          const dueDate = parseISO(transaction.due_date);
          
          if (isBefore(dueDate, now) && transaction.payment_status !== 'paid') {
            newAlerts.push({
              id: `overdue-${transaction.id}`,
              title: 'Conta atrasada!',
              description: `${transaction.description} - R$ ${Math.abs(transaction.amount).toFixed(2)}`,
              type: 'danger',
              date: transaction.due_date,
              isRead: false
            });
          } 
          else if (
            isAfter(dueDate, now) && 
            isBefore(dueDate, sevenDaysLater) && 
            transaction.payment_status !== 'paid'
          ) {
            newAlerts.push({
              id: `upcoming-${transaction.id}`,
              title: 'Vencimento próximo',
              description: `${transaction.description} vence em ${format(dueDate, 'dd/MM/yyyy')}`,
              type: 'warning',
              date: transaction.due_date,
              isRead: false
            });
          }
        }
      });
      
      setAlerts(newAlerts);
      
      if (newAlerts.some(alert => alert.type === 'danger')) {
        toast({
          title: "Atenção às suas finanças!",
          description: "Você tem contas atrasadas que precisam de atenção",
          variant: "destructive",
        });
      }
    }
  }, [transactions]);

  useEffect(() => {
    if (transactions.length) {
      const summary = transactions.reduce((acc: BalanceSummary, transaction: any) => {
        const amount = transaction.amount;
        const now = new Date();
        
        if (amount > 0) {
          acc.income += amount;
        } else {
          acc.expenses += Math.abs(amount);
          
          if (transaction.due_date && transaction.payment_status !== 'paid') {
            const dueDate = parseISO(transaction.due_date);
            if (isBefore(dueDate, now)) {
              acc.overdueExpenses += Math.abs(amount);
            } else {
              acc.pendingExpenses += Math.abs(amount);
            }
          }
        }
        
        acc.totalBalance += amount;
        return acc;
      }, {
        totalBalance: 0,
        income: 0,
        expenses: 0,
        pendingExpenses: 0,
        overdueExpenses: 0
      });
      
      setBalanceSummary(summary);
    }
  }, [transactions]);

  const incomeTransactions = transactions.filter((t: any) => t.amount > 0);
  const expenseTransactions = transactions.filter((t: any) => t.amount < 0);
  
  const monthEndForecast = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const expectedIncome = transactions
      .filter((t: Transaction) => 
        t.amount > 0 && 
        t.is_recurring && 
        parseISO(t.date).getMonth() === currentMonth &&
        parseISO(t.date).getFullYear() === currentYear
      )
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    
    const expectedExpenses = transactions
      .filter((t: Transaction) => 
        t.amount < 0 && 
        t.due_date && 
        parseISO(t.due_date).getMonth() === currentMonth &&
        parseISO(t.due_date).getFullYear() === currentYear &&
        t.payment_status !== 'paid'
      )
      .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0);
    
    const expectedBalance = balanceSummary.totalBalance + expectedIncome - expectedExpenses;
    
    return {
      expectedIncome,
      expectedExpenses,
      expectedBalance
    };
  }, [transactions, balanceSummary.totalBalance]);

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
      <div className="container pb-16">
        <h1 className="text-3xl font-bold mb-6">Finanças</h1>
        
        <div className="mb-8">
          <UserProposals />
        </div>
        
        <div className="mb-8">
          <BalanceCard balanceSummary={balanceSummary} />
        </div>
        
        {alerts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertas Financeiros
            </h2>
            <div className="grid gap-3">
              {alerts.map((alert) => (
                <Card key={alert.id} className={`
                  ${alert.type === 'danger' ? 'border-red-400 bg-red-50' : ''}
                  ${alert.type === 'warning' ? 'border-amber-400 bg-amber-50' : ''}
                  ${alert.type === 'info' ? 'border-blue-400 bg-blue-50' : ''}
                `}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex justify-between">
                      {alert.title}
                      <span className="text-sm font-normal">
                        {format(parseISO(alert.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p>{alert.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Previsão para o Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                R$ {monthEndForecast.expectedBalance.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                Saldo previsto ao fim do mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Receitas Esperadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                R$ {monthEndForecast.expectedIncome.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                Entrada prevista até o fim do mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-red-500" />
                Despesas Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                R$ {monthEndForecast.expectedExpenses.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                Contas a pagar neste mês
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>Meta de Economia</span>
              <span className="text-sm font-normal">R$ 1.000,00 / R$ 5.000,00</span>
            </CardTitle>
            <CardDescription>
              Férias - Dezembro/2025
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <Progress value={20} className="h-3" />
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-sm text-muted-foreground">
              Faltam R$ 4.000,00 (80%) para atingir sua meta
            </p>
          </CardFooter>
        </Card>
        
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
        
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Dicas para Economizar</h2>
          <Card>
            <CardContent className="p-4">
              <ul className="list-disc pl-5 space-y-2">
                <li>Estabeleça um orçamento mensal e siga-o rigorosamente</li>
                <li>Crie um fundo de emergência para despesas inesperadas</li>
                <li>Compare preços antes de fazer compras significativas</li>
                <li>Automatize suas economias com transferências automáticas</li>
                <li>Revise assinaturas e serviços que você não usa frequentemente</li>
              </ul>
              
              <Button variant="outline" className="mt-4 w-full">
                Ver mais dicas financeiras
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;

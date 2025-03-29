
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { fetchTransactions, fetchCategories } from '@/services/financeService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Loader2, Plus, AlertCircle, TrendingUp } from 'lucide-react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { BudgetSummary, Category } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const Planning = () => {
  const { toast } = useToast();
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', amount: '' });
  const [currentMonth] = useState(new Date());

  // Simulando orçamentos (em uma aplicação real, eles seriam armazenados no banco de dados)
  const [budgets, setBudgets] = useState<Record<string, number>>({
    'Alimentação': 1200,
    'Transporte': 500,
    'Moradia': 2200,
    'Lazer': 800,
    'Saúde': 400,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'expense')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());
      
      if (error) throw error;
      
      return data.map((tx: any) => ({
        ...tx,
        date: new Date(tx.date),
        amount: Math.abs(tx.amount), // Convertendo para positivo para facilitar cálculos
      }));
    }
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  // Calcular resumo do orçamento
  const calculateBudgetSummary = (): BudgetSummary[] => {
    const budgetSummaries: BudgetSummary[] = [];
    
    // Para cada categoria com orçamento
    Object.keys(budgets).forEach(category => {
      // Calcula quanto foi gasto na categoria
      const spent = transactions
        .filter(tx => tx.category === category)
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const allocated = budgets[category];
      const remaining = allocated - spent;
      const percentage = Math.min(Math.round((spent / allocated) * 100), 100);
      
      budgetSummaries.push({
        category,
        allocated,
        spent,
        remaining,
        percentage
      });
    });
    
    return budgetSummaries;
  };

  const budgetSummaries = calculateBudgetSummary();
  const totalBudget = Object.values(budgets).reduce((sum, value) => sum + value, 0);
  const totalSpent = budgetSummaries.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const totalPercentage = Math.round((totalSpent / totalBudget) * 100);

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.amount) {
      toast({
        title: 'Dados incompletos',
        description: 'Por favor, preencha a categoria e o valor do orçamento',
        variant: 'destructive'
      });
      return;
    }
    
    const amount = parseFloat(newBudget.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'O valor do orçamento deve ser um número positivo',
        variant: 'destructive'
      });
      return;
    }
    
    // Adiciona ou atualiza o orçamento
    setBudgets({
      ...budgets,
      [newBudget.category]: amount
    });
    
    setIsAddBudgetOpen(false);
    setNewBudget({ category: '', amount: '' });
    
    toast({
      title: 'Orçamento adicionado',
      description: `Orçamento para ${newBudget.category} foi definido com sucesso`
    });
  };

  if (transactionsLoading || categoriesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Preparar dados para o gráfico
  const chartData = budgetSummaries.map(budget => ({
    name: budget.category,
    spent: budget.spent,
    allocated: budget.allocated,
  }));

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Planejamento Financeiro</h1>
            <p className="text-muted-foreground">
              {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <Dialog open={isAddBudgetOpen} onOpenChange={setIsAddBudgetOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Orçamento</DialogTitle>
                <DialogDescription>
                  Defina um limite de gastos para uma categoria
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={newBudget.category}
                    onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((cat: Category) => cat.name !== 'Salário' && cat.name !== 'Investimentos')
                        .map((category: Category) => (
                          <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Valor do Orçamento (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                    placeholder="Ex: 1000"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddBudgetOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddBudget}>
                  Adicionar Orçamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Resumo do Mês</CardTitle>
            <CardDescription>
              Visão geral do seu orçamento para {format(currentMonth, "MMMM", { locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Orçamento Total: {formatCurrency(totalBudget)}</span>
                <span className="text-sm font-medium">{totalPercentage}% utilizado</span>
              </div>
              <Progress value={totalPercentage} 
                className={totalPercentage > 90 ? "bg-destructive/20" : ""} 
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-muted-foreground">
                  Gasto: {formatCurrency(totalSpent)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Restante: {formatCurrency(totalRemaining)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="list">
          <TabsList className="grid grid-cols-2 mb-4 w-[300px]">
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="chart">Gráfico</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {budgetSummaries.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <AlertCircle className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum orçamento definido</h3>
                  <p className="text-muted-foreground text-center max-w-sm mb-4">
                    Defina orçamentos para suas categorias de despesas e acompanhe seus gastos.
                  </p>
                  <Button onClick={() => setIsAddBudgetOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Orçamento
                  </Button>
                </CardContent>
              </Card>
            ) : (
              budgetSummaries.map((budget, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{budget.category}</CardTitle>
                      <span className={`font-bold ${
                        budget.percentage > 90 ? 'text-destructive' : 
                        budget.percentage > 75 ? 'text-amber-500' : 
                        'text-emerald-500'
                      }`}>
                        {budget.percentage}%
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Progress 
                      value={budget.percentage} 
                      className={budget.percentage > 90 ? "bg-destructive/20" : ""} 
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Gasto: {formatCurrency(budget.spent)}
                      </span>
                      <span className="text-muted-foreground">
                        Restante: {formatCurrency(budget.remaining)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Orçamento: {formatCurrency(budget.allocated)}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="chart">
            {budgetSummaries.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <TrendingUp className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum dado para visualizar</h3>
                  <p className="text-muted-foreground text-center max-w-sm mb-4">
                    Defina orçamentos para ver seus dados em formato gráfico.
                  </p>
                  <Button onClick={() => setIsAddBudgetOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Orçamento
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Comparativo de Orçamentos</CardTitle>
                  <CardDescription>
                    Gastos versus valores orçados por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 50,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis 
                          tickFormatter={(value) => 
                            new Intl.NumberFormat('pt-BR', {
                              notation: 'compact',
                              compactDisplay: 'short',
                              style: 'currency',
                              currency: 'BRL'
                            }).format(value)
                          } 
                        />
                        <Tooltip 
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                        <Bar name="Orçado" dataKey="allocated" fill="#8884d8" />
                        <Bar name="Gasto" dataKey="spent" fill="#82ca9d">
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`}
                              fill={entry.spent > entry.allocated ? '#FF8042' : '#82ca9d'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Planning;


import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { generateReport } from '@/services/financeService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileBarChart, Download } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const formSchema = z.object({
  reportType: z.enum(['income', 'expense', 'all']),
  period: z.enum(['last7days', 'last30days', 'thisMonth', 'lastMonth', 'custom']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(['category', 'date', 'account']),
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const Reports = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportType: 'all',
      period: 'thisMonth',
      groupBy: 'category',
    },
  });

  const watchPeriod = form.watch('period');
  const watchReportType = form.watch('reportType');
  const watchGroupBy = form.watch('groupBy');

  const getPeriodDates = () => {
    const today = new Date();
    let startDate, endDate;

    switch (watchPeriod) {
      case 'last7days':
        startDate = subDays(today, 7);
        endDate = today;
        break;
      case 'last30days':
        startDate = subDays(today, 30);
        endDate = today;
        break;
      case 'thisMonth':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case 'custom':
        startDate = form.getValues('startDate') 
          ? new Date(form.getValues('startDate') as string) 
          : subDays(today, 30);
        endDate = form.getValues('endDate') 
          ? new Date(form.getValues('endDate') as string) 
          : today;
        break;
      default:
        startDate = subDays(today, 30);
        endDate = today;
    }

    return { startDate, endDate };
  };

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['report', watchReportType, watchPeriod, watchGroupBy, form.getValues('startDate'), form.getValues('endDate')],
    queryFn: async () => {
      const { startDate, endDate } = getPeriodDates();
      return await generateReport(watchReportType, startDate, endDate, watchGroupBy);
    },
    enabled: true,
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    refetch();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getChartTitle = () => {
    const typeLabels = {
      all: 'Fluxo de Caixa',
      income: 'Receitas',
      expense: 'Despesas',
    };
    
    let periodLabel = '';
    const { startDate, endDate } = getPeriodDates();
    
    switch (watchPeriod) {
      case 'last7days':
        periodLabel = 'nos últimos 7 dias';
        break;
      case 'last30days':
        periodLabel = 'nos últimos 30 dias';
        break;
      case 'thisMonth':
        periodLabel = 'no mês atual';
        break;
      case 'lastMonth':
        periodLabel = 'no mês anterior';
        break;
      case 'custom':
        periodLabel = `de ${format(startDate, 'dd/MM/yyyy')} até ${format(endDate, 'dd/MM/yyyy')}`;
        break;
    }
    
    return `${typeLabels[watchReportType]} ${periodLabel}`;
  };

  const getChartData = () => {
    if (!reportData || !reportData.data) return [];
    
    if (watchGroupBy === 'category') {
      return reportData.data.map((item: any) => ({
        name: item.category || 'Sem categoria',
        value: Math.abs(item.totalAmount),
      }));
    } else if (watchGroupBy === 'date') {
      return reportData.data.map((item: any) => ({
        name: format(new Date(item.date), 'dd/MM'),
        value: Math.abs(item.totalAmount),
      }));
    } else {
      return reportData.data.map((item: any) => ({
        name: item.account || 'Sem conta',
        value: Math.abs(item.totalAmount),
      }));
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Relatórios</h1>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtros de Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="reportType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Relatório</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Fluxo de Caixa</SelectItem>
                              <SelectItem value="income">Receitas</SelectItem>
                              <SelectItem value="expense">Despesas</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Período</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                              <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                              <SelectItem value="thisMonth">Mês atual</SelectItem>
                              <SelectItem value="lastMonth">Mês anterior</SelectItem>
                              <SelectItem value="custom">Período personalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="groupBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agrupar por</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="category">Categoria</SelectItem>
                              <SelectItem value="date">Data</SelectItem>
                              <SelectItem value="account">Conta</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {watchPeriod === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Inicial</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Final</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <Button type="submit">Gerar Relatório</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {reportData && reportData.data && reportData.data.length > 0 ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>{getChartTitle()}</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chart">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="chart">Gráfico</TabsTrigger>
                  <TabsTrigger value="table">Tabela</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chart" className="pt-4">
                  <div className="h-80">
                    {watchGroupBy === 'category' ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getChartData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {getChartData().map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => formatCurrency(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getChartData()}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value: any) => formatCurrency(value)} />
                          <Legend />
                          <Bar 
                            dataKey="value" 
                            fill={watchReportType === 'expense' ? '#FF8042' : '#00C49F'} 
                            name={watchReportType === 'expense' ? 'Despesa' : 'Receita'} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="table">
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2 text-left">
                            {watchGroupBy === 'category' ? 'Categoria' : 
                             watchGroupBy === 'date' ? 'Data' : 'Conta'}
                          </th>
                          <th className="px-4 py-2 text-right">Valor</th>
                          {watchGroupBy === 'category' && <th className="px-4 py-2 text-right">%</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {getChartData().map((item: any, index: number) => {
                          const total = getChartData().reduce((sum: number, i: any) => sum + i.value, 0);
                          const percentage = (item.value / total) * 100;
                          
                          return (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2">{item.name}</td>
                              <td className="px-4 py-2 text-right">{formatCurrency(item.value)}</td>
                              {watchGroupBy === 'category' && (
                                <td className="px-4 py-2 text-right">{percentage.toFixed(1)}%</td>
                              )}
                            </tr>
                          );
                        })}
                        <tr className="font-bold">
                          <td className="px-4 py-2">Total</td>
                          <td className="px-4 py-2 text-right">
                            {formatCurrency(
                              getChartData().reduce((sum: number, item: any) => sum + item.value, 0)
                            )}
                          </td>
                          {watchGroupBy === 'category' && <td className="px-4 py-2 text-right">100%</td>}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileBarChart className="h-16 w-16 text-muted-foreground opacity-50 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Não há dados suficientes para gerar este relatório. Tente ajustar os filtros ou adicionar mais transações.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;

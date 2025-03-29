
import React, { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { Transaction, Category, Account } from '@/types/finance';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchTransactions, updateTransaction, fetchCategories, fetchAccounts } from '@/services/financeService';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  description: z.string().min(3, "A descrição precisa ter pelo menos 3 caracteres"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "O valor deve ser um número positivo",
  }),
  type: z.enum(["income", "expense"]),
  category: z.string().optional(),
  account_id: z.string().optional(),
  is_recurring: z.boolean().default(false),
  recurring_period: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  date: z.string(),
});

const EditTransaction = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      type: "expense",
      is_recurring: false,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Transaction & { account_id?: string };
    },
  });

  useEffect(() => {
    if (transaction) {
      form.setValue('description', transaction.description);
      form.setValue('amount', Math.abs(transaction.amount).toString());
      form.setValue('type', transaction.amount > 0 ? 'income' : 'expense');
      form.setValue('category', transaction.category || '');
      form.setValue('account_id', transaction.account_id || '');
      form.setValue('is_recurring', transaction.is_recurring || false);
      if (transaction.recurring_period && ['daily', 'weekly', 'monthly', 'yearly'].includes(transaction.recurring_period)) {
        form.setValue('recurring_period', transaction.recurring_period as 'daily' | 'weekly' | 'monthly' | 'yearly');
      }
      form.setValue('date', new Date(transaction.date).toISOString().split('T')[0]);
    }
  }, [transaction, form]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts
  });

  const watchIsRecurring = form.watch("is_recurring");
  const watchType = form.watch("type");

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!id) return;
    
    try {
      const amount = parseFloat(data.amount);
      
      const updatedTransaction: Partial<Transaction> = {
        description: data.description,
        amount: data.type === "expense" ? -amount : amount,
        date: data.date,
        type: data.type,
        category: data.category,
        is_recurring: data.is_recurring,
        recurring_period: data.is_recurring ? data.recurring_period : undefined,
        account_id: data.account_id,
      };

      await updateTransaction(id, updatedTransaction);

      toast({
        title: "Transação atualizada",
        description: "A transação foi atualizada com sucesso",
      });

      navigate("/");
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a transação",
        variant: "destructive",
      });
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

  if (!transaction) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto">
          <div className="bg-destructive/20 p-4 rounded-lg">
            <p className="text-destructive font-medium">Transação não encontrada</p>
          </div>
          <Button className="mt-4" onClick={() => navigate('/')}>Voltar para Transações</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Editar transação</h1>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Compras no mercado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">R$</span>
                        <Input placeholder="0,00" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <div className="flex rounded-md overflow-hidden">
                        <Button
                          type="button"
                          onClick={() => form.setValue("type", "income")}
                          className={`flex-1 rounded-none rounded-l-md ${
                            field.value === "income"
                              ? "bg-finance-income text-white"
                              : "bg-muted"
                          }`}
                        >
                          Receita
                        </Button>
                        <Button
                          type="button"
                          onClick={() => form.setValue("type", "expense")}
                          className={`flex-1 rounded-none rounded-r-md ${
                            field.value === "expense"
                              ? "bg-finance-expense text-white"
                              : "bg-muted"
                          }`}
                        >
                          Despesa
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma conta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((account: any) => (
                          <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories
                          .filter((cat: Category) => 
                            (watchType === "income" && ["Salário", "Investimentos"].includes(cat.name)) ||
                            (watchType === "expense" && !["Salário", "Investimentos"].includes(cat.name))
                          )
                          .map((category: Category) => (
                            <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="is_recurring"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border p-4">
                      <div>
                        <FormLabel>Transação recorrente</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          A transação se repetirá automaticamente
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (!checked) {
                              form.setValue("recurring_period", undefined);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchIsRecurring && (
                  <FormField
                    control={form.control}
                    name="recurring_period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Período de recorrência</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um período" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Diário</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="yearly">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Button type="submit" className="w-full">
                Salvar alterações
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditTransaction;

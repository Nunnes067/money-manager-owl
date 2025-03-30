
import React, { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { Transaction } from '@/types/finance';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { updateTransaction, fetchCategories, fetchAccounts } from '@/services/financeService';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TransactionFormFields } from '@/components/finance/TransactionFormFields';

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

type FormValues = z.infer<typeof formSchema>;

const EditTransaction = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();

  const form = useForm<FormValues>({
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

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts
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

  const onSubmit = async (data: FormValues) => {
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
              <TransactionFormFields
                form={form}
                accounts={accounts}
                categories={categories}
                isEdit={true}
              />
              
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

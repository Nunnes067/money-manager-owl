
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '@/types/finance';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { addTransaction, fetchCategories, fetchAccounts } from '@/services/financeService';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { TransactionFormFields } from '@/components/finance/TransactionFormFields';

const formSchema = z.object({
  description: z.string().min(3, "A descrição precisa ter pelo menos 3 caracteres"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "O valor deve ser um número positivo",
  }),
  type: z.enum(["income", "expense"]),
  category: z.string().optional(),
  account_id: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringPeriod: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  isInstallment: z.boolean().default(false),
  installmentTotal: z.string().optional(),
  date: z.string(),
  payment_status: z.enum(["pending", "paid", "overdue"]).optional()
});

type FormValues = z.infer<typeof formSchema>;

const AddTransaction = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      type: "expense",
      isRecurring: false,
      date: new Date().toISOString().split('T')[0],
      payment_status: "pending"
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const amount = parseFloat(data.amount);
      const transactionData: Omit<Transaction, "id" | "user_id"> = {
        description: data.description,
        amount: data.type === "expense" ? -amount : amount,
        date: data.date,
        type: data.type,
        category: data.category,
        is_recurring: data.isRecurring,
        recurring_period: data.isRecurring ? data.recurringPeriod : undefined,
        account_id: data.account_id,
        payment_status: data.payment_status || "pending",
      };

      if (data.isInstallment && data.installmentTotal && parseInt(data.installmentTotal) > 1) {
        const totalInstallments = parseInt(data.installmentTotal);
        const installmentAmount = amount / totalInstallments;
        
        let successCount = 0;

        // Criar transações para cada parcela
        for (let i = 0; i < totalInstallments; i++) {
          const installmentDate = new Date(data.date);
          installmentDate.setMonth(installmentDate.getMonth() + i);

          const installmentTransaction = {
            ...transactionData,
            amount: data.type === "expense" ? -installmentAmount : installmentAmount,
            date: installmentDate.toISOString().split('T')[0],
            installment_current: i + 1,
            installment_total: totalInstallments,
          };

          const result = await addTransaction(installmentTransaction);
          if (result) successCount++;
        }

        toast({
          title: "Parcelas adicionadas",
          description: `${successCount} de ${totalInstallments} parcelas foram adicionadas com sucesso`,
        });
      } else {
        const result = await addTransaction(transactionData);

        if (result) {
          toast({
            title: "Transação adicionada",
            description: "A transação foi adicionada com sucesso",
          });
        } else {
          throw new Error("Falha ao adicionar transação");
        }
      }
      
      navigate("/");
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar a transação",
        variant: "destructive",
      });
    }
  };

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
          <h1 className="text-2xl font-bold">Nova transação</h1>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TransactionFormFields
                form={form}
                accounts={accounts}
                categories={categories}
                loadingAccounts={loadingAccounts}
              />
              
              <Button type="submit" className="w-full">
                Adicionar transação
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddTransaction;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery } from '@tanstack/react-query';
import { fetchAccounts, fetchCategories } from '@/services/financeService';
import { addTransaction } from '@/services/transactionService';
import { Transaction } from '@/types/finance';
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
  payment_status: z.enum(["pending", "paid", "overdue"]).default("pending")
});

type FormValues = z.infer<typeof formSchema>;

interface AddTransactionFormProps {
  onAddTransaction: (transaction: any) => void;
}

export function AddTransactionForm({ onAddTransaction }: AddTransactionFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts
  });
  
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      type: "expense",
      isRecurring: false,
      isInstallment: false,
      date: new Date().toISOString().split('T')[0],
      payment_status: "pending"
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const amount = parseFloat(data.amount);
      
      const baseTransaction: Omit<Transaction, "id" | "user_id"> = {
        description: data.description,
        amount: data.type === "expense" ? -amount : amount,
        date: new Date(data.date).toISOString(),
        type: data.type,
        category: data.category,
        is_recurring: data.isRecurring,
        recurring_period: data.recurringPeriod,
        account_id: data.account_id,
        payment_status: data.payment_status
      };

      if (data.isInstallment && data.installmentTotal) {
        const totalInstallments = parseInt(data.installmentTotal);
        const installmentAmount = amount / totalInstallments;

        let successCount = 0;
        
        for (let i = 0; i < totalInstallments; i++) {
          const installmentDate = new Date(data.date);
          installmentDate.setMonth(installmentDate.getMonth() + i);

          const installmentTransaction: Omit<Transaction, "id" | "user_id"> = {
            ...baseTransaction,
            amount: data.type === "expense" ? -installmentAmount : installmentAmount,
            date: installmentDate.toISOString(),
            installment_current: i + 1,
            installment_total: totalInstallments,
          };

          const result = await addTransaction(installmentTransaction);
          if (result) {
            successCount++;
            onAddTransaction(result);
          }
        }
        
        toast({
          title: "Transações adicionadas",
          description: `${successCount} de ${totalInstallments} parcelas foram adicionadas com sucesso`,
        });
      } else {
        const result = await addTransaction(baseTransaction);
        
        if (result) {
          onAddTransaction(result);
          
          toast({
            title: "Transação adicionada",
            description: "Sua transação foi adicionada com sucesso",
          });
        } else {
          throw new Error("Falha ao adicionar a transação");
        }
      }

      navigate("/");
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar a transação",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TransactionFormFields
          form={form}
          accounts={accounts}
          categories={categories}
          loadingAccounts={loadingAccounts}
        />
        
        <Button type="submit" className="w-full">Adicionar transação</Button>
      </form>
    </Form>
  );
}

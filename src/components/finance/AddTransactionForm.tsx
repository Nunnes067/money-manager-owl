
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from '@tanstack/react-query';
import { fetchAccounts, fetchCategories } from '@/services/financeService';
import { TransactionFormFields } from '@/components/finance/TransactionFormFields';
import { useTransactionForm, transactionFormSchema, TransactionFormValues } from './hooks/useTransactionForm';

interface AddTransactionFormProps {
  onAddTransaction: (transaction: any) => void;
}

export function AddTransactionForm({ onAddTransaction }: AddTransactionFormProps) {
  const { handleSubmitTransaction } = useTransactionForm(onAddTransaction);
  
  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts
  });
  
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });
  
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
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

  const onSubmit = (data: TransactionFormValues) => {
    handleSubmitTransaction(data, form);
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

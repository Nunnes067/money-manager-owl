
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

const formSchema = z.object({
  description: z.string().min(3, "A descrição precisa ter pelo menos 3 caracteres"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "O valor deve ser um número positivo",
  }),
  type: z.enum(["income", "expense"]),
  category: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringPeriod: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  isInstallment: z.boolean().default(false),
  installmentTotal: z.string().optional(),
  date: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTransactionFormProps {
  onAddTransaction: (transaction: any) => void;
}

export function AddTransactionForm({ onAddTransaction }: AddTransactionFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      type: "expense",
      isRecurring: false,
      isInstallment: false,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const watchIsRecurring = form.watch("isRecurring");
  const watchIsInstallment = form.watch("isInstallment");
  const watchType = form.watch("type");

  // Example categories (can be expanded or moved to a prop/context)
  const categories = {
    income: ["Salário", "Freelance", "Investimentos", "Outros"],
    expense: ["Alimentação", "Moradia", "Transporte", "Lazer", "Saúde", "Educação", "Outros"],
  };

  const onSubmit = (data: FormValues) => {
    try {
      const amount = parseFloat(data.amount);
      const baseTransaction = {
        id: uuidv4(),
        description: data.description,
        amount: data.type === "expense" ? -amount : amount,
        date: new Date(data.date),
        type: data.type,
        category: data.category,
        isRecurring: data.isRecurring,
        recurringPeriod: data.recurringPeriod,
        installment: null,
      };

      if (data.isInstallment && data.installmentTotal) {
        const totalInstallments = parseInt(data.installmentTotal);
        const installmentAmount = amount / totalInstallments;

        // Create transactions for each installment
        for (let i = 0; i < totalInstallments; i++) {
          const installmentDate = new Date(data.date);
          installmentDate.setMonth(installmentDate.getMonth() + i);

          const installmentTransaction = {
            ...baseTransaction,
            id: uuidv4(),
            amount: data.type === "expense" ? -installmentAmount : installmentAmount,
            date: installmentDate,
            installment: {
              current: i + 1,
              total: totalInstallments,
            },
          };

          onAddTransaction(installmentTransaction);
        }
      } else {
        // Add a single transaction
        onAddTransaction(baseTransaction);
      }

      toast({
        title: "Transação adicionada",
        description: "Sua transação foi adicionada com sucesso",
      });

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
                    className={`flex-1 rounded-none rounded-l-md ${field.value === "income" ? "bg-finance-income text-white" : "bg-muted"}`}
                  >
                    Receita
                  </Button>
                  <Button
                    type="button"
                    onClick={() => form.setValue("type", "expense")}
                    className={`flex-1 rounded-none rounded-r-md ${field.value === "expense" ? "bg-finance-expense text-white" : "bg-muted"}`}
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
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {watchType === "income" 
                    ? categories.income.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))
                    : categories.expense.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))
                  }
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
            name="isRecurring"
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
                        form.setValue("recurringPeriod", undefined);
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
              name="recurringPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Período de recorrência</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          
          <FormField
            control={form.control}
            name="isInstallment"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4">
                <div>
                  <FormLabel>Parcelado</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Dividir o valor em parcelas
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (!checked) {
                        form.setValue("installmentTotal", undefined);
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {watchIsInstallment && (
            <FormField
              control={form.control}
              name="installmentTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de parcelas</FormLabel>
                  <FormControl>
                    <Input type="number" min="2" placeholder="Ex: 12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        <Button type="submit" className="w-full">Adicionar transação</Button>
      </form>
    </Form>
  );
}

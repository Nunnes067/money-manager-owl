import React, { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
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
import { addTransaction, fetchCategories, fetchAccounts } from '@/services/financeService';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';

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
  installment_total: z.string().optional(),
  date: z.string(),
  due_date: z.string().optional(),
  payment_status: z.enum(["pending", "paid", "overdue"]).optional()
});

const AddTransaction = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      type: "expense",
      is_recurring: false,
      date: new Date().toISOString().split('T')[0],
      payment_status: "pending"
    },
  });

  const watchIsRecurring = form.watch("is_recurring");
  const watchType = form.watch("type");

  useEffect(() => {
    console.log("Contas carregadas no componente:", accounts);
  }, [accounts]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      console.log("Formulário enviado:", data);
      const amount = parseFloat(data.amount);
      const transactionData: Omit<Transaction, "id" | "user_id"> = {
        description: data.description,
        amount: data.type === "expense" ? -amount : amount,
        date: data.date,
        type: data.type,
        category: data.category,
        is_recurring: data.is_recurring,
        recurring_period: data.is_recurring ? data.recurring_period : undefined,
        account_id: data.account_id,
        payment_status: data.payment_status,
        due_date: data.due_date
      };

      console.log("Transação a ser enviada:", transactionData);

      if (data.installment_total && parseInt(data.installment_total) > 1) {
        const totalInstallments = parseInt(data.installment_total);
        const installmentAmount = amount / totalInstallments;

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
          console.log(`Parcela ${i+1} adicionada:`, result);
        }

        toast({
          title: "Parcelas adicionadas",
          description: `${totalInstallments} parcelas foram adicionadas com sucesso`,
        });
      } else {
        // Adicionar uma única transação
        const result = await addTransaction(transactionData);
        console.log("Resultado da adição:", result);

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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma conta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingAccounts ? (
                          <SelectItem value="loading" disabled>Carregando...</SelectItem>
                        ) : accounts.length === 0 ? (
                          <SelectItem value="no-accounts" disabled>Nenhuma conta disponível</SelectItem>
                        ) : (
                          accounts.map((account: any) => (
                            <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                          ))
                        )}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          defaultValue={field.value}
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

                <FormField
                  control={form.control}
                  name="installment_total"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Número de parcelas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Deixe em branco se não for parcelado"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        Deixe em branco se não for uma compra parcelada
                      </p>
                    </FormItem>
                  )}
                />
              </div>

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

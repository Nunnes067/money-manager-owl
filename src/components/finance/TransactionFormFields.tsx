
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Account, Category } from '@/types/finance';

interface TransactionFormFieldsProps {
  form: UseFormReturn<any>;
  accounts: Account[];
  categories: Category[];
  loadingAccounts?: boolean;
  isEdit?: boolean;
}

export function TransactionFormFields({ 
  form, 
  accounts, 
  categories, 
  loadingAccounts = false,
  isEdit = false
}: TransactionFormFieldsProps) {
  const watchIsRecurring = form.watch(isEdit ? "is_recurring" : "isRecurring");
  const watchIsInstallment = !isEdit ? form.watch("isInstallment") : false;
  const watchType = form.watch("type");

  return (
    <>
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
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              defaultValue={field.value}
            >
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
                  accounts.map((account: Account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} {isEdit ? '' : `(R$ ${account.balance.toFixed(2)})`}
                    </SelectItem>
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
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              defaultValue={field.value}
            >
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
          name={isEdit ? "is_recurring" : "isRecurring"}
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
                      form.setValue(isEdit ? "recurring_period" : "recurringPeriod", undefined);
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
            name={isEdit ? "recurring_period" : "recurringPeriod"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Período de recorrência</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
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

        {!isEdit && (
          <>
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Número de parcelas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="2"
                        placeholder="Ex: 12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      Mínimo de 2 parcelas
                    </p>
                  </FormItem>
                )}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

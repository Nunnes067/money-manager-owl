
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';

interface AccountCategoryFieldsProps {
  form: UseFormReturn<any>;
  accounts: Account[];
  categories: Category[];
  loadingAccounts?: boolean;
  watchType: string;
}

export function AccountCategoryFields({ 
  form, 
  accounts, 
  categories, 
  loadingAccounts = false,
  watchType 
}: AccountCategoryFieldsProps) {
  return (
    <>
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
                      {account.name}
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
    </>
  );
}

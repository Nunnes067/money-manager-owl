
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface BasicTransactionFieldsProps {
  form: UseFormReturn<any>;
}

export function BasicTransactionFields({ form }: BasicTransactionFieldsProps) {
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
    </>
  );
}

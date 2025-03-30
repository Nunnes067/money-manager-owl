
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
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

interface RecurringFieldsProps {
  form: UseFormReturn<any>;
  isEdit?: boolean;
  watchIsRecurring: boolean;
}

export function RecurringFields({ 
  form, 
  isEdit = false,
  watchIsRecurring
}: RecurringFieldsProps) {
  const recurringFieldName = isEdit ? "is_recurring" : "isRecurring";
  const recurringPeriodFieldName = isEdit ? "recurring_period" : "recurringPeriod";

  return (
    <>
      <FormField
        control={form.control}
        name={recurringFieldName}
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
                    form.setValue(recurringPeriodFieldName, undefined);
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
          name={recurringPeriodFieldName}
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
    </>
  );
}

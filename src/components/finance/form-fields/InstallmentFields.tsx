
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface InstallmentFieldsProps {
  form: UseFormReturn<any>;
  watchIsInstallment: boolean;
}

export function InstallmentFields({ 
  form, 
  watchIsInstallment 
}: InstallmentFieldsProps) {
  return (
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
  );
}

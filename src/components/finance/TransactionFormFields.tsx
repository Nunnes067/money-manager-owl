
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Account, Category } from '@/types/finance';
import { BasicTransactionFields } from './form-fields/BasicTransactionFields';
import { AccountCategoryFields } from './form-fields/AccountCategoryFields';
import { RecurringFields } from './form-fields/RecurringFields';
import { InstallmentFields } from './form-fields/InstallmentFields';

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
      <BasicTransactionFields form={form} />
      
      <AccountCategoryFields 
        form={form} 
        accounts={accounts} 
        categories={categories} 
        loadingAccounts={loadingAccounts} 
        watchType={watchType}
      />

      <div className="flex flex-col gap-4">
        <RecurringFields 
          form={form} 
          isEdit={isEdit} 
          watchIsRecurring={watchIsRecurring} 
        />

        {!isEdit && (
          <InstallmentFields 
            form={form} 
            watchIsInstallment={watchIsInstallment} 
          />
        )}
      </div>
    </>
  );
}

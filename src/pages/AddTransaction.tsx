
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AddTransactionForm } from '@/components/finance/AddTransactionForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '@/types/finance';

const AddTransaction = () => {
  const navigate = useNavigate();

  const handleAddTransaction = (transaction: Transaction) => {
    // Get current transactions from localStorage
    const existingTransactionsJson = localStorage.getItem('transactions');
    const existingTransactions = existingTransactionsJson 
      ? JSON.parse(existingTransactionsJson) 
      : [];
    
    // Add new transaction
    const updatedTransactions = [...existingTransactions, transaction];
    
    // Save back to localStorage
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
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
          <AddTransactionForm onAddTransaction={handleAddTransaction} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddTransaction;

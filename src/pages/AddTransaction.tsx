
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AddTransactionForm } from '@/components/finance/AddTransactionForm';

const AddTransaction = () => {
  const navigate = useNavigate();

  const handleAddTransaction = (transaction: any) => {
    console.log("Transaction added:", transaction);
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

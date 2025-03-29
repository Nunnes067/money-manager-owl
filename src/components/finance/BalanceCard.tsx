
import { BalanceSummary } from '@/types/finance';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  balanceSummary: BalanceSummary;
}

export function BalanceCard({ balanceSummary }: BalanceCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-finance-card-gradient-from to-finance-card-gradient-to p-6 text-white shadow-lg">
      <div className="absolute inset-0 bg-white/10 bg-opacity-20"></div>
      <div className="relative">
        <h3 className="font-medium opacity-80">Saldo total</h3>
        <p className="mt-1 text-3xl font-bold">{formatCurrency(balanceSummary.totalBalance)}</p>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center text-green-300">
              <ArrowUpIcon className="mr-1 h-4 w-4" />
              <span className="text-xs font-medium">Receitas</span>
            </div>
            <span className="mt-1 text-lg font-semibold">{formatCurrency(balanceSummary.income)}</span>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center text-red-300">
              <ArrowDownIcon className="mr-1 h-4 w-4" />
              <span className="text-xs font-medium">Despesas</span>
            </div>
            <span className="mt-1 text-lg font-semibold">{formatCurrency(balanceSummary.expenses)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction } from '@/types/finance';
import { cn } from '@/lib/utils';
import { Repeat, CreditCard } from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const isIncome = transaction.type === 'income';
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Math.abs(transaction.amount));

  const timeAgo = formatDistanceToNow(new Date(transaction.date), { 
    addSuffix: true,
    locale: ptBR
  });

  return (
    <div className="p-4 border rounded-lg bg-card mb-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "p-2 rounded-full",
              isIncome ? "bg-green-100" : "bg-red-100"
            )}
          >
            {transaction.isRecurring ? (
              <Repeat className={cn("h-5 w-5", isIncome ? "text-finance-income" : "text-finance-expense")} />
            ) : (
              <CreditCard className={cn("h-5 w-5", isIncome ? "text-finance-income" : "text-finance-expense")} />
            )}
          </div>
          <div className="space-y-1">
            <p className="font-medium">{transaction.description}</p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{timeAgo}</span>
              {transaction.category && (
                <>
                  <span>•</span>
                  <span>{transaction.category}</span>
                </>
              )}
            </div>
            {transaction.installment && (
              <div className="text-xs inline-flex items-center font-medium rounded-full px-2 py-1 bg-muted">
                {transaction.installment.current}/{transaction.installment.total} parcelas
              </div>
            )}
          </div>
        </div>
        <div>
          <span
            className={cn(
              "font-semibold",
              isIncome ? "text-finance-income" : "text-finance-expense"
            )}
          >
            {isIncome ? '+' : '-'} {formattedAmount}
          </span>
        </div>
      </div>
    </div>
  );
}

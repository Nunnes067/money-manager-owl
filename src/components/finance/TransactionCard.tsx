
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction } from '@/types/finance';
import { cn } from '@/lib/utils';
import { Repeat, CreditCard, MoreVertical, Edit, Trash } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { deleteTransaction } from '@/services/financeService';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';

interface TransactionCardProps {
  transaction: any; // Usar 'any' para compatibilidade, depois refinamos para o tipo Transaction
  onDelete?: () => void;
}

export function TransactionCard({ transaction, onDelete }: TransactionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const isIncome = transaction.type === 'income';
  
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Math.abs(transaction.amount));

  const timeAgo = formatDistanceToNow(new Date(transaction.date), { 
    addSuffix: true,
    locale: ptBR
  });

  const handleEdit = () => {
    navigate(`/edit-transaction/${transaction.id}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteTransaction(transaction.id);
      if (success) {
        toast({
          title: 'Transação excluída',
          description: 'A transação foi excluída com sucesso',
        });
        if (onDelete) onDelete();
      }
    } finally {
      setIsDeleting(false);
    }
  };

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
            {transaction.is_recurring ? (
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
            {transaction.installment_current && transaction.installment_total && (
              <div className="text-xs inline-flex items-center font-medium rounded-full px-2 py-1 bg-muted">
                {transaction.installment_current}/{transaction.installment_total} parcelas
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-semibold",
              isIncome ? "text-finance-income" : "text-finance-expense"
            )}
          >
            {isIncome ? '+' : '-'} {formattedAmount}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza de que deseja excluir esta transação? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete} 
                      className="bg-destructive hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

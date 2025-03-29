
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { fetchAccounts, deleteAccount } from '@/services/financeService';
import { Account } from '@/types/finance';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Plus, Edit, Trash, CreditCard, Wallet, Landmark, LineChart, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
import { useToast } from '@/components/ui/use-toast';

const Accounts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: accounts = [], isLoading, refetch } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts
  });

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const success = await deleteAccount(id);
      if (success) {
        toast({
          title: 'Conta excluída',
          description: 'A conta foi excluída com sucesso',
        });
        refetch();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet className="h-6 w-6" />;
      case 'savings':
        return <Landmark className="h-6 w-6" />;
      case 'credit_card':
        return <CreditCard className="h-6 w-6" />;
      case 'investment':
        return <LineChart className="h-6 w-6" />;
      default:
        return <Briefcase className="h-6 w-6" />;
    }
  };

  const getAccountTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'checking': 'Conta Corrente',
      'savings': 'Conta Poupança',
      'credit_card': 'Cartão de Crédito',
      'investment': 'Investimento',
      'other': 'Outro'
    };
    return typeMap[type] || 'Outro';
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + (account.balance || 0), 0);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Minhas Contas</h1>
          <Button onClick={() => navigate('/add-account')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(getTotalBalance())}
            </p>
            <p className="text-muted-foreground">{accounts.length} contas registradas</p>
          </CardContent>
        </Card>

        {accounts.length === 0 ? (
          <div className="text-center py-10 border rounded-lg">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma conta registrada</h3>
            <p className="text-muted-foreground mb-4">
              Você ainda não adicionou nenhuma conta ao sistema.
            </p>
            <Button onClick={() => navigate('/add-account')}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Conta
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {accounts.map((account: Account) => (
              <Card key={account.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn("p-2 rounded-full", account.color || "bg-primary/10")}>
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {getAccountTypeLabel(account.type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/edit-account/${account.id}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza de que deseja excluir esta conta? Todas as transações associadas a ela serão afetadas.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(account.id)} 
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {deletingId === account.id ? 
                              <Loader2 className="h-4 w-4 animate-spin" /> : 
                              'Excluir'
                            }
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(account.balance)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Accounts;

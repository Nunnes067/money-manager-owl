
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/finance";
import { toast } from "@/components/ui/use-toast";
import { updateAccountBalance } from "./accountService";

export const fetchTransactions = async () => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*, accounts(name, color)")
      .order("date", { ascending: false });

    if (error) throw error;
    
    return data.map((transaction: any) => ({
      ...transaction,
      date: transaction.date,
      account_name: transaction.accounts?.name || 'Conta não especificada',
      account_color: transaction.accounts?.color
    }));
  } catch (error: any) {
    console.error("Erro ao buscar transações:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível carregar as transações",
      variant: "destructive",
    });
    return [];
  }
};

export const addTransaction = async (transaction: Omit<Transaction, "id" | "user_id">) => {
  try {
    console.log("Adicionando transação:", transaction);
    
    const transactionData = { ...transaction };
    
    // Fix the null check to avoid TypeScript error
    if (transactionData.account_id === null || 
        transactionData.account_id === undefined || 
        (typeof transactionData.account_id === 'object' && transactionData.account_id !== null && !('toString' in transactionData.account_id))) {
      delete transactionData.account_id;
    }
    
    const transactionForSupabase = {
      ...transactionData,
      date: typeof transactionData.date === 'object' ? 
        (transactionData.date as Date).toISOString() : transactionData.date,
      user_id: (await supabase.auth.getUser()).data.user?.id
    };

    const { data, error } = await supabase
      .from("transactions")
      .insert([transactionForSupabase])
      .select();

    if (error) {
      console.error("Erro do Supabase:", error);
      throw error;
    }

    // Safe type checking and handling for account_id
    const accountId = transactionData.account_id ? 
      (typeof transactionData.account_id === 'string' ? 
        transactionData.account_id : String(transactionData.account_id)) : 
      null;
      
    if (accountId && accountId.trim() !== '') {
      await updateAccountBalance(accountId, transactionData.amount);
    }
    
    return data[0];
  } catch (error: any) {
    console.error("Erro ao adicionar transação:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível adicionar a transação",
      variant: "destructive",
    });
    return null;
  }
};

export const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
  try {
    const { data: oldTransaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();
    
    const oldTransactionWithAccount = oldTransaction as Transaction & { account_id?: string };
    
    const transactionForSupabase = {
      ...transaction,
      date: transaction.date && typeof transaction.date === 'object' ? 
        (transaction.date as Date).toISOString() : transaction.date
    };

    const { data, error } = await supabase
      .from("transactions")
      .update(transactionForSupabase)
      .eq("id", id)
      .select();

    if (error) throw error;
    
    if (oldTransactionWithAccount && transaction.amount !== undefined) {
      if (transaction.account_id && oldTransactionWithAccount.account_id && 
          transaction.account_id !== oldTransactionWithAccount.account_id) {
        await updateAccountBalance(oldTransactionWithAccount.account_id, -oldTransactionWithAccount.amount);
        await updateAccountBalance(transaction.account_id, transaction.amount);
      } 
      else if (oldTransactionWithAccount.account_id && transaction.amount !== oldTransactionWithAccount.amount) {
        const difference = transaction.amount - oldTransactionWithAccount.amount;
        await updateAccountBalance(oldTransactionWithAccount.account_id, difference);
      }
    }
    
    return data[0];
  } catch (error: any) {
    console.error("Erro ao atualizar transação:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar a transação",
      variant: "destructive",
    });
    return null;
  }
};

export const deleteTransaction = async (id: string) => {
  try {
    const { data: transaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();
    
    const transactionWithAccount = transaction as Transaction;
    
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;
    
    if (transactionWithAccount && transactionWithAccount.account_id) {
      await updateAccountBalance(transactionWithAccount.account_id, -transactionWithAccount.amount);
    }
    
    return true;
  } catch (error: any) {
    console.error("Erro ao excluir transação:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível excluir a transação",
      variant: "destructive",
    });
    return false;
  }
};

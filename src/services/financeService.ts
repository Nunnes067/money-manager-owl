
import { supabase } from "@/integrations/supabase/client";
import { Transaction, Category, Account } from "@/types/finance";
import { toast } from "@/components/ui/use-toast";

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
    
    // Check if account_id exists and is a valid string before updating account balance
    if (transactionData.account_id && typeof transactionData.account_id === 'string' && transactionData.account_id.trim() !== '') {
      await updateAccountBalance(transactionData.account_id, transactionData.amount);
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

const updateAccountBalance = async (accountId: string, amountChange: number) => {
  try {
    console.log(`Atualizando saldo da conta ${accountId} com valor ${amountChange}`);
    
    const { data: account, error: fetchError } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", accountId)
      .single();
    
    if (fetchError) {
      console.error("Erro ao buscar conta:", fetchError);
      throw fetchError;
    }
    
    const currentBalance = account?.balance || 0;
    const newBalance = currentBalance + amountChange;
    
    console.log(`Saldo atual: ${currentBalance}, Novo saldo: ${newBalance}`);
    
    const { error: updateError } = await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", accountId);
    
    if (updateError) {
      console.error("Erro ao atualizar saldo:", updateError);
      throw updateError;
    }
    
    console.log(`Saldo atualizado com sucesso para: ${newBalance}`);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar saldo da conta:", error);
    return false;
  }
};

export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Erro ao buscar categorias:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível carregar as categorias",
      variant: "destructive",
    });
    return [];
  }
};

export const addCategory = async (category: Omit<Category, "id" | "user_id">) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .insert([category])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error: any) {
    console.error("Erro ao adicionar categoria:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível adicionar a categoria",
      variant: "destructive",
    });
    return null;
  }
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .update(category)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error: any) {
    console.error("Erro ao atualizar categoria:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar a categoria",
      variant: "destructive",
    });
    return null;
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Erro ao excluir categoria:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível excluir a categoria",
      variant: "destructive",
    });
    return false;
  }
};

export const fetchAccounts = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn("Usuário não autenticado, não é possível carregar contas");
      return [];
    }
    
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) throw error;
    console.log("Contas carregadas:", data);
    return data;
  } catch (error: any) {
    console.error("Erro ao buscar contas:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível carregar as contas",
      variant: "destructive",
    });
    return [];
  }
};

export const addAccount = async (account: Omit<Account, "id" | "user_id">) => {
  try {
    console.log("Adicionando conta:", account);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    const accountData = {
      ...account,
      user_id: user.id
    };
    
    const { data, error } = await supabase
      .from("accounts")
      .insert([accountData])
      .select();

    if (error) {
      console.error("Erro do Supabase ao adicionar conta:", error);
      throw error;
    }
    
    console.log("Conta adicionada com sucesso:", data[0]);
    return data[0];
  } catch (error: any) {
    console.error("Erro ao adicionar conta:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível adicionar a conta: " + error.message,
      variant: "destructive",
    });
    return null;
  }
};

export const updateAccount = async (id: string, account: Partial<Account>) => {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .update(account)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error: any) {
    console.error("Erro ao atualizar conta:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar a conta",
      variant: "destructive",
    });
    return null;
  }
};

export const deleteAccount = async (id: string) => {
  try {
    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Erro ao excluir conta:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível excluir a conta",
      variant: "destructive",
    });
    return false;
  }
};

export const generateReport = async (
  type: 'income' | 'expense' | 'all',
  startDate: Date,
  endDate: Date,
  groupBy: 'category' | 'date' | 'account'
) => {
  try {
    let query = supabase.from("transactions").select("*");
    
    if (type !== 'all') {
      query = query.eq("type", type);
    }
    
    query = query.gte("date", startDate.toISOString());
    query = query.lte("date", endDate.toISOString());
    
    const { data, error } = await query.order("date");
    
    if (error) throw error;
    
    if (data) {
      let processedData = [];

      if (groupBy === 'category') {
        const categoryGroups: Record<string, any> = {};
        
        for (const tx of data) {
          const category = tx.category || 'Sem categoria';
          if (!categoryGroups[category]) {
            categoryGroups[category] = {
              category,
              totalAmount: 0,
              count: 0,
            };
          }
          categoryGroups[category].totalAmount += tx.amount;
          categoryGroups[category].count += 1;
        }
        
        processedData = Object.values(categoryGroups);
      } 
      else if (groupBy === 'date') {
        const dateGroups: Record<string, any> = {};
        
        for (const tx of data) {
          const dateKey = new Date(tx.date).toISOString().split('T')[0];
          if (!dateGroups[dateKey]) {
            dateGroups[dateKey] = {
              date: dateKey,
              totalAmount: 0,
              count: 0,
            };
          }
          dateGroups[dateKey].totalAmount += tx.amount;
          dateGroups[dateKey].count += 1;
        }
        
        processedData = Object.values(dateGroups).sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      }
      else if (groupBy === 'account') {
        const accountGroups: Record<string, any> = {};
        
        for (const tx of data as any[]) {
          const account = tx.account_id || 'Sem conta';
          if (!accountGroups[account]) {
            accountGroups[account] = {
              account,
              totalAmount: 0,
              count: 0,
            };
          }
          accountGroups[account].totalAmount += tx.amount;
          accountGroups[account].count += 1;
        }
        
        processedData = Object.values(accountGroups);
      }
      
      return {
        type,
        startDate,
        endDate,
        groupBy,
        data: processedData,
        rawData: data
      };
    }
    
    return null;
  } catch (error: any) {
    console.error("Erro ao gerar relatório:", error.message);
    toast({
      title: "Erro",
      description: "Não foi possível gerar o relatório",
      variant: "destructive",
    });
    return null;
  }
};

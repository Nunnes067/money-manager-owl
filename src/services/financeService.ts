
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
    const transactionForSupabase = {
      ...transaction,
      date: typeof transaction.date === 'object' ? 
        (transaction.date as Date).toISOString() : transaction.date
    };

    const { data, error } = await supabase
      .from("transactions")
      .insert([transactionForSupabase])
      .select();

    if (error) {
      console.error("Erro do Supabase:", error);
      throw error;
    }
    
    // Atualizar o saldo da conta, se especificada
    if (transaction.account_id) {
      await updateAccountBalance(transaction.account_id, transaction.amount);
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
    // Buscar a transação antiga para comparar valores
    const { data: oldTransaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();
    
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
    
    // Atualizar os saldos das contas se necessário
    if (oldTransaction && transaction.amount !== undefined) {
      // Se a conta foi alterada
      if (transaction.account_id && oldTransaction.account_id && 
          transaction.account_id !== oldTransaction.account_id) {
        // Estornar valor da conta antiga
        await updateAccountBalance(oldTransaction.account_id, -oldTransaction.amount);
        // Adicionar à nova conta
        await updateAccountBalance(transaction.account_id, transaction.amount);
      } 
      // Se apenas o valor mudou, atualizar na mesma conta
      else if (oldTransaction.account_id && transaction.amount !== oldTransaction.amount) {
        const difference = transaction.amount - oldTransaction.amount;
        await updateAccountBalance(oldTransaction.account_id, difference);
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
    // Buscar a transação antes de excluir
    const { data: transaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();
    
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;
    
    // Se a transação tinha uma conta associada, ajustar o saldo
    if (transaction && transaction.account_id) {
      // Valor inverso para compensar a remoção
      await updateAccountBalance(transaction.account_id, -transaction.amount);
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

// Nova função para atualizar o saldo da conta
const updateAccountBalance = async (accountId: string, amountChange: number) => {
  try {
    const { data: account, error: fetchError } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", accountId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const newBalance = (account.balance || 0) + amountChange;
    
    const { error: updateError } = await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", accountId);
    
    if (updateError) throw updateError;
    
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
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
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
    const { data, error } = await supabase
      .from("accounts")
      .insert([account])
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
      description: "Não foi possível adicionar a conta",
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
        
        for (const tx of data as (Transaction & { account_id?: string })[]) {
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

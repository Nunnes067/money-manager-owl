
import { supabase } from "@/integrations/supabase/client";
import { Account } from "@/types/finance";
import { toast } from "@/components/ui/use-toast";

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

export const updateAccountBalance = async (accountId: string, amountChange: number) => {
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

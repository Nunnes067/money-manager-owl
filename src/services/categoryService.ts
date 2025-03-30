
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/finance";
import { toast } from "@/components/ui/use-toast";

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

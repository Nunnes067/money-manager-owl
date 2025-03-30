
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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

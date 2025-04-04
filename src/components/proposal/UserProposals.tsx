
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ProposalCard } from './ProposalCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type Proposal = {
  id: string;
  title: string;
  description: string;
  payment_link: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  admin_id: string;
  user_id: string;
};

export function UserProposals() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProposals();
  }, [user]);

  const fetchProposals = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProposals(data as Proposal[] || []);
    } catch (error: any) {
      console.error('Error fetching proposals:', error);
      toast({
        title: "Error loading proposals",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Proposals</CardTitle>
        <CardDescription>
          Review and manage proposals sent to you
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : proposals.length > 0 ? (
          proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              id={proposal.id}
              title={proposal.title}
              description={proposal.description}
              payment_link={proposal.payment_link}
              status={proposal.status}
              created_at={proposal.created_at}
              onStatusChange={fetchProposals}
            />
          ))
        ) : (
          <p className="text-center py-8 text-muted-foreground">You don't have any proposals yet.</p>
        )}
      </CardContent>
    </Card>
  );
}


import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type ProposalProps = {
  id: string;
  title: string;
  description: string;
  payment_link: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  onStatusChange: () => void;
};

export function ProposalCard({ id, title, description, payment_link, status, created_at, onStatusChange }: ProposalProps) {
  const { toast } = useToast();
  
  const updateProposalStatus = async (newStatus: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: `Proposal ${newStatus}`,
        description: newStatus === 'accepted' ? 
          "You have accepted the proposal. Please proceed to payment." : 
          "You have rejected the proposal.",
      });
      
      onStatusChange();
    } catch (error: any) {
      toast({
        title: "Error updating proposal",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Received {format(new Date(created_at), 'PPP')}
          <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
            status === 'accepted' ? 'bg-green-100 text-green-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 whitespace-pre-line">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        {status === 'pending' ? (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-300 hover:bg-red-50 hover:text-red-600"
              onClick={() => updateProposalStatus('rejected')}
            >
              <X className="mr-1 h-4 w-4" /> Reject
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-green-300 hover:bg-green-50 hover:text-green-600"
              onClick={() => updateProposalStatus('accepted')}
            >
              <Check className="mr-1 h-4 w-4" /> Accept
            </Button>
          </div>
        ) : (
          <div></div>
        )}
        
        {(status === 'accepted' || status === 'pending') && (
          <Button variant="outline" size="sm" asChild>
            <a href={payment_link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-4 w-4" /> Payment Link
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

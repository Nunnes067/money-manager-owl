
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User } from 'lucide-react';

type UserData = {
  id: string;
  email: string;
  profile?: {
    id: string;
    name?: string;
    role?: string;
  };
};

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

export default function UserManagement() {
  const { isAdmin, user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Redirect if not an admin
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all users from auth.users via RPC (requires proper function setup)
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, name, role');
      
      if (userError) throw userError;
      
      // Get emails from auth (this requires admin rights)
      const { data: authData, error: authError } = await supabase
        .from('users_view')
        .select('id, email');
        
      if (authError) {
        console.error("Error fetching auth data:", authError);
        // Continue with just profile data if auth data fetch fails
        const formattedData = userData.map((profile) => ({
          id: profile.id,
          email: "Email not available",
          profile,
        }));
        setUsers(formattedData);
      } else {
        // Merge profile and auth data
        const mergedUsers = userData.map(profile => {
          const authUser = authData?.find(auth => auth.id === profile.id);
          return {
            id: profile.id,
            email: authUser?.email || "Email not available",
            profile,
          };
        });
        setUsers(mergedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error loading users",
        description: "Couldn't load user list. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendProposal = async () => {
    if (!selectedUser || !proposalTitle || !proposalDescription || !paymentLink) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('proposals')
        .insert({
          title: proposalTitle,
          description: proposalDescription,
          payment_link: paymentLink,
          status: 'pending',
          admin_id: user?.id,
          user_id: selectedUser.id
        });

      if (error) throw error;

      toast({
        title: "Proposal sent",
        description: `Proposal sent to ${selectedUser.email}`,
      });

      // Reset form
      setProposalTitle('');
      setProposalDescription('');
      setPaymentLink('');
      setSelectedUser(null);
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error sending proposal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openProposalDialog = (userData: UserData) => {
    setSelectedUser(userData);
    setDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              View and manage all users in the system. Send payment proposals to users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((userData) => (
                      <TableRow key={userData.id}>
                        <TableCell>{userData.profile?.name || "Not set"}</TableCell>
                        <TableCell>{userData.email}</TableCell>
                        <TableCell>{userData.profile?.role || "user"}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline"
                            onClick={() => openProposalDialog(userData)}
                          >
                            Send Proposal
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Send Proposal</DialogTitle>
            <DialogDescription>
              Create a payment proposal for {selectedUser?.profile?.name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Proposal Title</Label>
              <Input
                id="title"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                placeholder="Enter proposal title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
                placeholder="Describe your proposal..."
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment_link">Payment Link</Label>
              <Input
                id="payment_link"
                value={paymentLink}
                onChange={(e) => setPaymentLink(e.target.value)}
                placeholder="https://example.com/payment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendProposal}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Proposal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

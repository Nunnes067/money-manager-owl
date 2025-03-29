
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AddTransaction from "./pages/AddTransaction";
import Reports from "./pages/Reports";
import Accounts from "./pages/Accounts";
import Settings from "./pages/Settings";
import Planning from "./pages/Planning";
import EditTransaction from "./pages/EditTransaction";
import AddAccount from "./pages/AddAccount";

// Create a client with specific configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/add-transaction" element={<AddTransaction />} />
              <Route path="/edit-transaction/:id" element={<EditTransaction />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/add-account" element={<AddAccount />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/planning" element={<Planning />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;

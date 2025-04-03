
import React from 'react';
import { cn } from '@/lib/utils';
import { Wallet, PieChart, Settings, Plus, DollarSign, CreditCard, BarChart4, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation, NavigateFunction } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserMenuDropdown } from './UserMenuDropdown';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, path, active, onClick }: NavItemProps) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 px-3 py-6 text-sm font-medium",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
      onClick={onClick}
    >
      <div className="w-4 h-4">{icon}</div>
      <span>{label}</span>
    </Button>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();
  
  // Use try-catch to handle the case when not inside a Router context
  let navigate: NavigateFunction | ((to: string) => void);
  let currentPath = '/';
  
  try {
    navigate = useNavigate();
    currentPath = useLocation().pathname;
  } catch (error) {
    console.warn('Router context not available:', error);
    // Fornecer uma função de navegação alternativa que usa window.location
    navigate = (to: any) => {
      window.location.href = to as string;
    };
  }

  const navItems = [
    { icon: <DollarSign className="h-4 w-4" />, label: "Transações", path: "/" },
    { icon: <CreditCard className="h-4 w-4" />, label: "Contas", path: "/accounts" },
    { icon: <BarChart4 className="h-4 w-4" />, label: "Relatórios", path: "/reports" },
    { icon: <Calendar className="h-4 w-4" />, label: "Planejamento", path: "/planning" },
    { icon: <Settings className="h-4 w-4" />, label: "Configurações", path: "/settings" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for larger screens */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card p-4">
        <div className="flex items-center gap-2 py-4">
          <Wallet className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Money Manager</h1>
        </div>
        <div className="flex flex-col mt-4 space-y-1">
          {navItems.map((item, index) => (
            <NavItem
              key={index}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={currentPath === item.path}
              onClick={() => handleNavigation(item.path)}
            />
          ))}
        </div>
        <div className="mt-auto pt-4">
          <Button className="w-full gap-2" onClick={() => handleNavigation("/add-transaction")}>
            <Plus className="h-4 w-4" />
            Nova transação
          </Button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-10 flex md:hidden justify-around items-center h-16 bg-card border-t">
        {navItems.map((item, index) => (
          <button 
            key={index}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full",
              currentPath === item.path ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => handleNavigation(item.path)}
          >
            <div className="w-5 h-5">{item.icon}</div>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
        <button
          className="flex flex-col items-center justify-center flex-1 h-full text-primary"
          onClick={() => handleNavigation("/add-transaction")}
        >
          <div className="w-5 h-5"><Plus /></div>
          <span className="text-xs mt-1">Adicionar</span>
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header with user menu */}
        <header className="border-b p-4 flex justify-end items-center">
          <UserMenuDropdown />
        </header>
        <div className="flex-1 overflow-auto p-4 pb-20 md:pb-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

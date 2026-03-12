import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  ClipboardCheck,
  LayoutDashboard,
  FileText,
  ListTodo,
  Database,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, isAdmin, kontraktorName, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Form Kartu Kerja',
      href: '/dashboard/form-kartu-kerja',
      icon: FileText,
    },
    {
      label: 'Daftar Pekerjaan',
      href: '/dashboard/daftar-pekerjaan',
      icon: ListTodo,
    },
    {
      label: 'Pengaturan',
      href: '/dashboard/pengaturan',
      icon: Settings,
    },
  ];

  const adminNavItems = [
    {
      label: 'Data Master',
      href: '/dashboard/data-master',
      icon: Database,
    },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg gradient-secondary">
                <ClipboardCheck className="w-4 h-4 text-secondary-foreground" />
              </div>
              <span className="font-bold text-foreground">Kartu Kerja</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover z-50">
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:translate-x-0 lg:static",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
            {/* Logo */}
            <div className="p-6 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl gradient-secondary shadow-glow">
                  <ClipboardCheck className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold text-sidebar-foreground">Kartu Kerja</h1>
                  <p className="text-xs text-sidebar-foreground/60">
                    {isAdmin ? 'Administrator' : 'Kontraktor'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive(item.href)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              {isAdmin && (
                <>
                  <div className="pt-4 pb-2">
                    <p className="px-4 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">
                      Admin
                    </p>
                  </div>
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                        isActive(item.href)
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </>
              )}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-sidebar-border">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {kontraktorName || user?.email}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full mt-3 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

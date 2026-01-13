import { Link, useLocation } from 'react-router-dom';
import { 
  CalendarDays, 
  Building2, 
  ClipboardList, 
  Settings, 
  LogOut,
  LayoutDashboard,
  History
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const publicNavItems = [
  { icon: Building2, label: 'Salas', href: '/' },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Building2, label: 'Salas', href: '/' },
  { icon: ClipboardList, label: 'Solicitudes', href: '/admin/bookings' },
  { icon: History, label: 'Historial', href: '/admin/history' },
  { icon: Settings, label: 'Configuración', href: '/admin/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const { isAdmin, setIsAdmin } = useApp();

  const navItems = isAdmin ? adminNavItems : publicNavItems;

  const handleLogout = () => {
    setIsAdmin(false);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <CalendarDays className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Reserva de Salas</h1>
            <p className="text-xs text-sidebar-foreground/70">Sistema Interno</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <LogOut className="h-5 w-5" />
              Cerrar sesión
            </button>
          ) : (
            <Link
              to="/admin/login"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <Settings className="h-5 w-5" />
              Acceso Admin
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

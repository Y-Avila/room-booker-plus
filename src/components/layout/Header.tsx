import { User, Shield } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { isAdmin } = useApp();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-6 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-3">
        <Badge 
          variant={isAdmin ? 'default' : 'secondary'}
          className="flex items-center gap-1.5 px-3 py-1"
        >
          {isAdmin ? (
            <>
              <Shield className="h-3.5 w-3.5" />
              Administrador
            </>
          ) : (
            <>
              <User className="h-3.5 w-3.5" />
              Invitado
            </>
          )}
        </Badge>
      </div>
    </header>
  );
}

import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useEffect, useState } from 'react';

export function ProtectedRoute() {
  const { isAdmin } = useApp();
  const [isChecking, setIsChecking] = useState(true);

  // Verificar token en localStorage al cargar (para evitar estado inicial incorrecto)
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // El token existe, dejamos que isAdmin del contexto maneje el estado
    }
    setIsChecking(false);
  }, []);

  // Si estamos verificando, no redirigimos aún
  if (isChecking) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

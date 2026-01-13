import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Database, Mail, Shield, Bell } from 'lucide-react';

export default function AdminSettings() {
  return (
    <Layout title="Configuración" subtitle="Ajustes del sistema">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Base de Datos
            </CardTitle>
            <CardDescription>
              Gestión de datos y respaldos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              La persistencia de datos requiere conexión a un backend. Actualmente los datos se almacenan en memoria.
            </p>
            <Button variant="outline" disabled>
              Configurar Backend
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notificaciones Email
            </CardTitle>
            <CardDescription>
              Configuración de correos automáticos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Las notificaciones por correo requieren integración con un servicio de email.
            </p>
            <Button variant="outline" disabled>
              Configurar Email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad
            </CardTitle>
            <CardDescription>
              Gestión de accesos y permisos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Próximamente: Gestión de múltiples administradores y políticas de seguridad.
            </p>
            <Button variant="outline" disabled>
              Gestionar Accesos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Preferencias
            </CardTitle>
            <CardDescription>
              Personalización del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Próximamente: Personalización de horarios, colores institucionales y más.
            </p>
            <Button variant="outline" disabled>
              Personalizar
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-4 p-6">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-semibold">¿Necesitas más funcionalidades?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Para habilitar persistencia de datos, autenticación real y notificaciones por correo, 
              es necesario conectar un backend. Esto permitirá que los datos se guarden de forma permanente 
              y que el sistema envíe correos automáticos.
            </p>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}

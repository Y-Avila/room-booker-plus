import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Building2,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { BookingCard } from '@/components/admin/BookingCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStats, useBookings, useRooms } from '@/hooks/useApi';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useBookings();
  const { data: rooms } = useRooms();

  const statsData = useMemo(() => {
    if (!stats) {
      return { pending: 0, approved: 0, activeRooms: 0, total: 0 };
    }
    
    const pending = stats.summary.pending;
    const approved = stats.summary.approved;
    const activeRooms = rooms?.filter((r) => !r.isBlocked).length || 0;
    const total = stats.summary.total;

    return { pending, approved, activeRooms, total };
  }, [stats, rooms]);

  const pendingBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings
      .filter((b) => b.status === 'pending')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, 5);
  }, [bookings]);

  const statCards = [
    {
      title: 'Pendientes',
      value: statsData.pending,
      icon: Clock,
      description: 'Solicitudes por revisar',
      color: 'text-status-pending',
      bgColor: 'bg-status-pending-bg',
    },
    {
      title: 'Aprobadas',
      value: statsData.approved,
      icon: CheckCircle2,
      description: 'Reservas activas',
      color: 'text-status-available',
      bgColor: 'bg-status-available-bg',
    },
    {
      title: 'Salas Activas',
      value: statsData.activeRooms,
      icon: Building2,
      description: rooms ? `de ${rooms.length} salas` : 'Cargando...',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Reservas',
      value: statsData.total,
      icon: Calendar,
      description: 'En el sistema',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
  ];

  const isLoading = statsLoading || bookingsLoading;

  return (
    <Layout title="Dashboard" subtitle="Panel de administración">
      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="animate-slide-up">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-3xl font-bold">
                    {isLoading ? '-' : stat.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
                </div>
                <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Solicitudes Pendientes
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link to="/admin/bookings">
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-24 bg-muted rounded-lg" />
              ))}
            </div>
          ) : pendingBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="mb-3 h-12 w-12 text-status-available" />
              <p className="font-medium">No hay solicitudes pendientes</p>
              <p className="text-sm text-muted-foreground">
                Todas las solicitudes han sido procesadas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking}
                  onRefresh={() => refetchBookings()}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}

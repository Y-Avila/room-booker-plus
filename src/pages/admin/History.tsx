import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { History, CheckCircle2, XCircle, Ban, Clock, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminHistory() {
  const { bookings, getRoomById } = useApp();

  const sortedBookings = useMemo(() => {
    return [...bookings].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [bookings]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-status-available" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-status-rejected" />;
      case 'cancelled':
        return <Ban className="h-4 w-4 text-status-blocked" />;
      default:
        return <Clock className="h-4 w-4 text-status-pending" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'status-available';
      case 'rejected':
        return 'status-rejected';
      case 'cancelled':
        return 'status-blocked';
      default:
        return 'status-pending';
    }
  };

  return (
    <Layout title="Historial" subtitle="Registro completo de todas las reservas">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Reservas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />

            <div className="space-y-6">
              {sortedBookings.map((booking) => {
                const room = getRoomById(booking.roomId);
                // Formatear fecha de manera segura
                const formatDateSafely = (dateString: string | null | undefined): string => {
                  if (!dateString || !dateString.trim()) {
                    return 'Fecha no disponible';
                  }
                  try {
                    const date = new Date(dateString + 'T00:00:00');
                    if (isNaN(date.getTime())) {
                      return 'Fecha no disponible';
                    }
                    return format(date, "d 'de' MMMM, yyyy", { locale: es });
                  } catch {
                    return 'Fecha no disponible';
                  }
                };
                const formattedDate = formatDateSafely(booking.date);

                return (
                  <div key={booking.id} className="relative flex gap-4 pl-10 animate-slide-up">
                    {/* Timeline dot */}
                    <div className="absolute left-2 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-card border-2 border-border">
                      {getStatusIcon(booking.status)}
                    </div>

                    <div className="flex-1 rounded-lg border bg-card p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium">{booking.fullName}</h4>
                          <p className="text-sm text-muted-foreground">{booking.area}</p>
                        </div>
                        <Badge className={cn('status-badge', getStatusClass(booking.status))}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>{room?.name || 'Sala eliminada'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formattedDate} • {booking.startTime} - {booking.endTime}</span>
                        </div>
                      </div>

                      <p className="mt-2 text-sm">{booking.reason}</p>

                      {/* Audit info */}
                      <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                        <p>
                          Creada: {format(new Date(booking.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                        </p>
                        {booking.approvedBy && (
                          <p>
                            Aprobada por: {booking.approvedBy} •{' '}
                            {format(new Date(booking.approvedAt!), "d MMM yyyy, HH:mm", { locale: es })}
                          </p>
                        )}
                        {booking.rejectedBy && (
                          <p>
                            Rechazada por: {booking.rejectedBy} •{' '}
                            {format(new Date(booking.rejectedAt!), "d MMM yyyy, HH:mm", { locale: es })}
                            {booking.rejectionReason && ` • Motivo: ${booking.rejectionReason}`}
                          </p>
                        )}
                        {booking.cancelledBy && (
                          <p>
                            Cancelada por: {booking.cancelledBy} •{' '}
                            {format(new Date(booking.cancelledAt!), "d MMM yyyy, HH:mm", { locale: es })}
                            {booking.cancellationReason && ` • Motivo: ${booking.cancellationReason}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}

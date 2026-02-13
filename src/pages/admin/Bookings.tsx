import { useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { BookingCard } from '@/components/admin/BookingCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBookings } from '@/hooks/useApi';
import { BookingStatus } from '@/types';
import { ClipboardList, Clock, CheckCircle2, XCircle, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminBookings() {
  const { data: bookings, isLoading, refetch } = useBookings();
  const [activeTab, setActiveTab] = useState<BookingStatus | 'all'>('pending');
  const { toast } = useToast();

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (activeTab === 'all') return bookings;
    return bookings.filter((b) => b.status === activeTab);
  }, [bookings, activeTab]);

  const counts = useMemo(() => {
    if (!bookings) {
      return { all: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 };
    }
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      approved: bookings.filter((b) => b.status === 'approved').length,
      rejected: bookings.filter((b) => b.status === 'rejected').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    };
  }, [bookings]);

  return (
    <Layout title="Gestión de Reservas" subtitle="Administra todas las solicitudes de reserva">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Solicitudes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BookingStatus | 'all')}>
            <TabsList className="mb-6 grid w-full grid-cols-5">
              <TabsTrigger value="pending" className="gap-1.5">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Pendientes</span>
                <span className="ml-1 rounded-full bg-status-pending-bg px-2 py-0.5 text-xs text-status-pending">
                  {counts.pending}
                </span>
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Aprobadas</span>
                <span className="ml-1 rounded-full bg-status-available-bg px-2 py-0.5 text-xs text-status-available">
                  {counts.approved}
                </span>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-1.5">
                <XCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Rechazadas</span>
                <span className="ml-1 rounded-full bg-status-rejected-bg px-2 py-0.5 text-xs text-status-rejected">
                  {counts.rejected}
                </span>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="gap-1.5">
                <Ban className="h-4 w-4" />
                <span className="hidden sm:inline">Canceladas</span>
                <span className="ml-1 rounded-full bg-status-blocked-bg px-2 py-0.5 text-xs text-status-blocked">
                  {counts.cancelled}
                </span>
              </TabsTrigger>
              <TabsTrigger value="all">
                Todas ({counts.all})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse h-32 bg-muted rounded-lg" />
                  ))}
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ClipboardList className="mb-3 h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium text-muted-foreground">No hay reservas en esta categoría</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking}
                      onRefresh={() => refetch()}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </Layout>
  );
}

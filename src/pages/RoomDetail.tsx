import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, Monitor, Clock, Info } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar';
import { BookingForm } from '@/components/booking/BookingForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useRoom, useCalendar } from '@/hooks/useApi';
import type { Room } from '@/types';

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: room, isLoading, error } = useRoom(id || '');
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formOpen, setFormOpen] = useState(false);
  const [weekStart, setWeekStart] = useState<string>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  });

  // Get calendar data when room or week changes
  const { data: calendarData } = useCalendar(id || '', weekStart);

  if (isLoading) {
    return (
      <Layout title="Cargando...">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </Layout>
    );
  }

  if (error || !room) {
    return (
      <Layout title="Sala no encontrada">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-muted-foreground">
            {error ? `Error: ${error.message}` : 'La sala solicitada no existe.'}
          </p>
          <Button asChild>
            <Link to="/">Volver a salas</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setFormOpen(true);
  };

  const handlePreviousWeek = () => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() - 7);
    setWeekStart(date.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + 7);
    setWeekStart(date.toISOString().split('T')[0]);
  };

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const availableDayNames = room.availableDays.map((d) => dayNames[d]).join(', ');

  return (
    <Layout title={room.name} subtitle={room.location}>
      <div className="mb-6">
        <Button variant="ghost" asChild className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Volver a salas
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Room Info */}
        <div className="space-y-4">
          <Card>
            <div className="aspect-video overflow-hidden rounded-t-lg bg-muted">
              <img
                src={room.imageUrl || '/placeholder.svg'}
                alt={room.name}
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>Capacidad: {room.capacity} personas</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{room.location}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>{room.availableStartTime} - {room.availableEndTime}</span>
                </div>

                <div className="flex items-start gap-2">
                  <Monitor className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex flex-wrap gap-1.5">
                    {room.equipment.map((item) => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-2 text-sm">
              <p>
                <span className="font-medium">Días disponibles:</span> {availableDayNames}
              </p>
              {room.observations && (
                <p className="text-muted-foreground">{room.observations}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm text-primary">
                <strong>Tip:</strong> Haz clic en un espacio libre (verde) en el calendario para solicitar una reserva.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <Button variant="outline" onClick={handlePreviousWeek}>
              Semana anterior
            </Button>
            <span className="font-medium">
              {new Date(weekStart).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long' 
              })}
            </span>
            <Button variant="outline" onClick={handleNextWeek}>
              Semana siguiente
            </Button>
          </div>
          
          <WeeklyCalendar 
            room={room as Room} 
            calendarData={calendarData as any}
            onSlotSelect={handleSlotSelect} 
          />
        </div>
      </div>

      {/* Booking Form Dialog */}
      <BookingForm
        room={room as Room}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </Layout>
  );
}

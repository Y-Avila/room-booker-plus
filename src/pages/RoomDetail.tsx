import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, Monitor, Clock, Info } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar';
import { BookingForm } from '@/components/booking/BookingForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const { getRoomById } = useApp();
  const room = getRoomById(id || '');
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formOpen, setFormOpen] = useState(false);

  if (!room) {
    return (
      <Layout title="Sala no encontrada">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-muted-foreground">La sala solicitada no existe.</p>
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
            <div className="aspect-video overflow-hidden rounded-t-lg">
              <img
                src={room.image}
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
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4" />
                Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
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
          <WeeklyCalendar room={room} onSlotSelect={handleSlotSelect} />
        </div>
      </div>

      {/* Booking Form Dialog */}
      <BookingForm
        room={room}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </Layout>
  );
}

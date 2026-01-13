import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CalendarDays, 
  Clock, 
  User, 
  Building2, 
  Mail, 
  Phone,
  Check,
  X,
  Ban,
  FileText
} from 'lucide-react';
import { Booking, Room } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BookingCardProps {
  booking: Booking;
  room?: Room;
  showActions?: boolean;
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    className: 'status-pending',
  },
  approved: {
    label: 'Aprobada',
    className: 'status-available',
  },
  rejected: {
    label: 'Rechazada',
    className: 'status-rejected',
  },
  cancelled: {
    label: 'Cancelada',
    className: 'status-blocked',
  },
};

export function BookingCard({ booking, room, showActions = true }: BookingCardProps) {
  const { updateBookingStatus, getRoomById } = useApp();
  const { toast } = useToast();
  const [rejectDialog, setRejectDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [reason, setReason] = useState('');
  
  const bookingRoom = room || getRoomById(booking.roomId);
  const config = statusConfig[booking.status];

  const handleApprove = () => {
    updateBookingStatus(booking.id, 'approved', 'admin@empresa.com');
    toast({
      title: 'Reserva aprobada',
      description: `La reserva de ${booking.fullName} ha sido aprobada.`,
    });
  };

  const handleReject = () => {
    updateBookingStatus(booking.id, 'rejected', 'admin@empresa.com', reason);
    setRejectDialog(false);
    setReason('');
    toast({
      title: 'Reserva rechazada',
      description: `La reserva de ${booking.fullName} ha sido rechazada.`,
    });
  };

  const handleCancel = () => {
    updateBookingStatus(booking.id, 'cancelled', 'admin@empresa.com', reason);
    setCancelDialog(false);
    setReason('');
    toast({
      title: 'Reserva cancelada',
      description: `La reserva de ${booking.fullName} ha sido cancelada.`,
    });
  };

  const formattedDate = format(new Date(booking.date + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es });

  return (
    <>
      <Card className="overflow-hidden animate-slide-up">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">{booking.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{booking.area}</p>
                </div>
                <Badge className={cn('status-badge', config.className)}>
                  {config.label}
                </Badge>
              </div>

              {/* Details */}
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{bookingRoom?.name || 'Sala no encontrada'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span className="capitalize">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{booking.startTime} - {booking.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{booking.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{booking.phone}</span>
                </div>
              </div>

              {/* Reason */}
              <div className="flex items-start gap-2 rounded-lg bg-muted p-3">
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <p className="text-sm">{booking.reason}</p>
              </div>

              {booking.observations && (
                <p className="text-sm text-muted-foreground italic">
                  Obs: {booking.observations}
                </p>
              )}
            </div>

            {/* Actions */}
            {showActions && booking.status === 'pending' && (
              <div className="flex gap-2 sm:flex-col">
                <Button size="sm" onClick={handleApprove} className="gap-1.5">
                  <Check className="h-4 w-4" />
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRejectDialog(true)}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                  Rechazar
                </Button>
              </div>
            )}

            {showActions && booking.status === 'approved' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCancelDialog(true)}
                className="gap-1.5"
              >
                <Ban className="h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Reserva</DialogTitle>
            <DialogDescription>
              Indica el motivo del rechazo. Se notificará al solicitante.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Motivo del rechazo</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Conflicto de horario con otra reserva prioritaria..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>
              Indica el motivo de la cancelación. Se notificará al solicitante.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Motivo de la cancelación</Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: La sala requiere mantenimiento urgente..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>
              Volver
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Confirmar Cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { Room, BookingFormData } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const bookingSchema = z.object({
  fullName: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  area: z.string().min(2, 'Área es requerida'),
  email: z.string().email('Correo electrónico inválido'),
  phone: z.string().min(8, 'Teléfono debe tener al menos 8 caracteres'),
  reason: z.string().min(10, 'Motivo debe tener al menos 10 caracteres'),
  observations: z.string().optional(),
  endTime: z.string().min(1, 'Hora de fin es requerida'),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  room: Room;
  selectedDate: string;
  selectedTime: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const END_TIME_OPTIONS = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00',
  '19:30', '20:00'
];

export function BookingForm({ room, selectedDate, selectedTime, open, onOpenChange }: BookingFormProps) {
  const { addBooking } = useApp();
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      endTime: '',
    },
  });
  
  const endTime = watch('endTime');
  
  const availableEndTimes = END_TIME_OPTIONS.filter((time) => time > selectedTime);

  const onSubmit = async (data: BookingFormValues) => {
    const bookingData: BookingFormData = {
      roomId: room.id,
      fullName: data.fullName,
      area: data.area,
      email: data.email,
      phone: data.phone,
      reason: data.reason,
      date: selectedDate,
      startTime: selectedTime,
      endTime: data.endTime,
      observations: data.observations,
    };
    
    addBooking(bookingData);
    setIsSuccess(true);
    
    toast({
      title: 'Solicitud enviada',
      description: 'Tu solicitud de reserva ha sido enviada correctamente.',
    });
    
    setTimeout(() => {
      setIsSuccess(false);
      reset();
      onOpenChange(false);
    }, 2000);
  };

  const handleClose = () => {
    setIsSuccess(false);
    reset();
    onOpenChange(false);
  };

  const formattedDate = selectedDate 
    ? format(new Date(selectedDate + 'T00:00:00'), "EEEE d 'de' MMMM, yyyy", { locale: es })
    : '';

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-status-available-bg">
              <CheckCircle2 className="h-8 w-8 text-status-available" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">¡Solicitud Enviada!</h3>
            <p className="text-muted-foreground">
              Tu solicitud ha sido recibida. Recibirás un correo cuando sea procesada.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar Reserva</DialogTitle>
          <DialogDescription>
            Completa el formulario para solicitar la reserva de {room.name}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 rounded-lg bg-muted p-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{selectedTime}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo *</Label>
              <Input
                id="fullName"
                placeholder="Juan Pérez"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área / Departamento *</Label>
              <Input
                id="area"
                placeholder="Recursos Humanos"
                {...register('area')}
              />
              {errors.area && (
                <p className="text-xs text-destructive">{errors.area.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan.perez@empresa.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                placeholder="+56 9 1234 5678"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">Hora de finalización *</Label>
            <Select value={endTime} onValueChange={(value) => setValue('endTime', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona hora de fin" />
              </SelectTrigger>
              <SelectContent>
                {availableEndTimes.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.endTime && (
              <p className="text-xs text-destructive">{errors.endTime.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo de la reunión *</Label>
            <Textarea
              id="reason"
              placeholder="Describe brevemente el propósito de la reunión..."
              rows={3}
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-xs text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones (opcional)</Label>
            <Textarea
              id="observations"
              placeholder="Requerimientos especiales, equipamiento adicional, etc."
              rows={2}
              {...register('observations')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useMemo, useState } from 'react';
import { format, addDays, startOfWeek, isSameDay, isToday, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Room, Booking, SlotStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';

interface WeeklyCalendarProps {
  room: Room;
  onSlotSelect?: (date: string, time: string) => void;
}

const TIME_SLOTS = generateTimeSlots('07:00', '20:00', 30);

function generateTimeSlots(start: string, end: string, intervalMinutes: number): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMin = startMin;
  
  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`);
    currentMin += intervalMinutes;
    if (currentMin >= 60) {
      currentHour += 1;
      currentMin = 0;
    }
  }
  
  return slots;
}

function getSlotStatus(
  time: string,
  date: Date,
  bookings: Booking[],
  room: Room
): { status: SlotStatus; duration?: number } {
  const dayOfWeek = date.getDay();
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Check if room is blocked
  if (room.isBlocked) {
    return { status: 'blocked' };
  }
  
  // Check if day is available
  if (!room.availableDays.includes(dayOfWeek)) {
    return { status: 'blocked' };
  }
  
  // Check if time is within room hours
  if (time < room.availableStartTime || time >= room.availableEndTime) {
    return { status: 'blocked' };
  }
  
  // Check if slot is in the past
  const now = new Date();
  const slotDate = new Date(`${dateStr}T${time}:00`);
  if (isBefore(slotDate, now)) {
    return { status: 'blocked' };
  }
  
  // Check bookings
  for (const booking of bookings) {
    if (booking.date === dateStr && booking.startTime <= time && booking.endTime > time) {
      if (booking.status === 'approved') {
        // Calculate duration for display
        const [startH, startM] = booking.startTime.split(':').map(Number);
        const [endH, endM] = booking.endTime.split(':').map(Number);
        const duration = (endH * 60 + endM) - (startH * 60 + startM);
        return { status: 'occupied', duration };
      } else if (booking.status === 'pending') {
        return { status: 'pending' };
      }
    }
  }
  
  return { status: 'available' };
}

export function WeeklyCalendar({ room, onSlotSelect }: WeeklyCalendarProps) {
  const { getBookingsForRoom } = useApp();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);
  
  const bookings = useMemo(() => {
    const allBookings: Booking[] = [];
    weekDays.forEach((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      allBookings.push(...getBookingsForRoom(room.id, dateStr));
    });
    return allBookings;
  }, [weekDays, room.id, getBookingsForRoom]);
  
  const handlePrevWeek = () => {
    setWeekStart((prev) => addDays(prev, -7));
  };
  
  const handleNextWeek = () => {
    setWeekStart((prev) => addDays(prev, 7));
  };
  
  const handleSlotClick = (date: Date, time: string) => {
    const { status } = getSlotStatus(time, date, bookings, room);
    if (status === 'available' && onSlotSelect) {
      onSlotSelect(format(date, 'yyyy-MM-dd'), time);
    }
  };

  return (
    <div className="rounded-xl border bg-card shadow-card animate-fade-in">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-base font-semibold">
          {format(weekStart, "MMMM yyyy", { locale: es })}
        </h3>
        <Button variant="ghost" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 border-b px-4 py-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-status-available" />
          <span>Libre</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-status-occupied" />
          <span>Ocupada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-status-pending" />
          <span>Pendiente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-status-blocked" />
          <span>No disponible</span>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b">
            <div className="p-2" />
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  'p-2 text-center border-l',
                  isToday(day) && 'bg-primary/5'
                )}
              >
                <div className="text-xs text-muted-foreground uppercase">
                  {format(day, 'EEE', { locale: es })}
                </div>
                <div className={cn(
                  'text-lg font-semibold',
                  isToday(day) && 'text-primary'
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>
          
          {/* Time Slots */}
          <div className="max-h-[500px] overflow-y-auto">
            {TIME_SLOTS.map((time) => (
              <div key={time} className="grid grid-cols-[80px_repeat(7,1fr)] border-b last:border-b-0">
                <div className="flex items-center justify-end px-2 py-1 text-xs text-muted-foreground">
                  {time}
                </div>
                {weekDays.map((day) => {
                  const { status, duration } = getSlotStatus(time, day, bookings, room);
                  const isClickable = status === 'available';
                  
                  return (
                    <button
                      key={`${day.toISOString()}-${time}`}
                      onClick={() => handleSlotClick(day, time)}
                      disabled={!isClickable}
                      className={cn(
                        'h-8 border-l transition-colors text-xs',
                        status === 'available' && 'bg-status-available-bg hover:bg-status-available/20 cursor-pointer',
                        status === 'occupied' && 'bg-status-occupied-bg cursor-default',
                        status === 'pending' && 'bg-status-pending-bg cursor-default',
                        status === 'blocked' && 'bg-status-blocked-bg cursor-not-allowed',
                        isToday(day) && status === 'available' && 'bg-primary/10 hover:bg-primary/20'
                      )}
                    >
                      {status === 'occupied' && duration && (
                        <span className="text-status-occupied font-medium">{duration}min</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

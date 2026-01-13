import { Link } from 'react-router-dom';
import { Users, MapPin, Monitor, Lock } from 'lucide-react';
import { Room } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <Card className="group overflow-hidden card-hover">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={room.image}
          alt={room.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {room.isBlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
            <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2">
              <Lock className="h-4 w-4 text-status-blocked" />
              <span className="text-sm font-medium">Bloqueada</span>
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground">{room.name}</h3>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {room.capacity}
          </Badge>
        </div>
        
        <div className="mb-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{room.location}</span>
          </div>
          <div className="flex items-start gap-2">
            <Monitor className="h-4 w-4 mt-0.5" />
            <span className="line-clamp-2">{room.equipment.slice(0, 3).join(', ')}</span>
          </div>
        </div>

        {room.isBlocked ? (
          <div className="rounded-lg bg-status-blocked-bg p-3 text-sm text-status-blocked">
            {room.blockReason || 'Sala no disponible'}
          </div>
        ) : (
          <Button asChild className="w-full">
            <Link to={`/room/${room.id}`}>Ver disponibilidad</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCreateRoom, useBlockRoom, useUnblockRoom, useUpdateRoom } from '@/hooks/useApi';
import { useApp } from '@/contexts/AppContext';
import { Room } from '@/types';
import { Settings, Database, Mail, Shield, Bell, Plus, Edit, Lock, Unlock } from 'lucide-react';

export default function AdminSettings() {
  const { rooms } = useApp();
  const { toast } = useToast();
  const createRoomMutation = useCreateRoom();
  const updateRoomMutation = useUpdateRoom();
  const blockRoomMutation = useBlockRoom();
  const unblockRoomMutation = useUnblockRoom();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 10,
    location: '',
    equipment: '',
    observations: '',
    availableStartTime: '08:00',
    availableEndTime: '18:00',
    availableDays: '1,2,3,4,5',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const roomData = {
      name: formData.name,
      capacity: formData.capacity,
      location: formData.location,
      equipment: formData.equipment.split(',').map(e => e.trim()).filter(Boolean),
      observations: formData.observations,
      availableStartTime: formData.availableStartTime,
      availableEndTime: formData.availableEndTime,
      availableDays: formData.availableDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d)),
    };

    try {
      if (editingRoom) {
        await updateRoomMutation.mutateAsync({ id: editingRoom.id, data: roomData });
        toast({ title: 'Sala actualizada', description: 'Los cambios se guardaron correctamente.' });
      } else {
        await createRoomMutation.mutateAsync(roomData as any);
        toast({ title: 'Sala creada', description: 'La nueva sala se agregó correctamente.' });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar la sala.', variant: 'destructive' });
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      equipment: room.equipment.join(', '),
      observations: room.observations || '',
      availableStartTime: room.availableStartTime,
      availableEndTime: room.availableEndTime,
      availableDays: room.availableDays.join(', '),
    });
    setIsDialogOpen(true);
  };

  const handleBlock = async (roomId: string) => {
    const reason = prompt('Motivo del bloqueo:');
    if (reason) {
      try {
        await blockRoomMutation.mutateAsync({ id: roomId, reason });
        toast({ title: 'Sala bloqueada', description: 'La sala no accepting reservas.' });
      } catch {
        toast({ title: 'Error', description: 'No se pudo bloquear la sala.', variant: 'destructive' });
      }
    }
  };

  const handleUnblock = async (roomId: string) => {
    try {
      await unblockRoomMutation.mutateAsync(roomId);
      toast({ title: 'Sala desbloqueada', description: 'La sala accepting reservas nuevamente.' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo desbloquear la sala.', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      capacity: 10,
      location: '',
      equipment: '',
      observations: '',
      availableStartTime: '08:00',
      availableEndTime: '18:00',
      availableDays: '1,2,3,4,5',
    });
  };

  return (
    <Layout title="Configuración" subtitle="Gestión del sistema">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Salas */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Gestión de Salas
              </CardTitle>
              <CardDescription>
                Administra las salas de reuniones del sistema
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Sala
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingRoom ? 'Editar Sala' : 'Nueva Sala'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la sala</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacidad</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipamiento (separado por comas)</Label>
                    <Input
                      id="equipment"
                      value={formData.equipment}
                      onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                      placeholder="Proyector, TV, Videoconferencia..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start">Hora inicio</Label>
                      <Input
                        id="start"
                        type="time"
                        value={formData.availableStartTime}
                        onChange={(e) => setFormData({ ...formData, availableStartTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end">Hora fin</Label>
                      <Input
                        id="end"
                        type="time"
                        value={formData.availableEndTime}
                        onChange={(e) => setFormData({ ...formData, availableEndTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="days">Días disponibles (1=Lun, 7=Dom)</Label>
                    <Input
                      id="days"
                      value={formData.availableDays}
                      onChange={(e) => setFormData({ ...formData, availableDays: e.target.value })}
                      placeholder="1,2,3,4,5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observations">Observaciones</Label>
                    <Input
                      id="observations"
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createRoomMutation.isPending}>
                    {createRoomMutation.isPending ? 'Guardando...' : editingRoom ? 'Actualizar' : 'Crear Sala'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {rooms.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <Card key={room.id} className={room.isBlocked ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{room.name}</h4>
                          <p className="text-sm text-muted-foreground">{room.location}</p>
                          <p className="text-sm mt-1">Capacidad: {room.capacity} personas</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(room as Room)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {room.isBlocked ? (
                            <Button variant="ghost" size="icon" onClick={() => handleUnblock(room.id)}>
                              <Unlock className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" onClick={() => handleBlock(room.id)}>
                              <Lock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {room.isBlocked && (
                        <p className="text-xs text-red-500 mt-2">Bloqueada: {room.blockReason}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No hay salas configuradas.</p>
            )}
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notificaciones Email
            </CardTitle>
            <CardDescription>
              Configuración de correos automáticos (próximamente)
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

        {/* Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad
            </CardTitle>
            <CardDescription>
              Gestión de accesos y permisos (próximamente)
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
      </div>

      <Card className="mt-6 border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-4 p-6">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-semibold">Sistema Backend Conectado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              El backend está funcionando en http://localhost:3000 con base de datos MySQL.
              Los datos se guardan de forma permanente.
            </p>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}

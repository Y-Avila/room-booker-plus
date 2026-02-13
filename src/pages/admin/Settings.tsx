import { useState, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useCreateRoom, useBlockRoom, useUnblockRoom, useUpdateRoom, useDeleteRoom } from '@/hooks/useApi';
import { useApp } from '@/contexts/AppContext';
import { Room } from '@/types';
import { api } from '@/api/client';
import { Settings, Database, Mail, Shield, Bell, Plus, Edit, Lock, Unlock, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';

export default function AdminSettings() {
  const { rooms } = useApp();
  const { toast } = useToast();
  const createRoomMutation = useCreateRoom();
  const updateRoomMutation = useUpdateRoom();
  const blockRoomMutation = useBlockRoom();
  const unblockRoomMutation = useUnblockRoom();
  const deleteRoomMutation = useDeleteRoom();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 10,
    location: '',
    imageUrl: '',
    equipment: '',
    observations: '',
    availableStartTime: '08:00',
    availableEndTime: '18:00',
    availableDays: '1,2,3,4,5',
  });

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      imageUrl: room.imageUrl || '',
      equipment: room.equipment.join(', '),
      observations: room.observations || '',
      availableStartTime: room.availableStartTime,
      availableEndTime: room.availableEndTime,
      availableDays: room.availableDays.join(', '),
    });
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      toast({ title: 'Sala desbloqueada', description: 'La sala aceptando reservas nuevamente.' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo desbloquear la sala.', variant: 'destructive' });
    }
  };

  const handleDelete = async (roomId: string) => {
    try {
      await deleteRoomMutation.mutateAsync(roomId);
      toast({ title: 'Sala eliminada', description: 'La sala ha sido eliminada correctamente.' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar la sala.', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      capacity: 10,
      location: '',
      imageUrl: '',
      equipment: '',
      observations: '',
      availableStartTime: '08:00',
      availableEndTime: '18:00',
      availableDays: '1,2,3,4,5',
    });
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Función para manejar el cambio de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Archivo no válido',
          description: 'Solo se permiten imágenes JPEG, PNG, GIF y WebP.',
          variant: 'destructive',
        });
        return;
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Archivo muy grande',
          description: 'La imagen debe ser menor a 5MB.',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
      
      // Crear previsualización
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para subir imagen al servidor
  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile && !formData.imageUrl) return null;
    
    // Si ya hay una URL en el formulario y no hay nuevo archivo, usar esa
    if (!selectedFile && formData.imageUrl) return formData.imageUrl;
    
    setIsUploading(true);
    try {
      const result = await api.uploadFile(selectedFile!);
      setIsUploading(false);
      return result.url;
    } catch (error) {
      setIsUploading(false);
      toast({
        title: 'Error al subir imagen',
        description: 'No se pudo subir la imagen. Intenta con otra.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Actualizar handleSubmit para subir imagen
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Subir imagen primero si hay una nueva
    const imageUrl = await uploadImage();
    if (selectedFile && !imageUrl) return; // Error al subir
    
    const roomData = {
      name: formData.name,
      capacity: formData.capacity,
      location: formData.location,
      imageUrl: imageUrl || formData.imageUrl,
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
              <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
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
                    <Label htmlFor="image">Imagen de la sala</Label>
                    <div className="space-y-3">
                      {/* Previsualización de imagen */}
                      {imagePreview ? (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                          <img 
                            src={imagePreview} 
                            alt="Previsualización" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setImagePreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : formData.imageUrl ? (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                          <img 
                            src={formData.imageUrl} 
                            alt="Imagen actual" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, imageUrl: '' });
                              setSelectedFile(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                          <ImageIcon className="h-8 w-8 mb-2" />
                          <span className="text-xs">Sin imagen</span>
                        </div>
                      )}
                      
                      {/* Input de archivo */}
                      <div className="flex items-center gap-2">
                        <Input
                          ref={fileInputRef}
                          id="image"
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                          disabled={isUploading}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? 'Subiendo...' : 'Seleccionar imagen'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Formatos permitidos: JPEG, PNG, GIF, WebP. Máximo 5MB.
                      </p>
                    </div>
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
                      <select
                        id="start"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={formData.availableStartTime}
                        onChange={(e) => setFormData({ ...formData, availableStartTime: e.target.value })}
                      >
                        {Array.from({ length: 32 }, (_, i) => {
                          const hour = 6 + Math.floor(i / 2);
                          const minute = (i % 2) * 30;
                          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                          return (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end">Hora fin</Label>
                      <select
                        id="end"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={formData.availableEndTime}
                        onChange={(e) => setFormData({ ...formData, availableEndTime: e.target.value })}
                      >
                        {Array.from({ length: 32 }, (_, i) => {
                          const hour = 6 + Math.floor(i / 2);
                          const minute = (i % 2) * 30;
                          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                          return (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Días disponibles</Label>
                    <div className="grid grid-cols-7 gap-2">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => {
                        const dayNumber = index + 1;
                        const isSelected = formData.availableDays.split(',').map(d => parseInt(d.trim())).includes(dayNumber);
                        return (
                          <label
                            key={day}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                          >
                            <span className="text-xs font-medium">{day}</span>
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={isSelected}
                              onChange={(e) => {
                                const days = formData.availableDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
                                if (e.target.checked) {
                                  days.push(dayNumber);
                                } else {
                                  const idx = days.indexOf(dayNumber);
                                  if (idx > -1) days.splice(idx, 1);
                                }
                                setFormData({ ...formData, availableDays: days.join(',') });
                              }}
                            />
                          </label>
                        );
                      })}
                    </div>
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar sala?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente la sala "{room.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(room.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

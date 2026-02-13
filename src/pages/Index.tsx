import { Layout } from '@/components/layout/Layout';
import { RoomCard } from '@/components/rooms/RoomCard';
import { useRooms } from '@/hooks/useApi';

const Index = () => {
  const { data: rooms, isLoading, error } = useRooms();

  if (isLoading) {
    return (
      <Layout title="Salas de Reuniones" subtitle="Cargando...">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-lg mb-4" />
              <div className="h-6 bg-muted rounded mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Salas de Reuniones">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-red-500 mb-4">Error al cargar las salas: {error.message}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Salas de Reuniones" 
      subtitle="Selecciona una sala para ver su disponibilidad y solicitar una reserva"
    >
      {rooms && rooms.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No hay salas disponibles.</p>
        </div>
      )}
    </Layout>
  );
};

export default Index;

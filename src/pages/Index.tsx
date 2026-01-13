import { Layout } from '@/components/layout/Layout';
import { RoomCard } from '@/components/rooms/RoomCard';
import { useApp } from '@/contexts/AppContext';

const Index = () => {
  const { rooms } = useApp();

  return (
    <Layout 
      title="Salas de Reuniones" 
      subtitle="Selecciona una sala para ver su disponibilidad y solicitar una reserva"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </Layout>
  );
};

export default Index;

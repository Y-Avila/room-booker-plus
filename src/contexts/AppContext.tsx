import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Room, Booking, BookingFormData } from '@/types';
import { useRooms, useBookings, useCreateBooking } from '@/hooks/useApi';

interface AppContextType {
  rooms: Room[];
  bookings: Booking[];
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  addBooking: (data: BookingFormData) => Promise<Booking>;
  updateBookingStatus: (
    bookingId: string,
    status: 'approved' | 'rejected' | 'cancelled',
    adminEmail: string,
    reason?: string
  ) => Promise<void>;
  getBookingsForRoom: (roomId: string, date: string) => Booking[];
  getRoomById: (id: string) => Room | undefined;
  refetch: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Usar datos de la API
  const { data: rooms = [], refetch: refetchRooms } = useRooms();
  const { data: bookings = [], refetch: refetchBookings } = useBookings();
  const createBookingMutation = useCreateBooking();
  
  const [isAdmin, setIsAdmin] = useState(false);

  // Sincronizar isAdmin con localStorage al cargar
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAdmin(true);
    }
  }, []);

  const addBooking = async (data: BookingFormData): Promise<Booking> => {
    const result = await createBookingMutation.mutateAsync(data);
    refetchBookings();
    return result;
  };

  const updateBookingStatus = async (
    bookingId: string,
    status: 'approved' | 'rejected' | 'cancelled',
    adminEmail: string,
    reason?: string
  ): Promise<void> => {
    // Esta función será proporcionada por los hooks de mutations
    console.log('updateBookingStatus llamado:', { bookingId, status, adminEmail, reason });
    refetchBookings();
  };

  const getBookingsForRoom = (roomId: string, date: string): Booking[] => {
    return bookings.filter(
      (b) => b.roomId === roomId && b.date === date && b.status !== 'rejected' && b.status !== 'cancelled'
    );
  };

  const getRoomById = (id: string): Room | undefined => {
    return rooms.find((r) => r.id === id);
  };

  const refetch = () => {
    refetchRooms();
    refetchBookings();
  };

  return (
    <AppContext.Provider
      value={{
        rooms,
        bookings,
        isAdmin,
        setIsAdmin,
        addBooking,
        updateBookingStatus,
        getBookingsForRoom,
        getRoomById,
        refetch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

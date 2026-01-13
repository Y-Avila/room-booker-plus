import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Room, Booking, BookingFormData } from '@/types';
import { mockRooms, mockBookings } from '@/data/mockData';

interface AppContextType {
  rooms: Room[];
  bookings: Booking[];
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  addBooking: (data: BookingFormData) => Booking;
  updateBookingStatus: (
    bookingId: string,
    status: 'approved' | 'rejected' | 'cancelled',
    adminEmail: string,
    reason?: string
  ) => void;
  getBookingsForRoom: (roomId: string, date: string) => Booking[];
  getRoomById: (id: string) => Room | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [rooms] = useState<Room[]>(mockRooms);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [isAdmin, setIsAdmin] = useState(false);

  const addBooking = (data: BookingFormData): Booking => {
    const newBooking: Booking = {
      id: Date.now().toString(),
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBookings((prev) => [...prev, newBooking]);
    return newBooking;
  };

  const updateBookingStatus = (
    bookingId: string,
    status: 'approved' | 'rejected' | 'cancelled',
    adminEmail: string,
    reason?: string
  ) => {
    setBookings((prev) =>
      prev.map((booking) => {
        if (booking.id !== bookingId) return booking;

        const now = new Date().toISOString();
        const updates: Partial<Booking> = {
          status,
          updatedAt: now,
        };

        if (status === 'approved') {
          updates.approvedBy = adminEmail;
          updates.approvedAt = now;
        } else if (status === 'rejected') {
          updates.rejectedBy = adminEmail;
          updates.rejectedAt = now;
          updates.rejectionReason = reason;
        } else if (status === 'cancelled') {
          updates.cancelledBy = adminEmail;
          updates.cancelledAt = now;
          updates.cancellationReason = reason;
        }

        return { ...booking, ...updates };
      })
    );
  };

  const getBookingsForRoom = (roomId: string, date: string): Booking[] => {
    return bookings.filter(
      (b) => b.roomId === roomId && b.date === date && b.status !== 'rejected' && b.status !== 'cancelled'
    );
  };

  const getRoomById = (id: string): Room | undefined => {
    return rooms.find((r) => r.id === id);
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

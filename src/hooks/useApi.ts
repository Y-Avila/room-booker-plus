import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Room, type Booking } from '../api/client';
import type { BookingFormData } from '../types';

// Query Keys
export const queryKeys = {
  rooms: ['rooms'] as const,
  room: (id: string) => ['rooms', id] as const,
  bookings: (filters?: Record<string, string>) => ['bookings', filters] as const,
  booking: (id: string) => ['bookings', id] as const,
  calendar: (roomId: string, weekStart: string) => ['calendar', roomId, weekStart] as const,
  history: (filters?: Record<string, string>) => ['history', filters] as const,
  audit: (bookingId: string) => ['audit', bookingId] as const,
  stats: ['stats'] as const,
};

// Auth
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: { username: string; password: string }) =>
      api.login(credentials.username, credentials.password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => {
      api.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useVerifyAuth = () => {
  return useQuery({
    queryKey: ['auth'],
    queryFn: () => api.verifyToken(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Rooms
export const useRooms = () => {
  return useQuery({
    queryKey: queryKeys.rooms,
    queryFn: () => api.getRooms(),
  });
};

export const useRoom = (id: string) => {
  return useQuery({
    queryKey: queryKeys.room(id),
    queryFn: () => api.getRoom(id),
    enabled: !!id,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Room>) => api.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Room> }) =>
      api.updateRoom(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
      queryClient.invalidateQueries({ queryKey: queryKeys.room(id) });
    },
  });
};

export const useBlockRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.blockRoom(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
      queryClient.invalidateQueries({ queryKey: queryKeys.room(id) });
    },
  });
};

export const useUnblockRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.unblockRoom(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
      queryClient.invalidateQueries({ queryKey: queryKeys.room(id) });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
    },
  });
};

// Bookings
export const useBookings = (filters?: Record<string, string>) => {
  return useQuery({
    queryKey: queryKeys.bookings(filters),
    queryFn: () => api.getBookings(filters),
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: () => api.getBooking(id),
    enabled: !!id,
  });
};

export const useCalendar = (roomId: string, weekStart: string) => {
  return useQuery({
    queryKey: queryKeys.calendar(roomId, weekStart),
    queryFn: () => api.getCalendar(roomId, weekStart),
    enabled: !!roomId && !!weekStart,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BookingFormData) => api.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.history() });
    },
  });
};

export const useApproveBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, approvedBy }: { id: string; approvedBy: string }) =>
      api.approveBooking(id, approvedBy),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.history() });
    },
  });
};

export const useRejectBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      id,
      rejectedBy,
      reason,
    }: {
      id: string;
      rejectedBy: string;
      reason: string;
    }) => api.rejectBooking(id, rejectedBy, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.history() });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, cancelledBy }: { id: string; cancelledBy: string }) =>
      api.cancelBooking(id, cancelledBy),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.history() });
    },
  });
};

// History
export const useHistory = (filters?: Record<string, string>) => {
  return useQuery({
    queryKey: queryKeys.history(filters),
    queryFn: () => api.getHistory(filters),
  });
};

export const useAudit = (bookingId: string) => {
  return useQuery({
    queryKey: queryKeys.audit(bookingId),
    queryFn: () => api.getAudit(bookingId),
    enabled: !!bookingId,
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => api.getStats(),
  });
};

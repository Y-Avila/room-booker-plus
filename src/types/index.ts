export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type SlotStatus = 'available' | 'occupied' | 'pending' | 'blocked';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  equipment: string[];
  image: string;
  observations?: string;
  availableDays: number[]; // 0-6, Sunday-Saturday
  availableStartTime: string; // HH:mm
  availableEndTime: string; // HH:mm
  isBlocked: boolean;
  blockReason?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  fullName: string;
  area: string;
  email: string;
  phone: string;
  reason: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  observations?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface TimeSlot {
  time: string;
  status: SlotStatus;
  bookingId?: string;
  duration?: number; // in minutes, only shown for occupied slots
}

export interface BookingFormData {
  roomId: string;
  fullName: string;
  area: string;
  email: string;
  phone: string;
  reason: string;
  date: string;
  startTime: string;
  endTime: string;
  observations?: string;
}

export interface AuditLog {
  id: string;
  bookingId: string;
  action: 'created' | 'approved' | 'rejected' | 'cancelled';
  performedBy: string;
  performedAt: string;
  details?: string;
}

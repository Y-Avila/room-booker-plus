// API Client Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Import types from the app
import type { Room, Booking, BookingFormData, AuditLog } from '../types';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Convert snake_case to camelCase
  private toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private convertToCamelCase<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertToCamelCase(item)) as T;
    }
    if (typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        const camelKey = this.toCamelCase(key);
        result[camelKey] = value;
      }
      return result as T;
    }
    return obj;
  }

  // Rooms
  async getRooms(): Promise<Room[]> {
    const data = await this.request<Room[]>('/rooms');
    return data.map((room) => this.convertToCamelCase(room));
  }

  async getRoom(id: string): Promise<Room> {
    const data = await this.request<Room>(`/rooms/${id}`);
    return this.convertToCamelCase(data);
  }

  async createRoom(data: Partial<Room>): Promise<Room> {
    const apiData: Record<string, unknown> = {
      name: data.name,
      capacity: data.capacity,
      location: data.location,
      equipment: data.equipment,
      image_url: data.image,
      observations: data.observations,
      available_days: data.availableDays,
      available_start: data.availableStartTime,
      available_end: data.availableEndTime,
    };
    
    const result = await this.request<Room>('/rooms', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
    return this.convertToCamelCase(result);
  }

  async updateRoom(id: string, data: Partial<Room>): Promise<Room> {
    const apiData: Record<string, unknown> = {};
    if (data.name) apiData.name = data.name;
    if (data.capacity) apiData.capacity = data.capacity;
    if (data.location) apiData.location = data.location;
    if (data.equipment) apiData.equipment = data.equipment;
    if (data.image) apiData.image_url = data.image;
    if (data.observations) apiData.observations = data.observations;
    if (data.availableDays) apiData.available_days = data.availableDays;
    if (data.availableStartTime) apiData.available_start = data.availableStartTime;
    if (data.availableEndTime) apiData.available_end = data.availableEndTime;
    
    const result = await this.request<Room>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiData),
    });
    return this.convertToCamelCase(result);
  }

  async blockRoom(id: string, reason: string): Promise<Room> {
    const result = await this.request<Room>(`/rooms/${id}/block`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
    return this.convertToCamelCase(result);
  }

  async unblockRoom(id: string): Promise<Room> {
    const result = await this.request<Room>(`/rooms/${id}/unblock`, {
      method: 'PUT',
    });
    return this.convertToCamelCase(result);
  }

  // Bookings
  async getBookings(filters?: { roomId?: string; status?: string; startDate?: string; endDate?: string }): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (filters?.roomId) params.append('roomId', filters.roomId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const query = params.toString();
    const data = await this.request<Booking[]>(`/bookings${query ? `?${query}` : ''}`);
    return data.map((booking) => this.convertToCamelCase(booking));
  }

  async getCalendar(roomId: string, weekStart: string) {
    return this.request(`/bookings/calendar?roomId=${roomId}&weekStart=${weekStart}`);
  }

  async createBooking(data: BookingFormData): Promise<Booking> {
    const apiData = {
      room_id: data.roomId,
      full_name: data.fullName,
      area: data.area,
      email: data.email,
      phone: data.phone,
      reason: data.reason,
      date: data.date,
      start_time: data.startTime,
      end_time: data.endTime,
      observations: data.observations,
    };
    
    const result = await this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
    return this.convertToCamelCase(result);
  }

  async getBooking(id: string): Promise<Booking> {
    const data = await this.request<Booking>(`/bookings/${id}`);
    return this.convertToCamelCase(data);
  }

  async approveBooking(id: string, approvedBy: string): Promise<Booking> {
    const result = await this.request<Booking>(`/bookings/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approved_by: approvedBy }),
    });
    return this.convertToCamelCase(result);
  }

  async rejectBooking(id: string, rejectedBy: string, reason: string): Promise<Booking> {
    const result = await this.request<Booking>(`/bookings/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejected_by: rejectedBy, rejection_reason: reason }),
    });
    return this.convertToCamelCase(result);
  }

  async cancelBooking(id: string, cancelledBy: string): Promise<Booking> {
    const result = await this.request<Booking>(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancelled_by: cancelledBy }),
    });
    return this.convertToCamelCase(result);
  }

  async cancelBookingByUser(id: string, cancellationToken: string): Promise<Booking> {
    const result = await this.request<Booking>(`/bookings/${id}/cancel-user`, {
      method: 'POST',
      body: JSON.stringify({ cancellation_token: cancellationToken }),
    });
    return this.convertToCamelCase(result);
  }

  // Auth
  async login(username: string, password: string) {
    const response = await this.request<{ token: string; admin: { id: string; username: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async verifyToken() {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const response = await this.request<{ valid: boolean; admin: { id: string; username: string; email: string } }>('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      return response;
    } catch {
      this.setToken(null);
      return null;
    }
  }

  logout() {
    this.setToken(null);
  }

  // History
  async getHistory(filters?: { status?: string; roomId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.roomId) params.append('roomId', filters.roomId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString();
    return this.request<{ data: Booking[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/history${query ? `?${query}` : ''}`);
  }

  async getAudit(bookingId: string): Promise<Booking> {
    const data = await this.request<Booking>(`/audit/${bookingId}`);
    return this.convertToCamelCase(data);
  }

  async getStats() {
    return this.request<{
      summary: { total: number; pending: number; approved: number; rejected: number; cancelled: number };
      byRoom: { roomId: string; roomName: string; count: number }[];
      byMonth: { month: number; count: number }[];
    }>('/audit/stats/summary');
  }
}

// Export singleton instance and types
export const api = new ApiClient();
export type { Room, Booking, AuditLog };

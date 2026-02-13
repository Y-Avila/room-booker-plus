import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';

const router = Router();

// GET /api/bookings - Listar reservas (con filtros)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { roomId, status, startDate, endDate } = req.query;

    const where: any = {};

    if (roomId) where.room_id = roomId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: { room: true },
      orderBy: { created_at: 'desc' },
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/calendar - Calendario por sala/semana
router.get('/calendar', async (req: Request, res: Response) => {
  try {
    const { roomId, weekStart } = req.query;

    if (!roomId || !weekStart) {
      return res.status(400).json({ error: 'roomId and weekStart are required' });
    }

    const startDate = new Date(weekStart as string);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    // Get all bookings for the week
    const bookings = await prisma.booking.findMany({
      where: {
        room_id: roomId as string,
        date: {
          gte: startDate,
          lt: endDate,
        },
        status: {
          in: ['approved', 'pending'],
        },
      },
      orderBy: { start_time: 'asc' },
    });

    // Generate calendar data
    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const slots = [];
      const dayBookings = bookings.filter(
        (b) => b.date.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
      );

      // Generate 30-minute slots from 7:00 to 20:00
      for (let hour = 7; hour <= 20; hour++) {
        for (let min = 0; min < 60; min += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          
          const booking = dayBookings.find((b) => {
            const bookingStart = b.start_time;
            const bookingEnd = b.end_time;
            return time >= bookingStart && time < bookingEnd;
          });

          if (booking) {
            // Find the end of this booking block
            let endTime = booking.end_time;
            const bookingSlots = dayBookings.filter(
              (b) => b.start_time === booking.start_time && b.id !== booking.id
            );
            if (bookingSlots.length > 0) {
              endTime = bookingSlots[0].end_time;
            }

            // Calculate duration in minutes
            const startParts = booking.start_time.split(':');
            const endParts = endTime.split(':');
            const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
            const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
            const duration = endMinutes - startMinutes;

            slots.push({
              time,
              status: 'occupied',
              bookingId: booking.id,
              duration,
              endTime,
              booking,
            });

            // Skip slots until end of booking
            const currentMinutes = hour * 60 + min;
            const endMinutesBooking = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
            if (currentMinutes + 30 > endMinutesBooking) {
              min = endMinutesBooking % 60 - 30;
              if (min < 0) {
                min = 30;
                hour++;
              }
            }
          } else {
            slots.push({
              time,
              status: 'available',
              bookingId: null,
            });
          }
        }
      }

      days.push({
        date: currentDate.toISOString().split('T')[0],
        slots,
      });
    }

    res.json({
      roomId,
      weekStart: weekStart as string,
      days,
    });
  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

// POST /api/bookings - Crear reserva
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      room_id,
      full_name,
      area,
      email,
      phone,
      reason,
      date,
      start_time,
      end_time,
      observations,
    } = req.body;

    // Generate cancellation token
    const cancellation_token = uuidv4();

    const booking = await prisma.booking.create({
      data: {
        room_id,
        full_name,
        area,
        email,
        phone,
        reason,
        date: new Date(date),
        start_time,
        end_time,
        observations,
        cancellation_token,
      },
      include: { room: true },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        booking_id: booking.id,
        action: 'created',
        performed_by: full_name,
        details: JSON.stringify({ email, area }),
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/bookings/:id - Detalle de reserva
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true, audit_logs: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// PUT /api/bookings/:id/approve - Aprobar reserva
router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approved_by } = req.body;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'approved',
        approved_by,
        approved_at: new Date(),
      },
      include: { room: true },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        booking_id: id,
        action: 'approved',
        performed_by: approved_by,
        details: JSON.stringify({ email: booking.email }),
      },
    });

    res.json(booking);
  } catch (error) {
    console.error('Error approving booking:', error);
    res.status(500).json({ error: 'Failed to approve booking' });
  }
});

// PUT /api/bookings/:id/reject - Rechazar reserva
router.put('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejected_by, rejection_reason } = req.body;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'rejected',
        rejected_by,
        rejected_at: new Date(),
        rejection_reason,
      },
      include: { room: true },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        booking_id: id,
        action: 'rejected',
        performed_by: rejected_by,
        details: JSON.stringify({ email: booking.email, reason: rejection_reason }),
      },
    });

    res.json(booking);
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ error: 'Failed to reject booking' });
  }
});

// PUT /api/bookings/:id/cancel - Cancelar reserva (admin)
router.put('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cancelled_by } = req.body;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled',
      },
      include: { room: true },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        booking_id: id,
        action: 'cancelled',
        performed_by: cancelled_by,
        details: JSON.stringify({ email: booking.email }),
      },
    });

    res.json(booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// POST /api/bookings/:id/cancel-user - Cancelar reserva (usuario)
router.post('/:id/cancel-user', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cancellation_token } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { id, cancellation_token },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Invalid cancellation token' });
    }

    if (booking.status !== 'pending' && booking.status !== 'approved') {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled',
      },
      include: { room: true },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        booking_id: id,
        action: 'cancelled',
        performed_by: booking.full_name,
        details: JSON.stringify({ email: booking.email, reason: 'User cancellation' }),
      },
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// GET /api/bookings/cancel/:token - Verificar token de cancelación
router.get('/cancel/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const booking = await prisma.booking.findFirst({
      where: { cancellation_token: token },
      include: { room: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Invalid cancellation token' });
    }

    res.json({
      valid: true,
      booking,
    });
  } catch (error) {
    console.error('Error verifying cancellation token:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

export default router;

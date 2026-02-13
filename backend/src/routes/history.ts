import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper function to parse JSON fields
const parseBooking = (booking: any) => ({
  ...booking,
  equipment: booking.equipment ? JSON.parse(booking.equipment) : [],
  available_days: booking.available_days ? JSON.parse(booking.available_days) : [],
});

// GET /api/history - Historial completo de reservas (requiere auth)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status, roomId, startDate, endDate, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) where.status = status;
    if (roomId) where.room_id = roomId;
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate as string);
      if (endDate) where.created_at.lte = new Date(endDate as string);
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: { room: true },
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      data: bookings.map(parseBooking),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/audit/:bookingId - Auditoría de reserva
router.get('/:bookingId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { room: true, audit_logs: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(parseBooking(booking));
  } catch (error) {
    console.error('Error fetching audit:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// GET /api/audit/room/:roomId - Auditoría por sala
router.get('/room/:roomId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { startDate, endDate } = req.query;

    const where: any = {
      room_id: roomId,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: { audit_logs: true },
      orderBy: { created_at: 'desc' },
    });

    res.json(bookings.map(parseBooking));
  } catch (error) {
    console.error('Error fetching room audit:', error);
    res.status(500).json({ error: 'Failed to fetch room audit log' });
  }
});

// GET /api/audit/stats - Estadísticas de uso
router.get('/stats/summary', authMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      cancelledBookings,
      bookingsByRoom,
      bookingsByMonth,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'pending' } }),
      prisma.booking.count({ where: { status: 'approved' } }),
      prisma.booking.count({ where: { status: 'rejected' } }),
      prisma.booking.count({ where: { status: 'cancelled' } }),
      prisma.booking.groupBy({
        by: ['room_id'],
        _count: true,
      }),
      prisma.$queryRaw`
        SELECT 
          MONTH(date) as month,
          COUNT(*) as count
        FROM bookings
        WHERE created_at >= DATEADD(month, -6, GETDATE())
        GROUP BY MONTH(date)
        ORDER BY month
      `,
    ]);

    // Get room names for the grouped data
    const roomIds = bookingsByRoom.map((b) => b.room_id);
    const rooms = await prisma.room.findMany({
      where: { id: { in: roomIds } },
      select: { id: true, name: true },
    });

    const roomMap = new Map(rooms.map((r) => [r.id, r.name]));

    res.json({
      summary: {
        total: totalBookings,
        pending: pendingBookings,
        approved: approvedBookings,
        rejected: rejectedBookings,
        cancelled: cancelledBookings,
      },
      byRoom: bookingsByRoom.map((b) => ({
        roomId: b.room_id,
        roomName: roomMap.get(b.room_id) || 'Unknown',
        count: b._count,
      })),
      byMonth: bookingsByMonth,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;

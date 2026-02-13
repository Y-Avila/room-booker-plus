import { Router, Request, Response } from 'express';
import prisma from '../config/database';

const router = Router();

// Helper function to parse JSON fields
const parseRoom = (room: any) => ({
  ...room,
  equipment: room.equipment ? JSON.parse(room.equipment) : [],
  available_days: room.available_days ? JSON.parse(room.available_days) : [],
});

// GET /api/rooms - Listar todas las salas
router.get('/', async (_req: Request, res: Response) => {
  try {
    // Eliminar el filtro is_blocked para que el admin pueda ver todas las salas
    const rooms = await prisma.room.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(rooms.map(parseRoom));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// GET /api/rooms/:id - Detalle de sala
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const room = await prisma.room.findUnique({
      where: { id },
      include: { bookings: true },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(parseRoom(room));
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// POST /api/rooms - Crear sala
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, capacity, location, equipment, image_url, observations, available_days, available_start, available_end } = req.body;

    const room = await prisma.room.create({
      data: {
        name,
        capacity,
        location,
        equipment: JSON.stringify(equipment),
        image_url,
        observations,
        available_days: JSON.stringify(available_days),
        available_start,
        available_end,
      },
    });

    res.status(201).json(parseRoom(room));
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// PUT /api/rooms/:id - Actualizar sala
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, capacity, location, equipment, image_url, observations, available_days, available_start, available_end } = req.body;

    const room = await prisma.room.update({
      where: { id },
      data: {
        name,
        capacity,
        location,
        equipment: JSON.stringify(equipment),
        image_url,
        observations,
        available_days: JSON.stringify(available_days),
        available_start,
        available_end,
      },
    });

    res.json(parseRoom(room));
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// PUT /api/rooms/:id/block - Bloquear sala
router.put('/:id/block', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const room = await prisma.room.update({
      where: { id },
      data: {
        is_blocked: true,
        block_reason: reason,
      },
    });

    res.json(parseRoom(room));
  } catch (error) {
    console.error('Error blocking room:', error);
    res.status(500).json({ error: 'Failed to block room' });
  }
});

// PUT /api/rooms/:id/unblock - Desbloquear sala
router.put('/:id/unblock', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.update({
      where: { id },
      data: {
        is_blocked: false,
        block_reason: null,
      },
    });

    res.json(parseRoom(room));
  } catch (error) {
    console.error('Error unblocking room:', error);
    res.status(500).json({ error: 'Failed to unblock room' });
  }
});

// DELETE /api/rooms/:id - Eliminar sala
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.room.delete({
      where: { id },
    });

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

export default router;

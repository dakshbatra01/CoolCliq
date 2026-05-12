import { Router } from 'express';
import { PrismaClient } from '@coolcliq/prisma/generated/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validateGps } from '../services/geoService';
import { io } from '../index';
import { SOCKET_EVENTS } from '@coolcliq/shared';

const router = Router();
const prisma = new PrismaClient();

// POST /api/sessions/checkin
router.post('/checkin', authMiddleware, async (req: AuthRequest, res) => {
  const schema = z.object({
    venueId: z.string(),
    tableId: z.string().optional(),
    lat: z.number(),
    lng: z.number(),
  });

  try {
    const { venueId, tableId, lat, lng } = schema.parse(req.body);

    // Check if already checked in somewhere
    const existing = await prisma.session.findFirst({
      where: { userId: req.userId, isActive: true },
    });

    if (existing) {
      // Auto-exit previous session
      await prisma.session.update({
        where: { id: existing.id },
        data: { isActive: false, exitedAt: new Date() },
      });
    }

    // Get venue for GPS validation
    const venue = await prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) return res.status(404).json({ success: false, error: 'Venue not found' });
    if (!venue.isActive) return res.status(400).json({ success: false, error: 'Venue is not active' });

    // GPS Validation (skip in dev if SKIP_GPS_VALIDATION=true)
    if (process.env.SKIP_GPS_VALIDATION !== 'true') {
      const { valid, distanceMeters } = validateGps(lat, lng, venue.lat, venue.lng);
      if (!valid) {
        return res.status(400).json({
          success: false,
          error: `You must be within ${Math.round(distanceMeters)}m of the venue (max 150m)`,
        });
      }
    }

    const session = await prisma.session.create({
      data: {
        userId: req.userId!,
        venueId,
        tableId: tableId || null,
        lat,
        lng,
      },
    });

    // Notify venue room of updated user count
    const activeCount = await prisma.session.count({ where: { venueId, isActive: true } });
    io.to(`venue:${venueId}`).emit(SOCKET_EVENTS.VENUE_USERS_UPDATE, {
      venueId,
      activeCount,
    });

    return res.json({ success: true, data: session });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    console.error(err);
    return res.status(500).json({ success: false, error: 'Check-in failed' });
  }
});

// DELETE /api/sessions/exit  (panic or normal exit)
router.delete('/exit', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const session = await prisma.session.findFirst({
      where: { userId: req.userId, isActive: true },
    });

    if (!session) {
      return res.status(404).json({ success: false, error: 'No active session found' });
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { isActive: false, exitedAt: new Date() },
    });

    // Notify venue room
    const activeCount = await prisma.session.count({
      where: { venueId: session.venueId, isActive: true },
    });
    io.to(`venue:${session.venueId}`).emit(SOCKET_EVENTS.VENUE_USERS_UPDATE, {
      venueId: session.venueId,
      activeCount,
    });

    return res.json({ success: true, message: 'Exited venue successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Exit failed' });
  }
});

// GET /api/sessions/current
router.get('/current', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const session = await prisma.session.findFirst({
      where: { userId: req.userId, isActive: true },
      include: {
        venue: { select: { id: true, name: true, address: true } },
        table: { select: { id: true, label: true } },
      },
    });

    return res.json({ success: true, data: session });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to fetch session' });
  }
});

export default router;

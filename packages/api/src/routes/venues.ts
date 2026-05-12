import { Router } from 'express';
import { PrismaClient } from '@coolcliq/prisma/generated/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { distanceBetweenCoords } from '@coolcliq/shared';

const router = Router();
const prisma = new PrismaClient();

// GET /api/venues/nearby?lat=&lng=&radius=
router.get('/nearby', authMiddleware, async (req: AuthRequest, res) => {
  const schema = z.object({
    lat: z.coerce.number(),
    lng: z.coerce.number(),
    radius: z.coerce.number().default(5000),
  });

  try {
    const { lat, lng, radius } = schema.parse(req.query);

    const venues = await prisma.venue.findMany({
      where: { isActive: true },
      include: {
        sessions: {
          where: { isActive: true },
          select: { id: true, userId: true },
        },
        tables: { select: { id: true, label: true } },
      },
    });

    // Filter by radius and add distance + active count
    const nearby = venues
      .map((v) => ({
        id: v.id,
        name: v.name,
        address: v.address,
        lat: v.lat,
        lng: v.lng,
        category: v.category,
        activeUserCount: v.sessions.length,
        tableCount: v.tables.length,
        distanceMeters: Math.round(distanceBetweenCoords(lat, lng, v.lat, v.lng)),
      }))
      .filter((v) => v.distanceMeters <= radius)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    return res.json({ success: true, data: nearby });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to fetch venues' });
  }
});

// GET /api/venues/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const venue = await prisma.venue.findUnique({
      where: { id: req.params.id },
      include: {
        tables: { select: { id: true, label: true } },
      },
    });

    if (!venue) return res.status(404).json({ success: false, error: 'Venue not found' });

    return res.json({ success: true, data: venue });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to fetch venue' });
  }
});

// GET /api/venues/:id/active-users?gender=
router.get('/:id/active-users', authMiddleware, async (req: AuthRequest, res) => {
  const genderFilter = req.query.gender as string | undefined;

  try {
    const sessions = await prisma.session.findMany({
      where: {
        venueId: req.params.id,
        isActive: true,
        NOT: { userId: req.userId }, // hide self
        ...(genderFilter && genderFilter !== 'ALL'
          ? { user: { gender: genderFilter as any } }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            alias: true,
            avatarSeed: true,
            gender: true,
          },
        },
        table: { select: { label: true } },
      },
      orderBy: { checkedInAt: 'desc' },
    });

    // Anonymize: never return table info here (only after mutual reveal)
    const users = sessions.map((s) => ({
      sessionId: s.id,
      userId: s.user.id,
      alias: s.user.alias,
      avatarSeed: s.user.avatarSeed,
      gender: s.user.gender,
      checkedInAt: s.checkedInAt,
    }));

    return res.json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to fetch active users' });
  }
});

export default router;

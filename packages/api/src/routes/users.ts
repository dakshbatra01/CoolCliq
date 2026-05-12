import { Router } from 'express';
import { PrismaClient } from '@coolcliq/prisma/generated/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/users/me
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        alias: true,
        avatarSeed: true,
        gender: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    return res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// PATCH /api/users/profile
router.patch('/profile', authMiddleware, async (req: AuthRequest, res) => {
  const schema = z.object({
    alias: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
    avatarSeed: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  });

  try {
    const data = schema.parse(req.body);

    // Check alias uniqueness if updating
    if (data.alias) {
      const existing = await prisma.user.findFirst({
        where: { alias: data.alias, NOT: { id: req.userId } },
      });
      if (existing) {
        return res.status(409).json({ success: false, error: 'Alias already taken' });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: { id: true, alias: true, avatarSeed: true, gender: true },
    });

    return res.json({ success: true, data: user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

export default router;

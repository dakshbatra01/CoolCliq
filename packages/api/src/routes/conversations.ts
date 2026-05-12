import { Router } from 'express';
import { PrismaClient } from '@coolcliq/prisma/generated/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// POST /api/conversations — Start or get existing 1-to-1 chat
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const schema = z.object({
    targetUserId: z.string(),
    venueId: z.string(),
  });

  try {
    const { targetUserId, venueId } = schema.parse(req.body);
    const userId = req.userId!;

    if (userId === targetUserId) {
      return res.status(400).json({ success: false, error: 'Cannot chat with yourself' });
    }

    // Check blocks
    const blocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: targetUserId },
          { blockerId: targetUserId, blockedId: userId },
        ],
      },
    });

    if (blocked) {
      return res.status(403).json({ success: false, error: 'Cannot chat with this user' });
    }

    // Ordered IDs for consistent unique constraint
    const [u1, u2] = [userId, targetUserId].sort();

    const conversation = await prisma.conversation.upsert({
      where: { user1Id_user2Id_venueId: { user1Id: u1, user2Id: u2, venueId } },
      update: {},
      create: { user1Id: u1, user2Id: u2, venueId },
      include: {
        user1: { select: { id: true, alias: true, avatarSeed: true, gender: true } },
        user2: { select: { id: true, alias: true, avatarSeed: true, gender: true } },
      },
    });

    const otherUser = conversation.user1.id === userId ? conversation.user2 : conversation.user1;

    return res.json({ success: true, data: { ...conversation, otherUser } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to create conversation' });
  }
});

// GET /api/conversations — User's conversations list
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const convs = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: { id: true, alias: true, avatarSeed: true, gender: true } },
        user2: { select: { id: true, alias: true, avatarSeed: true, gender: true } },
        messages: { orderBy: { sentAt: 'desc' }, take: 1 },
        tableReveal: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = convs.map((c) => ({
      ...c,
      otherUser: c.user1.id === userId ? c.user2 : c.user1,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
});

// GET /api/conversations/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const conv = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: {
        user1: { select: { id: true, alias: true, avatarSeed: true, gender: true } },
        user2: { select: { id: true, alias: true, avatarSeed: true, gender: true } },
        tableReveal: true,
      },
    });

    if (!conv) return res.status(404).json({ success: false, error: 'Conversation not found' });

    if (conv.user1Id !== userId && conv.user2Id !== userId) {
      return res.status(403).json({ success: false, error: 'Not part of this conversation' });
    }

    const otherUser = conv.user1.id === userId ? conv.user2 : conv.user1;
    return res.json({ success: true, data: { ...conv, otherUser } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
  }
});

export default router;

import { Router } from 'express';
import { PrismaClient } from '@coolcliq/prisma/generated/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { io } from '../index';
import { SOCKET_EVENTS } from '@coolcliq/shared';

const router = Router();
const prisma = new PrismaClient();

// POST /api/reveal/consent
router.post('/consent', authMiddleware, async (req: AuthRequest, res) => {
  const schema = z.object({ conversationId: z.string() });

  try {
    const { conversationId } = schema.parse(req.body);
    const userId = req.userId!;

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { tableReveal: true },
    });

    if (!conv || (conv.user1Id !== userId && conv.user2Id !== userId)) {
      return res.status(403).json({ success: false, error: 'Not part of this conversation' });
    }

    const isUser1 = conv.user1Id === userId;

    // Create or update reveal record
    let reveal = await prisma.tableReveal.upsert({
      where: { conversationId },
      update: isUser1 ? { user1Consented: true } : { user2Consented: true },
      create: {
        conversationId,
        user1Consented: isUser1,
        user2Consented: !isUser1,
      },
    });

    // Check if both consented
    if (reveal.user1Consented && reveal.user2Consented) {
      // Get both users' table info
      const [session1, session2] = await Promise.all([
        prisma.session.findFirst({
          where: { userId: conv.user1Id, venueId: conv.venueId, isActive: true },
          include: { table: true },
        }),
        prisma.session.findFirst({
          where: { userId: conv.user2Id, venueId: conv.venueId, isActive: true },
          include: { table: true },
        }),
      ]);

      const tableLabel = [
        session1?.table?.label || 'Unknown table',
        session2?.table?.label || 'Unknown table',
      ].join(' & ');

      reveal = await prisma.tableReveal.update({
        where: { conversationId },
        data: { revealedAt: new Date(), tableLabel },
      });

      // Notify both users
      io.to(`conv:${conversationId}`).emit(SOCKET_EVENTS.REVEAL_CONFIRMED, {
        tableLabel,
        revealedAt: reveal.revealedAt,
      });
    }

    return res.json({ success: true, data: reveal });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to process consent' });
  }
});

// GET /api/reveal/status/:conversationId
router.get('/status/:conversationId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const reveal = await prisma.tableReveal.findUnique({
      where: { conversationId: req.params.conversationId },
    });
    return res.json({ success: true, data: reveal });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to fetch reveal status' });
  }
});

export default router;

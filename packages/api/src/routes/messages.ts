import { Router } from 'express';
import { PrismaClient } from '@coolcliq/prisma/generated/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { messageRateLimiter } from '../middleware/rateLimiter';
import { io } from '../index';
import { SOCKET_EVENTS } from '@coolcliq/shared';

const router = Router();
const prisma = new PrismaClient();

// GET /api/messages/:conversationId
router.get('/:conversationId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { conversationId } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const before = req.query.before as string | undefined;

    // Verify user is in conversation
    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv || (conv.user1Id !== userId && conv.user2Id !== userId)) {
      return res.status(403).json({ success: false, error: 'Not part of this conversation' });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(before ? { sentAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { sentAt: 'asc' },
      take: limit,
    });

    // Mark received messages as read
    await prisma.message.updateMany({
      where: { conversationId, receiverId: userId, isRead: false },
      data: { isRead: true },
    });

    return res.json({ success: true, data: messages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// POST /api/messages — Send a message (HTTP fallback, primary via Socket.IO)
router.post('/', authMiddleware, messageRateLimiter, async (req: AuthRequest, res) => {
  const schema = z.object({
    conversationId: z.string(),
    content: z.string().min(1).max(500),
  });

  try {
    const { conversationId, content } = schema.parse(req.body);
    const userId = req.userId!;

    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv || (conv.user1Id !== userId && conv.user2Id !== userId)) {
      return res.status(403).json({ success: false, error: 'Not part of this conversation' });
    }

    const receiverId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;

    const message = await prisma.message.create({
      data: { conversationId, senderId: userId, receiverId, content },
    });

    // Emit to conversation room
    io.to(`conv:${conversationId}`).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);

    return res.json({ success: true, data: message });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

export default router;

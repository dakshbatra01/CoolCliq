import { Router } from 'express';
import { PrismaClient } from '@coolcliq/prisma/generated/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { io } from '../index';
import { SOCKET_EVENTS, REPORT_REASONS } from '@coolcliq/shared';

const router = Router();
const prisma = new PrismaClient();

// POST /api/safety/block
router.post('/block', authMiddleware, async (req: AuthRequest, res) => {
  const schema = z.object({ blockedId: z.string() });

  try {
    const { blockedId } = schema.parse(req.body);
    const blockerId = req.userId!;

    if (blockerId === blockedId) {
      return res.status(400).json({ success: false, error: 'Cannot block yourself' });
    }

    await prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      update: {},
      create: { blockerId, blockedId },
    });

    // Notify blocked user (disconnect from any shared rooms)
    io.to(`user:${blockedId}`).emit(SOCKET_EVENTS.USER_BLOCKED, { blockedBy: blockerId });

    return res.json({ success: true, message: 'User blocked successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to block user' });
  }
});

// POST /api/safety/report
router.post('/report', authMiddleware, async (req: AuthRequest, res) => {
  const schema = z.object({
    reportedId: z.string(),
    reason: z.enum(REPORT_REASONS as unknown as [string, ...string[]]),
  });

  try {
    const { reportedId, reason } = schema.parse(req.body);
    const reporterId = req.userId!;

    await prisma.report.create({
      data: { reporterId, reportedId, reason },
    });

    return res.json({ success: true, message: 'Report submitted. Our team will review it.' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to submit report' });
  }
});

// POST /api/safety/panic — Emergency exit
router.post('/panic', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    // End all active sessions
    await prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, exitedAt: new Date() },
    });

    // Emit panic event to user's own socket (will trigger client-side cleanup)
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.PANIC_EXIT, { userId });

    return res.json({ success: true, message: 'Panic exit triggered. You are now hidden.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to trigger panic exit' });
  }
});

export default router;

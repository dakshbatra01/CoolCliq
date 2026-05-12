import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@coolcliq/prisma/generated/client';
import jwt from 'jsonwebtoken';
import { SOCKET_EVENTS, MAX_MESSAGE_LENGTH } from '@coolcliq/shared';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'coolcliq-dev-secret-change-in-prod';

interface AuthSocket extends Socket {
  userId?: string;
}

export function initSocketHandlers(io: Server) {
  // ─── Auth Middleware ────────────────────────────────────────────────────
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    const userId = socket.userId!;
    console.log(`🔌 Socket connected: ${userId}`);

    // Join user's private room for targeted notifications
    socket.join(`user:${userId}`);

    // ─── Venue Presence ──────────────────────────────────────────────────

    socket.on(SOCKET_EVENTS.JOIN_VENUE, async ({ venueId }: { venueId: string }) => {
      socket.join(`venue:${venueId}`);
      console.log(`👤 ${userId} joined venue:${venueId}`);

      // Broadcast updated user count to venue room
      const activeCount = await prisma.session.count({
        where: { venueId, isActive: true },
      });

      io.to(`venue:${venueId}`).emit(SOCKET_EVENTS.VENUE_USERS_UPDATE, {
        venueId,
        activeCount,
      });
    });

    socket.on(SOCKET_EVENTS.LEAVE_VENUE, ({ venueId }: { venueId: string }) => {
      socket.leave(`venue:${venueId}`);
    });

    // ─── Chat ─────────────────────────────────────────────────────────────

    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (payload: {
      conversationId: string;
      content: string;
    }) => {
      try {
        const { conversationId, content } = payload;

        if (!content || content.length > MAX_MESSAGE_LENGTH) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid message content' });
          return;
        }

        // Verify user is in conversation
        const conv = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });

        if (!conv || (conv.user1Id !== userId && conv.user2Id !== userId)) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Not part of this conversation' });
          return;
        }

        // Check block status
        const receiverId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
        const blocked = await prisma.block.findFirst({
          where: {
            OR: [
              { blockerId: userId, blockedId: receiverId },
              { blockerId: receiverId, blockedId: userId },
            ],
          },
        });

        if (blocked) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Cannot send message to this user' });
          return;
        }

        // Persist message
        const message = await prisma.message.create({
          data: { conversationId, senderId: userId, receiverId, content },
        });

        // Join conversation room if not already
        socket.join(`conv:${conversationId}`);

        // Emit to all in conversation room
        io.to(`conv:${conversationId}`).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
      } catch (err) {
        console.error('Socket send_message error:', err);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to send message' });
      }
    });

    // Join a conversation room (to receive messages)
    socket.on('join_conversation', ({ conversationId }: { conversationId: string }) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on('leave_conversation', ({ conversationId }: { conversationId: string }) => {
      socket.leave(`conv:${conversationId}`);
    });

    // ─── Table Reveal ─────────────────────────────────────────────────────

    socket.on(SOCKET_EVENTS.REVEAL_CONSENT, async ({ conversationId }: { conversationId: string }) => {
      try {
        const conv = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { tableReveal: true },
        });

        if (!conv || (conv.user1Id !== userId && conv.user2Id !== userId)) return;

        const isUser1 = conv.user1Id === userId;

        const reveal = await prisma.tableReveal.upsert({
          where: { conversationId },
          update: isUser1 ? { user1Consented: true } : { user2Consented: true },
          create: {
            conversationId,
            user1Consented: isUser1,
            user2Consented: !isUser1,
          },
        });

        if (reveal.user1Consented && reveal.user2Consented) {
          const [s1, s2] = await Promise.all([
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
            s1?.table?.label || 'Unknown table',
            s2?.table?.label || 'Unknown table',
          ].join(' & ');

          await prisma.tableReveal.update({
            where: { conversationId },
            data: { revealedAt: new Date(), tableLabel },
          });

          io.to(`conv:${conversationId}`).emit(SOCKET_EVENTS.REVEAL_CONFIRMED, { tableLabel });
        }
      } catch (err) {
        console.error('Socket reveal_consent error:', err);
      }
    });

    // ─── Panic Exit ───────────────────────────────────────────────────────

    socket.on(SOCKET_EVENTS.PANIC_EXIT, async () => {
      try {
        await prisma.session.updateMany({
          where: { userId, isActive: true },
          data: { isActive: false, exitedAt: new Date() },
        });
        socket.emit(SOCKET_EVENTS.PANIC_EXIT, { success: true });
        socket.disconnect();
      } catch (err) {
        console.error('Socket panic_exit error:', err);
      }
    });

    // ─── Disconnect ───────────────────────────────────────────────────────

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${userId}`);
    });
  });
}

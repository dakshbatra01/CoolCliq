import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { Server as SocketServer } from 'socket.io';

import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import venuesRoutes from './routes/venues';
import sessionsRoutes from './routes/sessions';
import conversationsRoutes from './routes/conversations';
import messagesRoutes from './routes/messages';
import revealRoutes from './routes/reveal';
import safetyRoutes from './routes/safety';
import adminRoutes from './routes/admin';

import { initSocketHandlers } from './socket/chatHandler';
import { rateLimiter } from './middleware/rateLimiter';

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.IO ───────────────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin: [
      process.env.WEB_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:3001',
    ],
    credentials: true,
  },
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    process.env.WEB_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(rateLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/reveal', revealRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/admin', adminRoutes);

// ─── Socket.IO Handlers ───────────────────────────────────────────────────────
initSocketHandlers(io);

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 CoolCliq API running on port ${PORT}`);
  console.log(`📡 Socket.IO ready`);
});

export { io };

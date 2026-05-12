import { Router } from 'express';
import { PrismaClient, VenueCategory } from '@coolcliq/prisma/generated/client';
import { z } from 'zod';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
import QRCode from 'qrcode';

const router = Router();
const prisma = new PrismaClient();

// All admin routes require auth + admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// ─── Analytics ────────────────────────────────────────────────────────────────

// GET /api/admin/analytics
router.get('/analytics', async (_req, res) => {
  try {
    const [
      totalUsers,
      activeSessions,
      totalCheckIns,
      venues,
      recentSessions,
    ] = await Promise.all([
      prisma.user.count({ where: { isAdmin: false } }),
      prisma.session.count({ where: { isActive: true } }),
      prisma.session.count({
        where: {
          checkedInAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.venue.findMany({
        include: { sessions: { where: { isActive: true }, select: { id: true } } },
        where: { isActive: true },
      }),
      prisma.session.findMany({
        orderBy: { checkedInAt: 'desc' },
        take: 100,
        select: { checkedInAt: true, venueId: true },
      }),
    ]);

    // Find most active venue
    const venueActivity = venues.map((v) => ({
      id: v.id,
      name: v.name,
      count: v.sessions.length,
    })).sort((a, b) => b.count - a.count);

    // Daily stats (last 7 days)
    const dailyStats = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const start = new Date(date.setHours(0, 0, 0, 0));
        const end = new Date(date.setHours(23, 59, 59, 999));
        return prisma.session.count({
          where: { checkedInAt: { gte: start, lte: end } },
        }).then((count) => ({
          date: start.toISOString().split('T')[0],
          checkIns: count,
        }));
      })
    );

    // Reports summary
    const unresolvedReports = await prisma.report.count({ where: { resolved: false } });

    return res.json({
      success: true,
      data: {
        totalUsers,
        activeSessions,
        totalCheckIns,
        unresolvedReports,
        mostActiveVenue: venueActivity[0]?.name || 'N/A',
        venueActivity,
        dailyStats,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// ─── Venue Management ─────────────────────────────────────────────────────────

// GET /api/admin/venues
router.get('/venues', async (_req, res) => {
  try {
    const venues = await prisma.venue.findMany({
      include: {
        tables: true,
        sessions: { where: { isActive: true }, select: { id: true } },
        _count: { select: { sessions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: venues });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to fetch venues' });
  }
});

// POST /api/admin/venues
router.post('/venues', async (req: AuthRequest, res) => {
  const schema = z.object({
    name: z.string().min(2).max(100),
    address: z.string().min(5),
    lat: z.number(),
    lng: z.number(),
    category: z.nativeEnum(VenueCategory).default(VenueCategory.OTHER),
    tables: z.array(z.string()).optional(),
  });

  try {
    const { tables, ...venueData } = schema.parse(req.body);

    const venue = await prisma.venue.create({
      data: {
        ...venueData,
        tables: tables?.length
          ? { create: tables.map((label) => ({ label })) }
          : undefined,
      },
      include: { tables: true },
    });

    return res.status(201).json({ success: true, data: venue });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to create venue' });
  }
});

// PATCH /api/admin/venues/:id
router.patch('/venues/:id', async (req: AuthRequest, res) => {
  const schema = z.object({
    name: z.string().min(2).max(100).optional(),
    address: z.string().min(5).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    isActive: z.boolean().optional(),
  });

  try {
    const data = schema.parse(req.body);
    const venue = await prisma.venue.update({
      where: { id: req.params.id },
      data,
    });
    return res.json({ success: true, data: venue });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to update venue' });
  }
});

// DELETE /api/admin/venues/:id
router.delete('/venues/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.venue.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Venue deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to delete venue' });
  }
});

// ─── QR Generation ────────────────────────────────────────────────────────────

// POST /api/admin/venues/:id/qr — Generate venue-level QR
router.post('/venues/:id/qr', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const venue = await prisma.venue.findUnique({ where: { id } });
    if (!venue) return res.status(404).json({ success: false, error: 'Venue not found' });

    const qrData = JSON.stringify({
      type: 'venue',
      venueId: id,
      venueName: venue.name,
      t: Date.now(),
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    });

    await prisma.venue.update({ where: { id }, data: { qrCode: qrCodeDataUrl } });

    return res.json({ success: true, data: { qrCode: qrCodeDataUrl, venueId: id } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to generate QR code' });
  }
});

// POST /api/admin/tables/:tableId/qr — Generate table-level QR
router.post('/tables/:tableId/qr', async (req: AuthRequest, res) => {
  try {
    const { tableId } = req.params;
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: { venue: true },
    });
    if (!table) return res.status(404).json({ success: false, error: 'Table not found' });

    const qrData = JSON.stringify({
      type: 'table',
      venueId: table.venueId,
      tableId,
      tableLabel: table.label,
      venueName: table.venue.name,
      t: Date.now(),
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    });

    await prisma.table.update({ where: { id: tableId }, data: { qrCode: qrCodeDataUrl } });

    return res.json({ success: true, data: { qrCode: qrCodeDataUrl, tableId } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to generate QR code' });
  }
});

// ─── Reports Moderation ───────────────────────────────────────────────────────

// GET /api/admin/reports
router.get('/reports', async (_req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { id: true, alias: true, phone: true } },
        reported: { select: { id: true, alias: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: reports });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to fetch reports' });
  }
});

// PATCH /api/admin/reports/:id/resolve
router.patch('/reports/:id/resolve', async (req: AuthRequest, res) => {
  try {
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { resolved: true },
    });
    return res.json({ success: true, data: report });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to resolve report' });
  }
});

export default router;

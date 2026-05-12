import { Router } from 'express';
import { PrismaClient } from '@coolcliq/prisma/generated/client';
import { z } from 'zod';
import { generateRandomAlias } from '@coolcliq/shared';
import { generateToken } from '../middleware/auth';
import { otpRateLimiter } from '../middleware/rateLimiter';
import { OTP_MOCK_CODE, OTP_LENGTH } from '@coolcliq/shared';

const router = Router();
const prisma = new PrismaClient();

const sendOtpSchema = z.object({
  phone: z.string().min(10).max(15),
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  code: z.string().length(OTP_LENGTH),
});

// POST /api/auth/send-otp
router.post('/send-otp', otpRateLimiter, async (req, res) => {
  try {
    const { phone } = sendOtpSchema.parse(req.body);

    // Delete old tokens for this phone
    await prisma.otpToken.deleteMany({ where: { phone } });

    // In production: send via Twilio. For MVP, use mock code.
    const code = process.env.NODE_ENV === 'production'
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : OTP_MOCK_CODE;

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await prisma.otpToken.create({
      data: { phone, code, expiresAt },
    });

    // TODO: In production, call Twilio here
    console.log(`[DEV] OTP for ${phone}: ${code}`);

    return res.json({
      success: true,
      message: 'OTP sent successfully',
      ...(process.env.NODE_ENV !== 'production' && { devCode: code }),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, code } = verifyOtpSchema.parse(req.body);

    const token = await prisma.otpToken.findFirst({
      where: { phone, used: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) {
      return res.status(400).json({ success: false, error: 'No OTP found for this number' });
    }

    if (token.expiresAt < new Date()) {
      return res.status(400).json({ success: false, error: 'OTP has expired' });
    }

    if (token.attempts >= 3) {
      return res.status(400).json({ success: false, error: 'Too many failed attempts' });
    }

    if (token.code !== code) {
      await prisma.otpToken.update({
        where: { id: token.id },
        data: { attempts: { increment: 1 } },
      });
      return res.status(400).json({ success: false, error: 'Invalid OTP code' });
    }

    // Mark OTP as used
    await prisma.otpToken.update({ where: { id: token.id }, data: { used: true } });

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });
    const isNewUser = !user;

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          alias: generateRandomAlias(),
          avatarSeed: `${phone}_${Date.now()}`,
          gender: 'PREFER_NOT_TO_SAY',
        },
      });
    }

    const authToken = generateToken(user.id, user.isAdmin);

    return res.json({
      success: true,
      data: {
        token: authToken,
        user: {
          id: user.id,
          alias: user.alias,
          avatarSeed: user.avatarSeed,
          gender: user.gender,
          isAdmin: user.isAdmin,
        },
        isNewUser,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    console.error(err);
    return res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

export default router;

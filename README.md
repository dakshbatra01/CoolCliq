# CoolCliq — Full-Stack MVP

**Connect instantly, right where you are.**

### 🌐 Live Production Links
*   **User Web App**: [https://cool-cliq-1.netlify.app](https://cool-cliq-1.netlify.app)
*   **Admin Dashboard**: [https://coolcliq-admin.netlify.app](https://coolcliq-admin.netlify.app)
*   **API Backend**: [https://coolcliq-api.onrender.com](https://coolcliq-api.onrender.com)

---

CoolCliq is a mobile-first anonymous social discovery platform for real-world venues (cafés, bars, lounges). Users scan a venue QR code, get GPS-verified, discover anonymously-present others, and can chat 1-to-1 — with a mutual consent table-reveal to meet in person.

---

## 🏗️ Architecture

This is a **Turborepo monorepo** with the following packages:

```
coolcliq/
├── apps/
│   ├── web/          # Next.js 15 — user-facing mobile PWA (port 3000)
│   └── admin/        # Next.js 15 — admin dashboard (port 3001)
├── packages/
│   ├── api/          # Express + Socket.IO backend (port 4000)
│   ├── prisma/       # PostgreSQL schema + Prisma ORM
│   └── shared/       # Shared TypeScript types, constants, utils
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL 14+

### 1. Install dependencies
```bash
pnpm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Edit .env with your DATABASE_URL
```

### 3. Set up the database
```bash
cd packages/prisma
pnpm db:generate   # Generate Prisma client
pnpm db:push       # Push schema to database
pnpm db:seed       # Seed sample venues + admin user
```

### 4. Run the apps

**Start all apps in parallel:**
```bash
pnpm dev
```

**Or start individually:**
```bash
# Web app (user-facing)
pnpm --filter @coolcliq/web dev

# Admin dashboard
pnpm --filter @coolcliq/admin dev

# API backend
pnpm --filter @coolcliq/api dev
```

| App | URL |
|-----|-----|
| User Web App | http://localhost:3000 |
| Admin Dashboard | http://localhost:3001 |
| API | http://localhost:4000 |

---

## 🔑 Development Notes

- **OTP Bypass**: In development, use code `000000` for any phone number
- **GPS Bypass**: Set `SKIP_GPS_VALIDATION=true` in `.env` to skip check-in GPS validation
- **Google Maps**: Add `NEXT_PUBLIC_GOOGLE_MAPS_KEY` to enable the map view (fallback is list view)
- **Twilio**: OTP sending is mocked in dev. Set Twilio credentials in `.env` for production

---

## 📱 User Flow

```
Splash → Age Gate (18+) → Location Permission → Privacy Info
       → OTP Login → OTP Verify → Profile Setup
       → Live Venue Map → QR Scan → Check In
       → Venue Detail → Start Chat → (Reveal Table?)
       → Panic Exit (any time)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| User Frontend | Next.js 15, TypeScript, TailwindCSS |
| Admin Frontend | Next.js 15, TypeScript, Recharts |
| Backend | Node.js + Express, TypeScript |
| Real-time | Socket.IO |
| Database | PostgreSQL + Prisma ORM |
| Auth | OTP (mock/Twilio) + JWT |
| QR Codes | html5-qrcode (scan) + qrcode (generate) |
| Maps | Google Maps SDK / @vis.gl/react-google-maps |
| Package Manager | pnpm + Turborepo |

---

## 🔒 Key Features

- **QR Check-in**: Scan venue/table QR → GPS-validated check-in
- **Anonymous Profiles**: Alias + DiceBear avatar only — no real identity
- **Real-time Chat**: Socket.IO 1-to-1 chat with block enforcement
- **Table Reveal**: Mutual consent before location is shared
- **Panic Exit**: Instant session end + sign out
- **Admin Dashboard**: Analytics, venue CRUD, QR generation, report moderation

---

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/send-otp` | Send OTP |
| POST | `/api/auth/verify-otp` | Verify OTP → JWT |
| GET | `/api/venues/nearby` | Nearby venues |
| GET | `/api/venues/:id/active-users` | Anonymous user list |
| POST | `/api/sessions/checkin` | GPS-validated check-in |
| DELETE | `/api/sessions/exit` | Exit venue |
| POST | `/api/conversations` | Start 1-to-1 chat |
| GET | `/api/messages/:conversationId` | Chat history |
| POST | `/api/reveal/consent` | Consent to table reveal |
| POST | `/api/safety/block` | Block user |
| POST | `/api/safety/report` | Report user |
| POST | `/api/safety/panic` | Emergency exit |
| GET | `/api/admin/analytics` | Dashboard metrics |
| POST | `/api/admin/venues/:id/qr` | Generate venue QR |

---

## 📁 Screens Built (18/18)

| # | Screen | Route |
|---|--------|-------|
| 1 | Splash Screen | `/` |
| 2 | Age Gate (18+) | `/onboarding/age` |
| 3 | Location Permission | `/onboarding/location` |
| 4 | Privacy & Anonymity | `/onboarding/privacy` |
| 5 | Community Guidelines | `/onboarding/community` |
| 6 | Phone OTP Login | `/auth/login` |
| 7 | OTP Verification | `/auth/verify` |
| 8 | Profile Setup | `/auth/profile` |
| 9 | Live Venue Map | `/map` |
| 10 | QR Scanner | `/scan` |
| 11 | Venue Detail & Active Users | `/venue/[id]` |
| 12 | Anonymous 1-to-1 Chat | `/chat/[conversationId]` |
| 13 | Reveal Table Modal | `/chat/[conversationId]/reveal` |
| 14 | Panic Exit & Safety | `/safety` |
| 15 | Edit Profile | `/profile/edit` |
| 16 | Admin Analytics Dashboard | `/admin` (port 3001) |
| 17 | Admin Venue Management | `/admin/venues` |
| 18 | Admin QR Generation | `/admin/venues/[venueId]/qr` |

---

## 🔧 Environment Variables

See `.env.example` for all required variables.

```bash
DATABASE_URL=             # PostgreSQL connection string
JWT_SECRET=               # JWT signing secret (change in production)
SKIP_GPS_VALIDATION=true  # Dev bypass for GPS check
NEXT_PUBLIC_API_URL=      # Backend API URL
NEXT_PUBLIC_WS_URL=       # Socket.IO server URL
NEXT_PUBLIC_GOOGLE_MAPS_KEY=  # (optional) Google Maps API key
```

---

## 🚢 Deployment

### Architecture
| Service | Platform | Notes |
|---|---|---|
| `packages/api` | **Render** (Docker) | Express + Socket.IO |
| `apps/web` | **Vercel** | User-facing PWA |
| `apps/admin` | **Vercel** | Admin dashboard |
| Database | **Supabase** (PostgreSQL) | Already configured |

---

### 1. Deploy the API → Render

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New → Blueprint** → select your repo.
3. Render will detect `render.yaml` and create the `coolcliq-api` web service automatically.
4. In the service's **Environment** tab, set these secrets:
   ```
   DATABASE_URL=<your Supabase connection string>
   JWT_SECRET=<long random string>
   WEB_URL=https://<your-web-app>.vercel.app
   ADMIN_URL=https://<your-admin-app>.vercel.app
   ```
5. Click **Deploy**. After deploy, note your Render URL (e.g. `https://coolcliq-api.onrender.com`).

> **Note:** The free tier spins down after inactivity. Upgrade to **Starter** for always-on.

---

### 2. Deploy the Frontends → Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project**.
2. Select your GitHub repo.
3. For each app (Web and Admin), create a separate site:
   - **Base Directory**: `apps/web` (for web) or `apps/admin` (for admin)
   - **Build Command**: `pnpm build`
   - **Publish Directory**: `.next`
4. Add **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://coolcliq-api.onrender.com/api
   NEXT_PUBLIC_WS_URL=https://coolcliq-api.onrender.com
   PNPM_FLAGS=--shamefully-hoist --no-frozen-lockfile
   ```
5. Deploy.

---

### 4. Post-Deploy: Run DB Migrations

After the first deploy, run the Prisma migration against your production DB:
```bash
# From the packages/prisma directory, with production DATABASE_URL set
pnpm db:push
pnpm db:seed   # optional: seed venues + admin user
```

---

### Environment Variables Summary

| Variable | Where | Required |
|---|---|---|
| `DATABASE_URL` | Render | ✅ |
| `JWT_SECRET` | Render | ✅ |
| `WEB_URL` | Render | ✅ |
| `ADMIN_URL` | Render | ✅ |
| `NEXT_PUBLIC_API_URL` | Vercel (both apps) | ✅ |
| `NEXT_PUBLIC_WS_URL` | Vercel (both apps) | ✅ |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Vercel (web only) | ⬜ optional |
| `TWILIO_*` | Render | ⬜ optional (mock OTP if absent) |

---

*Built for the CoolCliq MVP — targeting 10-20 launch venues.*

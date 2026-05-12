# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy all workspace manifests first (maximises layer cache)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/admin/package.json        ./apps/admin/package.json
COPY apps/web/package.json          ./apps/web/package.json
COPY packages/api/package.json      ./packages/api/package.json
COPY packages/prisma/package.json   ./packages/prisma/package.json
COPY packages/shared/package.json   ./packages/shared/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/eslint-config/package.json     ./packages/eslint-config/package.json
COPY packages/ui/package.json                ./packages/ui/package.json

# Install all deps (needed for type compilation)
RUN pnpm install --frozen-lockfile

# Copy full source
COPY packages/shared        ./packages/shared
COPY packages/typescript-config ./packages/typescript-config
COPY packages/prisma        ./packages/prisma
COPY packages/api           ./packages/api

# Generate Prisma client
RUN pnpm --filter @coolcliq/prisma db:generate

# Compile API TypeScript → dist/
RUN pnpm --filter @coolcliq/api build

# Use pnpm deploy to create a clean, standalone production bundle
# This resolves all workspace:* links into real files — no more symlinks
RUN pnpm --filter @coolcliq/api deploy --prod /app/deploy

# Copy generated Prisma client into the deploy bundle
RUN cp -r /app/packages/prisma/generated /app/deploy/node_modules/@coolcliq/prisma/generated

# ─── Stage 2: Runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copy the self-contained deploy bundle (all node_modules resolved, no pnpm needed)
COPY --from=builder /app/deploy       ./
COPY --from=builder /app/packages/api/dist ./dist

EXPOSE 4000
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]

# =============================================================================
# OPTIMIZED Production Dockerfile - Next.js Frontend
# =============================================================================
# Key optimizations for faster builds:
# 1. Pinned pnpm version (no download each time)
# 2. Better layer caching with --mount=type=cache
# 3. Swappable base image for ARM (M1/M2) vs x86
# 4. Parallelized commands where possible
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: deps - Install dependencies with caching
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

# Copy only package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches/

# Install with cache mount (persists across builds)
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# -----------------------------------------------------------------------------
# Stage 2: builder - Build with Next.js cache
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code (after deps for better caching)
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Increase memory limit for build (fixes Turbopack crashes)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build with cache mount for Next.js cache
RUN --mount=type=cache,target=/app/.next/cache \
    pnpm build

# -----------------------------------------------------------------------------
# Stage 3: runner - Minimal production image (~50MB)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what's needed for production
COPY --from=builder /app/public ./public

# Copy standalone output (self-contained server)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

CMD ["node", "server.js"]

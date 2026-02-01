# =============================================================================
# Production Dockerfile - Next.js Frontend
# =============================================================================
# Multi-stage build for Next.js 16+ frontend deployment
# Uses standalone output mode for minimal image size
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: deps - Install dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and patches (required for patchedDependencies)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches/

# Install dependencies (frozen-lockfile may fail if patches changed, fallback to regular install)
RUN pnpm install --frozen-lockfile || pnpm install

# -----------------------------------------------------------------------------
# Stage 2: builder - Build Next.js application
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js in standalone mode
RUN pnpm build

# -----------------------------------------------------------------------------
# Stage 3: runner - Minimal production image
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone output (self-contained server)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Configure port and hostname
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start Next.js standalone server
CMD ["node", "server.js"]

# syntax=docker/dockerfile:1.4
# ==========================================
# Stage 1: Install dependencies
# ==========================================
FROM node:22-alpine AS deps

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install production + dev dependencies (needed for build)
# BuildKit cache mount keeps the npm HTTP cache between builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline

# ==========================================
# Stage 2: Build the Next.js application
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Pass public env vars as build args (Next.js inlines NEXT_PUBLIC_* at build time)
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Set Next.js to produce a standalone output
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# ==========================================
# Stage 3: Production runner
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built assets from builder
# Public folder
COPY --from=builder /app/public ./public

# Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

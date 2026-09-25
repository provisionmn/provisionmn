# syntax=docker/dockerfile:1

# Next.js standalone image for Provision.mn.
# Node 22 (LTS): Next 16 needs >= 20.9, and Node 20 is past end-of-life.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Plain `npm ci` — this repo needs no peer-dep flags.
RUN --mount=type=cache,target=/root/.npm \
    npm ci

FROM node:22-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
# Switches next.config.mjs to `output: "standalone"`. Without it the runner
# stage below has no server.js to copy.
ENV DOCKER_BUILD=1
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=""
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# next/font downloads Inter, Manrope, JetBrains Mono and Sora from Google at
# BUILD time and self-hosts them in the output — this stage needs network
# access, but the resulting image makes no external font requests.
#
# Persist Next's incremental build cache across builds.
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# The repo has no public/ directory today. Creating it keeps the COPY in the
# runner stage valid either way, so adding one later needs no Dockerfile edit.
RUN mkdir -p public

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV TZ=Asia/Ulaanbaatar

RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nextjs -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/ || exit 1

LABEL org.opencontainers.image.source="https://github.com/provisionmn/provisionmn"
LABEL org.opencontainers.image.title="Provision.mn"
LABEL org.opencontainers.image.description="Provision.mn marketing site (Next.js)"

CMD ["node", "server.js"]

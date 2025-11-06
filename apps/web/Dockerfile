# -------------------------
# Base image
# -------------------------
FROM node:20-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm turbo

WORKDIR /app

# -------------------------
# Prepare the monorepo
# -------------------------
FROM base AS prepare
COPY . .
RUN turbo prune web --docker

# -------------------------
# Install dependencies & build
# -------------------------
FROM base AS builder
# Copy pruned lockfile + package manifests
COPY --from=prepare /app/out/json/ ./
RUN pnpm install --frozen-lockfile --prefer-offline
# Copy full source for build
COPY --from=prepare /app/out/full/ ./

RUN pnpm add -g @nestjs/cli@^11

# -------------------------
# Remote Caching from turborepo
# -------------------------
# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN turbo run build --filter=web...

# -------------------------
# Production runtime image
# -------------------------
FROM base AS runner
WORKDIR /app

# Don't run production as root for security reasons
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
USER nextjs

# Copy built output (Next.js standalone mode)
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]

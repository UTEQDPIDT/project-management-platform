# -------------------------
# Base Stage
# -------------------------
FROM node:20-alpine AS base
RUN apk update
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app

# -------------------------
# Prune Stage
# -------------------------
FROM base AS prune
RUN pnpm add -g turbo
COPY . .
RUN turbo prune web --docker

# -------------------------
# Install dependencies
# -------------------------
FROM base AS installer
WORKDIR /app
# Copy package.json files for workspace resolution
COPY --from=prune /app/out/json/ ./
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prune /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and turbo config
COPY --from=prune /app/out/full/ ./

# -------------------------
# Remote Caching from turborepo
# -------------------------
# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

# Build the application
RUN pnpm turbo build --filter=web

# -------------------------
# Production runtime image
# -------------------------
FROM base AS runner
WORKDIR /app

# Don't run production as root for security reasons
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy built output (Next.js standalone mode)
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]

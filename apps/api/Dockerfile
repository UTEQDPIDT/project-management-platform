# -------------------------
# Base Stage
# -------------------------
FROM node:20-alpine AS base
RUN apk update
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm add -g turbo

# -------------------------
# Prune Stage
# -------------------------
FROM base AS prune
WORKDIR /app
COPY . .
RUN turbo prune api --docker

# -------------------------
# Install Dev dependencies
# -------------------------
FROM base AS installer
WORKDIR /app
# Copy package.json files for workspace resolution
COPY --from=prune /app/out/json/ ./
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prune /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install all dependencies (including dev)
RUN pnpm install --frozen-lockfile

# Copy source code (this should include turbo.json)
COPY --from=prune /app/out/full/ ./

# Verify turbo.json exists
RUN ls -la /app && echo "Checking for turbo.json:" && test -f /app/turbo.json && echo "turbo.json found" || echo "turbo.json NOT found"

# -------------------------
# Production Installer: This Step only installs Production dependencies only
# -------------------------
FROM base AS installer-production
WORKDIR /app
COPY --from=prune /app/out/full/ .
RUN pnpm install --prod --frozen-lockfile

# -------------------------
# Remote Caching from turborepo
# -------------------------
# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

# -------------------------
# Builder Stage
# -------------------------
FROM base AS builder
WORKDIR /app
# Copy everything from installer (which should include turbo.json)
COPY --from=installer /app/ ./

# Verify turbo.json exists before building
RUN ls -la /app && echo "Checking for turbo.json in builder:" && test -f /app/turbo.json && echo "turbo.json found" || echo "turbo.json NOT found"

# build api package with turbo
RUN pnpm turbo build --filter=api

# -------------------------
# Runner Stage: runner will use the builder output, and use only the node_modules for production to reduce the size of the final image
# -------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Security: create non-root user
RUN addgroup --system app && adduser --system --ingroup app app

# Copy production dependencies and package.json from the production installer stage
COPY --from=installer-production --chown=app:app /app/ ./

# copy build output
COPY --from=builder --chown=app:app /app/apps/api/dist/src ./

USER app

# expose app port
EXPOSE 3001

# commands to run app
CMD ["node", "main.js"]

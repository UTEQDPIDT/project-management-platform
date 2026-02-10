FROM node:20-alpine AS base
RUN apk update
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app

FROM base AS prune
RUN pnpm add -g turbo
COPY . .
RUN turbo prune web --docker

FROM base AS installer
WORKDIR /app

# Copiamos primero el pnpm-lock.yaml y todo el código podado
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prune /app/out/full/ ./

# Instalamos las dependencias. El script 'prepare' se ejecutará aquí.
RUN pnpm install --frozen-lockfile

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

# Build the application
RUN pnpm turbo build --filter=web

FROM node:20-alpine AS runner
WORKDIR /app

# Don't run production as root for security reasons
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy built output (Next.js standalone mode)
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000
CMD ["node", "apps/web/server.js"]

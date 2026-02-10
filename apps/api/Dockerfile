FROM node:20-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.21.0 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm add -g turbo

FROM base AS prune
WORKDIR /app
COPY . .
RUN turbo prune api --docker

FROM base AS builder
WORKDIR /app

COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prune /app/out/json/ .

RUN pnpm install --frozen-lockfile

COPY --from=prune /app/out/full/ ./

RUN turbo build --filter=api

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create security user
RUN addgroup --system app && adduser --system --ingroup app app

# Copy workspace files and lockfile
COPY --from=prune /app/out/json/ ./
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy shared types
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/types/package.json ./packages/types/package.json

# Copy the API build
COPY --from=builder --chown=app:app /app/apps/api/dist ./apps/api/dist

USER app
EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]
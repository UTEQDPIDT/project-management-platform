# -------------------------
# Base image
# -------------------------
FROM node:20-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm turbo

# Set working directory
WORKDIR /app

FROM base AS prepare
COPY . .
# prune monorepo
RUN turbo prune api --docker

# -------------------------
# Install dependencies & build
# -------------------------
FROM base AS builder
ENV NODE_ENV=production

# Add lockfile and package.json's
COPY --from=prepare /app/out/json/ ./

# install dependencies
RUN pnpm install --frozen-lockfile --prefer-offline

COPY --from=prepare /app/out/full/ ./

# -------------------------
# Remote Caching from turborepo
# -------------------------
# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

# build api package with turbo
RUN pnpm turbo run build --filter=api...

# -------------------------
# Production runtime image
# -------------------------
FROM base AS runner
WORKDIR /apps

# Security: create non-root user
RUN addgroup --system app && adduser --system --ingroup app app
USER app

# copy build output
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./

# only install prod deps
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# expose app port
EXPOSE 3001

# commands to run app
CMD ["node", "dist/main.js"]

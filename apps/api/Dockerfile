FROM node:20-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm add -g turbo

FROM base AS prune
WORKDIR /app
COPY . .
RUN turbo prune api --docker

FROM base AS builder
WORKDIR /app

# Copiamos primero el pnpm-lock.yaml y todo el código podado (incluye los package.json y tsconfig.json)
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prune /app/out/full/ ./

RUN pnpm install --frozen-lockfile

RUN pnpm turbo build --filter=api

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Crear usuario de seguridad
RUN addgroup --system app && adduser --system --ingroup app app

# 1. Copiamos los archivos de workspace y el lock
COPY --from=prune /app/out/json/ ./
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# 2. Instalamos dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# 4. Copiamos el paquete de tipos
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/types/package.json ./packages/types/package.json

# 4. Copiamos el build de la API
COPY --from=builder --chown=app:app /app/apps/api/dist/apps/api/src/ ./apps/api/dist/src

USER app
EXPOSE 3001

# Ejecutamos desde la raíz del workspace para que la resolución de módulos de PNPM funcione
CMD ["node", "apps/api/dist/src/main.js"]
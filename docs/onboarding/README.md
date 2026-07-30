# Onboarding para nuevos desarrolladores

## Objetivo

Dejar el proyecto corriendo localmente y conocer las piezas mínimas para empezar a trabajar sin romper el flujo de desarrollo.

## Requisitos previos

- Node.js `20.10.0`
- `pnpm 10.21.0`
- Docker Desktop
- Docker Compose

## Arranque rápido

1. Instalar dependencias.
2. Levantar API y MongoDB.
3. Levantar el frontend.

```bash
pnpm install
docker compose -f docker-compose.dev.yml up --build
turbo dev --filter=web
```

La API queda en `http://localhost:3001/api` y la web en `http://localhost:3000`.

## Variables de entorno

Copiar los archivos de ejemplo y completar valores reales:

```bash
cp apps/api/sample.env apps/api/.env.development
cp apps/web/sample.env apps/web/.env.development
```

Variables clave:

- API: `PORT`, `FRONTEND_URL`, `MONGO_HOST`, `MONGO_DB_NAME`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_JWT_SECRET`, `REFRESH_JWT_EXPIRES_IN`, `SEED_PASSWORD`, `MAIL_*`, `RECAPTCHA_SECRET_KEY`
- Web: `NEXT_PRIVATE_JWT_SECRET`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`

## Scripts útiles

### Root

```bash
pnpm lint
pnpm check-types
pnpm build
```

### API

```bash
pnpm --filter api dev
pnpm --filter api test
pnpm --filter api test:e2e
pnpm --filter api run check-types
```

### Web

```bash
pnpm --filter web dev
pnpm --filter web run check-types
pnpm --filter web lint
```

## Seed y datos de prueba

- El seed del backend se ejecuta automáticamente si la base está vacía.
- También puede dispararse manualmente con `GET /seed/:password`.
- Si hay problemas con índices de usuarios, usar `GET /seed/fix-matricula-index/:password`.

## Cosas que conviene saber desde el día 1

- El proyecto usa MongoDB con Mongoose, no un ORM con migraciones tradicionales.
- Hay compatibilidad con datos legacy en archivos, membresías y estados.
- La UI de archivos en actividades deja el borrado al backend para respetar permisos reales.
- Si se agregan nuevos `InjectModel`, hay que registrar el modelo en el módulo Nest correspondiente.

## Troubleshooting

- Si `pnpm install` avisa por scripts ignorados, revisar `pnpm approve-builds`.
- Si usas una versión de Node distinta a `20.10.0`, puede haber warnings o diferencias de comportamiento.
- Si MongoDB no sube, revisar `docker compose -f docker-compose.dev.yml ps` y reconstruir el stack.

## Referencias

- [README principal](../../README.md)
- [README API](../../apps/api/README.md)
- [README Web](../../apps/web/README.md)
- [Verify workflow](../../.github/workflows/verify.yml)
- [Deploy workflow](../../.github/workflows/deploy.yml)
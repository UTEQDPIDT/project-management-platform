# Handoff Ejecutivo - Project Management Platform

## Resumen

Monorepo con `pnpm` y `Turborepo` que contiene:

- `apps/web`: frontend en `Next.js 16` + `React 19`.
- `apps/api`: backend en `NestJS 11` + `MongoDB/Mongoose`.
- `packages/types`: tipos compartidos entre frontend y backend.

El proyecto administra proyectos, actividades, productos, eventos, archivos y catálogos institucionales. El almacenamiento de archivos usa `GridFS`.

## Estado actual

El último cambio funcional quedó en el commit `36c99b0`:

- Se corrigió el borrado de evidencias de actividades para miembros asignados.
- Se endureció la resolución de proyecto padre para archivos con metadata legacy o incompleta.
- Se ajustó la UI para que el backend decida la autorización final de borrado en actividades.

## Entorno y despliegue

- Desarrollo local: `docker compose -f docker-compose.dev.yml up --build`
- Frontend local: `turbo dev --filter=web`
- API local: `pnpm --filter api dev`
- Producción: `docker-compose.yml` + GitHub Actions + runner self-hosted

## Variables y secretos

No se incluyen credenciales reales en el repositorio. Los secretos visibles en configuración son:

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_JWT_SECRET`, `REFRESH_JWT_EXPIRES_IN`
- `SEED_PASSWORD`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`
- `MONGO_USER`, `MONGO_PASSWORD`, `MONGO_HOST`, `MONGO_DB_NAME`, `MONGO_KEYFILE`

## Riesgos y notas

- El proyecto está pensado para `Node 20.10.0`; versiones más nuevas pueden producir warnings de compatibilidad.
- El repo tolera datos legacy en `entityType` y estados de membresía; cualquier refactor de autorización debe probar compatibilidad histórica.
- No encontré un inventario formal de staging, backups o contactos de escalación.

## Referencias

- [README principal](../README.md)
- [README API](../apps/api/README.md)
- [README Web](../apps/web/README.md)
- [Deploy workflow](../.github/workflows/deploy.yml)
- [Verify workflow](../.github/workflows/verify.yml)

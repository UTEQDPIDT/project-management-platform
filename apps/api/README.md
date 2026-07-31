# UTEQ Project Management Platform - API

Backend REST API for the UTEQ Project Management Platform built with NestJS.

## Tech Stack

- **Framework:** [NestJS](https://nestjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- **Authentication:** [Passport.js](http://www.passportjs.org/) (Google OAuth 2.0 + JWT)
- **Authorization:** [CASL](https://casl.js.org/) (Attribute-based access control)
- **Validation:** [class-validator](https://github.com/typestack/class-validator) + [class-transformer](https://github.com/typestack/class-transformer)
- **API Docs:** [Swagger](https://swagger.io/) (OpenAPI)
- **Security:** [Helmet](https://helmetjs.github.io/) + Rate Limiting

---

## Prerequisites

Ensure MongoDB is running. The easiest way is via Docker:

```bash
docker compose -f docker-compose.dev.yml up mongodb
```

---

## Environment Setup

1. Copy the sample environment file:

```bash
cp sample.env .env.development
```

2. Fill in the required variables:

| Variable                 | Description                       | Required |
| ------------------------ | --------------------------------- | -------- |
| `PORT`                   | API server port                   | Yes      |
| `FRONTEND_URL`           | Frontend URL for CORS             | Yes      |
| `MONGO_HOST`             | MongoDB connection host           | Yes      |
| `MONGO_DB_NAME`          | Database name                     | Yes      |
| `GOOGLE_CLIENT_ID`       | Google OAuth client ID            | Yes      |
| `GOOGLE_CLIENT_SECRET`   | Google OAuth client secret        | Yes      |
| `GOOGLE_CALLBACK_URL`    | OAuth callback URL                | Yes      |
| `JWT_SECRET`             | Access token secret               | Yes      |
| `JWT_EXPIRES_IN`         | Access token expiry (e.g., `8h`)  | Yes      |
| `COOKIE_SECURE`          | Set `true` only when HTTPS is enabled end-to-end | Yes      |
| `REFRESH_JWT_SECRET`     | Refresh token secret              | Yes      |
| `REFRESH_JWT_EXPIRES_IN` | Refresh token expiry (e.g., `7d`) | Yes      |
| `SEED_PASSWORD`          | Password for seeded users         | Yes      |
| `RECAPTCHA_ENABLED`      | Set `false` only for local/manual testing | Yes      |
| `RECAPTCHA_SECRET_KEY`   | Google reCAPTCHA secret used when reCAPTCHA is enabled | Yes      |
| `FORGOT_PASSWORD_COOLDOWN_SECONDS` | Cooldown per account between forgot-password emails | Yes |
| `FORGOT_PASSWORD_EMAIL_RATE_LIMIT_MAX_ATTEMPTS` | Max forgot-password attempts per email in the rate-limit window | Yes |
| `FORGOT_PASSWORD_EMAIL_RATE_LIMIT_WINDOW_SECONDS` | Window size for per-email forgot-password rate limiting | Yes |
| `PASSWORD_RESET_TOKEN_TTL_MINUTES` | Lifetime of reset-password token | Yes |

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env.development`

---

## Getting Started

### With Docker (Recommended)

```bash
docker compose -f docker-compose.dev.yml up --build
```

The API will be available at [http://localhost:3001/api](http://localhost:3001/api)

---

## API Documentation

Swagger documentation is available at:

```
http://localhost:3001/api/docs
```

---

## Security Notes

### HTTP and Cookie Behavior

This API may run in environments where TLS termination is not yet available at the application boundary. In those cases, authentication cookies remain configured with `secure: false` by design so browsers will continue sending them over HTTP during login and refresh flows.

This should not be interpreted as the target end state for an internet-exposed deployment. Setting `secure: true` is still the recommended posture once HTTPS is available, but enabling it before TLS exists would break authentication.

Current runtime behavior:

- `COOKIE_SECURE=false` keeps login/refresh flows working over HTTP environments.
- `COOKIE_SECURE=true` must be used in HTTPS environments so auth cookies are never sent over plaintext transport.

### reCAPTCHA Behavior

- `RECAPTCHA_ENABLED=false` is intended only for local development or manual Postman testing.
- `RECAPTCHA_ENABLED=true` requires a valid `RECAPTCHA_SECRET_KEY` and valid `recaptchaToken` values from the client.
- When reCAPTCHA is disabled locally, `mock-login`, `mock-register`, and `forgot-password` can be tested without sending `recaptchaToken`.

### Forgot-Password Abuse Controls

- Forgot-password requests are rate-limited per email based on `FORGOT_PASSWORD_EMAIL_RATE_LIMIT_MAX_ATTEMPTS` and `FORGOT_PASSWORD_EMAIL_RATE_LIMIT_WINDOW_SECONDS`.
- Forgot-password requests apply a per-account cooldown using `FORGOT_PASSWORD_COOLDOWN_SECONDS`.
- Responses remain generic to avoid account enumeration, even when limits are reached.
- Reset tokens expire according to `PASSWORD_RESET_TOKEN_TTL_MINUTES` and are invalidated after successful use.

### Compensating Controls

The current implementation relies on the following controls while HTTP remains an infrastructure constraint:

- `httpOnly` authentication cookies to reduce script-level token access.
- `sameSite: 'lax'` cookies to limit some cross-site request scenarios.
- CORS restricted to `FRONTEND_URL` in the Nest bootstrap.
- Helmet enabled for HTTP header hardening.
- Global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, and `transform` enabled.
- Explicit authorization checks for privileged user-management operations.
- Sensitive user fields excluded from standard query results by default.
- Rate limiting on file upload routes.

### Deployment Recommendation

Before exposing this API outside a trusted internal network, place it behind a reverse proxy or gateway that terminates TLS. Once HTTPS is enforced, update cookie configuration to use `secure: true`.

---

## Project Structure

```
apps/api/src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
│
├── auth/                   # Authentication module
│   ├── strategies/         # Passport strategies (Google, JWT)
│   ├── guards/             # Auth guards
│   └── config/             # Auth configuration
│
├── casl/                   # Authorization (CASL abilities)
│
├── users/                  # Users module
├── teams/                  # Teams module
├── projects/               # Projects module
├── products/               # Products module
├── events/                 # Events module
├── activities/             # Activities module
├── files/                  # File uploads module
├── catalogs/               # Catalog data (divisions, programs, etc.)
│
├── schemas/                # Mongoose schemas
├── seed/                   # Database seeding
└── common/                 # Shared utilities, decorators, pipes
```

---

## Available Scripts

| Command            | Description                 |
| ------------------ | --------------------------- |
| `pnpm dev`         | Start in watch mode         |
| `pnpm build`       | Build for production        |
| `pnpm start:prod`  | Start production server     |
| `pnpm lint`        | Run ESLint with auto-fix    |
| `pnpm test`        | Run unit tests              |
| `pnpm test:watch`  | Run tests in watch mode     |
| `pnpm test:cov`    | Run tests with coverage     |
| `pnpm test:e2e`    | Run end-to-end tests        |
| `pnpm check-types` | Type check without emitting |

---

## Database Seeding

The API includes seed data for catalogs and initial users. Seeding runs automatically on startup if the database is empty.

Seeded users use the password defined in `SEED_PASSWORD`.

---

## Learn More

- [NestJS Documentation](https://docs.nestjs.com)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [CASL Documentation](https://casl.js.org/v6/en/guide/intro)
- [Passport.js Documentation](http://www.passportjs.org/docs/)

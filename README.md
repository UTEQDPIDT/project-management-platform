# UTEQ Project Management Platform

This is a full-stack monorepo application for managing projects, products, events and related activities for the **Dirección de Posgrado Investigación y Desarrollo Tecnológico de la UTEQ**.

This repository is organized as a [Turborepo](https://turborepo.com/docs) workspace using **pnpm** as the package manager.
It includes:

- **Backend:** NestJS (runs on port `3001`)
- **Frontend:** Next.js (runs on port `3000`)
- **Shared Packages:** ESLint config, TypeScript config, and shared utilities

---

## Tech Stack

| Layer            | Tech                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend         | [Next.js](https://nextjs.org/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [TailwindCSS](https://tailwindcss.com/) |
| Backend          | [NestJS](https://nestjs.com/) + [TypeScript](https://www.typescriptlang.org/)                                                                          |
| Database         | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)                                                                              |
| Monorepo Tooling | [Turborepo](https://turbo.build/repo)                                                                                                                  |
| Package Manager  | [pnpm](https://pnpm.io)                                                                                                                                |
| Language         | TypeScript                                                                                                                                             |
| Runtime          | Node.js (v20+)                                                                                                                                         |

---

## Monorepo Structure

```bash
project-management-platform/
├── apps/
│   ├── api/                # NestJS backend
│   └── web/                # Next.js frontend
│
├── packages/
│   ├── eslint-config/      # Shared linting rules
│   ├── typescript-config/  # Shared tsconfig base
│   └── types/              # Shared types, interfaces and enums
│
├── .nvmrc                  # Node version lock
├── docker-compose.yml      # Docker compose file for production
├── docker-compose.dev.yml  # Docker compose file for development
├── turbo.json              # Turborepo configuration
├── pnpm-workspace.yaml     # pnpm workspace definition
└── README.md               # This file
```

---

## Getting Started

### 1. Install Node.js

Make sure you're using the correct Node.js version

```bash
# If you use NVM
nvm install
nvm use
```

The required Node version is defined in `.nvmrc` at the root of the project.

### 2. Install pnpm

If you don't already have `pnpm` installed globally:

```bash
npm install -g pnpm
# verify installation
pnpm -v
```

### 3. Install dependencies

At the root of the monorepo, run:

```bash
pnpm install
```

### Install Turborepo

Install turborepo repo globally:

```bash
pnpm add turbo --global
```

You can see the installation guide [here](https://turborepo.com/docs/getting-started/installation#installing-turbo)

### Install Docker Desktop and Docker Compose

You can see the installation guide for Docker Desktop [here](https://docs.docker.com/desktop/)
You can see the installation guide for Docker Compose [here](https://docs.docker.com/compose/install)

### Environment Variables

Inside each application's root there are `sample.env` files provided with the needed environment variables for development. These are empty, it is up to you to fill out these environment variables.

- `apps/api/sample.env` - Backend configuration (MongoDB, Google OAuth, JWT secrets)
- `apps/web/sample.env` - Frontend configuration (API URL, JWT secret)

### Build app for development

Once Docker Desktop and Docker Compose are installed, build the `api` and `mongodb` services for development:

```bash
docker compose -f docker-compose.dev.yml up --build
```

### Run `web` for development

Once both the `api` and `mongodb` containers are up and running, start the `web` app for local development:

```bash
turbo dev --filter=web
```

---

## Database

This project uses **MongoDB** as the database, with **Mongoose** as the ODM (Object Document Mapper) for the NestJS backend.

### Development Setup

The MongoDB instance runs as a Docker container defined in `docker-compose.dev.yml`. When you run the development containers, MongoDB will be automatically available at `mongodb://mongodb:27017`.

### Configuration

The database connection is configured via environment variables in `apps/api/.env.development`:

| Variable        | Description           | Default Value        |
| --------------- | --------------------- | -------------------- |
| `MONGO_HOST`    | MongoDB host and port | `mongodb:27017`      |
| `MONGO_DB_NAME` | Database name         | `uteq_prep_database` |

### Data Persistence

In development, MongoDB data is persisted using Docker volumes. The data will survive container restarts but will be lost if you remove the volume.

To reset the database, stop the containers and remove the volume:

```bash
docker compose -f docker-compose.dev.yml down -v
```

---

## CI/CD

This project uses GitHub Actions for continuous integration and deployment.

### Workflows

| Workflow       | File         | Trigger                 | Description                                                       |
| -------------- | ------------ | ----------------------- | ----------------------------------------------------------------- |
| **CI Verify**  | `verify.yml` | Pull requests to `main` | Runs linting and type checking on changed packages and builds app |
| **Deployment** | `deploy.yml` | Push to `main`          | Builds and deploys to production via Docker                       |

### Pull Request Checks

When you open a PR targeting `main`, the following checks run automatically:

- **Lint** — ESLint validation on affected packages
- **Type Check** — TypeScript compilation check on affected packages

Both checks use Turborepo's filtering to only run on packages that changed since `origin/main`.

### Deployment

When code is merged to `main`:

1. Environment files are created from GitHub [Secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)
2. Docker containers are built and restarted
3. MongoDB replica set is initialized (if needed)
4. Old Docker images are pruned

### Required Secrets

The following secrets must be configured in GitHub repository settings:

| Secret                    | Description                     |
| ------------------------- | ------------------------------- |
| `PORT`                    | API server port                 |
| `FRONTEND_URL`            | Frontend URL for CORS           |
| `MONGO_USER`              | MongoDB username                |
| `MONGO_PASSWORD`          | MongoDB password                |
| `MONGO_HOST`              | MongoDB host                    |
| `MONGO_DB_NAME`           | Database name                   |
| `MONGO_KEYFILE`           | MongoDB keyfile for replica set |
| `GOOGLE_CLIENT_ID`        | Google OAuth client ID          |
| `GOOGLE_CLIENT_SECRET`    | Google OAuth client secret      |
| `GOOGLE_CALLBACK_URL`     | OAuth callback URL              |
| `JWT_SECRET`              | Access token secret             |
| `JWT_EXPIRES_IN`          | Access token expiry             |
| `REFRESH_JWT_SECRET`      | Refresh token secret            |
| `REFRESH_JWT_EXPIRES_IN`  | Refresh token expiry            |
| `SEED_PASSWORD`           | Password for seeded users       |
| `NEXT_PRIVATE_JWT_SECRET` | Frontend JWT secret             |
| `BACKEND_URL`             | API URL for frontend            |

---

## Turborepo starter

### What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `web`: frontend using [Next.js](https://nextjs.org/) app
- `api`: backend using [NestJS](https://docs.nestjs.com/) as the framework
- `@repo/types`: collection of types, interfaces and enums used accross `web` and `api` for type safety
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd project-management-platform

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
pnpm exec turbo build --filter=web
```

### Develop

To develop all apps and packages, run the following command:

```
cd project-management-platform

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
pnpm exec turbo dev --filter=web
```

### Lint

To lint all packages, run the following command:

```
cd project-management-platform

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo lint

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
pnpm exec turbo lint
```

You can lint a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo lint --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
pnpm exec turbo lint --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd project-management-platform

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)

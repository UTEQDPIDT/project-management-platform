# UTEQ Project Management Platform - Web

Frontend application for the UTEQ Project Management Platform built with Next.js 16 and React 19.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (New York style)
- **Styling:** [TailwindCSS](https://tailwindcss.com/)
- **State Management:** [TanStack Query](https://tanstack.com/query) (React Query)
- **Tables:** [TanStack Table](https://tanstack.com/table)
- **Forms:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## Prerequisites

Before running the web app, ensure the following services are running:

1. **MongoDB** - Database (via Docker)
2. **API** - NestJS backend on port `3001` (via Docker)

Start both services with:

```bash
docker compose -f docker-compose.dev.yml up --build
```

---

## Environment Setup

1. Copy the sample environment file:

```bash
cp sample.env .env.development
```

2. Fill in the required variables:

| Variable                   | Description                           |
| -------------------------- | ------------------------------------- |
| `NEXT_PRIVATE_JWT_SECRET`  | JWT secret (must match API)           |
| `NEXT_PUBLIC_API_BASE_URL` | API URL (`http://localhost:3001/api`) |

---

## Getting Started

Run the development server:

```bash
turbo dev --filter=web
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── admin/          # Admin pages
│   │   └── user/           # User pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing/login page
│   └── providers.tsx       # React Query, Theme providers
│
├── src/
│   ├── components/         # UI components
│   │   ├── ui/             # shadcn/ui primitives
│   │   ├── forms/          # Form components
│   │   └── *-table.tsx     # Data table components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities
│   ├── schemas/            # Zod validation schemas
│   └── services/           # API service functions with [axios](https://axios-http.com/docs/api_intro)
│
├── context/                # React context providers
└── public/                 # Static assets
```

---

## Available Scripts

| Command            | Description                |
| ------------------ | -------------------------- |
| `pnpm dev`         | Start development server   |
| `pnpm build`       | Build for production       |
| `pnpm start`       | Start production server    |
| `pnpm lint`        | Run ESLint                 |
| `pnpm check-types` | Type check with TypeScript |

---

## Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/). To add new components:

```bash
pnpm dlx shadcn@latest add <component-name>
```

Example:

```bash
pnpm dlx shadcn@latest add button
```

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [TanStack Table](https://tanstack.com/table/latest/docs/introduction)

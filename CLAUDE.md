# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zeta is a Frontend Efficiency Platform (前端提效平台) - a full-stack monorepo with NestJS backend and Nuxt 4 frontend. It provides user authentication (JWT + OAuth), RBAC permissions, and user management.

## Tech Stack

- **Backend**: NestJS v11, PostgreSQL with Prisma ORM, Redis for caching
- **Frontend**: Nuxt 4 (SPA mode), Nuxt UI v4, Vue 3
- **Build**: pnpm monorepo
- **Deploy**: Docker Compose

## Development Commands

```bash
# Install dependencies
pnpm install

# Start all dev servers (frontend :3000, backend :3001)
pnpm dev

# Start individual services
pnpm dev:web         # Frontend only
pnpm dev:server      # Backend only

# Build
pnpm build

# Database operations
pnpm db:generate     # Generate Prisma Client
pnpm db:migrate      # Run migrations
pnpm db:seed         # Seed database

# Start database containers
pnpm docker:up       # or: docker-compose -f docker-compose.dev.yml up -d

# Prisma Studio (database UI)
pnpm --filter @zeta/server prisma studio

# Create new migration
pnpm --filter @zeta/server prisma migrate dev --name migration_name

# Create new NestJS module
cd apps/server && pnpm nest g module modules/example

# Run tests
pnpm --filter @zeta/server test              # Unit tests
pnpm --filter @zeta/server test:e2e          # E2E tests
pnpm --filter @zeta/web typecheck            # Frontend type check
```

## Architecture

### Monorepo Structure

- `apps/web` - Nuxt 4 SPA frontend (@zeta/web)
- `apps/server` - NestJS API backend (@zeta/server)
- `packages/shared` - Shared types and constants (@zeta/shared)

### Backend Modules (apps/server/src/modules/)

| Module | Purpose |
|--------|---------|
| auth | JWT authentication (access + refresh tokens) |
| oauth | GitHub and DingTalk OAuth login |
| user | User CRUD operations |
| role | RBAC role management |
| permission | Fine-grained permission control |
| prisma | Database service |
| redis | Caching service |
| mail | Email verification |

### Backend Common Patterns (apps/server/src/common/)

- **Decorators**: `@Public()` for open routes, `@Roles()` for role checks, `@Permissions()` for permission checks, `@CurrentUser()` to get authenticated user
- **Guards**: `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard`
- **Interceptors**: `TransformInterceptor` wraps all responses, `LoggingInterceptor` for request logging
- **Filters**: `HttpExceptionFilter` for unified error handling

### Frontend Structure (apps/web/app/)

- **composables/**: `useAuth` (auth state), `useApi` (API requests), `usePermissions` (permission checks)
- **layouts/**: `auth` (login pages), `dashboard` (admin panel), `default`
- **middleware/**: `auth` (login check), `admin` (admin check), `guest` (redirect if logged in)

### Key Conventions

- Backend: kebab-case files, PascalCase classes, each module has controller/service/module/dto
- Frontend: PascalCase components, composables prefixed with `use`, pages use `definePageMeta` for layout/middleware
- API docs at http://localhost:3001/api/docs (Swagger)

### Default Test Account

```
Email: admin@zeta.dev
Password: admin123
```

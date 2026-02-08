# SaaS Backend Template

Express + TypeScript + Prisma + Postgres + Redis.

## Features

- **Authentication**: JWT access/refresh tokens, bcrypt hashing.
- **RBAC**: Role-based access control (Admin, User).
- **Payments**: Stripe integration (subscriptions, webhooks).
- **Security**: Helmet, Rate Limiting, Input Sanitization, Zod Validation.
- **Database**: PostgreSQL (Prisma ORM).
- **Caching**: Redis.
- **Production Ready**: Dockerized, graceful shutdown, environment validation.

## Prerequisites

- Node.js (v18+)
- Docker & Docker Compose (optional, for containerized run)
- PostgreSQL (if running locally)
- Redis (if running locally)

## Environment Variables

Copy `.env.example` to `.env` and fill in the following:

| Variable | Description |
|---|---|
| `NODE_ENV` | `development`, `production`, `test` |
| `PORT` | API Port (default: 3000) |
| `DATABASE_URL` | PostgreSQL Connection String |
| `JWT_SECRET` | Secret for Access Tokens |
| `REFRESH_TOKEN_SECRET` | Secret for Refresh Tokens |
| `REDIS_URL` | Redis Connection String |
| `STRIPE_SECRET_KEY` | Stripe Secret Key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Sign Secret |

## Getting Started

### Method 1: Docker (Recommended)

Run the entire stack (API, Postgres, Redis) with one command:

```bash
docker compose up --build -d
```

The API will be available at `http://localhost:3000`.

To stop:
```bash
docker compose down
```

### Method 2: Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Services:**
   Ensure PostgreSQL and Redis are running.

3. **Database Setup:**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

## Production Build

To build and run without Docker:

```bash
npm run build
npm start
```

## API Documentation

- `GET /health` - System Status
- `POST /auth/register` - User Registration
- `POST /auth/login` - User Login
- `POST /api/stripe/checkout` - Create Subscription

See `src/routes` for full API definition.

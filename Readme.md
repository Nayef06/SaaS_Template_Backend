# SaaS Backend Template

Express + TypeScript + Prisma + Postgres.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Database:**
   - Copy `.env.example` to `.env`.
   - Update `DATABASE_URL` with your local Postgres connection string.
   - Sync schema:
     ```bash
     npx prisma migrate dev
     ```
   - Seed database (Roles):
     ```bash
     npx prisma db seed
     ```

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm run start
```

## API

- `GET /` - Health check (Simple)
- `GET /health` - Detailed Health Check
- `POST /auth/register` - Register
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh Token
- `POST /auth/logout` - Logout
- `GET /protected/dashboard` - Protected Example (Authenticated)
- `GET /admin/stats` - Admin Stats (Protected, Admin only)


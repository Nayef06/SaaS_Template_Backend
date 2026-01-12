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
     npx prisma db push
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

- `GET /` - Health check


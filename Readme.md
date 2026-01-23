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

3. **Redis:**
   - Ensure Redis is running locally on port `6379`.
   - Update `REDIS_URL` in `.env` if your Redis configuration differs.

4. **Stripe:**
   - Add `STRIPE_SECRET_KEY` to `.env`.
   - Seed products and prices:
     ```bash
     npx ts-node src/scripts/seed-stripe.ts
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
- `GET /health` - Detailed Health Check
- `POST /auth/register` - Register
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh Token
- `POST /auth/logout` - Logout
- `GET /protected/dashboard` - Protected Example (Authenticated)
- `GET /admin/stats` - Admin Stats (Protected, Admin only)
- `POST /api/stripe/checkout` - Create Checkout Session (Authenticated)


# SaaS Template Backend

WIP Express server with TypeScript.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs with nodemon for auto-restart on file changes.

## Production

```bash
npm run build
npm run start
```

## Configuration

Copy `.env.example` to `.env` and set your values:

```
PORT=3000
NODE_ENV=development
```

## API

- `GET /` - Health check endpoint

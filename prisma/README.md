# Database Setup

## Prerequisites

1. **PostgreSQL** installed locally or use Docker
2. **Node.js** and **npm** installed

## Quick Start with Docker (Recommended)

```bash
# Start PostgreSQL with Docker
docker run --name shader-house-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=shader_house \
  -p 5432:5432 \
  -d postgres:16-alpine

# Or use docker-compose (create docker-compose.yml in project root):
docker-compose up -d
```

## Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shader_house?schema=public"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

## Running Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# Open Prisma Studio to view/edit data
npx prisma studio
```

## Database Schema

The database includes:

- **User** model with:
  - `id` (String, CUID)
  - `email` (String, unique)
  - `name` (String)
  - `password` (String, hashed)
  - `role` (Enum: DEVELOPER | GAMER)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)

## Production Deployment

For production, use a managed PostgreSQL service:

- **Vercel**: Vercel Postgres
- **Railway**: Railway Postgres
- **Supabase**: Supabase Postgres
- **Neon**: Neon Postgres (Serverless)
- **PlanetScale**: PlanetScale (MySQL-compatible, if switching)

Update your `DATABASE_URL` environment variable with the production connection string.

## Troubleshooting

### Connection refused
- Ensure PostgreSQL is running: `docker ps` or `brew services list`
- Check port 5432 is not in use: `lsof -i :5432`

### Migration failed
- Reset database: `npx prisma migrate reset`
- Push schema without migration: `npx prisma db push`

### Prisma Client not found
- Run: `npx prisma generate`


# 🗄️ Database Setup Guide

## Overview

Shader House now uses **PostgreSQL** with **Prisma ORM** for data persistence. This replaces the previous in-memory storage.

---

## 🚀 Quick Start

### 1. Start PostgreSQL (Docker - Recommended)

```bash
# Using docker-compose (easiest)
docker-compose up -d

# Or using docker run directly
docker run --name shader-house-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=shader_house \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### 2. Set Environment Variables

The `.env` file should already exist. If not, create it:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shader_house?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

### 3. Run Database Migration

```bash
# This will create the database tables
npm run db:migrate

# When prompted for migration name, enter: init
```

### 4. Start the App

```bash
npm run dev
```

Visit `http://localhost:3000` and test registration/login! 🎉

---

## 📊 Database Schema

### User Table

| Column     | Type      | Description                    |
|------------|-----------|--------------------------------|
| id         | String    | Unique user ID (CUID)          |
| email      | String    | Unique email address           |
| name       | String    | User's display name            |
| password   | String    | Bcrypt hashed password         |
| role       | Enum      | DEVELOPER or GAMER             |
| createdAt  | DateTime  | Account creation timestamp     |
| updatedAt  | DateTime  | Last update timestamp          |

### Indexes
- `email` (unique, indexed for fast lookups)

---

## 🛠️ Available Commands

```bash
# Generate Prisma Client after schema changes
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Push schema changes without migration (dev only)
npm run db:push

# Open Prisma Studio (visual database editor)
npm run db:studio

# Seed the database (when implemented)
npm run db:seed
```

---

## 🧪 Testing the Database

### 1. Register a New User

Visit `http://localhost:3000/register` and create an account.

### 2. Check Prisma Studio

```bash
npm run db:studio
```

This opens a visual editor at `http://localhost:5555` where you can:
- View all users
- Edit data manually
- Execute queries

### 3. Test Login

Login with your newly created account at `http://localhost:3000/login`.

---

## 🔧 Troubleshooting

### "Connection refused" or "ECONNREFUSED"

**Problem**: PostgreSQL is not running.

**Solution**:
```bash
# Check if container is running
docker ps

# Start if stopped
docker-compose up -d

# Or restart
docker-compose restart
```

### "Port 5432 already in use"

**Problem**: Another PostgreSQL instance is running.

**Solution**:
```bash
# Check what's using port 5432
lsof -i :5432

# Stop other PostgreSQL
brew services stop postgresql  # macOS Homebrew
sudo systemctl stop postgresql  # Linux
```

### "Prisma Client not found"

**Problem**: Prisma Client wasn't generated.

**Solution**:
```bash
npm run db:generate
```

### Migration Failed

**Solution 1**: Reset and retry
```bash
npx prisma migrate reset
npm run db:migrate
```

**Solution 2**: Push without migration (development only)
```bash
npm run db:push
```

---

## 🌐 Production Deployment

### Recommended Services

1. **Vercel Postgres** (easiest for Vercel deploys)
   - Automatic integration
   - Serverless
   - Free tier available

2. **Railway**
   - Simple setup
   - Automatic backups
   - $5/month starter plan

3. **Supabase**
   - Built-in auth + storage
   - Real-time subscriptions
   - Free tier available

4. **Neon**
   - Serverless PostgreSQL
   - Branching database support
   - Free tier available

### Environment Variables

In your production environment, set:

```env
DATABASE_URL="postgresql://user:pass@host:port/dbname?sslmode=require"
JWT_SECRET="<generate-with-openssl-rand>"
```

### Pre-Deploy Checklist

- [ ] Update `DATABASE_URL` with production connection string
- [ ] Generate secure `JWT_SECRET`: `openssl rand -base64 32`
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Test authentication flow
- [ ] Enable SSL mode in DATABASE_URL (`sslmode=require`)

---

## 📝 Schema Changes

When you modify `prisma/schema.prisma`:

1. **Development**:
   ```bash
   npm run db:migrate
   # Give your migration a descriptive name
   ```

2. **Production**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Always commit** both:
   - `prisma/schema.prisma`
   - `prisma/migrations/*`

---

## 🔒 Security Notes

- ✅ Passwords are hashed with bcrypt (10 rounds)
- ✅ JWT tokens stored in HttpOnly cookies
- ✅ Email lookups use indexed queries
- ✅ Generic error messages prevent email enumeration
- ⚠️ Change `JWT_SECRET` in production!
- ⚠️ Use SSL for production DATABASE_URL

---

## 📚 Additional Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

---

## 🆘 Need Help?

1. Check `prisma/README.md` for detailed setup
2. Review logs: `docker-compose logs -f`
3. Inspect Prisma queries: set `log: ['query']` in `lib/db/prisma.ts`
4. Open an issue if problems persist

---

**Happy Coding! 🌲✨**


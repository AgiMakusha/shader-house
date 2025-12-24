# Database Connection Pooling Configuration

## Overview

This project uses Prisma with PostgreSQL and implements connection pooling to optimize database performance. Proper connection pooling is critical for production environments with high concurrent traffic.

## Configuration

### 1. Basic Connection Pool Settings (DATABASE_URL)

Add the following query parameters to your `DATABASE_URL` in `.env`:

```bash
# Development (moderate connection limit)
DATABASE_URL="postgresql://user:password@localhost:5432/shader_house?connection_limit=10&pool_timeout=10&connect_timeout=5"

# Production (higher connection limit)
DATABASE_URL="postgresql://user:password@host:5432/shader_house?connection_limit=20&pool_timeout=15&connect_timeout=10"
```

### 2. Query Parameter Explanation

| Parameter | Description | Development | Production |
|-----------|-------------|-------------|------------|
| `connection_limit` | Maximum number of database connections in the pool | 10 | 20-50 |
| `pool_timeout` | Maximum time (seconds) to wait for an available connection | 10 | 15 |
| `connect_timeout` | Maximum time (seconds) to establish a new connection | 5 | 10 |

### 3. Production Best Practices

For production environments with high traffic (1000+ concurrent users), consider:

#### Option A: PgBouncer (Recommended)

PgBouncer is a lightweight connection pooler that sits between your application and PostgreSQL:

```bash
# Install PgBouncer
sudo apt-get install pgbouncer

# Configure PgBouncer (example)
[databases]
shader_house = host=localhost port=5432 dbname=shader_house

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 50
```

Then update your `DATABASE_URL` to connect through PgBouncer:

```bash
DATABASE_URL="postgresql://user:password@localhost:6432/shader_house?pgbouncer=true"
```

#### Option B: External Connection Pooling Service

Use a managed connection pooling service like:
- **Supabase Pooler** (if using Supabase)
- **AWS RDS Proxy** (if using AWS RDS)
- **PlanetScale** (built-in connection pooling)
- **Neon** (built-in connection pooling)

### 4. Monitoring Connection Pool Health

Monitor your connection pool metrics in production:

```typescript
// Example: Check connection pool stats
const stats = await prisma.$queryRaw`
  SELECT * FROM pg_stat_database 
  WHERE datname = current_database()
`;
console.log('Database connections:', stats);
```

### 5. Troubleshooting

#### Too Many Connections Error

If you see `too many connections` errors:

1. **Reduce `connection_limit`** in your DATABASE_URL
2. **Implement PgBouncer** for better connection management
3. **Check for connection leaks** (ensure `prisma.$disconnect()` is called)
4. **Optimize queries** to reduce query execution time

#### Slow Query Performance

1. **Increase `pool_timeout`** to allow more time for busy connections
2. **Add database indexes** for frequently queried fields
3. **Use connection pooling** to reuse connections efficiently
4. **Monitor slow queries** with PostgreSQL logs

## Implementation Details

### Prisma Client Configuration

The Prisma client is configured as a singleton in `lib/db/prisma.ts`:

- **Development**: Reuses the same connection across hot reloads
- **Production**: Gracefully disconnects on process termination
- **Logging**: Only logs errors to avoid performance overhead

### Environment-Specific Settings

| Environment | Connection Limit | Reasoning |
|-------------|------------------|-----------|
| Development | 5-10 | Lower traffic, faster iteration |
| Staging | 10-20 | Moderate traffic, testing |
| Production | 20-50+ | High traffic, optimal performance |

## Migration Checklist

When deploying with connection pooling:

- [ ] Update `DATABASE_URL` with connection pool parameters
- [ ] Test connection pool under load (use load testing tools)
- [ ] Monitor database connection metrics in production
- [ ] Set up alerts for connection pool exhaustion
- [ ] Document connection pool settings for your team
- [ ] Consider PgBouncer for high-traffic production environments

## Additional Resources

- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [PostgreSQL Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [PgBouncer Documentation](https://www.pgbouncer.org/)
- [Next.js Database Best Practices](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)

## Performance Impact

Implementing proper connection pooling can:

- **Reduce database connection overhead** by 60-80%
- **Improve query response times** by 30-50%
- **Support 10x more concurrent users** without database errors
- **Reduce server load** by reusing connections efficiently

Always benchmark your specific workload to measure the impact.


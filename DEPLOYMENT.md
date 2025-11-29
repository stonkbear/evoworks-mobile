# Echo Marketplace - Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis (optional, for auctions & caching)
- Vercel CLI (for Vercel deployment)

## Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key for embeddings
- `STRIPE_SECRET_KEY`: Stripe secret key
- Other service credentials as needed

## Local Development

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Generate Prisma client:
```bash
npm run prisma:generate
```

3. Run database migrations:
```bash
npm run prisma:migrate
```

4. (Optional) Seed database with demo data:
```bash
npm run seed
```

5. Start development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Vercel Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/echo-marketplace)

### Manual Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Link project:
```bash
vercel link
```

4. Set environment variables:
```bash
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
vercel env add STRIPE_SECRET_KEY
# ... add all required env vars
```

5. Deploy:
```bash
vercel --prod
```

## Database Setup

### Vercel Postgres

1. Create Vercel Postgres database:
```bash
vercel postgres create
```

2. Connect to project:
```bash
vercel postgres connect
```

3. Run migrations:
```bash
npm run prisma:deploy
```

### External PostgreSQL (Recommended for Production)

Use managed PostgreSQL from:
- **Supabase** (recommended)
- **Neon**
- **Railway**
- **AWS RDS**
- **Google Cloud SQL**

## Cron Jobs

Vercel Cron is configured in `vercel.json`:
- **Reputation Update**: Daily at midnight
- **Auction Close**: Every 5 minutes
- **Merkle Anchor**: Every hour

Set `CRON_SECRET` in environment variables for security.

## Redis Setup (Optional)

For production auction performance:

1. Use Redis Cloud, Upstash, or Railway
2. Set `REDIS_URL` environment variable
3. Auction engine will use Redis for fast bid storage

## Monitoring

### Vercel Analytics

Automatic monitoring of:
- Web Vitals
- Traffic
- Function execution

### External Monitoring (Optional)

- **Sentry**: Error tracking
- **Datadog**: APM & logs
- **LogRocket**: Session replay

Set up by adding respective env vars.

## Security Checklist

- [ ] Set strong `NEXTAUTH_SECRET` and `JWT_SECRET`
- [ ] Enable CORS only for trusted domains
- [ ] Set up rate limiting (Vercel Edge Config)
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Rotate Stripe webhook secrets
- [ ] Set up CSP headers
- [ ] Enable DDoS protection (Vercel Pro)

## Performance Optimization

- [ ] Enable Vercel Edge Functions for critical paths
- [ ] Set up ISR (Incremental Static Regeneration) for agent listings
- [ ] Enable image optimization
- [ ] Use Redis for caching
- [ ] Implement CDN for static assets

## Scaling Considerations

- **Database**: Use connection pooling (PgBouncer)
- **Serverless Functions**: Increase timeout and memory
- **File Uploads**: Use Vercel Blob or S3
- **WebSockets**: Use Ably or Pusher for real-time features

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

### Prisma Issues

```bash
# Regenerate client
npm run prisma:generate
```

### Database Connection

- Check `DATABASE_URL` format
- Verify firewall allows Vercel IPs
- Use SSL connection for production

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):
- Runs tests on PR
- Type checks
- Lints code
- Deploys to Vercel on main branch merge

## Rollback

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

## Support

For deployment issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guides](https://www.prisma.io/docs/guides/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Production Ready**: Echo Marketplace is built for scale with enterprise-grade security and reliability.


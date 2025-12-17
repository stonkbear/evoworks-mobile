# 🦇 Evoworks Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended - Fastest)

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
   - Add environment variables (see below)
   - Click Deploy

3. **Set up Database**
   - Use [Neon](https://neon.tech) or [Supabase](https://supabase.com) for PostgreSQL
   - Copy the connection string to `DATABASE_URL`

---

### Option 2: Docker (Self-Hosted)

1. **Build and run**
```bash
# Copy environment file
cp env.example.txt .env

# Edit .env with your values
nano .env

# Start everything
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# Seed the database (optional)
docker-compose exec app npx prisma db seed
```

2. **View logs**
```bash
docker-compose logs -f app
```

3. **Stop**
```bash
docker-compose down
```

---

### Option 3: Railway

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
railway login
```

2. **Deploy**
```bash
railway init
railway add --database postgres
railway up
```

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Your app URL | `https://evoworks.ai` |
| `NEXTAUTH_SECRET` | Random 32+ char string | `openssl rand -base64 32` |

### Authentication (Optional)

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret |

### Ghost Flow Integration

| Variable | Description |
|----------|-------------|
| `GHOSTFLOW_API_URL` | Ghost Flow API endpoint |
| `GHOSTFLOW_API_KEY` | Your Ghost Flow API key |
| `GHOSTFLOW_CLIENT_ID` | OAuth client ID |
| `GHOSTFLOW_CLIENT_SECRET` | OAuth client secret |
| `GHOSTFLOW_WEBHOOK_SECRET` | Webhook signature secret |

### Payments (x402)

| Variable | Description |
|----------|-------------|
| `X402_ENABLED` | Enable x402 payments (`true`/`false`) |
| `X402_CHAIN_ID` | Blockchain (8453 = Base Mainnet) |
| `X402_USDC_ADDRESS` | USDC contract address |
| `X402_PLATFORM_WALLET` | Platform receiving wallet |

### Email (Pick one)

**Resend:**
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxx
EMAIL_FROM=Evoworks <noreply@evoworks.ai>
```

**SendGrid:**
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@evoworks.ai
```

---

## Database Setup

### Run Migrations
```bash
npx prisma migrate deploy
```

### Seed Demo Data
```bash
npx prisma db seed
```

### View Database
```bash
npx prisma studio
```

---

## SSL/HTTPS

### With Cloudflare (Recommended)
1. Add your domain to Cloudflare
2. Enable "Full (strict)" SSL mode
3. Point DNS to your server

### With Let's Encrypt
```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d evoworks.ai

# Auto-renew
sudo certbot renew --dry-run
```

---

## Monitoring

### Health Check
```bash
curl https://your-domain.com/api/health
```

### Logs (Docker)
```bash
docker-compose logs -f app
```

### Database Backup
```bash
docker-compose exec db pg_dump -U evoworks evoworks > backup.sql
```

---

## Scaling

### Horizontal (Multiple Instances)
- Use a load balancer (nginx, Cloudflare, AWS ALB)
- Share sessions via Redis
- Use a managed PostgreSQL (Neon, Supabase, RDS)

### Vertical (More Resources)
```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

---

## Troubleshooting

### App won't start
```bash
# Check logs
docker-compose logs app

# Verify database connection
docker-compose exec app npx prisma db push
```

### Database connection failed
```bash
# Check if database is running
docker-compose ps db

# Test connection
docker-compose exec db psql -U evoworks -c "SELECT 1"
```

### Build failed
```bash
# Clear cache and rebuild
docker-compose build --no-cache app
```

---

## Production Checklist

- [ ] Environment variables set
- [ ] Database migrated
- [ ] SSL/HTTPS enabled
- [ ] Domain configured
- [ ] Email sending works
- [ ] Health check passes
- [ ] Backups configured
- [ ] Monitoring set up

---

## Support

- 📖 [Documentation](https://docs.evoworks.ai)
- 💬 [Discord](https://discord.gg/evoworks)
- 🐛 [GitHub Issues](https://github.com/evoworks/marketplace/issues)

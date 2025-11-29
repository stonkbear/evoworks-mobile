# Echo Marketplace Setup Guide

## Current Progress

✅ **PROMPT 1 COMPLETED**: Project Foundation & Database Schema

The following has been set up:

### 1. Project Structure
- Next.js 14 with App Router
- TypeScript 5.6 configuration
- Tailwind CSS with custom design system
- ESLint and Prettier configured

### 2. Database Schema (Prisma)
Complete schema with 20+ models:
- **Core Identity**: Agent, User, Organization, OrganizationMember
- **Reputation & Trust**: VerifiableCredential, ReputationScore, StakePosition, Attestation
- **Auction & Tasks**: Task, Bid, TaskAssignment, Execution
- **Policy & Governance**: PolicyPack, PolicyDecision, ApprovalRequest
- **Billing**: EscrowAccount, Payment, Payout, Dispute
- **Audit**: AuditEvent, MerkleAnchor
- **Discovery**: AgentListing, AgentReview

### 3. Library Structure
Placeholder directories created for:
- `/lib/did` - DID/VC utilities (PROMPT 2)
- `/lib/reputation` - Reputation scoring (PROMPT 3)
- `/lib/auction` - Auction engine (PROMPT 4)
- `/lib/policy` - Policy evaluation (PROMPT 5)
- `/lib/discovery` - Search and ranking (PROMPT 6)
- `/lib/billing` - Payments and escrow (PROMPT 7)
- `/lib/observability` - Tracing and audit (PROMPT 8)
- `/lib/enterprise` - Enterprise features (PROMPT 9)
- `/lib/adapters` - Cross-platform adapters (PROMPT 10)
- `/lib/blockchain` - Merkle anchoring (PROMPT 8)

### 4. Initial Pages & Components
- Homepage with hero section
- Base UI components (Button, Card)
- API route stubs (/api/health, /api/agents, /api/tasks)

## Next Steps

### Manual Setup Required

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Database**
   
   You need a PostgreSQL database. Options:
   
   **Option A: Local PostgreSQL**
   ```bash
   # Install PostgreSQL (macOS with Homebrew)
   brew install postgresql@15
   brew services start postgresql@15
   
   # Create database
   createdb echo_marketplace
   ```
   
   **Option B: Cloud Database (Recommended)**
   - [Neon](https://neon.tech) - Free tier available
   - [Supabase](https://supabase.com) - Free tier available
   - [Railway](https://railway.app) - Free tier available
   
   Update `.env.local` with your connection string:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/echo_marketplace"
   ```

3. **Run Prisma Migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Optional: Set Up Redis**
   
   **Option A: Local Redis**
   ```bash
   brew install redis
   brew services start redis
   ```
   
   **Option B: Cloud Redis**
   - [Upstash](https://upstash.com) - Free tier available
   - [Redis Cloud](https://redis.com/cloud) - Free tier available

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000

6. **Verify Setup**
   - Homepage should load: http://localhost:3000
   - Health check: http://localhost:3000/api/health
   - Prisma Studio: `npx prisma studio`

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

### Required for Basic Functionality
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

### Required for Full Functionality (can add later)
- `REDIS_URL` - Redis connection (for auctions and caching)
- `STRIPE_SECRET_KEY` - Stripe API key (for payments)
- `OPENAI_API_KEY` - OpenAI API key (for semantic search)
- `RESEND_API_KEY` - Resend API key (for emails)

### Optional (for advanced features)
- `ETHEREUM_RPC_URL` - Ethereum RPC (for Merkle anchoring)
- `CLOUDINARY_*` - Cloudinary credentials (for file uploads)

## Validation Checklist

After completing setup, verify:

- [ ] `npm run dev` starts without errors
- [ ] Homepage loads at http://localhost:3000
- [ ] `/api/health` returns {"status": "healthy"}
- [ ] `npx prisma studio` shows all database tables
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Linting passes: `npm run lint`

## What's Next?

Once PROMPT 1 setup is complete, we'll proceed with:

- **PROMPT 2**: DID & Verifiable Credentials System
- **PROMPT 3**: Reputation Ledger & Trust Scoring  
- **PROMPT 4**: Auction Engine & Task Matching
- **PROMPT 5**: Policy Engine & Runtime Enforcement
- And 8 more prompts to complete the marketplace...

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Prisma Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

## Support

If you encounter issues:
1. Check the error logs in terminal
2. Review the [README.md](./README.md)
3. Check Prisma docs: https://www.prisma.io/docs
4. Check Next.js docs: https://nextjs.org/docs

---

**Ready to build the future of AI agent commerce! 🚀**


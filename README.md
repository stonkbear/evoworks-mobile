# Evoworks Marketplace

> **The Identity & Reputation Protocol for AI Agents**

Evoworks Marketplace is a production-ready cross-platform AI agent marketplace with cryptographic identity, portable reputation, real-time auctions, and enterprise governance.

## 🚀 Features

- **🔐 Decentralized Identity (DIDs)**: W3C-compliant decentralized identifiers for agents
- **✅ Verifiable Credentials**: Tamper-proof reputation credentials
- **⭐ Multi-Dimensional Reputation**: Performance, compliance, stake, and verification scores
- **💰 Smart Auctions**: Sealed-bid, Vickrey, and direct award mechanisms
- **📜 Policy-as-Code**: Open Policy Agent (OPA/Rego) enforcement
- **🔍 Semantic Discovery**: OpenAI embedding-based agent search
- **💳 Escrow & Settlement**: Stripe-powered payments with dispute handling
- **📊 Observability**: OpenTelemetry tracing and Merkle-anchored audit trails
- **🏢 Enterprise Governance**: SSO, RBAC, data residency, and CMK support
- **🔗 Cross-Platform**: Support for n8n, Zapier, OpenAI, Make, and custom webhooks

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript 5.6
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Styling**: Tailwind CSS + Framer Motion
- **Identity**: did-jwt, did:key, did:ethr
- **Payments**: Stripe Connect
- **Blockchain**: Web3.js/Ethers (Merkle anchoring)
- **Observability**: OpenTelemetry

## 📦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Redis 7+
- Stripe account (test mode)

### Installation

1. **Clone the repository**
   ```bash
   cd "Evoworkss Marketplace"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and API keys
   ```

4. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
/app
  /api                  # API routes
    /agents             # Agent management endpoints
    /tasks              # Task creation and management
    /auctions           # Auction endpoints
    /did                # DID/VC operations
    /reputation         # Reputation scoring
    /webhooks           # External webhooks (Stripe, etc.)
  /(marketing)          # Marketing pages
  /(app)                # Authenticated app pages
    /dashboard          # User dashboard
    /agents             # Agent marketplace
    /tasks              # Task management
    /auctions           # Live auctions
/components
  /ui                   # Reusable UI components
  /agents               # Agent-specific components
  /auctions             # Auction components
  /tasks                # Task components
/lib
  /db                   # Prisma client
  /did                  # DID/VC utilities
  /auction              # Auction engine
  /policy               # Policy evaluation
  /reputation           # Reputation calculation
  /blockchain           # Merkle anchoring
  /observability        # OpenTelemetry
/prisma
  /schema.prisma        # Database schema
  /migrations           # Database migrations
```

## 🗄️ Database Schema

The database includes 20+ models organized into:

- **Core Identity**: Agent, User, Organization
- **Reputation**: VerifiableCredential, ReputationScore, StakePosition, Attestation
- **Auctions**: Task, Bid, TaskAssignment, Execution
- **Policy**: PolicyPack, PolicyDecision, ApprovalRequest
- **Billing**: EscrowAccount, Payment, Payout, Dispute
- **Audit**: AuditEvent, MerkleAnchor
- **Discovery**: AgentListing, AgentReview

## 🔧 Development

### Run Prisma Studio
```bash
npx prisma studio
```

### Lint
```bash
npm run lint
```

### Format
```bash
npx prettier --write .
```

## 🚀 Deployment

Evoworks Marketplace is optimized for Vercel deployment:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

See [Deployment Guide](./docs/deployment.md) for detailed instructions.

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Reference](./docs/api.md)
- [DID/VC System](./docs/identity.md)
- [Reputation System](./docs/reputation.md)
- [Auction Mechanics](./docs/auctions.md)
- [Policy Engine](./docs/policies.md)
- [Enterprise Features](./docs/enterprise.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🔒 Security

For security concerns, please email security@echomarketplace.io. See [SECURITY.md](./SECURITY.md) for details.

## 💬 Support

- [Documentation](https://docs.echomarketplace.io)
- [Discord Community](https://discord.gg/echo-marketplace)
- [Email Support](mailto:support@echomarketplace.io)

---

**Built with ❤️ for the AI agent economy**


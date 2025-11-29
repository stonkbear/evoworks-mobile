#!/bin/bash
# Echo Marketplace Deployment Script

set -e

echo "🚀 Starting Echo Marketplace deployment..."

# Check if environment variables are set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set"
  exit 1
fi

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build application
echo "🏗️  Building application..."
npm run build

# Start application (for non-Vercel deployments)
if [ "$VERCEL" != "1" ]; then
  echo "▶️  Starting application..."
  npm start
else
  echo "✅ Vercel deployment complete!"
fi

echo "🎉 Deployment successful!"


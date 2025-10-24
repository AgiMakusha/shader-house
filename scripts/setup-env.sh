#!/bin/bash

# Setup environment variables for Shader House

echo "🌲 Shader House - Database Setup"
echo ""

# Check if .env exists
if [ -f .env ]; then
  echo "⚠️  .env file already exists"
  read -p "Do you want to overwrite it? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled"
    exit 0
  fi
fi

# Create .env file
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shader_house?schema=public"

# JWT Secret (change this to a random string in production)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
EOF

echo "✅ .env file created"
echo ""
echo "📝 Next steps:"
echo "1. Start PostgreSQL (via Docker or local install)"
echo "2. Run: npm run db:migrate"
echo "3. Run: npm run dev"
echo ""
echo "🐳 To start PostgreSQL with Docker:"
echo "   docker run --name shader-house-postgres \\"
echo "     -e POSTGRES_PASSWORD=postgres \\"
echo "     -e POSTGRES_DB=shader_house \\"
echo "     -p 5432:5432 \\"
echo "     -d postgres:16-alpine"


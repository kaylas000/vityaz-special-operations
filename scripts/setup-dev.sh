#!/bin/bash

# VITYAZ Development Setup Script
# Run this once to setup local development environment

set -e

echo "🚀 VITYAZ: Special Operations - Development Setup"
echo "=====================================================\n"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "${YELLOW}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "${RED}❌ Node.js not found. Please install Node.js 20+${NC}"
    exit 1
fi
echo "${GREEN}✅ Node.js $(node --version)${NC}"

# Check Docker
echo "\n${YELLOW}Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo "${RED}❌ Docker not found. Please install Docker${NC}"
    exit 1
fi
echo "${GREEN}✅ Docker $(docker --version)${NC}"

# Install dependencies
echo "\n${YELLOW}Installing dependencies...${NC}"
npm ci
echo "${GREEN}✅ Dependencies installed${NC}"

# Create .env
echo "\n${YELLOW}Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo "${GREEN}✅ Created .env file${NC}"
    echo "${YELLOW}⚠️  Edit .env with your configuration${NC}"
else
    echo "${GREEN}✅ .env already exists${NC}"
fi

# Create logs directory
mkdir -p logs
echo "${GREEN}✅ Created logs directory${NC}"

# Create uploads directory
mkdir -p uploads
echo "${GREEN}✅ Created uploads directory${NC}"

# Install pre-commit hooks
echo "\n${YELLOW}Setting up Git hooks...${NC}"
npx husky install
echo "${GREEN}✅ Git hooks installed${NC}"

echo "\n${GREEN}====================================================="
echo "✅ Development setup complete!"
echo "======================================================${NC}\n"

echo "${YELLOW}Next steps:${NC}"
echo "1. Edit .env with your configuration"
echo "2. Run: make docker-up"
echo "3. Run: make db-migrate"
echo "4. Run: npm run dev"
echo ""
echo "${YELLOW}Documentation:${NC}"
echo "- Getting Started: GETTING_STARTED.md"
echo "- Deployment: DEPLOYMENT.md"
echo "- Action Items: ACTION_ITEMS.md"
echo ""

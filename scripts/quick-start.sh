#!/bin/bash

# VITYAZ Quick Start - Run everything in one command

set -e

echo "🚀 VITYAZ: Quick Start - Full Setup"
echo "===================================\n"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Development setup
echo "${YELLOW}[1/4] Setting up development environment...${NC}"
bash scripts/setup-dev.sh

# Step 2: Docker setup
echo ""
echo "${YELLOW}[2/4] Starting Docker services...${NC}"
make docker-up
sleep 10

# Step 3: Database setup
echo ""
echo "${YELLOW}[3/4] Setting up database...${NC}"
make db-migrate
npm run prisma:seed

# Step 4: Testing setup
echo ""
echo "${YELLOW}[4/4] Setting up testing...${NC}"
bash scripts/test-setup.sh

echo ""
echo "${GREEN}==================================="
echo "✅ Quick start complete!"
echo "===================================${NC}\n"

echo "${YELLOW}What's next:${NC}"
echo "1. Deploy contracts: bash scripts/deploy-contracts.sh"
echo "2. Start backend: npm run start:dev"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Visit: http://localhost:3000 (frontend)"
echo "         http://localhost:3001 (backend)"

# VITYAZ: Special Operations - Makefile
# One-command deployment helper

.PHONY: help install docker-up docker-down db-migrate db-seed dev test build deploy-testnet clean ton-compile ton-deploy contracts

help:
	@echo "VITYAZ: Special Operations - Available Commands"
	@echo "================================================"
	@echo ""
	@echo "📦 DEPENDENCIES"
	@echo "  make install        - Install all dependencies"
	@echo ""
	@echo "🐳 DOCKER"
	@echo "  make docker-up      - Start Docker services (PostgreSQL, Redis)"
	@echo "  make docker-down    - Stop Docker services"
	@echo ""
	@echo "🗄️  DATABASE"
	@echo "  make db-migrate     - Run database migrations"
	@echo "  make db-seed        - Seed database with test data"
	@echo ""
	@echo "🚀 DEVELOPMENT"
	@echo "  make dev            - Show how to start dev servers (manual)"
	@echo "  make test           - Run all unit tests (backend + frontend)"
	@echo "  make build          - Build for production"
	@echo ""
	@echo "⛓️  BLOCKCHAIN (TON/Ethereum/Solana)"
	@echo "  make ton-compile    - Compile TON FunC contracts to .boc"
	@echo "  make ton-deploy     - Deploy compiled contracts (requires testnet setup)"
	@echo "  make contracts      - Show contract status and paths"
	@echo ""
	@echo "🚢 DEPLOYMENT"
	@echo "  make deploy-testnet - Full testnet deployment pipeline"
	@echo "  make clean          - Clean all build artifacts"
	@echo ""
	@echo "🎯 QUICK START"
	@echo "  make quickstart     - Install + Docker + DB setup (one command!)"
	@echo ""

install:
	@echo "📦 Installing dependencies..."
	npm install
	cd backend && npm install
	cd frontend && npm install
	@echo "✅ Dependencies installed"

docker-up:
	@echo "🐳 Starting Docker services..."
	docker-compose up -d
	@echo "⏳ Waiting for services to be ready..."
	sleep 10
	@echo "✅ Docker services running (PostgreSQL on 5432, Redis on 6379)"

docker-down:
	@echo "🐳 Stopping Docker services..."
	docker-compose down
	@echo "✅ Docker services stopped"

db-migrate:
	@echo "🗄️  Running database migrations..."
	cd backend && npx prisma migrate deploy
	@echo "✅ Migrations complete"

db-seed:
	@echo "🌱 Seeding database..."
	cd backend && npx prisma db seed
	@echo "✅ Database seeded"

dev:
	@echo "🚀 Starting development servers..."
	@echo ""
	@echo "📍 URLs:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:3001"
	@echo "  Docs:     http://localhost:3001/docs"
	@echo ""
	@echo "📋 Open 2 terminals and run:"
	@echo "  Terminal 1: cd frontend && npm run dev"
	@echo "  Terminal 2: cd backend && npm run start:dev"
	@echo ""

test:
	@echo "🧪 Running all unit tests..."
	cd backend && npm test -- --coverage
	cd frontend && npm test -- --coverage
	@echo "✅ All tests passed"

test-watch:
	@echo "🧪 Running tests in watch mode..."
	cd backend && npm run test:watch

build:
	@echo "🏗️  Building for production..."
	cd backend && npm run build
	cd frontend && npm run build
	@echo "✅ Build complete"

# ⛓️  BLOCKCHAIN TARGETS
ton-compile:
	@echo "⛓️  Compiling TON FunC contracts..."
	@if command -v func >/dev/null 2>&1; then \
		./scripts/compile-ton-contracts.sh; \
		@echo "✅ TON contracts compiled to contracts/ton/build/"; \
	else \
		@echo "❌ 'func' binary not found!"; \
		@echo "📖 Install TON toolchain: https://ton.org/docs/#/func"; \
		@echo "   Or run: brew install ton-cli (macOS)"; \
		false; \
	fi

ton-deploy:
	@echo "⛓️  Deploying to TON testnet..."
	@echo "📖 See ACTION_ITEMS.md section 1.1 for manual deployment steps."
	@echo "   This target requires: ton-cli installed + testnet wallet setup"
	@echo ""
	@echo "Quick steps:"
	@echo "  1. Install ton-cli: brew install ton-cli"
	@echo "  2. Create testnet wallet: tonlib wallet init testnet"
	@echo "  3. Compile first: make ton-compile"
	@echo "  4. Deploy VityazToken: tonlib deploy testnet contracts/ton/build/VityazToken.boc"
	@echo "  5. Save contract address to .env.testnet"

contracts:
	@echo "⛓️  VITYAZ Smart Contracts Status"
	@echo "================================="
	@echo ""
	@echo "📁 FunC Source Files (TON):"
	@echo "  - contracts/ton/VityazToken.fc (ERC-20 equivalent)"
	@echo "  - contracts/ton/marketplace.func (NFT trading)"
	@echo "  - contracts/ton/staking.func (Staking rewards)"
	@echo ""
	@echo "📁 Solidity Contracts (Ethereum):"
	@echo "  - contracts/ethereum/VityazToken.sol"
	@echo "  - contracts/ethereum/NFTMarketplace.sol"
	@echo ""
	@echo "📁 Rust Programs (Solana):"
	@echo "  - contracts/solana/programs/vityaz_token/"
	@echo ""
	@echo "🔧 Compilation:"
	@echo "  - make ton-compile    (compile FunC to Fift/.boc)"
	@echo "  - make ton-deploy     (deploy to TON testnet)"
	@echo ""

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf backend/dist
	rm -rf frontend/dist
	rm -rf contracts/ton/build
	rm -rf backend/coverage
	rm -rf frontend/coverage
	@echo "✅ Cleaned"

# Quick start - Run everything
quickstart: install docker-up db-migrate db-seed
	@echo ""
	@echo "🎉 VITYAZ is ready for local development!"
	@echo "========================================="
	@echo ""
	@echo "📋 Next steps:"
	@echo "  1. Start development servers:"
	@echo "     Terminal 1: cd frontend && npm run dev"
	@echo "     Terminal 2: cd backend && npm run start:dev"
	@echo ""
	@echo "  2. Open browser: http://localhost:3000"
	@echo ""
	@echo "  3. View API docs: http://localhost:3001/docs"
	@echo ""
	@echo "  4. Run tests: make test"
	@echo ""
	@echo "  5. Deploy contracts: make ton-compile && make ton-deploy"
	@echo ""

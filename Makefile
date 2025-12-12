.PHONY: help install dev build test docker-up docker-down clean

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help:
	@echo "$(GREEN)VITYAZ: Special Operations - Development Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Setup & Installation:$(NC)"
	@echo "  make install          Install all dependencies"
	@echo "  make install-frontend Install frontend only"
	@echo "  make install-backend  Install backend only"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@echo "  make dev              Start dev servers (frontend + backend)"
	@echo "  make dev-frontend     Start frontend dev server"
	@echo "  make dev-backend      Start backend dev server"
	@echo ""
	@echo "$(YELLOW)Build:$(NC)"
	@echo "  make build            Build all projects"
	@echo "  make build-frontend   Build frontend only"
	@echo "  make build-backend    Build backend only"
	@echo ""
	@echo "$(YELLOW)Testing:$(NC)"
	@echo "  make test             Run all tests"
	@echo "  make test-frontend    Test frontend only"
	@echo "  make test-backend     Test backend only"
	@echo ""
	@echo "$(YELLOW)Docker:$(NC)"
	@echo "  make docker-up        Start Docker containers"
	@echo "  make docker-down      Stop Docker containers"
	@echo "  make docker-logs      View Docker logs"
	@echo "  make docker-clean     Remove containers & volumes"
	@echo ""
	@echo "$(YELLOW)Database:$(NC)"
	@echo "  make db-migrate       Run database migrations"
	@echo "  make db-seed          Seed database"
	@echo ""
	@echo "$(YELLOW)Blockchain:$(NC)"
	@echo "  make deploy-ton       Deploy TON contracts"
	@echo "  make deploy-eth       Deploy Ethereum contracts"
	@echo "  make deploy-sol       Deploy Solana programs"
	@echo ""
	@echo "$(YELLOW)Utilities:$(NC)"
	@echo "  make lint             Lint all code"
	@echo "  make clean            Clean all build artifacts"
	@echo "  make reset            Full clean & reinstall"

# Installation
install:
	@echo "$(GREEN)Installing all dependencies...$(NC)"
	npm install

install-frontend:
	@echo "$(GREEN)Installing frontend dependencies...$(NC)"
	cd frontend && npm install

install-backend:
	@echo "$(GREEN)Installing backend dependencies...$(NC)"
	cd backend && npm install

# Development
dev:
	@echo "$(GREEN)Starting development servers...$(NC)"
	npm run dev

dev-frontend:
	@echo "$(GREEN)Starting frontend dev server (port 3000)...$(NC)"
	cd frontend && npm run dev

dev-backend:
	@echo "$(GREEN)Starting backend dev server (port 3001)...$(NC)"
	cd backend && npm run start:dev

# Building
build:
	@echo "$(GREEN)Building all projects...$(NC)"
	npm run build

build-frontend:
	@echo "$(GREEN)Building frontend...$(NC)"
	cd frontend && npm run build

build-backend:
	@echo "$(GREEN)Building backend...$(NC)"
	cd backend && npm run build

# Testing
test:
	@echo "$(GREEN)Running all tests...$(NC)"
	npm run test

test-frontend:
	@echo "$(GREEN)Testing frontend...$(NC)"
	cd frontend && npm run test

test-backend:
	@echo "$(GREEN)Testing backend...$(NC)"
	cd backend && npm run test

# Linting
lint:
	@echo "$(GREEN)Linting code...$(NC)"
	npm run lint

# Docker operations
docker-up:
	@echo "$(GREEN)Starting Docker containers...$(NC)"
	docker-compose up -d
	@echo "$(YELLOW)PostgreSQL: localhost:5432$(NC)"
	@echo "$(YELLOW)Redis: localhost:6379$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:3001$(NC)"

docker-down:
	@echo "$(GREEN)Stopping Docker containers...$(NC)"
	docker-compose down

docker-logs:
	@echo "$(GREEN)Viewing Docker logs...$(NC)"
	docker-compose logs -f

docker-clean:
	@echo "$(RED)Removing containers and volumes...$(NC)"
	docker-compose down -v
	@echo "$(GREEN)Done!$(NC)"

# Database
db-migrate:
	@echo "$(GREEN)Running database migrations...$(NC)"
	npm --workspace=backend run prisma:migrate

db-seed:
	@echo "$(GREEN)Seeding database...$(NC)"
	npm --workspace=backend run prisma:seed

# Blockchain deployments
deploy-ton:
	@echo "$(GREEN)Deploying TON contracts...$(NC)"
	npm --workspace=contracts run deploy:ton

deploy-eth:
	@echo "$(GREEN)Deploying Ethereum contracts...$(NC)"
	npm --workspace=contracts run deploy:eth

deploy-sol:
	@echo "$(GREEN)Deploying Solana programs...$(NC)"
	npm --workspace=contracts run deploy:sol

# Utilities
clean:
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf dist build .next out

reset:
	@echo "$(RED)Full reset: removing node_modules and reinstalling...$(NC)"
	rm -rf node_modules frontend/node_modules backend/node_modules contracts/node_modules
	npm install
	@echo "$(GREEN)Reset complete!$(NC)"

.DEFAULT_GOAL := help
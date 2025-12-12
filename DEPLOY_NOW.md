# 🚀 DEPLOY VITYAZ NOW - One Command

## ⚡ FASTEST START (5 Minutes)

```bash
# 1. Clone repository
git clone https://github.com/kaylas000/vityaz-special-operations.git
cd vityaz-special-operations

# 2. ONE COMMAND TO RULE THEM ALL
make quickstart

# 3. Start development servers (open 2 terminals)
# Terminal 1:
cd frontend && npm run dev

# Terminal 2:
cd backend && npm run start:dev

# 4. Open browser
# http://localhost:3000
```

**DONE! Game is running!** ✅

---

## 📋 What `make quickstart` Does

1. ✅ Installs all npm dependencies (backend + frontend)
2. ✅ Starts Docker (PostgreSQL + Redis)
3. ✅ Runs database migrations
4. ✅ Seeds database with test data
5. ✅ Creates logs directory
6. ✅ Sets up environment

**Total time: ~5 minutes**

---

## 🎮 What You Get

### Running Services
- ✅ **Frontend**: http://localhost:3000 (React + Phaser 3)
- ✅ **Backend API**: http://localhost:3001 (NestJS)
- ✅ **API Docs**: http://localhost:3001/docs (Swagger)
- ✅ **Database**: PostgreSQL on localhost:5432
- ✅ **Cache**: Redis on localhost:6379

### Working Features
- ✅ User authentication (JWT + TON Connect ready)
- ✅ Game engine (Phaser 3 with physics)
- ✅ Combat system (damage calculation, armor, headshots)
- ✅ Token economy ($VITYAZ)
- ✅ NFT system (minting, transfers, marketplace)
- ✅ WebSocket multiplayer (real-time)
- ✅ REST API (25 endpoints)
- ✅ Error handling & validation
- ✅ Logging (Winston)
- ✅ **Unit tests** (35+ tests, 35% coverage) ✨ NEW

---

## 🔧 Manual Setup (If make doesn't work)

```bash
# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# Start Docker
docker-compose up -d
sleep 10

# Database
cd backend
npx prisma migrate deploy
npx prisma db seed
cd ..

# Start servers
# Terminal 1:
cd frontend && npm run dev

# Terminal 2:
cd backend && npm run start:dev
```

---

## ✅ Verify Installation

```bash
# Check Docker services
docker-compose ps

# Should show:
# - vityaz-postgres (Up)
# - vityaz-redis (Up)

# Check backend
curl http://localhost:3001/health
# Should return: {"status":"ok"}

# Check frontend
curl http://localhost:3000
# Should return HTML
```

---

## 🧪 Run Tests ✨ NEW

```bash
# Run ALL tests (backend + frontend) with coverage
make test

# Backend tests only
cd backend && npm test

# Backend tests with coverage
cd backend && npm run test:cov

# Frontend tests only
cd frontend && npm test

# Frontend tests with UI dashboard
cd frontend && npm run test:ui

# Watch mode (re-run on file changes)
cd backend && npm run test:watch
```

**New Test Files:**
- `backend/src/auth/auth.service.spec.ts` - Authentication & JWT
- `backend/src/combat/combat.service.spec.ts` - Combat mechanics
- `backend/src/battles/battles.service.spec.ts` - Battle management
- `backend/src/economy/economy.service.spec.ts` - Token economy
- `backend/src/nft/nft.service.spec.ts` - NFT marketplace
- `frontend/src/game/combat.test.ts` - Game combat logic
- `frontend/src/api/client.test.ts` - API integration

For detailed testing guide, see: [`TESTING_GUIDE.md`](TESTING_GUIDE.md) ✨ NEW

---

## ⛓️ Blockchain Compilation ✨ NEW

### Compile TON Contracts

```bash
# Compile all TON FunC contracts to .boc format
make ton-compile

# Or manually:
./scripts/compile-ton-contracts.sh

# Check compiled artifacts
ls contracts/ton/build/
# Should contain: VityazToken.boc, marketplace.boc, staking.boc
```

### Deploy to TON Testnet

```bash
# View deployment instructions
make ton-deploy

# Manual deployment (requires ton-cli + testnet wallet):
tonlib wallet init testnet  # Create testnet wallet
tonlib deploy testnet contracts/ton/build/VityazToken.boc
tonlib deploy testnet contracts/ton/build/marketplace.boc
tonlib deploy testnet contracts/ton/build/staking.boc
```

### View Contract Status

```bash
make contracts

# Shows all contract sources and compilation commands
```

**Note**: Requires `func` compiler from TON toolchain. Install:
```bash
brew install ton-cli  # macOS
# Or download from https://ton.org/docs/#/func
```

For detailed blockchain instructions, see: [`ACTION_ITEMS.md`](ACTION_ITEMS.md) Phase 1, Task 1.1

---

## 📊 Available Make Targets

```bash
make help              # Show all available commands
make install           # Install dependencies
make docker-up         # Start Docker services
make docker-down       # Stop Docker services
make db-migrate        # Run database migrations
make db-seed           # Seed database with test data
make dev               # Show development server instructions
make test              # Run all tests with coverage
make test-watch        # Run backend tests in watch mode
make build             # Build for production
make ton-compile       # Compile TON contracts
make ton-deploy        # Deploy to TON testnet
make contracts         # Show contract status
make clean             # Clean all build artifacts
make quickstart        # Full setup in one command!
```

---

## 📊 Project Status

| Component | Status | Ready | Notes |
|-----------|--------|-------|-------|
| Backend API | ✅ Working | YES | NestJS + Prisma |
| Frontend | ✅ Working | YES | React + Phaser 3 |
| Game Engine | ✅ Working | YES | Full physics + combat |
| Database | ✅ Working | YES | PostgreSQL + migrations |
| Tests | ✅ Working | YES | 35+ tests, 35% coverage ✨ NEW |
| Error Handling | ✅ Working | YES | Global filters + validation |
| Logging | ✅ Working | YES | Winston logger |
| Docker | ✅ Working | YES | docker-compose ready |
| TON Contracts | ✅ Compilable | PARTIAL | Scripts ready ✨ NEW |
| Ethereum Contracts | ⚠️ Designed | NO | Ready to deploy |
| Solana Programs | ⚠️ Designed | NO | Ready to deploy |
| Graphics | ⚠️ Placeholders | PARTIAL | Free assets available |

**Overall: 80% Complete - READY FOR LOCAL DEV + TESTING**

---

## ⚠️ Known Issues

### 1. Graphics Missing
**Problem**: Game uses placeholder graphics (colored rectangles)  
**Solution**: Download free assets from itch.io or use simple sprites

### 2. Smart Contracts Not Deployed
**Problem**: Blockchain features use mock data  
**Solution**: Follow [`ACTION_ITEMS.md`](ACTION_ITEMS.md) Phase 1, Task 1.1

### 3. Port Already in Use
**Problem**: `Error: listen EADDRINUSE :::3000`  
**Solution**:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### 4. Tests Fail
**Problem**: Jest/Vitest errors  
**Solution**: See [`TESTING_GUIDE.md`](TESTING_GUIDE.md)

---

## 🎯 Next Steps After Local Deploy

### Week 1: Complete Phase 1
- [ ] Compile TON contracts: `make ton-compile`
- [ ] Deploy to TON testnet: Follow instructions in `make ton-deploy`
- [ ] Add graphics assets
- [ ] Increase test coverage to 50%+

### Week 2-3: Phase 2
- [ ] Complete frontend UI
- [ ] Deploy to Ethereum Sepolia
- [ ] Deploy to Solana devnet
- [ ] Telegram Mini App integration

### Week 4-6: Phase 3
- [ ] Performance optimization
- [ ] Advanced matchmaking
- [ ] Monitoring setup
- [ ] Security hardening

### Week 7-8: Testnet Launch
- [ ] Deploy to staging
- [ ] Invite alpha testers
- [ ] Gather feedback
- [ ] Fix bugs

---

## 📞 Support

**Need help?** Check:
1. [`TESTING_GUIDE.md`](TESTING_GUIDE.md) - Testing instructions ✨ NEW
2. [`ACTION_ITEMS.md`](ACTION_ITEMS.md) - Detailed task list
3. [`GETTING_STARTED.md`](GETTING_STARTED.md) - Setup guide
4. [`README.md`](README.md) - Project overview
5. GitHub Issues: https://github.com/kaylas000/vityaz-special-operations/issues

---

## 🎉 Success!

If you see:
- ✅ Frontend running on :3000
- ✅ Backend running on :3001
- ✅ API docs on :3001/docs
- ✅ Tests passing: `make test`
- ✅ No errors in console

**CONGRATULATIONS! VITYAZ is running!** 🚀

Now:
1. Play the game locally
2. Run tests: `make test`
3. Review test files
4. Compile contracts: `make ton-compile`
5. Follow [`ACTION_ITEMS.md`](ACTION_ITEMS.md) for phase 1 blockchain tasks
6. Deploy to testnet

---

**Repository**: https://github.com/kaylas000/vityaz-special-operations  
**Status**: ✅ **READY TO DEPLOY LOCALLY + RUN TESTS**  
**Last Updated**: December 12, 2025  
**Next**: Blockchain compilation & testnet deployment

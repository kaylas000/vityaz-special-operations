# 🚀 VITYAZ Deployment Checklist

## Pre-Launch Checklist

### Phase 1: Local Development (5 minutes)
- [ ] Clone repository
- [ ] Install dependencies: `make install`
- [ ] Start Docker: `make docker-up`
- [ ] Run migrations: `make db-migrate`
- [ ] Start servers: `npm run dev`
- [ ] Verify: Frontend on 3000, Backend on 3001

### Phase 2: Testnet Deployment (1 week)

#### Smart Contracts
- [ ] Compile TON contracts
- [ ] Deploy to TON testnet
- [ ] Get contract addresses
- [ ] Test token transfers
- [ ] Compile Ethereum contracts
- [ ] Deploy to Sepolia testnet
- [ ] Deploy to Solana devnet

#### Backend
- [ ] Create .env.testnet
- [ ] Add contract addresses to config
- [ ] Setup TON Connect
- [ ] Setup Telegram bot testnet version
- [ ] Run database migrations
- [ ] Seed test data
- [ ] Deploy to staging server
- [ ] Setup CloudFlare DNS
- [ ] Configure SSL (Let's Encrypt)

#### Frontend
- [ ] Update API_URL to staging
- [ ] Update VITE_TON_NETWORK to testnet
- [ ] Add graphics assets
- [ ] Build for production: `npm run build`
- [ ] Deploy to staging
- [ ] Test on mobile

#### Testing
- [ ] Test authentication
- [ ] Test battle system
- [ ] Test token rewards
- [ ] Test NFT minting
- [ ] Test marketplace
- [ ] Test staking
- [ ] Load test: 100 concurrent users
- [ ] Security scan

### Phase 3: Production Mainnet (6-12 weeks)

#### Security
- [ ] Security audit (CertiK or Trail of Bits)
- [ ] Fix critical issues
- [ ] Fix high-priority issues
- [ ] Formal contract verification
- [ ] Penetration testing
- [ ] Code review (all code)

#### Blockchain
- [ ] Deploy to TON mainnet
- [ ] Deploy to Ethereum mainnet
- [ ] Deploy to Solana mainnet
- [ ] Setup liquidity pools
- [ ] Register on CoinGecko
- [ ] Update contract addresses in code

#### Infrastructure
- [ ] Setup AWS/Azure/GCP account
- [ ] Create VPC and security groups
- [ ] Setup RDS PostgreSQL
- [ ] Setup ElastiCache Redis
- [ ] Setup Lambda/Fargate for autoscaling
- [ ] Configure load balancer
- [ ] Setup CloudFlare WAF
- [ ] Configure DDoS protection
- [ ] Setup SSL/TLS
- [ ] Configure CDN

#### Monitoring & Logging
- [ ] Setup Prometheus
- [ ] Setup Grafana dashboards
- [ ] Setup ELK Stack
- [ ] Setup PagerDuty alerts
- [ ] Setup Sentry error tracking
- [ ] Setup APM (DataDog/New Relic)
- [ ] Configure log retention

#### Operations
- [ ] Write runbooks
- [ ] Setup automated backups
- [ ] Setup backup verification
- [ ] Configure disaster recovery
- [ ] Setup secrets management
- [ ] Configure auto-scaling
- [ ] Setup canary deployments
- [ ] Write incident response procedures

#### Compliance
- [ ] Write Terms of Service
- [ ] Write Privacy Policy
- [ ] Implement cookie consent
- [ ] Setup KYC/AML (if needed)
- [ ] Setup bug bounty program
- [ ] Review legal requirements by region

#### Performance
- [ ] Optimize database queries
- [ ] Setup caching (Redis)
- [ ] Optimize frontend bundle
- [ ] Enable gzip compression
- [ ] Optimize images
- [ ] Load test: 10,000 concurrent users
- [ ] Achieve <200ms API response time
- [ ] Achieve >99% uptime

#### Final Validation
- [ ] All systems operational
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance targets met
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Team trained
- [ ] Communication plan ready

---

## Environment Variables Checklist

### .env.development
```
✓ DATABASE_URL
✓ REDIS_URL
✓ JWT_SECRET
✓ TON_NETWORK=testnet
✓ TON_MNEMONIC
✓ CORS_ORIGIN=*
```

### .env.staging
```
✓ DATABASE_URL (staging DB)
✓ REDIS_URL (staging Redis)
✓ JWT_SECRET (unique)
✓ TON_NETWORK=testnet
✓ TON_TOKEN_ADDRESS
✓ TON_MARKETPLACE_ADDRESS
✓ TON_STAKING_ADDRESS
✓ ETH_NETWORK=sepolia
✓ ETH_RPC_URL
✓ ETH_TOKEN_ADDRESS
✓ CORS_ORIGIN=https://staging.vityaz.game
✓ SENTRY_DSN
```

### .env.production
```
✓ NODE_ENV=production
✓ LOG_LEVEL=info
✓ DATABASE_URL (production DB, encrypted)
✓ REDIS_URL (production Redis, encrypted)
✓ JWT_SECRET (strong, >32 chars)
✓ TON_NETWORK=mainnet
✓ TON_MNEMONIC (ENCRYPTED)
✓ TON_TOKEN_ADDRESS (mainnet)
✓ TON_MARKETPLACE_ADDRESS (mainnet)
✓ TON_STAKING_ADDRESS (mainnet)
✓ ETH_NETWORK=mainnet
✓ ETH_RPC_URL (Infura/Alchemy key)
✓ ETH_PRIVATE_KEY (ENCRYPTED)
✓ SOLANA_NETWORK=mainnet
✓ SOLANA_RPC_URL
✓ SOLANA_TOKEN_ADDRESS
✓ CORS_ORIGIN=https://vityaz.game
✓ SENTRY_DSN
✓ DATADOG_API_KEY
✓ CLOUDFLARE_API_TOKEN
```

---

## Database Migration Checklist

- [ ] Run Prisma migrations
  ```bash
  npx prisma migrate deploy
  ```

- [ ] Verify schema
  ```bash
  npx prisma db pull
  ```

- [ ] Seed test data
  ```bash
  npx prisma db seed
  ```

- [ ] Backup production database before migration
  ```bash
  pg_dump vityaz_prod > backup_$(date +%s).sql
  ```

- [ ] Test rollback procedure
  ```bash
  git checkout main~1
  npx prisma migrate resolve --rolled-back
  ```

---

## Deployment Commands

### Local Development
```bash
make install
make docker-up
make db-migrate
make dev
```

### Staging Deployment
```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Push to registry
docker push your-registry/vityaz-backend:latest
docker push your-registry/vityaz-frontend:latest

# Deploy to staging
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Verify
curl https://staging.vityaz.game/api/health
```

### Production Deployment
```bash
# Tag release
git tag -a v1.0.0 -m "Production Release"
git push origin v1.0.0

# Build and push
docker build -t your-registry/vityaz-backend:v1.0.0 -f backend/Dockerfile .
docker build -t your-registry/vityaz-frontend:v1.0.0 -f frontend/Dockerfile .
docker push your-registry/vityaz-backend:v1.0.0
docker push your-registry/vityaz-frontend:v1.0.0

# Deploy with Kubernetes
kubectl apply -f k8s/deployment.yaml
kubectl rollout status deployment/vityaz-backend -n production

# Verify
curl https://api.vityaz.game/api/health
```

---

## Testing Checklist Before Launch

### Unit Tests
- [ ] >80% code coverage
- [ ] All business logic tested
- [ ] All edge cases covered
- [ ] All error paths tested

### Integration Tests
- [ ] Database integration
- [ ] Redis integration
- [ ] WebSocket integration
- [ ] TON contract interaction
- [ ] Ethereum contract interaction
- [ ] API endpoints

### E2E Tests
- [ ] User registration
- [ ] User login
- [ ] Battle flow
- [ ] Token transfer
- [ ] NFT minting
- [ ] Marketplace trade
- [ ] Staking

### Load Tests
- [ ] 100 concurrent users
- [ ] 1000 concurrent users
- [ ] 10,000 concurrent users
- [ ] WebSocket stress test
- [ ] Database connection pool
- [ ] Redis cache hit rate >90%

### Security Tests
- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked
- [ ] CSRF protection working
- [ ] Rate limiting working
- [ ] JWT validation working
- [ ] DDoS mitigation working
- [ ] Contract audit passed

---

## Monitoring Checklist

### Real-time Metrics
- [ ] API response time (<200ms target)
- [ ] Error rate (<0.1% target)
- [ ] Database query time
- [ ] Redis hit rate
- [ ] CPU usage
- [ ] Memory usage
- [ ] Disk usage
- [ ] Network throughput

### Alerts
- [ ] Error rate spike
- [ ] Database down
- [ ] Redis down
- [ ] API timeout
- [ ] High memory usage
- [ ] High CPU usage
- [ ] Low disk space
- [ ] Certificate expiration

### Logging
- [ ] Application logs (DEBUG, INFO, WARN, ERROR)
- [ ] Access logs
- [ ] Error logs
- [ ] Contract interaction logs
- [ ] Security audit logs
- [ ] Log retention: 30 days

---

## Rollback Plan

### For Code
```bash
# If deployment fails
git revert <commit-hash>
git push origin main

# Redeploy
docker-compose -f docker-compose.prod.yml up -d
```

### For Database
```bash
# Restore from backup
pg_restore -d vityaz_prod backup.sql

# Revert migration
npx prisma migrate resolve --rolled-back
```

### For Contracts
```bash
# Update contract address
# Update .env
# Restart backend
# Clear Redis cache
redis-cli FLUSHALL
```

---

## Go-Live Checklist (24 Hours Before)

- [ ] All tests passing
- [ ] All security issues resolved
- [ ] All performance targets met
- [ ] Backups verified
- [ ] Runbooks reviewed
- [ ] Team trained
- [ ] Monitoring configured
- [ ] Alerting verified
- [ ] Communication plan ready
- [ ] Support staff ready
- [ ] Incident response team on-call
- [ ] Marketing ready

---

## Post-Launch (First Week)

- [ ] Monitor 24/7
- [ ] Fix critical bugs immediately
- [ ] Track metrics
- [ ] Gather user feedback
- [ ] Performance tuning
- [ ] Security monitoring
- [ ] Update documentation
- [ ] Post-mortem on any issues

---

**Last Updated:** December 2025  
**Status:** 🟡 **In Progress**  
**Estimated Time:** 8-12 weeks to production
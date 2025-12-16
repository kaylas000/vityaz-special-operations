# 🔗 ETHEREUM DEPLOYMENT - QUICK START

**Статус:** 🔴 BLOCKED  
**Время:** 2-3 часа  
**Бюджет:** $50-100

---

## 📋 При Пнередра ОуНор

```bash
# 1. Hardhat install
cd contracts/ethereum
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers

# 2. Init project
npx hardhat
# Нажать Enter (Create empty hardhat.config.js)

# 3. Настроить .env
cat > .env << 'EOF'
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0xyour_key
ETHERSCAN_API_KEY=your_key
EOF
```

## 🗣️ Получить ресурсы

- **Infura Key**: https://www.infura.io/ (Sign Up → Create App)
- **Test ETH**: https://sepoliafaucet.com/
- **API Key**: https://etherscan.io/apis

## 🚀 Компиляция

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

## 📚 Обновить адреса

**backend/src/config/contracts.ts:**
```typescript
export const ETHEREUM_CONTRACTS = {
  vityazToken: '0x...', // from deploy output
  vityazNFT: '0x...'
};
```

## ✅ Проверить

- 🔍 https://sepolia.etherscan.io/address/0x...
- ✅ "Проверено"
- ✅ Код виден


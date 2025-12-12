# 🚀 VITYAZ: Quick Start Guide

## ⚡ Запуск за 5 минут

### 1. Требования
- Node.js 20+
- Docker & Docker Compose
- Git

### 2. Клонирование и установка

```bash
# Клонируйте репозиторий
git clone https://github.com/kaylas000/vityaz-special-operations.git
cd vityaz-special-operations

# Скопируйте .env
cp backend/.env.example backend/.env

# Запустите Docker
docker-compose up -d

# Установите зависимости
npm install

# Запустите миграции
cd backend
npm run prisma:migrate:deploy
npm run prisma:seed
cd ..
```

### 3. Запуск приложения

```bash
# Terminal 1 - Frontend
cd frontend
npm run dev
# http://localhost:3000

# Terminal 2 - Backend
cd backend
npm run start:dev
# http://localhost:3001
```

### 4. Проверка

✅ Frontend: http://localhost:3000  
✅ Backend: http://localhost:3001  
✅ API Docs: http://localhost:3001/api/docs  
✅ Database: postgresql://localhost:5432  
✅ Redis: redis://localhost:6379  

### 5. Запуск тестов

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## 🎮 Основные команды

```bash
# Docker
docker-compose up -d      # Запустить
docker-compose down       # Остановить
docker-compose logs -f    # Логи

# Backend
npm run start:dev         # Dev режим
npm run build             # Продакшн сборка
npm test                  # Тесты
npm run prisma:studio    # БД UI

# Frontend
npm run dev               # Dev режим
npm run build             # Продакшн сборка
npm test                  # Тесты
```

---

## 📊 Структура проекта

```
vityaz-special-operations/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── modules/      # Бизнес логика
│   │   ├── common/       # Глобальные фильтры и логгирование
│   │   └── __tests__/    # Unit тесты (новые!)
│   └── prisma/           # Database ORM
├── frontend/             # React + Phaser
│   ├── src/
│   │   ├── scenes/       # Игровые сцены (с графикой!)
│   │   ├── components/   # React компоненты
│   │   └── __tests__/    # Unit тесты (новые!)
│   └── index.html
├── contracts/            # Smart contracts
│   ├── ton/              # TON contracts
│   ├── ethereum/         # Solidity contracts
│   └── solana/           # Rust programs
├── scripts/              # Automation scripts
└── docs/                 # Documentation
```

---

## ✨ Что готово в этой версии

✅ **Backend (75%)**
- REST API с 25+ endpoints
- WebSocket multiplayer
- Token economy
- NFT система
- Error handling & Logging
- Unit tests (30+)

✅ **Frontend (80%)**
- Phaser 3 game engine
- Combat система
- Placeholder графика
- HUD display
- Unit tests (15+)

✅ **Infrastructure**
- Docker ready
- Database (PostgreSQL)
- Caching (Redis)
- CI/CD prepared

❌ **Требует доделки**
- Smart contracts (deploy)
- Профессиональная графика
- Security audit
- Production servers

---

## 🔧 Развертывание на Production

### 1. Разверните Smart Contracts
```bash
cd contracts/ton
# Следуйте инструкциям в DEPLOYMENT.md
```

### 2. Настройте .env
```bash
# Обновите backend/.env с:
- TON_TOKEN_ADDRESS
- TON_MARKETPLACE_ADDRESS
- TON_STAKING_ADDRESS
- Ethereum и Solana адреса
```

### 3. Запустите на сервере
```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker push your-registry/vityaz-frontend:latest
docker push your-registry/vityaz-backend:latest
```

---

## 📚 Документация

- `ACTION_ITEMS.md` - Полный список работ
- `DEPLOYMENT.md` - Инструкции развертывания
- `SMART_CONTRACTS.md` - Контракты
- `GAMEPLAY.md` - Механика игры
- `CRYPTOECONOMICS.md` - Экономика токена

---

## 🤝 Получить помощь

- Issues: https://github.com/kaylas000/vityaz-special-operations/issues
- Discussions: https://github.com/kaylas000/vityaz-special-operations/discussions
- Docs: https://github.com/kaylas000/vityaz-special-operations/wiki

---

## 🎯 Следующие шаги

1. ✅ Запустите локально
2. 🎮 Играйте в игру
3. 🧪 Запустите тесты
4. 🚀 Разверните контракты
5. 📦 Deploy на production

---

**Status:** 🟡 **ALPHA - READY TO DEPLOY**  
**Completion:** 63% → 80%+  
**Last Updated:** December 12, 2025

# 📊 ПЛАН РЕАЛИЗАЦИИ НЕдОСТАГОЩИХ КОМПОНЕНТОВ

**Дата:** 16 декабря 2025  
**Автор:** Development Team  
**Версия:** 1.0 FINAL  
**Осталось:** 15-20% проекта

---

## 🌟 ОБЩАЯ ИНФОРМАЦИЯ

### НЕОЧНА НЕ СДЕЛАНО

| Вид | Кол-во | Приоритет | Время | Стоимость |
|--------|---------|-----------|-------|-----------|
| **Blockchain** | 3 сети | 🔴 CRITICAL | 5-7 дней | $500-1K |
| **Графика** | 50+ ассетов | 🟠 ВЫСОКИЙ | 3-5 дней | $1.5K-2.5K |
| **Audio** | 20+ стацион | 🟡 СРЕДНИЙ | 2-3 дня | $800-1.2K |
| **Security Audit** | 1 аудит | 🟠 ВЫСОКИЙ | 2-3 недели | $5K-15K |
| **Monitoring** | 5 систем | 🟠 ВЫСОКИЙ | 1 неделя | $200-500/мес |
| **Features** | 12+ фичей | 🟡 СРЕДНИЙ | 4-6 недель | $5K-10K |
| **Тестирование** | 80+ тестов | 🟡 СРЕДНИЙ | 2-3 недели | $0-3K |

**ИТОГО:** Около 15-20% проекта осталось

---

## 🔴 ФАЗА 1: КРИТИЧЕСКИЕ ЗАДАЧИ (НЕДЕЛЯ 1)

### 1.1 ⬜ BLOCKCHAIN DEPLOYMENT

**Статус:** ❌ 0% (БЛОКИРУЕТ ВСЁ)

#### TON Blockchain

**Файлы для работы:**
```
contracts/ton/
├── VityazToken.fc
├── Marketplace.fc
├── Staking.func
├── deploy.ts
└── tests/
```

**Шаг 1.1.1: Подготовка окружения**
```bash
# Установить TON CLI
npm install -g @ton-cli/cli
npm install ton ton-core ton-crypto

# Инициализировать wallet
tonlib wallet init testnet

# Запросить testnet tokens с faucet
# https://testnet-faucet.toncenter.com/
```

**Шаг 1.1.2: Компилирование контрактов**
```bash
cd contracts/ton

# Компилировать VityazToken
fift -s compile.fif VityazToken.fc
# Результат: VityazToken.boc, VityazToken.fif

# Компилировать Marketplace
fift -s compile.fif Marketplace.fc
# Результат: Marketplace.boc, Marketplace.fif

# Компилировать Staking
fift -s compile.fif Staking.func
# Результат: Staking.boc, Staking.fif
```

**Шаг 1.1.3: Развертывание на testnet**
```bash
# Deploy VityazToken
tonlib deploy testnet VityazToken.boc
# Запомнить адрес контракта!
# Пример: EQCv_SfVCNCQ5GGr5MsKVxO0J8zd0LJgPaJ4rX8sQ3F6K2cK

# Deploy Marketplace
tonlib deploy testnet Marketplace.boc

# Deploy Staking
tonlib deploy testnet Staking.boc
```

**Шаг 1.1.4: Тестирование**
```bash
# Перевести токены
tonlib transfer \
  --to <CONTRACT_ADDRESS> \
  --amount 100 \
  --payload "test"

# Проверить на tonscan.org
```

**Шаг 1.1.5: Документирование**
```bash
# Создать файл deploy-results.json
cat > contracts/ton/deploy-results.json << 'EOF'
{
  "network": "testnet",
  "date": "2025-12-16",
  "contracts": {
    "token": "EQCv_SfVCNCQ5GGr5MsKVxO0J8zd0LJgPaJ4rX8sQ3F6K2cK",
    "marketplace": "EQDz...",
    "staking": "EQE6..."
  },
  "wallet": "UQAhE...",
  "balance": "1.5 TON"
}
EOF

# Обновить .env
echo "TON_TOKEN_ADDRESS=EQCv_SfVCNCQ5GGr5MsKVxO0J8zd0LJgPaJ4rX8sQ3F6K2cK" >> .env
echo "TON_MARKETPLACE_ADDRESS=EQDz..." >> .env
echo "TON_STAKING_ADDRESS=EQE6..." >> .env
```

**Временная оценка:** 3-4 часа  
**Стоимость:** $100-200 (gas fees)  
**Тесты:** Проверить на tonscan.org

---

#### Ethereum Deployment

**Файлы:**
```
contracts/ethereum/
├── VityazToken.sol
├── VityazNFT.sol
├── hardhat.config.js
├── scripts/deploy.js
└── tests/
```

**Шаг 1.1.6: Hardhat setup**
```bash
cd contracts/ethereum

# Установить Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat

# Выбрать "Create a TypeScript project"
```

**Шаг 1.1.7: Конфигурация Sepolia**
```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY
  }
};
```

**Шаг 1.1.8: Развертывание**
```bash
# Получить testnet ETH
# https://sepoliafaucet.com/

# Скомпилировать
npx hardhat compile

# Deploy на Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

**Временная оценка:** 2-3 часа  
**Стоимость:** $50-100  
**Верификация:** https://sepolia.etherscan.io/

---

#### Solana Deployment

**Файлы:**
```
contracts/solana/
├── programs/
│   ├── token/
│   ├── staking/
│   └── marketplace/
├── Anchor.toml
└── tests/
```

**Шаг 1.1.9: Anchor setup**
```bash
cd contracts/solana

# Установить Anchor
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli

# Инициализировать проект
anchor init token-program
```

**Шаг 1.1.10: Конфигурация devnet**
```bash
# Установить Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Переключиться на devnet
solana config set --url devnet

# Создать keypair
solana-keygen new

# Получить SOL
solana airdrop 1
```

**Шаг 1.1.11: Build and Deploy**
```bash
# Скомпилировать
anchor build

# Deploy на devnet
anchor deploy --provider.cluster devnet

# Результат: program ID в Anchor.toml
```

**Временная оценка:** 2-3 часа  
**Стоимость:** $0 (бесплатно)  
**Верификация:** https://explorer.solana.com/

---

### 1.2 🎸 ГРАФИКА И АНИМАЦИИ

**Статус:** ⚠️ 40% (Placeholder готов, нужна профессиональная)

#### Спрайты персонажей

**Что создать:**
```
gfx/sprites/
├── player/
│   ├── idle.png (32x64, 4 кадра)
│   ├── run.png (32x64, 6 кадров)
│   ├── shoot.png (32x64, 4 кадра)
│   └── death.png (32x64, 4 кадра)
├── enemies/
│   ├── terrorist_1.png
│   ├── terrorist_2.png
│   └── terrorist_3.png
└── weapons/
    ├── rifle.png
    ├── pistol.png
    └── knife.png
```

**Вариант 1: DIY (если бюджет ограничен)**
```bash
# Использовать свободные ассеты
# Сайты: itch.io, OpenGameArt.org, Kenney.nl

# Или создать в Piskel (бесплатно)
# https://www.piskelapp.com/

# Или в Aseprite ($20)
# https://www.aseprite.org/
```

**Вариант 2: Заказать (профессионально)**
```
Freelance платформы:
- Fiverr ($200-500 за набор спрайтов)
- Upwork ($50-150 за час)
- ArtStation ($500-2000 за проект)
```

**Шаг 1.2.1: Загрузить в проект**
```bash
# Скопировать файлы
cp ~/downloads/sprites/* frontend/public/assets/sprites/

# Обновить BattleScene.ts
# Заменить placeholder графику
```

**Шаг 1.2.2: Оптимизация**
```bash
# Сжать PNG
cd frontend/public/assets/sprites/
for f in *.png; do
  pngquant --ext .png --force "$f"
done

# Результат: файлы сжаты на 40-60%
```

**Временная оценка:** 3-5 дней  
**Стоимость:** $0-2,500  
**Формат:** PNG 32-bit с альфа каналом

---

### 1.3 🔈 AUDIO И ЗВУКОВЫЕ ЭФФЕКТЫ

**Статус:** ⚠️ 40% (Система готова, звуков нет)

#### Необходимые звуки

```
audio/
├── sfx/
│   ├── weapon_fire.mp3
│   ├── weapon_reload.mp3
│   ├── explosion.mp3
│   ├── hit.mp3
│   ├── death.mp3
│   └── ui_click.mp3
├── music/
│   ├── menu_theme.mp3
│   ├── battle_track_1.mp3
│   ├── battle_track_2.mp3
│   └── victory.mp3
└── ambient/
    ├── outdoor.mp3
    ├── indoor.mp3
    └── wind.mp3
```

**Вариант 1: Свободные звуки**
```
Сайты:
- Freesound.org
- Zapsplat.com
- BBC Sound Effects Library
```

**Вариант 2: Заказать**
```
Средняя стоимость:
- 10 SFX: $200-500
- 3 музыкальных трека: $300-1000
```

**Шаг 1.3.1: Интеграция**
```typescript
// frontend/src/services/AudioService.ts
export class AudioService {
  private sounds = new Map<string, HTMLAudioElement>();
  
  load() {
    this.sounds.set('fire', new Audio('/audio/sfx/weapon_fire.mp3'));
    this.sounds.set('explosion', new Audio('/audio/sfx/explosion.mp3'));
    this.sounds.set('death', new Audio('/audio/sfx/death.mp3'));
  }
  
  play(name: string) {
    this.sounds.get(name)?.play();
  }
}
```

**Временная оценка:** 2-3 дня  
**Стоимость:** $300-1,000  
**Формат:** MP3 128kbps или OGG

---

## 🟠 ФАЗА 2: ВЫСОКИЙ ПРИОРИТЕТ (НЕДЕЛЯ 2-3)

### 2.1 🔒 SECURITY AUDIT

**Статус:** ❌ 0% (КРИТИЧНО для production)

#### Что аудировать

1. **Smart Contracts (TON, Ethereum, Solana)**
   - Проверка математики
   - Проверка overflow/underflow
   - Проверка прав доступа
   - Стоимость: $2K-5K

2. **Backend API (NestJS)**
   - Authentication bypass
   - SQL injection
   - Rate limiting
   - Стоимость: $1K-3K

3. **Frontend (React)**
   - XSS уязвимости
   - CSRF защита
   - Input validation
   - Стоимость: $500-1K

#### Как найти аудитора

```
Платформы:
- Immunefi ($1K-10K)
- Code4rena ($500-5K)
- Trail of Bits ($10K+)
- OpenZeppelin ($5K+)
```

**Шаг 2.1.1: Подготовка**
```bash
# Создать отдельную ветку
git checkout -b security/audit-preparation

# Добавить комментарии к коду
# Создать security.md с объяснением архитектуры
# Подготовить скрипты для тестирования
```

**Временная оценка:** 2-3 недели  
**Стоимость:** $5K-15K  
**Результат:** Аудит-репорт + рекомендации

---

### 2.2 📊 MONITORING & OBSERVABILITY

**Статус:** ❌ 0% (Нужно для production)

#### Компоненты

**Prometheus (метрики)**
```bash
npm install prom-client
```

**backend/src/metrics/prometheus.ts**
```typescript
import { register, Counter, Histogram } from 'prom-client';

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code']
});

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export const metricsRoute = (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
};
```

**Grafana (визуализация)**
```bash
# Добавить в docker-compose.yml
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3002:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_storage:/var/lib/grafana
```

**Sentry (error tracking)**
```bash
npm install @sentry/node
```

**backend/src/main.ts**
```typescript
import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });
}
```

**Временная оценка:** 1 неделя  
**Стоимость:** $200-500/месяц  
**Dashboards:** Request rate, Response time, Error rate

---

### 2.3 🤖 ADVANCED FEATURES

**Статус:** ⚠️ 20% (Базовые готовы)

#### Features для реализации

| Feature | Файлы | Время | Сложность |
|---------|-------|-------|----------|
| **Clan System** | 4-5 файлов | 3 дня | Средняя |
| **Tournament** | 6-8 файлов | 4 дня | Высокая |
| **Battle Pass** | 3-4 файла | 2 дня | Средняя |
| **Trading Market** | 5-6 файлов | 4 дня | Высокая |
| **Spectator Mode** | 2-3 файла | 2 дня | Средняя |
| **Replay System** | 4-5 файлов | 3 дня | Высокая |

**Шаг 2.3.1: Clan System (Пример)**

**backend/src/modules/clan/**
```typescript
// clan.entity.ts
@Entity()
export class Clan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => User, u => u.clanOwner)
  owner: User;

  @ManyToMany(() => User)
  members: User[];

  @Column({ type: 'jsonb', default: {} })
  stats: {
    wins: number;
    losses: number;
    level: number;
  };
}

// clan.service.ts
@Injectable()
export class ClanService {
  constructor(@InjectRepository(Clan) private repo: Repository<Clan>) {}

  async create(name: string, owner: User): Promise<Clan> {
    return this.repo.save({
      name,
      owner,
      members: [owner],
      stats: { wins: 0, losses: 0, level: 1 }
    });
  }

  async joinClan(user: User, clan: Clan): Promise<void> {
    clan.members.push(user);
    await this.repo.save(clan);
  }

  async leaveClan(user: User, clan: Clan): Promise<void> {
    clan.members = clan.members.filter(m => m.id !== user.id);
    await this.repo.save(clan);
  }
}

// clan.controller.ts
@Controller('clans')
export class ClanController {
  constructor(private clanService: ClanService) {}

  @Post()
  async create(@Body() dto: CreateClanDto, @Req() req): Promise<Clan> {
    return this.clanService.create(dto.name, req.user);
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @Req() req): Promise<void> {
    const clan = await this.clanService.findOne(id);
    await this.clanService.joinClan(req.user, clan);
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Clan> {
    return this.clanService.findOne(id);
  }
}
```

**Временная оценка:** 4-6 недель  
**Стоимость:** $5K-10K  
**Приоритет:** 🟡 Средний

---

## 🟡 ФАЗА 3: ТЕСТИРОВАНИЕ И ОПТИМИЗАЦИЯ (НЕДЕЛЯ 4-5)

### 3.1 📝 РАСШИРЕННОЕ ТЕСТИРОВАНИЕ

**Статус:** ⚠️ 30% (Unit tests готовы, нужны E2E и load tests)

#### E2E Tests (Playwright)

```bash
npm install -D @playwright/test
```

**frontend/tests/e2e/battle.spec.ts**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Battle Scenario', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should login and enter battle', async ({ page }) => {
    // Login
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'password123');
    await page.click('[type="submit"]');
    
    // Wait for game
    await page.waitForNavigation();
    expect(page.url()).toContain('/game');

    // Enter battle
    await page.click('[data-testid="join-battle"]');
    await page.waitForSelector('[data-testid="game-canvas"]');

    // Test shooting
    await page.click('[data-testid="game-canvas"]');
    const score = await page.textContent('[data-testid="score"]');
    expect(score).not.toBe('0');
  });

  test('should handle game over', async ({ page }) => {
    // ... setup code ...
    
    // Wait for game over
    await page.waitForSelector('[data-testid="game-over"]', { timeout: 120000 });
    
    // Check results
    const finalScore = await page.textContent('[data-testid="final-score"]');
    expect(parseInt(finalScore)).toBeGreaterThan(0);
  });
});
```

**Запуск тестов:**
```bash
npx playwright test
npx playwright test --headed  # С браузером
npx playwright test --debug   # Отладка
```

#### Load Tests (k6)

```bash
npm install -D k6
```

**load-tests/battle.js**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp-up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 0 },     // Ramp-down to 0 users
  ],
};

export default function () {
  // Login
  const loginRes = http.post('http://localhost:3001/auth/login', {
    username: `user${__VU}`,
    password: 'password123',
  });

  const token = loginRes.json('token');

  // Join battle
  const battleRes = http.post(
    'http://localhost:3001/battle/join',
    { gameMode: 'deathmatch' },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  check(battleRes, {
    'status is 200': (r) => r.status === 200,
    'battle created': (r) => r.json('battleId') !== null,
  });

  sleep(1);
}
```

**Запуск:**
```bash
k6 run load-tests/battle.js
```

**Цели:**
- ✅ 100 одновременных пользователей
- ✅ <200ms API response time
- ✅ <1% error rate
- ✅ 99.9% uptime

**Временная оценка:** 2-3 недели  
**Стоимость:** $0 (инструменты бесплатные)

---

### 3.2 ⚡ PERFORMANCE OPTIMIZATION

**Статус:** ⚠️ 50% (Базовое оптимизировано)

#### Database Optimization

**Добавить индексы:**
```prisma
// prisma/schema.prisma
model User {
  id        String  @id @default(cuid())
  username  String  @unique
  tonAddress String @unique
  score     Int     @default(0)
  
  @@index([tonAddress])  // Быстрый поиск по адресу
  @@index([score])       // Для leaderboard
}

model Battle {
  id        String @id @default(cuid())
  player1Id String
  player2Id String
  createdAt DateTime @default(now())
  
  @@index([createdAt])
}
```

**Применить индексы:**
```bash
npx prisma migrate dev --name add_indexes
```

#### Frontend Bundle Optimization

**Code Splitting:**
```typescript
// frontend/src/main.tsx
import { lazy, Suspense } from 'react';

const BattleScene = lazy(() => import('./scenes/BattleScene'));
const MenuScene = lazy(() => import('./scenes/MenuScene'));

export function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      {/* Components load on demand */}
    </Suspense>
  );
}
```

**Lazy Load Assets:**
```typescript
// frontend/src/services/AssetLoader.ts
export class AssetLoader {
  private cache = new Map();

  async loadAsset(url: string) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    
    const asset = await fetch(url);
    this.cache.set(url, asset);
    return asset;
  }
}
```

#### Redis Caching

**backend/src/cache/cache.service.ts**
```typescript
@Injectable()
export class CacheService {
  constructor(private redis: Redis) {}

  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached);

    const result = await fn();
    await this.redis.setex(key, ttl, JSON.stringify(result));
    return result;
  }
}
```

**Использование:**
```typescript
// backend/src/modules/leaderboard/leaderboard.service.ts
async getLeaderboard() {
  return this.cacheService.getOrSet(
    'leaderboard:top100',
    () => this.repo.findTopPlayers(100),
    600 // 10 минут кэша
  );
}
```

**Временная оценка:** 2-3 недели  
**Ожидаемое улучшение:** 
- API response: 500ms → 200ms (-60%)
- Bundle size: 2.5MB → 1.2MB (-50%)
- Load time: 5s → 2s (-60%)

---

## 📊 СВОДНАЯ ТАБЛИЦА ВЫПОЛНЕНИЯ

### По фазам

| Фаза | Задачи | Дни | Люди | Стоимость |
|------|--------|------|------|----------|
| **1** | Blockchain, Graphics, Audio | 5-7 | 2-3 | $2.5K-3.5K |
| **2** | Security, Monitoring, Features | 14-21 | 3 | $7K-16K |
| **3** | Testing, Optimization | 10-14 | 2 | $0-3K |
| **4** | Mobile, Community | 42-56 | 2-3 | $15K-30K |
| **ИТОГО** | ВСЕ | 71-98 дней | 2-3 | $24.5K-52.5K |

### По приоритету

```
🔴 CRITICAL (НЕДЕЛЯ 1-2): $2.5K-3.5K
   └─ Blockchain deploy
   └─ Graphics (базовые)
   └─ Audio (базовые)

🟠 HIGH (НЕДЕЛЯ 2-4): $7K-16K
   └─ Security audit
   └─ Monitoring
   └─ Production infra

🟡 MEDIUM (НЕДЕЛЯ 4-8): $5K-10K
   └─ Advanced features
   └─ Testing
   └─ Optimization

🟢 LOW (НЕДЕЛЯ 9-15): $15K-30K
   └─ Mobile
   └─ Community
   └─ Polish
```

---

## 💼 РЕКОМЕНДУЕМЫЕ СЦЕНАРИИ

### Сценарий 1: MVP (2 недели, $2-3K)
✅ Blockchain deploy  
✅ Базовая графика  
✅ Testnet launch  
❌ Security audit (позже)

### Сценарий 2: Бета (4 недели, $7-10K)
✅ Всё из Сценария 1  
✅ Профессиональная графика  
✅ Security audit начало  
✅ Monitoring setup  

### Сценарий 3: Production (12 недель, $25-35K)
✅ Всё готово  
✅ Security audit завершен  
✅ Load тестирование  
✅ Production infrastructure  
✅ Mainnet deployment

---

## 🚀 НАЧАЛО РАБОТЫ

### Сегодня
1. [ ] Прочитать этот документ
2. [ ] Собрать команду
3. [ ] Выбрать сценарий

### Завтра
1. [ ] Начать ФАЗУ 1 - Blockchain
2. [ ] Заказать графику (если Сценарий 2+)
3. [ ] Подготовить окружение

### Неделю
1. [ ] Завершить Blockchain deployment
2. [ ] Добавить графику
3. [ ] Запустить на testnet

---

**Документ:** IMPLEMENTATION_PLAN_INCOMPLETE.md  
**Версия:** 1.0 FINAL  
**Статус:** ✅ Готов к использованию  
**Последнее обновление:** 16.12.2025

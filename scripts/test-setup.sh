#!/bin/bash

# VITYAZ Testing Setup Script
# Sets up Jest and runs initial tests

set -e

echo "📋 VITYAZ: Testing Setup"
echo "======================\n"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "${YELLOW}Step 1: Install testing dependencies${NC}"
cd backend
npm install --save-dev jest @types/jest ts-jest @nestjs/testing supertest
echo "${GREEN}✅ Testing dependencies installed${NC}"

echo ""
echo "${YELLOW}Step 2: Configure Jest${NC}"
cat > jest.config.js << 'EOF'
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
EOF
echo "${GREEN}✅ Jest configured${NC}"

echo ""
echo "${YELLOW}Step 3: Run tests${NC}"
npm test
echo "${GREEN}✅ Tests completed${NC}"

echo ""
echo "${YELLOW}Step 4: Generate coverage report${NC}"
npm test -- --coverage
echo "${GREEN}✅ Coverage report generated${NC}"
echo "Location: coverage/index.html"

echo ""
echo "${GREEN}=====================${NC}"
echo "✅ Testing setup complete!"
echo "${GREEN}=====================${NC}\n"

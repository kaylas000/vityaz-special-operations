#!/bin/bash

# VITYAZ Smart Contract Deployment Script
# Deploys all 3 contracts to TON testnet

set -e

echo "🚀 VITYAZ: Smart Contract Deployment to TON Testnet"
echo "====================================================\n"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if TON CLI is installed
if ! command -v tonlib &> /dev/null; then
    echo "${RED}❌ TON CLI not found. Installing...${NC}"
    brew install ton-cli
fi

echo "${YELLOW}Step 1: Setup TON Testnet Environment${NC}"
echo "======================================="

# Configure testnet
tonlib config set testnet
echo "${GREEN}✅ Configured testnet${NC}"

# Get or create wallet
if [ ! -f ~/.ton/wallet ]; then
    echo "${YELLOW}Creating testnet wallet...${NC}"
    tonlib wallet init testnet
    echo "${GREEN}✅ Wallet created${NC}"
    echo "${YELLOW}Request testnet TON from faucet:${NC}"
    echo "https://testnet-giver.ton.org/"
else
    echo "${GREEN}✅ Wallet exists${NC}"
fi

echo ""
echo "${YELLOW}Step 2: Compile VityazToken.fc${NC}"
echo "===================================="
cd contracts/ton
fift -s compile.fif VityazToken.fc
echo "${GREEN}✅ Compiled VityazToken${NC}"

echo ""
echo "${YELLOW}Step 3: Deploy VityazToken to Testnet${NC}"
echo "====================================="
TOKEN_ADDRESS=$(tonlib deploy testnet VityazToken.boc)
echo "${GREEN}✅ Deployed VityazToken${NC}"
echo "Address: ${YELLOW}${TOKEN_ADDRESS}${NC}"

echo ""
echo "${YELLOW}Step 4: Compile Marketplace.fc${NC}"
echo "================================="
fift -s compile.fif Marketplace.fc
echo "${GREEN}✅ Compiled Marketplace${NC}"

echo ""
echo "${YELLOW}Step 5: Deploy Marketplace to Testnet${NC}"
echo "==================================="
MARKETPLACE_ADDRESS=$(tonlib deploy testnet Marketplace.boc)
echo "${GREEN}✅ Deployed Marketplace${NC}"
echo "Address: ${YELLOW}${MARKETPLACE_ADDRESS}${NC}"

echo ""
echo "${YELLOW}Step 6: Compile Staking.func${NC}"
echo "============================="
fift -s compile.fif Staking.func
echo "${GREEN}✅ Compiled Staking${NC}"

echo ""
echo "${YELLOW}Step 7: Deploy Staking to Testnet${NC}"
echo "================================="
STAKING_ADDRESS=$(tonlib deploy testnet Staking.boc)
echo "${GREEN}✅ Deployed Staking${NC}"
echo "Address: ${YELLOW}${STAKING_ADDRESS}${NC}"

echo ""
echo "${GREEN}====================================================="
echo "✅ All contracts deployed successfully!"
echo "=====================================================${NC}\n"

echo "${YELLOW}Save these addresses in .env:${NC}"
echo "TON_TOKEN_ADDRESS=${TOKEN_ADDRESS}"
echo "TON_MARKETPLACE_ADDRESS=${MARKETPLACE_ADDRESS}"
echo "TON_STAKING_ADDRESS=${STAKING_ADDRESS}"
echo ""

echo "${YELLOW}Test transfers:${NC}"
echo "tonlib transfer ${TOKEN_ADDRESS} 100 <another-wallet>"

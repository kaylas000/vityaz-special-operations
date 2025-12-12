#!/usr/bin/env bash
set -euo pipefail

# Simple helper to compile TON FunC/Fift contracts into .boc files for deployment
# Requires: ton-cli / fift installed locally

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTRACTS_DIR="$ROOT_DIR/contracts/ton"
BUILD_DIR="$CONTRACTS_DIR/build"

mkdir -p "$BUILD_DIR"

echo "[VITYAZ] Compiling TON contracts into $BUILD_DIR"

# VityazToken.fc (FunC -> Fift/.boc is toolchain specific; here we assume 'func' + 'fift')
if command -v func >/dev/null 2>&1; then
  echo "[VITYAZ] Compiling VityazToken.fc with func..."
  func -o "$BUILD_DIR/VityazToken.fif" -SPA "$CONTRACTS_DIR/VityazToken.fc"
else
  echo "[WARN] 'func' binary not found. Please install TON FunC toolchain and re-run."
fi

# Marketplace / Staking (FunC sources)
if command -v func >/dev/null 2>&1; then
  echo "[VITYAZ] Compiling marketplace.func..."
  func -o "$BUILD_DIR/marketplace.fif" -SPA "$CONTRACTS_DIR/marketplace.func"

  echo "[VITYAZ] Compiling staking.func..."
  func -o "$BUILD_DIR/staking.fif" -SPA "$CONTRACTS_DIR/staking.func"
fi

echo "[VITYAZ] If your toolchain uses a different flow (e.g. fift -s compile.fif ...),\nupdate this script accordingly or see ACTION_ITEMS.md for manual commands."

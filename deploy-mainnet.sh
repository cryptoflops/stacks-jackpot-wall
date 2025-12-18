#!/bin/bash
echo "🚀 Deploying Jackpot Wall to MAINNET..."

# Ensure we have the binary
if [ ! -f "../bin/clarinet" ]; then
    echo "Error: Clarinet binary not found in ../bin/"
    exit 1
fi

# 1. Generate Mainnet Deployment Plan
# This uses the settings/Mainnet.toml for the mnemonic
../bin/clarinet deployments generate --mainnet --low-cost

# 2. Apply Deployment
echo "Warning: This will use REAL STX on Mainnet."
read -p "Are you sure you want to proceed? (y/N) " confirm
if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    yes | ../bin/clarinet deployments apply --mainnet --no-dashboard
    echo "✅ Mainnet Deployment Complete."
    echo "Check explorer at: https://explorer.hiro.so/?chain=mainnet"
else
    echo "❌ Deployment Cancelled."
    exit 1
fi

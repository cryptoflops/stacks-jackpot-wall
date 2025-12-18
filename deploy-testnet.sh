#!/bin/bash
echo "Deploying Jackpot Wall to Testnet..."

# Ensure we have the binary
if [ ! -f "../bin/clarinet" ]; then
    echo "Error: Clarinet binary not found in ../bin/"
    exit 1
fi

# Deploy
../bin/clarinet deployments generate --testnet --low-cost
yes | ../bin/clarinet deployments apply --testnet --no-dashboard

echo "Deployment complete (if verify passed)."
echo "Check explorer at: https://explorer.hiro.so/?chain=testnet"

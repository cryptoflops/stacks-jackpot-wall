# Stacks Jackpot Wall 🏆

A high-performance, real-time decentralized messaging scoreboard built on the **Stacks Blockchain**. Features an immutable micro-lottery system powered by **Clarity Smart Contracts** and real-time observability via **Hiro Chainhooks**.

---

## 🏗️ Stacks Building Mechanics

### 1. Smart Contract Strategy (Clarity 2.0)
The core engine is an autonomous Clarity contract (`jackpot-wall.clar`) that enforces:
- **Immutable State**: Every post is etched permanently on-chain.
- **Deterministic Payouts**: Every 10th poster is rewarded with 90% of the pot, calculated at settlement.
- **Protocol Fees**: 10% is retained by the contract to sustain the ecosystem.
- **Zero Control**: No admin keys, no pause buttons—pure, decentralized code.

### 2. Real-Time Observability (Chainhooks)
Instead of polling the Stacks node, this project utilizes **Hiro Chainhooks** to achieve sub-second UI updates:
- **Predicates**: Custom hooks listen for the `print` events (`new-post` and `jackpot-won`) emitted by the contract.
- **Latency**: Near-instant data ingestion, bypassing the block confirmation lag for non-critical UI feedback.

### 3. Testnet and Mainnet Deployment
The architecture is designed for seamless transitions between environments using standardized Clarinet deployment plans.

---

## 🛠️ Repository Structure

```text
├── contracts/          # Clarity 2.0 smart contract source
├── chainhooks/         # JSON predicates for Hiro Chainhook
├── tests/              # Vitest suite for contract logic
├── deployments/        # Clarinet deployment plans (Mainnet/Testnet)
└── web/                # Stacks-enabled Dashboard (Next.js/Stacks SDK)
```

---

## 🏁 Quick Start

### 1. Contract Development & Testing
Ensure you have [Clarinet](https://github.com/hirosystems/clarinet) installed.

```bash
# Run the test suite
npm test

# Check contract syntax
clarinet check
```

### 2. Ship to Testnet & Mainnet
```bash
# Deploy to Testnet
./deploy-testnet.sh

# Deploy to Mainnet (Requires SP... contract address)
./deploy-mainnet.sh
```

---

## 🛡️ Security & Privacy
- **Paranoid Review**: Full security audit available in `security_audit.md`.
- **Zero-Key Principle**: This repository contains no private keys, seed phrases, or hardcoded secrets.
- **Audit Trails**: All event logs are printed on-chain for public verification.

## 📜 License
MIT

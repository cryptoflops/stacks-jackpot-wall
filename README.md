# Stacks Jackpot Wall 🏆

A high-performance, real-time decentralized messaging platform built on the Stacks blockchain. Features a micro-lottery system powered by Hiro Chainhooks.

## 🚀 Key Features

- **Decentralized Messaging**: High-frequency on-chain activity where every post is a permanent record on the Stacks network.
- **Smart Payout Engine**: Automated Clarity contract logic—every 10th poster triggers a jackpot, winning 90% of the accumulated pot.
- **Real-time Observability**: Powered by Hiro Chainhooks for instant UI updates and event tracking.
- **Premium Web3 UI**: A sleek, dark-mode dashboard with glassmorphism and real-time progress monitoring.

## 🛠️ Architecture

- **Smart Contracts**: Clarity (v2) implemented in `/contracts`. Optimized for security and gas efficiency.
- **Frontend**: Next.js 14 / React 18 for maximum stability with Stacks SDK integration.
- **Event Streaming**: custom Hiro Chainhook predicates for real-time off-chain indexing.

## 🏁 Quick Start

### 1. Installation
Install dependencies for both the testing suite and the frontend application:
```bash
# Root (Testing Suite)
npm install

# Web (Frontend)
cd web && npm install
```

### 2. Contract Testing
Verify the contract logic and jackpot mechanics:
```bash
# From root
npm test
```

### 3. Start Dashboard
```bash
cd web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to join the wall.

---

## 🌐 Multi-Network Support
The dashboard supports both Stacks Testnet and Mainnet.
- **Deploy to Testnet**: `./deploy-testnet.sh`
- **Deploy to Mainnet**: `./deploy-mainnet.sh`
- **Toggle Frontend**: Update `NEXT_PUBLIC_NETWORK` in your `.env`.

## ☁️ Deployment (Vercel)
This project is pre-configured for Vercel.
1. Connect your GitHub repository to Vercel.
2. The `vercel.json` will automatically handle the monorepo-style build.
3. Configure **Environment Variables** in Vercel:
   - `NEXT_PUBLIC_NETWORK`: `testnet` or `mainnet`
   - `CHAINHOOK_SECRET`: A secret token for secure event ingestion.

## ⚙️ Configuration
### Contract Deployment
- **Testnet**: `ST1TN1ERKXEM2H9TKKWGPGZVNVNEKS92M7MAMP23P.jackpot-wall`
- **Mainnet**: `SP1TN1ERKXEM2H9TKKWGPGZVNVNEKS92M7M3CKVJJ.jackpot-wall`


## 📜 License
MIT

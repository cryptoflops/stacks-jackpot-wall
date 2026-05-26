# Stacks Jackpot Dashboard 🏆

A modern, high-fidelity Web3 frontend built with Next.js, Tailwind CSS, Framer Motion, and Three.js (via React Three Fiber). This dashboard allows users to interact with the decentralized **Stacks Jackpot Wall** smart contract in real time.

---

## 🚀 Key Features

- **Wallet Connection**: Seamless connection using the `@stacks/connect` SDK.
- **Dynamic 3D Background**: Immersive WebGL shader background using Three.js.
- **Real-Time Data Ingestion**: Powered by Hiro Chainhooks via local webhook endpoint `/api/chainhook`.
- **Talent Protocol Integration**: Displays user reputation score (Builder Score) to prevent spam and highlight community members.
- **Live Feed & History**: Live stream of posts and jackpot events directly on Stacks.

---

## 🛠️ Environment Configuration

Copy the template file to create your local environment file:

```bash
cp env.template .env.local
```

Configure the following variables in `.env.local`:

| Variable | Description | Default / Example |
|---|---|---|
| `NEXT_PUBLIC_NETWORK` | Target network (`testnet` or `mainnet`) | `testnet` |
| `NEXT_PUBLIC_TESTNET_CONTRACT` | Address of deployed testnet contract | `ST1TN1ERKXEM2H9TKKWGPGZVNVNEKS92M7MAMP23P.jackpot-wall` |
| `NEXT_PUBLIC_MAINNET_CONTRACT` | Address of deployed mainnet contract | `SP1TN1ERKXEM2H9TKKWGPGZVNVNEKS92M7M3CKVJJ.jackpot-wall` |
| `CHAINHOOK_SECRET` | Secret Bearer token to authorize Chainhook events | `secret-token` |
| `TALENT_PROTOCOL_API_KEY` | API key to fetch passports from Talent Protocol | `your_api_key` |
| `HIRO_API_KEY` | Optional Hiro API key to bypass rate limits | `your_api_key` |

---

## 🏁 Local Development

You can run the dashboard from the root repository or inside the `web` directory.

### Running from the Root Directory (Recommended)

```bash
# Start Next.js in development mode
npm run dev:web

# Build for production
npm run build:web

# Start production build
npm run start:web

# Run ESLint check
npm run lint:web
```

### Running from the `web` Directory

```bash
cd web
npm run dev
```

---

## 📦 Deployment to Vercel

The dashboard is fully compatible with Vercel and supports API routes out of the box.

1. **Deploy Repository**: Import your repository into Vercel.
2. **Set root directory**: Change the root directory setting to `web`.
3. **Configure Environment Variables**: Add the variables from `.env.local` to Vercel's Environment Variables settings.
4. **Deploy**: Trigger a build.

Once deployed, you can point your **Hiro Chainhook** predicate to target the URL `https://jackpot-wall.vercel.app/api/chainhook` (or `https://stacks-jackpot-wall.vercel.app/api/chainhook`) with the `Authorization: Bearer <CHAINHOOK_SECRET>` header to enable sub-second real-time event updates.

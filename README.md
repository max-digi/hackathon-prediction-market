# Hackathon Prediction Market 🎯

A decentralized prediction market where users can bet on which projects will win a hackathon. Built with Next.js, Solidity (Foundry), and Wagmi on Tempo mainnet.

## Quick Start (Use This Template)

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/hackathon-prediction-market
cd hackathon-prediction-market
npm install
```

### 2. Customize Projects
Edit `script/Deploy.s.sol` with your hackathon projects and participant names:
```solidity
names[0] = "Your Project 1";
teams[0] = "Participant Name";
// ... etc
```

### 3. Deploy Contracts
```bash
# Add your private key to .env.local
cp .env.example .env.local

# Deploy to Tempo mainnet
forge build
forge script script/Deploy.s.sol:DeployScript --rpc-url https://rpc.mainnet.tempo.xyz --broadcast
```

### 4. Update Frontend
After deployment, update the market addresses in:
- `app/portfolio/page.tsx` - MARKETS array
- `app/admin/page.tsx` - MARKETS array

### 5. Run
```bash
npm run dev
```

## Features

- **Binary Markets**: Each hackathon project has a YES/NO market
- **AMM Pricing**: Automatic odds adjustment using constant product formula
- **Passkey Wallets**: No MetaMask needed - users sign up with fingerprint
- **Auto-funding**: New accounts get testnet tokens automatically
- **Settlement System**: Admin settles winners, users claim $1 per winning share

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- TypeScript
- TailwindCSS
- Wagmi v3 / Viem v2

### Smart Contracts
- Solidity 0.8.20
- Foundry
- OpenZeppelin Contracts

## Project Structure

```
├── app/                      # Next.js pages
│   ├── page.tsx             # Home (market grid)
│   ├── admin/               # Admin settlement page
│   ├── portfolio/           # User positions
│   └── project/[id]/        # Project detail
├── components/              # React components
├── contracts/               # Solidity contracts
│   ├── Market.sol          # Individual market
│   └── MarketFactory.sol   # Market creator
├── script/                  # Foundry deploy scripts
└── constants/               # ABIs and addresses
```

## Admin Functions

The admin (deployer wallet) can settle markets via CLI:

```bash
node scripts/settle.mjs <private_key> <market_address> true   # YES wins
node scripts/settle.mjs <private_key> <market_address> false  # NO wins
```

## Network Details

| Property | Value |
|----------|-------|
| Network | Tempo Mainnet |
| Chain ID | `4217` |
| RPC URL | `https://rpc.mainnet.tempo.xyz` |
| Explorer | https://explore.mainnet.tempo.xyz |
| Stablecoin | pathUSD `0x20C000000000000000000000033aBB6ac7D235e5` |

## License

MIT

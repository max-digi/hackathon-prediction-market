# Deployment Guide for Tempo Mainnet

## Quick Start

### 1. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your private key:
```bash
PRIVATE_KEY=your_wallet_private_key_here
TEMPO_RPC_URL=https://eng:aphex-twin-jeff-mills@rpc.mainnet.tempo.xyz
```

### 2. Deploy Contracts

```bash
# Build contracts
forge build

# Deploy to Tempo Mainnet
forge script script/Deploy.s.sol:DeployScript --rpc-url tempo --broadcast
```

The deploy script will:
1. Use Tempo's native **pathUSD** stablecoin
2. Deploy the MarketFactory contract
3. Create 6 sample markets for hackathon projects

### 3. Update Frontend

After deployment, copy the factory address to `.env.local`:
```bash
NEXT_PUBLIC_FACTORY_ADDRESS=<deployed factory address>
```

### 4. Run the App

```bash
npm run dev
```

---

## Network Details

| Property | Value |
|----------|-------|
| Network Name | Tempo Mainnet |
| Chain ID | `4217` |
| RPC URL | `https://rpc.mainnet.tempo.xyz` |
| Block Explorer | https://explorer.tempo.xyz |
| Currency | USD |

## Key Addresses

| Contract | Address |
|----------|---------|
| pathUSD (stablecoin) | `0x20C0000000000000000000000000000000000000` |
| Stablecoin DEX | `0xdec0000000000000000000000000000000000000` |
| TIP-20 Factory | `0x20fc000000000000000000000000000000000000` |

---

## Troubleshooting

**"Insufficient funds" error:**
- Tempo uses TIP-20 stablecoins for gas fees
- Make sure your wallet has pathUSD for gas and betting

**RPC authentication error (401):**
- Ensure TEMPO_RPC_URL includes credentials: `https://eng:aphex-twin-jeff-mills@rpc.mainnet.tempo.xyz`

**Can't connect to network:**
- Verify RPC URL and chain ID: `4217`

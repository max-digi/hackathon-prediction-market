# Deployment Guide for Tempo Testnet

## Quick Start

### 1. Get Testnet Funds

Visit the **Tempo Faucet**: https://docs.tempo.xyz/quickstart/faucet

This gives you test stablecoins (pathUSD, AlphaUSD, etc.) that you can use for:
- Paying gas fees
- Testing the prediction market

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
PRIVATE_KEY=your_wallet_private_key_here
```

### 3. Deploy Contracts

```bash
# Compile first
npx hardhat compile

# Deploy to Tempo Testnet (Moderato)
npx hardhat run scripts/deploy.ts --network tempo
```

The deploy script will:
1. Use Tempo's native **pathUSD** stablecoin (no need to deploy MockUSDC)
2. Deploy the MarketFactory contract
3. Create 12 sample markets for hackathon projects

### 4. Update Frontend

After deployment, copy the output addresses to `.env.local`:
```bash
NEXT_PUBLIC_USDC_ADDRESS=0x20c0000000000000000000000000000000000000
NEXT_PUBLIC_FACTORY_ADDRESS=<deployed factory address>
```

### 5. Run the App

```bash
npm run dev
```

---

## Network Details

| Property | Value |
|----------|-------|
| Network Name | Tempo Testnet (Moderato) |
| Chain ID | `42431` |
| RPC URL | `https://rpc.moderato.tempo.xyz` |
| Block Explorer | https://explore.tempo.xyz |
| Currency | USD |

## Key Addresses

| Contract | Address |
|----------|---------|
| pathUSD (stablecoin) | `0x20c0000000000000000000000000000000000000` |
| Stablecoin DEX | `0xdec0000000000000000000000000000000000000` |
| TIP-20 Factory | `0x20fc000000000000000000000000000000000000` |

---

## Alternative: Deploy via Remix IDE

### Step 1: Setup

1. Go to https://remix.ethereum.org
2. Copy your contracts from `contracts/` folder
3. Compile with Solidity 0.8.20

### Step 2: Connect MetaMask

Add Tempo Testnet to MetaMask:
- Network Name: `Tempo Testnet (Moderato)`
- RPC URL: `https://rpc.moderato.tempo.xyz`
- Chain ID: `42431`
- Currency: `USD`
- Explorer: `https://explore.tempo.xyz`

### Step 3: Deploy

1. **MarketFactory** - Use pathUSD address: `0x20c0000000000000000000000000000000000000`
2. Call `batchCreateMarkets()` with your project data

---

## Alternative: Local Development

```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy locally (uses MockUSDC)
npx hardhat run scripts/deploy.ts --network localhost
```

---

## Testing the Contracts

1. **Get pathUSD**: Use the faucet at https://docs.tempo.xyz/quickstart/faucet
2. **Approve spending**: Call `approve(marketAddress, amount)` on pathUSD
3. **Buy shares**: Call `buyShares(true/false, amount)` on a Market
4. **Check odds**: Call `getCurrentOdds()` on any Market
5. **Claim winnings**: After settlement, call `claimWinnings()`

---

## Troubleshooting

**"Insufficient funds" error:**
- Get testnet stablecoins from the faucet
- Make sure you have pathUSD for betting

**Can't connect to network:**
- Verify RPC URL: `https://rpc.moderato.tempo.xyz`
- Check chain ID: `42431`

**Hardhat issues with Node.js 25+:**
- Use Node.js 22 LTS: `nvm use 22`

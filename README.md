# Hackathon Prediction Market 🎯

A decentralized prediction market where users can bet on which projects will win a hackathon. Built with Next.js, Solidity (Foundry), and Wagmi on Tempo mainnet.

## Features

- **Binary Markets**: Each hackathon project has a YES/NO market
- **AMM Pricing**: Automatic odds adjustment using constant product formula
- **Real-time Odds**: Dynamic pricing based on market demand
- **Portfolio Tracking**: View all your positions and potential winnings
- **Settlement System**: Winners claim $1 per winning share after results

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Wagmi v3 / Viem v2
- React Query

### Smart Contracts
- Solidity 0.8.20
- Foundry
- OpenZeppelin Contracts

## Project Structure

```
hackathon-prediction-market/
├── app/                      # Next.js pages
│   ├── page.tsx             # Home page (market grid)
│   ├── portfolio/           # Portfolio page
│   └── project/[id]/        # Project detail page
├── components/              # React components
│   ├── BuyModal.tsx        # Share purchase modal
│   ├── ConnectButton.tsx   # Wallet connection
│   ├── Header.tsx          # Navigation header
│   ├── ProjectCard.tsx     # Market card
│   └── Web3Provider.tsx    # Wagmi provider
├── contracts/              # Solidity contracts
│   ├── Market.sol         # Individual market contract
│   └── MarketFactory.sol  # Market creator
├── script/                # Foundry deploy scripts
│   └── Deploy.s.sol      # Main deployment script
├── lib/                   # Utilities
│   └── wagmi.ts          # Wagmi configuration
├── types/                # TypeScript types
└── constants/            # Contract ABIs and addresses
```

## Getting Started

### Prerequisites

- Node.js 18+
- Foundry (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- MetaMask or Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone <your-repo>
cd hackathon-prediction-market
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Smart Contract Deployment

### Deploy to Tempo Mainnet

1. Add your private key to `.env.local`:
```bash
PRIVATE_KEY=your_private_key_here
TEMPO_RPC_URL=https://eng:aphex-twin-jeff-mills@rpc.mainnet.tempo.xyz
```

2. Build and deploy:
```bash
forge build
forge script script/Deploy.s.sol:DeployScript --rpc-url tempo --broadcast
```

3. Update `NEXT_PUBLIC_FACTORY_ADDRESS` in `.env.local` with the deployed address

## Smart Contracts

### Market.sol

Individual prediction market for a project. Features:
- Constant product AMM (x * y = k)
- Buy YES/NO shares with pathUSD
- Settlement by admin
- Claim winnings after settlement

Key functions:
- `buyShares(bool isYes, uint256 usdcAmount)` - Purchase shares
- `settle(bool yesWon)` - Mark winner (admin only)
- `claimWinnings()` - Redeem winning shares
- `getCurrentOdds()` - Get current YES probability
- `calculateSharesOut(bool isYes, uint256 usdcAmount)` - Preview purchase

### MarketFactory.sol

Creates and tracks all markets. Features:
- Deploy new Market contracts
- Batch market creation
- Track project metadata

Key functions:
- `createMarket(...)` - Deploy new market
- `getAllMarkets()` - Get all market addresses
- `getProjectMetadata(address)` - Get project info

## How the AMM Works

The prediction market uses a constant product market maker (CPMM):

1. **Initial State**: Each market starts with 100 YES and 100 NO shares (50/50 odds)

2. **Buying YES shares**:
   - User sends pathUSD to contract
   - Contract calculates shares using: `k = yesPool * noPool`
   - YES pool decreases, NO pool increases
   - This makes YES more expensive (lower supply)

3. **Buying NO shares**:
   - Same mechanism but inverted
   - NO pool decreases, YES pool increases

4. **Odds Calculation**:
   - YES odds = `noPool / (yesPool + noPool) * 100`
   - Higher demand for YES → fewer YES shares → higher YES price

5. **Settlement**:
   - Admin marks the winner
   - Winning shares redeem for $1 each
   - Losing shares are worthless

## User Flows

### Place a Bet

1. Connect wallet (top right)
2. Click "Buy YES" or "Buy NO" on any project
3. Enter amount
4. Approve pathUSD (first time only)
5. Confirm transaction
6. Shares appear in your portfolio

### Claim Winnings

1. Go to Portfolio page
2. After settlement, click "Claim Winnings"
3. Receive $1 per winning share

## Network Details

| Property | Value |
|----------|-------|
| Network Name | Tempo Mainnet |
| Chain ID | `4217` |
| RPC URL | `https://rpc.mainnet.tempo.xyz` |
| Block Explorer | https://explorer.tempo.xyz |
| Stablecoin (pathUSD) | `0x20C0000000000000000000000000000000000000` |

## Troubleshooting

### Wallet Connection Issues

- Make sure you're on Tempo mainnet (chain ID 4217)
- Refresh the page after switching networks

### Transaction Failures

- Ensure you have pathUSD for gas and betting
- Check you've approved the Market contract

## License

MIT

# Hackathon Prediction Market 🎯

A decentralized prediction market where users can bet on which projects will win a hackathon. Built with Next.js, Solidity, and Wagmi.

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
- Hardhat
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
│   ├── MarketFactory.sol  # Market creator
│   └── MockUSDC.sol       # Test USDC token
├── lib/                   # Utilities
│   └── wagmi.ts          # Wagmi configuration
├── types/                # TypeScript types
└── constants/            # Contract ABIs and addresses
```

## Getting Started

### Prerequisites

- Node.js 18+ (Note: Hardhat may have issues with Node 25+)
- MetaMask or another Web3 wallet
- Git

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

### Local Development

1. Start a local Hardhat node:
```bash
npx hardhat node
```

2. Deploy contracts:
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

3. Update `.env.local` with the deployed contract addresses.

### Tempo Testnet Deployment

1. Get Tempo testnet tokens from the faucet

2. Add your private key to `.env.local`:
```bash
PRIVATE_KEY=your_private_key_here
```

3. Deploy to Tempo testnet:
```bash
npx hardhat run scripts/deploy.ts --network tempo
```

4. Update `NEXT_PUBLIC_USDC_ADDRESS` and `NEXT_PUBLIC_FACTORY_ADDRESS` in `.env.local`

## Smart Contracts

### Market.sol

Individual prediction market for a project. Features:
- Constant product AMM (x * y = k)
- Buy YES/NO shares with USDC
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

### MockUSDC.sol

Test USDC token for development:
- `faucet()` - Get free test USDC
- `mint(address, uint256)` - Mint tokens (admin)

## How the AMM Works

The prediction market uses a constant product market maker (CPMM):

1. **Initial State**: Each market starts with 100 YES and 100 NO shares (50/50 odds)

2. **Buying YES shares**:
   - User sends USDC to contract
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
3. Enter USDC amount
4. Approve USDC (first time only)
5. Confirm transaction
6. Shares appear in your portfolio

### Claim Winnings

1. Go to Portfolio page
2. After settlement, click "Claim Winnings"
3. Receive $1 per winning share

### Add Test USDC

For testing on local/testnet:
1. Call `faucet()` on MockUSDC contract
2. Receive 1000 test USDC

## Current Status

**MVP Complete** ✅

- ✅ Smart contracts with AMM logic
- ✅ Frontend with dark mode theme
- ✅ Wallet connection (MetaMask)
- ✅ Home page with project cards
- ✅ Project detail pages
- ✅ Portfolio tracking
- ✅ Buy modal with approval flow

**Using Mock Data**: The app currently uses hardcoded project data for development. Once contracts are deployed, it will fetch real data from the blockchain.

## Next Steps

To make this production-ready:

1. **Deploy contracts** to Tempo testnet
2. **Update contract addresses** in `.env.local`
3. **Remove mock data** and fetch from contracts
4. **Add error handling** for failed transactions
5. **Implement admin panel** for settlement
6. **Add price charts** using historical data
7. **Optimize mobile** responsiveness

## Troubleshooting

### Hardhat Compilation Issues

If you encounter errors with Hardhat:
- Hardhat may not support Node.js 25+
- Try using Node.js 22 LTS
- Use `nvm` to switch versions: `nvm use 22`

### Wallet Connection Issues

- Make sure you're on the correct network (Tempo testnet or localhost)
- Refresh the page after switching networks
- Clear MetaMask cache if needed

### Transaction Failures

- Ensure you have test USDC
- Check you've approved the Market contract
- Verify you're connected to the right network

## Contributing

This is an MVP built for a hackathon. Contributions are welcome!

## License

MIT

// Contract addresses (to be updated after deployment)
export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0x0000000000000000000000000000000000000000"
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x0000000000000000000000000000000000000000"

// Market ABI (simplified for MVP)
export const MARKET_ABI = [
  "function projectName() view returns (string)",
  "function projectDescription() view returns (string)",
  "function yesPool() view returns (uint256)",
  "function noPool() view returns (uint256)",
  "function totalVolume() view returns (uint256)",
  "function settled() view returns (bool)",
  "function yesWon() view returns (bool)",
  "function yesShares(address) view returns (uint256)",
  "function noShares(address) view returns (uint256)",
  "function getCurrentOdds() view returns (uint256)",
  "function getProjectInfo() view returns (string, string, uint256, bool, bool)",
  "function getUserShares(address) view returns (uint256, uint256)",
  "function calculateSharesOut(bool, uint256) view returns (uint256)",
  "function buyShares(bool, uint256)",
  "function claimWinnings()",
  "event SharesPurchased(address indexed buyer, bool isYes, uint256 usdcAmount, uint256 sharesReceived, uint256 newYesPool, uint256 newNoPool)",
  "event MarketSettled(bool yesWon)",
  "event WinningsClaimed(address indexed user, uint256 amount)"
] as const

// MarketFactory ABI (simplified for MVP)
export const FACTORY_ABI = [
  "function markets(uint256) view returns (address)",
  "function getAllMarkets() view returns (address[])",
  "function getMarketCount() view returns (uint256)",
  "function getMarket(uint256) view returns (address)",
  "function getProjectMetadata(address) view returns (string, string, string, string, uint256)",
  "function createMarket(string, string, string, string) returns (address)",
  "event MarketCreated(address indexed marketAddress, string projectName, string projectDescription, uint256 timestamp)"
] as const

// Mock USDC ABI
export const USDC_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function faucet()",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
] as const

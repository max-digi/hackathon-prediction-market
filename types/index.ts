export interface Project {
  id: string
  marketAddress: string
  name: string
  description: string
  category: string
  teamName: string
  yesOdds: number // Percentage (0-100)
  totalVolume: bigint
  settled: boolean
  yesWon: boolean
  createdAt: number
}

export interface UserPosition {
  marketAddress: string
  projectName: string
  yesShares: bigint
  noShares: bigint
  totalInvested: bigint
  currentValue: bigint
  settled: boolean
  yesWon: boolean
}

export interface MarketData {
  yesPool: bigint
  noPool: bigint
  yesOdds: number
  totalVolume: bigint
}

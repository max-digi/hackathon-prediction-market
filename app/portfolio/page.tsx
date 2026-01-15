'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { encodeFunctionData, formatUnits } from 'viem'
import { Header } from '@/components/Header'
import { UserPosition } from '@/types'
import Link from 'next/link'
import { MARKET_ABI } from '@/constants/contracts'

const USDC_ADDRESS = '0x20C000000000000000000000033aBB6ac7D235e5'

const MARKETS = [
  { address: '0x2462C067eE3992612cA786037E4F8d36C3232Ada', name: 'Tempo Directory (Steffi)' },
  { address: '0x94Bd897F7A0148aa7afD0e31389109D63464611E', name: 'Legal Directory (Lindsey)' },
  { address: '0xe01d9bC1a3e979937E30A10379CceE17596117dB', name: 'X Dashboard (Juan)' },
  { address: '0x32E90FF95d9f0701241049Bf2e624798f4899ABC', name: 'Chain/Stablecoin TVL flow dashboard (Karina)' },
  { address: '0x6533Bd6aFC2f96D29B58e97c86B134848620Ce37', name: 'Compliance App (Gina)' },
  { address: '0x06BC94549Df915A3D43d976e6C244351077387f5', name: 'LinkedIn Connect (Teresa)' },
]

export default function Portfolio() {
  const { address, isConnected } = useAccount()
  const [positions, setPositions] = useState<UserPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingMarket, setClaimingMarket] = useState<string | null>(null)
  const [isClaimPending, setIsClaimPending] = useState(false)
  const [isClaimConfirming, setIsClaimConfirming] = useState(false)
  const [claimTxHashes, setClaimTxHashes] = useState<Record<string, string>>({})
  const [claimedMarkets, setClaimedMarkets] = useState<Set<string>>(new Set())

  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const fetchPositions = useCallback(async () => {
    if (!isConnected || !address || !publicClient) return

    setLoading(true)
    const userPositions: UserPosition[] = []

    for (const market of MARKETS) {
      try {
        const [yesShares, noShares, settled, yesWon] = await Promise.all([
          publicClient.readContract({
            address: market.address as `0x${string}`,
            abi: MARKET_ABI,
            functionName: 'yesShares',
            args: [address],
          }),
          publicClient.readContract({
            address: market.address as `0x${string}`,
            abi: MARKET_ABI,
            functionName: 'noShares',
            args: [address],
          }),
          publicClient.readContract({
            address: market.address as `0x${string}`,
            abi: MARKET_ABI,
            functionName: 'settled',
          }),
          publicClient.readContract({
            address: market.address as `0x${string}`,
            abi: MARKET_ABI,
            functionName: 'yesWon',
          }),
        ])

        const yes = yesShares as bigint
        const no = noShares as bigint

        if (yes > 0n || no > 0n) {
          const shares = yes > 0n ? yes : no
          userPositions.push({
            marketAddress: market.address,
            projectName: market.name,
            yesShares: yes,
            noShares: no,
            totalInvested: shares,
            currentValue: shares,
            settled: settled as boolean,
            yesWon: yesWon as boolean,
          })
        }
      } catch (error) {
        console.error(`Error fetching position for ${market.name}:`, error)
      }
    }

    setPositions(userPositions)
    setLoading(false)
  }, [isConnected, address, publicClient])

  useEffect(() => {
    fetchPositions()
  }, [fetchPositions])

  const handleClaimWinnings = async (marketAddress: string) => {
    if (!walletClient || !publicClient) return
    
    setClaimingMarket(marketAddress)
    setIsClaimPending(true)
    
    try {
      const claimData = encodeFunctionData({
        abi: MARKET_ABI,
        functionName: 'claimWinnings',
      })
      
      const hash = await walletClient.sendTransaction({
        to: marketAddress as `0x${string}`,
        data: claimData,
        feeToken: USDC_ADDRESS as `0x${string}`,
      } as any)
      
      setClaimTxHashes(prev => ({ ...prev, [marketAddress]: hash }))
      setIsClaimPending(false)
      setIsClaimConfirming(true)
      
      await publicClient.waitForTransactionReceipt({ hash })
      
      setClaimedMarkets(prev => new Set(prev).add(marketAddress))
      setIsClaimConfirming(false)
      setClaimingMarket(null)
      
      await fetchPositions()
    } catch (error) {
      console.error('Claim failed:', error)
      setIsClaimPending(false)
      setIsClaimConfirming(false)
      setClaimingMarket(null)
    }
  }

  const totalInvested = positions.reduce((sum, pos) => sum + pos.totalInvested, 0n)
  const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0n)
  const totalProfitLoss = totalValue - totalInvested

  const getPositionType = (position: UserPosition): 'YES' | 'NO' => {
    return position.yesShares > 0n ? 'YES' : 'NO'
  }

  const getShareCount = (position: UserPosition): bigint => {
    return position.yesShares > 0n ? position.yesShares : position.noShares
  }

  const isWinner = (position: UserPosition): boolean => {
    if (!position.settled) return false
    const holdsYes = position.yesShares > 0n
    return holdsYes ? position.yesWon : !position.yesWon
  }

  const canClaim = (position: UserPosition): boolean => {
    if (claimedMarkets.has(position.marketAddress)) return false
    const shares = getShareCount(position)
    return position.settled && isWinner(position) && shares > 0n
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white noise">
        <Header />
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-24">
          <div className="border border-[#222] bg-[#0a0a0a] p-12 sm:p-16 text-center">
            <h1 className="font-serif text-4xl sm:text-5xl mb-6">
              Connect Wallet
            </h1>
            <p className="text-[#555] text-sm tracking-wider uppercase mb-8">
              Please connect your wallet to view your portfolio
            </p>
            <div className="inline-block border border-[#333] px-6 py-3">
              <span className="text-[11px] tracking-[0.2em] text-[#666] uppercase">
                No wallet detected
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white noise">
      <Header />

      <div className="border-b border-[#222]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
          <p className="text-[11px] tracking-[0.3em] text-[#555] uppercase mb-4">
            Your Positions
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight">
            Portfolio
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-10">
        {loading ? (
          <div className="border border-[#222] bg-[#0a0a0a] p-12 sm:p-16 text-center">
            <p className="text-[#555] text-sm tracking-wider">Loading positions...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
              <div className="border border-[#222] bg-[#0a0a0a] p-6 sm:p-8 overflow-hidden">
                <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-3">
                  Total Shares
                </p>
                <p className="font-serif text-2xl sm:text-3xl truncate">
                  {parseFloat(formatUnits(totalInvested, 6)).toFixed(2)}
                </p>
              </div>

              <div className="border border-[#222] bg-[#0a0a0a] p-6 sm:p-8 overflow-hidden">
                <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-3">
                  Potential Payout
                </p>
                <p className="font-serif text-2xl sm:text-3xl truncate">
                  ${parseFloat(formatUnits(totalValue, 6)).toFixed(2)}
                </p>
              </div>

              <div className="border border-[#222] bg-[#0a0a0a] p-6 sm:p-8 overflow-hidden">
                <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-3">
                  Active Markets
                </p>
                <p className="font-serif text-2xl sm:text-3xl truncate">
                  {positions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase">
                Your Positions
              </p>
              <button
                onClick={fetchPositions}
                className="text-[10px] tracking-[0.2em] text-[#555] uppercase hover:text-white transition-colors"
              >
                ↻ Refresh
              </button>
            </div>

            {positions.length === 0 ? (
              <div className="border border-[#222] bg-[#0a0a0a] p-12 sm:p-16 text-center">
                <p className="text-[#555] text-sm tracking-wider mb-6">
                  You don&apos;t have any positions yet
                </p>
                <Link href="/" className="btn-secondary px-6 py-3 text-xs inline-block">
                  Browse Markets
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {positions.map((position, index) => {
                  const positionType = getPositionType(position)
                  const shares = getShareCount(position)
                  const winner = isWinner(position)
                  const claimable = canClaim(position)
                  const isClaiming = claimingMarket === position.marketAddress && (isClaimPending || isClaimConfirming)
                  const alreadyClaimed = claimedMarkets.has(position.marketAddress)

                  return (
                    <div
                      key={index}
                      className="border border-[#222] bg-[#0a0a0a] p-6 sm:p-8 hover:border-[#333] transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                        <div>
                          <h3 className="font-serif text-xl sm:text-2xl mb-3">{position.projectName}</h3>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-3 py-1 border text-[11px] font-bold tracking-[0.1em] uppercase ${
                              positionType === 'YES' 
                                ? 'border-white bg-white text-black' 
                                : 'border-[#555] bg-transparent text-[#555]'
                            }`}>
                              {positionType}: {parseFloat(formatUnits(shares, 6)).toFixed(2)} shares
                            </span>
                            {position.settled && (
                              <span className={`px-3 py-1 border text-[11px] font-bold tracking-[0.1em] uppercase ${
                                winner 
                                  ? 'border-white text-white' 
                                  : 'border-[#333] text-[#555]'
                              }`}>
                                {winner ? '✓ Winner' : '✗ Lost'}
                              </span>
                            )}
                            {alreadyClaimed && claimTxHashes[position.marketAddress] && (
                              <a
                                href={`https://explore.mainnet.tempo.xyz/tx/${claimTxHashes[position.marketAddress]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 border border-green-500 text-green-500 text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-green-500 hover:text-black transition-colors"
                              >
                                ✓ Claimed ↗
                              </a>
                            )}
                          </div>
                        </div>

                        {claimable && (
                          <div className="flex flex-col items-end gap-2">
                            <button 
                              onClick={() => handleClaimWinnings(position.marketAddress)}
                              disabled={isClaiming}
                              className="btn-yes px-4 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isClaiming ? 'Claiming...' : `Claim $${parseFloat(formatUnits(shares, 6)).toFixed(2)}`}
                            </button>
                            {claimTxHashes[position.marketAddress] && claimingMarket === position.marketAddress && (
                              <a 
                                href={`https://explore.mainnet.tempo.xyz/tx/${claimTxHashes[position.marketAddress]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs text-[#888] hover:text-white transition-colors"
                              >
                                {claimTxHashes[position.marketAddress].slice(0, 8)}...{claimTxHashes[position.marketAddress].slice(-6)} ↗
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-[#222] bg-black">
                        <div>
                          <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-2">
                            If You Win
                          </p>
                          <p className="text-white font-mono">
                            {parseFloat(formatUnits(shares, 6)).toFixed(2)} shares × $1.00 = ${parseFloat(formatUnits(shares, 6)).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-2">
                            If You Lose
                          </p>
                          <p className="text-[#555] font-mono">
                            {parseFloat(formatUnits(shares, 6)).toFixed(2)} shares × $0.00 = $0.00
                          </p>
                        </div>
                      </div>

                      {!position.settled && (
                        <p className="text-[10px] text-[#555] mt-4 tracking-wider uppercase">
                          Market not yet settled — awaiting hackathon results
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      <footer className="border-t border-[#222] py-8 sm:py-10 mt-12">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between">
          <span className="text-[10px] tracking-[0.2em] text-[#444] uppercase">
            Built on Tempo
          </span>
          <span className="text-[10px] tracking-[0.2em] text-[#444] uppercase">
            2025
          </span>
        </div>
      </footer>
    </div>
  )
}

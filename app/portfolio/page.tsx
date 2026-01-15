'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Header } from '@/components/Header'
import { UserPosition } from '@/types'
import { formatEther } from 'viem'
import Link from 'next/link'

export default function Portfolio() {
  const { address, isConnected } = useAccount()
  const [positions, setPositions] = useState<UserPosition[]>([])

  // Mock data for development
  useEffect(() => {
    if (!isConnected) return

    // Mock positions
    const mockPositions: UserPosition[] = [
      {
        marketAddress: '0x0000000000000000000000000000000000000001',
        projectName: 'DeFi Yield Aggregator',
        yesShares: BigInt('50000000000000000000'),
        noShares: BigInt('0'),
        totalInvested: BigInt('30000000000000000000'),
        currentValue: BigInt('50000000000000000000'),
        settled: false,
        yesWon: false,
      },
      {
        marketAddress: '0x0000000000000000000000000000000000000003',
        projectName: 'Web3 Gaming Platform',
        yesShares: BigInt('0'),
        noShares: BigInt('25000000000000000000'),
        totalInvested: BigInt('20000000000000000000'),
        currentValue: BigInt('25000000000000000000'),
        settled: false,
        yesWon: false,
      },
      {
        marketAddress: '0x0000000000000000000000000000000000000008',
        projectName: 'Prediction Market Platform',
        yesShares: BigInt('75000000000000000000'),
        noShares: BigInt('0'),
        totalInvested: BigInt('50000000000000000000'),
        currentValue: BigInt('75000000000000000000'),
        settled: false,
        yesWon: false,
      },
    ]

    setPositions(mockPositions)
  }, [isConnected])

  const totalInvested = positions.reduce((sum, pos) => sum + pos.totalInvested, 0n)
  const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0n)
  const totalProfitLoss = totalValue - totalInvested

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-gray-400">
              Please connect your wallet to view your portfolio
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">My Portfolio</h1>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm text-gray-400 mb-2">Total Invested</h3>
            <p className="text-3xl font-bold">
              ${parseFloat(formatEther(totalInvested)).toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm text-gray-400 mb-2">Current Value</h3>
            <p className="text-3xl font-bold">
              ${parseFloat(formatEther(totalValue)).toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm text-gray-400 mb-2">Profit/Loss</h3>
            <p className={`text-3xl font-bold ${totalProfitLoss >= 0n ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfitLoss >= 0n ? '+' : ''}
              ${parseFloat(formatEther(totalProfitLoss)).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Positions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Active Positions</h2>

          {positions.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <p className="text-gray-400 mb-4">You don't have any positions yet</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 gradient-purple-blue rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Browse Markets
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {positions.map((position, index) => {
                const profitLoss = position.currentValue - position.totalInvested
                const profitLossPercent = Number(profitLoss * 100n / position.totalInvested)

                return (
                  <div
                    key={index}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{position.projectName}</h3>
                        <div className="flex items-center gap-4">
                          {position.yesShares > 0n && (
                            <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-medium rounded-full">
                              YES: {parseFloat(formatEther(position.yesShares)).toFixed(2)} shares
                            </span>
                          )}
                          {position.noShares > 0n && (
                            <span className="px-3 py-1 bg-red-500/20 text-red-300 text-sm font-medium rounded-full">
                              NO: {parseFloat(formatEther(position.noShares)).toFixed(2)} shares
                            </span>
                          )}
                        </div>
                      </div>

                      {position.settled && (
                        <button className="px-6 py-2 gradient-purple-blue rounded-lg font-semibold hover:opacity-90 transition-opacity">
                          Claim Winnings
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Invested</p>
                        <p className="font-semibold">
                          ${parseFloat(formatEther(position.totalInvested)).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400 mb-1">Current Value</p>
                        <p className="font-semibold">
                          ${parseFloat(formatEther(position.currentValue)).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400 mb-1">P/L</p>
                        <p className={`font-semibold ${profitLoss >= 0n ? 'text-green-400' : 'text-red-400'}`}>
                          {profitLoss >= 0n ? '+' : ''}
                          ${parseFloat(formatEther(profitLoss)).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400 mb-1">P/L %</p>
                        <p className={`font-semibold ${profitLoss >= 0n ? 'text-green-400' : 'text-red-400'}`}>
                          {profitLoss >= 0n ? '+' : ''}{profitLossPercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

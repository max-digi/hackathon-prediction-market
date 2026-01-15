'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { BuyModal } from '@/components/BuyModal'
import { Project } from '@/types'
import { formatEther } from 'viem'
import Link from 'next/link'

export default function ProjectDetail() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [buyIsYes, setBuyIsYes] = useState(true)

  useEffect(() => {
    // Mock data - in production, fetch from contract
    const mockProjects: Project[] = [
      {
        id: '0',
        marketAddress: '0x0000000000000000000000000000000000000001',
        name: 'DeFi Yield Aggregator',
        description: 'Automated yield optimization across multiple protocols',
        category: 'DeFi',
        teamName: 'Yield Masters',
        yesOdds: 65,
        totalVolume: BigInt('15000000000000000000'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
      {
        id: '1',
        marketAddress: '0x0000000000000000000000000000000000000002',
        name: 'NFT Marketplace for Musicians',
        description: 'Platform for musicians to mint and sell music NFTs',
        category: 'NFT',
        teamName: 'SoundChain',
        yesOdds: 42,
        totalVolume: BigInt('8500000000000000000'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
      {
        id: '2',
        marketAddress: '0x0000000000000000000000000000000000000003',
        name: 'Web3 Gaming Platform',
        description: 'Play-to-earn gaming ecosystem with token rewards',
        category: 'Gaming',
        teamName: 'GameFi Studios',
        yesOdds: 78,
        totalVolume: BigInt('22000000000000000000'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
    ]

    const found = mockProjects.find(p => p.id === params.id)
    setProject(found || null)
  }, [params.id])

  if (!project) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
            <Link
              href="/"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Back to Markets
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const noOdds = 100 - project.yesOdds

  return (
    <div className="min-h-screen">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
        >
          ← Back to Markets
        </Link>

        {/* Project header */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold">{project.name}</h1>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full">
                  {project.category}
                </span>
              </div>
              <p className="text-xl text-gray-300 mb-2">{project.description}</p>
              <p className="text-gray-500">by {project.teamName}</p>
            </div>
          </div>

          {/* Odds display */}
          <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center flex-1">
                <p className="text-5xl font-bold text-green-400 mb-2">
                  {project.yesOdds}%
                </p>
                <p className="text-gray-400">YES odds</p>
              </div>
              <div className="w-px h-16 bg-gray-700"></div>
              <div className="text-center flex-1">
                <p className="text-5xl font-bold text-red-400 mb-2">
                  {noOdds}%
                </p>
                <p className="text-gray-400">NO odds</p>
              </div>
            </div>

            {/* Odds bar */}
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                style={{ width: `${project.yesOdds}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/30 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Total Volume</p>
              <p className="text-2xl font-bold">
                ${parseFloat(formatEther(project.totalVolume)).toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Status</p>
              <p className="text-2xl font-bold">
                {project.settled ? (
                  <span className={project.yesWon ? 'text-green-400' : 'text-red-400'}>
                    {project.yesWon ? 'Winner!' : 'Did not win'}
                  </span>
                ) : (
                  'Active'
                )}
              </p>
            </div>
          </div>

          {/* Buy buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setBuyIsYes(true)
                setBuyModalOpen(true)
              }}
              className="px-6 py-4 bg-green-600 hover:bg-green-700 rounded-xl text-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={project.settled}
            >
              Buy YES {project.yesOdds}%
            </button>
            <button
              onClick={() => {
                setBuyIsYes(false)
                setBuyModalOpen(true)
              }}
              className="px-6 py-4 bg-red-600 hover:bg-red-700 rounded-xl text-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={project.settled}
            >
              Buy NO {noOdds}%
            </button>
          </div>
        </div>

        {/* Additional info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">How it works</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              • Buy YES shares if you think this project will win the hackathon
            </p>
            <p>
              • Buy NO shares if you think it won't win
            </p>
            <p>
              • Odds adjust automatically based on market demand (AMM)
            </p>
            <p>
              • After results are announced, winning shares can be redeemed for $1 each
            </p>
            <p className="text-purple-400 font-semibold">
              • Your potential profit depends on the odds when you buy
            </p>
          </div>
        </div>
      </div>

      {/* Buy modal */}
      <BuyModal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        project={project}
        isYes={buyIsYes}
      />
    </div>
  )
}

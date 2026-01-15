'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAccount, useReadContract } from 'wagmi'
import { Header } from '@/components/Header'
import { BuyModal } from '@/components/BuyModal'
import { Project } from '@/types'
import { formatUnits } from 'viem'
import Link from 'next/link'
import { MARKET_ABI } from '@/constants/contracts'

export default function ProjectDetail() {
  const params = useParams()
  const { address, isConnected } = useAccount()
  const [project, setProject] = useState<Project | null>(null)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [buyIsYes, setBuyIsYes] = useState(true)

  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: '0',
        marketAddress: '0x2462C067eE3992612cA786037E4F8d36C3232Ada',
        name: 'Tempo Directory',
        description: 'A comprehensive directory for discovering and navigating the Tempo ecosystem',
        category: 'Discovery',
        teamName: 'Steffi',
        yesOdds: 50,
        totalVolume: BigInt('0'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
      {
        id: '1',
        marketAddress: '0x94Bd897F7A0148aa7afD0e31389109D63464611E',
        name: 'Legal Directory',
        description: 'Decentralized legal services directory powered by blockchain',
        category: 'Legal',
        teamName: 'Lindsey',
        yesOdds: 50,
        totalVolume: BigInt('0'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
      {
        id: '2',
        marketAddress: '0xe01d9bC1a3e979937E30A10379CceE17596117dB',
        name: 'X Dashboard',
        description: 'Real-time analytics and monitoring dashboard for X/Twitter metrics',
        category: 'Analytics',
        teamName: 'Juan',
        yesOdds: 50,
        totalVolume: BigInt('0'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
      {
        id: '3',
        marketAddress: '0x32E90FF95d9f0701241049Bf2e624798f4899ABC',
        name: 'Chain/Stablecoin TVL flow dashboard',
        description: 'Track stablecoin flows and TVL movements across chains in real-time',
        category: 'AI',
        teamName: 'Karina',
        yesOdds: 50,
        totalVolume: BigInt('0'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
      {
        id: '4',
        marketAddress: '0x6533Bd6aFC2f96D29B58e97c86B134848620Ce37',
        name: 'Compliance App',
        description: 'Streamlined compliance management and regulatory reporting tool',
        category: 'Compliance',
        teamName: 'Gina',
        yesOdds: 50,
        totalVolume: BigInt('0'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
      {
        id: '5',
        marketAddress: '0x06BC94549Df915A3D43d976e6C244351077387f5',
        name: 'LinkedIn Connect',
        description: 'Professional networking integration for Web3 identity and credentials',
        category: 'Social',
        teamName: 'Teresa',
        yesOdds: 50,
        totalVolume: BigInt('0'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
    ]

    const found = mockProjects.find(p => p.id === params.id)
    setProject(found || null)
  }, [params.id])

  const { data: userShares } = useReadContract({
    address: project?.marketAddress as `0x${string}`,
    abi: MARKET_ABI,
    functionName: 'getUserShares',
    args: address ? [address] : undefined,
    query: {
      enabled: !!project?.marketAddress && !!address,
    },
  })

  if (!project) {
    return (
      <div className="min-h-screen noise">
        <Header />
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-16">
          <div className="text-center">
            <h1 className="font-serif text-4xl mb-6">Project Not Found</h1>
            <Link
              href="/"
              className="text-[#666] hover:text-white transition-colors text-sm tracking-wider uppercase"
            >
              ← Back to Markets
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const noOdds = 100 - project.yesOdds
  const sharesData = userShares as [bigint, bigint] | undefined
  const yesSharesHeld = sharesData ? sharesData[0] : BigInt(0)
  const noSharesHeld = sharesData ? sharesData[1] : BigInt(0)
  const hasPosition = yesSharesHeld > BigInt(0) || noSharesHeld > BigInt(0)

  return (
    <div className="min-h-screen noise">
      <Header />

      <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 py-8 sm:py-12">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center text-[#555] hover:text-white transition-colors mb-8 text-[11px] tracking-[0.2em] uppercase"
        >
          ← Back to Markets
        </Link>

        {/* Project header */}
        <div className="border border-[#222] p-8 sm:p-10 mb-6">
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[0.95]">{project.name}</h1>
              <span className="px-3 py-1 border border-[#333] text-[10px] font-bold tracking-[0.15em] uppercase text-[#888] shrink-0 mt-2">
                {project.category}
              </span>
            </div>
            <p className="text-[#666] text-base sm:text-lg max-w-xl leading-relaxed mb-2">{project.description}</p>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#444]">by {project.teamName}</p>
          </div>

          {/* Odds display */}
          <div className="border border-[#222] bg-[#0a0a0a] p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <p className="font-serif text-5xl sm:text-6xl mb-2">
                  {project.yesOdds}%
                </p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#555]">Yes odds</p>
              </div>
              <div className="w-px h-16 bg-[#222]"></div>
              <div className="text-center flex-1">
                <p className="font-serif text-5xl sm:text-6xl mb-2">
                  {noOdds}%
                </p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#555]">No odds</p>
              </div>
            </div>

            {/* Odds bar */}
            <div className="odds-bar">
              <div
                className="odds-fill"
                style={{ width: `${project.yesOdds}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="border border-[#222] p-5">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Total Volume</p>
              <p className="font-serif text-3xl">
                ${parseFloat(formatUnits(project.totalVolume, 6)).toFixed(2)}
              </p>
            </div>
            <div className="border border-[#222] p-5">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">Status</p>
              <p className="font-serif text-3xl">
                {project.settled ? (
                  project.yesWon ? 'Winner' : 'Did not win'
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
              className="btn-yes px-6 py-4 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={project.settled}
            >
              Buy YES {project.yesOdds}%
            </button>
            <button
              onClick={() => {
                setBuyIsYes(false)
                setBuyModalOpen(true)
              }}
              className="btn-no px-6 py-4 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={project.settled}
            >
              Buy NO {noOdds}%
            </button>
          </div>
        </div>

        {/* User Position */}
        {isConnected && hasPosition && (
          <div className="border border-[#222] p-8 sm:p-10 mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl mb-6">Your Position</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[#222] p-5">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">YES Shares</p>
                <p className="font-serif text-3xl">
                  {parseFloat(formatUnits(yesSharesHeld, 6)).toFixed(2)}
                </p>
              </div>
              <div className="border border-[#222] p-5">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#555] mb-2">NO Shares</p>
                <p className="font-serif text-3xl">
                  {parseFloat(formatUnits(noSharesHeld, 6)).toFixed(2)}
                </p>
              </div>
            </div>
            {project.settled && (
              <div className="mt-6">
                <button className="btn-yes w-full py-4 text-sm">
                  Claim Winnings
                </button>
              </div>
            )}
          </div>
        )}

        {/* How it works */}
        <div className="border border-[#222] p-8 sm:p-10">
          <h2 className="font-serif text-2xl sm:text-3xl mb-6">How it works</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <span className="text-[#333] font-bold text-lg">01</span>
              <p className="text-[#888]">
                <span className="text-white font-bold">Buy YES</span> = betting this project will win the hackathon
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-[#333] font-bold text-lg">02</span>
              <p className="text-[#888]">
                <span className="text-white font-bold">Buy NO</span> = betting this project won't win
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-[#333] font-bold text-lg">03</span>
              <p className="text-[#888]">
                <span className="text-white font-bold">Winning shares = $1 each</span> — if you bought at 50%, you double your money
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-[#333] font-bold text-lg">04</span>
              <p className="text-[#888]">
                <span className="text-white font-bold">Losing shares = $0</span> — you lose your entire bet
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#222]">
            <p className="text-[11px] tracking-[0.15em] uppercase text-[#444]">
              The lower the odds when you buy, the higher your potential profit
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#222] py-8 sm:py-10 mt-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between">
          <span className="text-[10px] tracking-[0.2em] text-[#444] uppercase">
            Built on Tempo
          </span>
          <span className="text-[10px] tracking-[0.2em] text-[#444] uppercase">
            2025
          </span>
        </div>
      </footer>

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

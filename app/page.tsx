'use client'

import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { Header } from '@/components/Header'
import { ProjectCard } from '@/components/ProjectCard'
import { BuyModal } from '@/components/BuyModal'
import { Project } from '@/types'
import { FACTORY_ADDRESS, FACTORY_ABI } from '@/constants/contracts'

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [buyIsYes, setBuyIsYes] = useState(true)
  const [sortBy, setSortBy] = useState<'odds' | 'volume' | 'newest'>('odds')

  const { data: marketAddresses } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'getAllMarkets',
  })

  useEffect(() => {
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
      {
        id: '3',
        marketAddress: '0x0000000000000000000000000000000000000004',
        name: 'DAO Governance Tool',
        description: 'Streamlined voting and proposal management for DAOs',
        category: 'DAO',
        teamName: 'GovTech',
        yesOdds: 55,
        totalVolume: BigInt('12000000000000000000'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
      {
        id: '4',
        marketAddress: '0x0000000000000000000000000000000000000005',
        name: 'Decentralized Social',
        description: 'Privacy-focused social media on blockchain',
        category: 'Social',
        teamName: 'SocialWeb3',
        yesOdds: 38,
        totalVolume: BigInt('9000000000000000000'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
      {
        id: '5',
        marketAddress: '0x0000000000000000000000000000000000000006',
        name: 'Carbon Credits Market',
        description: 'Tokenized carbon credits trading platform',
        category: 'Climate',
        teamName: 'GreenChain',
        yesOdds: 51,
        totalVolume: BigInt('11000000000000000000'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
      {
        id: '6',
        marketAddress: '0x0000000000000000000000000000000000000007',
        name: 'Crypto Payment Gateway',
        description: 'Easy crypto payments for e-commerce',
        category: 'Payments',
        teamName: 'PayFlow',
        yesOdds: 62,
        totalVolume: BigInt('16000000000000000000'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
      {
        id: '7',
        marketAddress: '0x0000000000000000000000000000000000000008',
        name: 'Identity Protocol',
        description: 'Decentralized identity and KYC solution',
        category: 'Identity',
        teamName: 'TrustID',
        yesOdds: 47,
        totalVolume: BigInt('10000000000000000000'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
      {
        id: '8',
        marketAddress: '0x0000000000000000000000000000000000000009',
        name: 'Prediction Markets',
        description: 'Bet on future events with transparent odds',
        category: 'Prediction',
        teamName: 'FutureBets',
        yesOdds: 70,
        totalVolume: BigInt('18000000000000000000'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
      {
        id: '9',
        marketAddress: '0x000000000000000000000000000000000000000a',
        name: 'Supply Chain Tracker',
        description: 'Blockchain-based supply chain transparency',
        category: 'Supply',
        teamName: 'ChainTrace',
        yesOdds: 44,
        totalVolume: BigInt('7500000000000000000'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
      {
        id: '10',
        marketAddress: '0x000000000000000000000000000000000000000b',
        name: 'Decentralized Exchange',
        description: 'Fast and cheap token swaps with minimal slippage',
        category: 'DeFi',
        teamName: 'SwapLab',
        yesOdds: 58,
        totalVolume: BigInt('14000000000000000000'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
      {
        id: '11',
        marketAddress: '0x000000000000000000000000000000000000000c',
        name: 'AI Trading Bot',
        description: 'Automated trading strategies using machine learning',
        category: 'Trading',
        teamName: 'BotTraders',
        yesOdds: 73,
        totalVolume: BigInt('20000000000000000000'),
        settled: false,
        yesWon: false,
        createdAt: Date.now(),
      },
    ]

    setProjects(mockProjects)
  }, [])

  const handleBuyYes = (project: Project) => {
    setSelectedProject(project)
    setBuyIsYes(true)
    setBuyModalOpen(true)
  }

  const handleBuyNo = (project: Project) => {
    setSelectedProject(project)
    setBuyIsYes(false)
    setBuyModalOpen(true)
  }

  const sortedProjects = [...projects].sort((a, b) => {
    switch (sortBy) {
      case 'odds':
        return b.yesOdds - a.yesOdds
      case 'volume':
        return Number(b.totalVolume - a.totalVolume)
      case 'newest':
        return b.createdAt - a.createdAt
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen noise">
      <Header />

      {/* Hero section */}
      <div className="border-b border-[#222]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-[11px] tracking-[0.3em] text-[#555] uppercase mb-6 animate-fade-in">
              Tempo Blockchain • Live Markets
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-4 sm:mb-6 leading-[0.9] tracking-tight animate-fade-in animate-delay-1">
              Bet on the
              <br />
              <span className="italic">winners.</span>
            </h1>
            <p className="text-[#666] text-base sm:text-lg max-w-xl leading-relaxed animate-fade-in animate-delay-2">
              Trade shares on hackathon projects. Back your favorites 
              and earn when they take home the prize.
            </p>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="border-b border-[#222] bg-[#0a0a0a] overflow-hidden py-3">
        <div className="animate-marquee whitespace-nowrap flex gap-8">
          {[...sortedProjects, ...sortedProjects].map((p, i) => (
            <span key={i} className="text-[11px] tracking-wider text-[#555]">
              <span className="text-white font-bold">{p.name}</span>
              <span className="mx-2">·</span>
              <span>{p.yesOdds}%</span>
              <span className="mx-4">⬡</span>
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-8 sm:py-10">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <span className="text-[10px] tracking-[0.2em] text-[#555] uppercase">Sort</span>
          <div className="flex gap-2">
            {(['odds', 'volume', 'newest'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-4 py-2 text-[11px] font-bold tracking-[0.1em] uppercase border transition-all duration-200 ${
                  sortBy === sort
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-[#666] border-[#333] hover:border-white hover:text-white'
                }`}
              >
                {sort}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects grid */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {sortedProjects.map((project, index) => (
            <div
              key={project.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
            >
              <ProjectCard
                project={project}
                onBuyYes={() => handleBuyYes(project)}
                onBuyNo={() => handleBuyNo(project)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#222] py-8 sm:py-10">
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
      {selectedProject && (
        <BuyModal
          isOpen={buyModalOpen}
          onClose={() => setBuyModalOpen(false)}
          project={selectedProject}
          isYes={buyIsYes}
        />
      )}
    </div>
  )
}

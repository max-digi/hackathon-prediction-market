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
        <div className="max-w-7xl mx-auto px-8 sm:px-16 lg:px-24 xl:px-32 py-16 sm:py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-[11px] tracking-[0.3em] text-[#555] uppercase mb-6 animate-fade-in">
              Tempo Blockchain • Live Markets
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-4 sm:mb-6 leading-[0.9] tracking-tight animate-fade-in animate-delay-1">
              Tempo
              <br />
              <span className="italic">Odds.</span>
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
      <div className="max-w-7xl mx-auto px-8 sm:px-16 lg:px-24 xl:px-32 py-8 sm:py-10">
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
      <div className="max-w-7xl mx-auto px-8 sm:px-16 lg:px-24 xl:px-32 pb-16 sm:pb-24">
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
        <div className="max-w-7xl mx-auto px-8 sm:px-16 lg:px-24 xl:px-32 flex items-center justify-between">
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

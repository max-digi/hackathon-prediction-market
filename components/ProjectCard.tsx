'use client'

import Link from 'next/link'
import { Project } from '@/types'
import { formatUnits } from 'viem'

interface ProjectCardProps {
  project: Project
  onBuyYes: () => void
  onBuyNo: () => void
}

export function ProjectCard({ project, onBuyYes, onBuyNo }: ProjectCardProps) {
  const noOdds = 100 - project.yesOdds
  const volume = parseFloat(formatUnits(project.totalVolume, 6)).toFixed(0)

  return (
    <Link href={`/project/${project.id}`}>
      <div className="group card p-0 overflow-hidden cursor-pointer">
        {/* Header with category */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#222]">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#666]">
            {project.category}
          </span>
          <span className="text-[10px] font-mono text-[#444]">
            #{project.id.padStart(2, '0')}
          </span>
        </div>

        {/* Main content */}
        <div className="px-5 sm:px-6 py-5 sm:py-6">
          {/* Project name - fixed height for consistency */}
          <div className="min-h-[3.5rem] sm:min-h-[4rem] mb-2">
            <h3 className="font-serif text-xl sm:text-2xl group-hover:text-white/80 transition-colors leading-tight line-clamp-2">
              {project.name}
            </h3>
          </div>
          
          {/* Team */}
          <p className="text-[11px] tracking-[0.1em] text-[#555] uppercase mb-6">
            by {project.teamName}
          </p>

          {/* Odds display - big and bold */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight">
                {project.yesOdds}
              </span>
              <span className="text-xl text-[#555]">%</span>
            </div>
            
            {/* Minimal odds bar */}
            <div className="odds-bar">
              <div
                className="odds-fill"
                style={{ width: `${project.yesOdds}%` }}
              />
            </div>
          </div>

          {/* Volume stat */}
          <div className="flex items-center justify-between text-xs border-t border-[#222] pt-3 sm:pt-4 mb-4 sm:mb-6">
            <span className="text-[#555] uppercase tracking-wider">Vol</span>
            <span className="font-bold">${volume}</span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={(e) => {
                e.preventDefault()
                onBuyYes()
              }}
              className="btn-yes px-3 sm:px-4 py-2.5 sm:py-3 text-[10px] sm:text-xs disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={project.settled}
            >
              Yes · {project.yesOdds}%
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                onBuyNo()
              }}
              className="btn-no px-3 sm:px-4 py-2.5 sm:py-3 text-[10px] sm:text-xs disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={project.settled}
            >
              No · {noOdds}%
            </button>
          </div>
        </div>

        {/* Settled state */}
        {project.settled && (
          <div className="px-5 sm:px-6 py-3 border-t border-[#222] bg-[#111]">
            <span className={`text-xs font-bold tracking-wider uppercase ${
              project.yesWon ? 'text-white' : 'text-[#555]'
            }`}>
              {project.yesWon ? '● Winner' : '○ Did not win'}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

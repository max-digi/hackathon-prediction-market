'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from './ConnectButton'

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b border-[#222] bg-black/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-6 sm:gap-12">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-200">
                <span className="text-sm sm:text-lg font-bold">⬡</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                  Hackathon
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-[#666] uppercase hidden sm:block">
                  Prediction Market
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className={`text-xs font-bold tracking-[0.15em] uppercase transition-all duration-200 ${
                  pathname === '/'
                    ? 'text-white'
                    : 'text-[#666] hover:text-white'
                }`}
              >
                Markets
              </Link>
              <Link
                href="/portfolio"
                className={`text-xs font-bold tracking-[0.15em] uppercase transition-all duration-200 ${
                  pathname === '/portfolio'
                    ? 'text-white'
                    : 'text-[#666] hover:text-white'
                }`}
              >
                Portfolio
              </Link>
            </nav>
          </div>

          <ConnectButton />
        </div>
      </div>
    </header>
  )
}

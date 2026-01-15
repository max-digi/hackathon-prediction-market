'use client'

import { useAccount, useDisconnect } from 'wagmi'
import { useState } from 'react'
import { WalletModal } from './WalletModal'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [showModal, setShowModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-3 px-4 py-2.5 border border-[#333] hover:border-[#555] transition-all duration-200"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-xs font-mono tracking-wider">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <svg 
            className={`w-3 h-3 text-[#555] transition-transform ${showMenu ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#0a0a0a] border border-[#222] z-50">
              <div className="px-4 py-4 border-b border-[#222]">
                <p className="text-[10px] text-[#555] uppercase tracking-wider mb-2">Connected</p>
                <p className="text-xs font-mono truncate">{address}</p>
              </div>
              <button
                onClick={() => {
                  disconnect()
                  setShowMenu(false)
                }}
                className="w-full px-4 py-3 text-left text-xs font-bold tracking-wider uppercase text-[#666] hover:text-white hover:bg-[#111] transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="group relative px-5 py-2.5 bg-white text-black font-bold text-xs tracking-[0.1em] uppercase hover:bg-transparent hover:text-white border-2 border-white transition-all duration-200"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          Connect
        </span>
      </button>

      <WalletModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  )
}

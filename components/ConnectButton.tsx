'use client'

import { useAccount, useDisconnect, usePublicClient } from 'wagmi'
import { useState, useEffect } from 'react'
import { WalletModal } from './WalletModal'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const publicClient = usePublicClient()
  const [showModal, setShowModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isFunding, setIsFunding] = useState(false)
  const [fundSuccess, setFundSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const requestFunds = async () => {
    if (!address || !publicClient) return
    setIsFunding(true)
    setFundSuccess(false)
    try {
      const result = await publicClient.request({
        method: 'tempo_fundAddress' as any,
        params: [address],
      }) as `0x${string}`[] | `0x${string}`
      const hash = Array.isArray(result) ? result[0] : result
      if (hash) {
        await publicClient.waitForTransactionReceipt({ hash })
        setFundSuccess(true)
        setTimeout(() => setFundSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Faucet error:', err)
    }
    setIsFunding(false)
  }

  if (!mounted) {
    return (
      <button className="group flex items-center gap-2 px-5 py-2 bg-white text-black font-bold text-[11px] tracking-wide uppercase rounded-full opacity-50">
        Connect
      </button>
    )
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2.5 px-4 py-2 bg-[#111] border border-[#333] hover:border-[#555] rounded-full transition-all duration-200"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[11px] font-mono tracking-wide">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </button>

        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-52 bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden z-50 shadow-2xl">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(address)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="w-full px-4 py-3 border-b border-[#222] bg-[#111] hover:bg-[#151515] transition-all text-left"
              >
                <p className="text-[9px] text-[#555] uppercase tracking-wider mb-1">
                  {copied ? '✓ Copied!' : 'Click to copy'}
                </p>
                <p className="text-[11px] font-mono truncate text-[#888]">{address}</p>
              </button>
              <button
                onClick={requestFunds}
                disabled={isFunding}
                className="w-full px-4 py-3 text-left text-[11px] font-bold tracking-wider uppercase text-[#666] hover:text-white hover:bg-[#151515] transition-all flex items-center gap-2 border-b border-[#222] disabled:opacity-50"
              >
                {isFunding ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#666] border-t-white rounded-full animate-spin" />
                    Funding...
                  </>
                ) : fundSuccess ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400">Funded!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Get Funds
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  disconnect()
                  setShowMenu(false)
                }}
                className="w-full px-4 py-3 text-left text-[11px] font-bold tracking-wider uppercase text-[#666] hover:text-white hover:bg-[#151515] transition-all flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        className="group flex items-center gap-2 px-5 py-2 bg-white text-black font-bold text-[11px] tracking-wide uppercase rounded-full hover:bg-[#eee] transition-all duration-200"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        Connect
      </button>

      <WalletModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  )
}

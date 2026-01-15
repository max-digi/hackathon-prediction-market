'use client'

import { useConnect, useAccount } from 'wagmi'
import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { createPublicClient, http } from 'viem'
import { tempo } from '@/lib/wagmi'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

function getFriendlyErrorMessage(error: Error | null): string {
  if (!error) return ''
  
  const message = error.message.toLowerCase()
  
  if (message.includes('user rejected') || message.includes('user denied') || message.includes('cancelled')) {
    return 'Request cancelled. Try again when ready.'
  }
  if (message.includes('already pending')) {
    return 'A request is already pending. Check your wallet.'
  }
  if (message.includes('not found') || message.includes('no passkey')) {
    return 'No passkey found. Try signing up first.'
  }
  if (message.includes('not supported') || message.includes('webauthn')) {
    return 'Passkeys not supported on this device/browser.'
  }
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'Request timed out. Please try again.'
  }
  if (message.includes('network') || message.includes('connection')) {
    return 'Network error. Check your connection and try again.'
  }
  
  return 'Something went wrong. Please try again.'
}

// Create a standalone client for faucet calls (doesn't depend on React state)
const faucetClient = createPublicClient({
  chain: tempo,
  transport: http(),
})

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, connectAsync, connectors, isPending, error, reset } = useConnect()
  const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [localError, setLocalError] = useState<Error | null>(null)
  const [isFunding, setIsFunding] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setLocalError(null)
      setShowSuccess(false)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (error) {
      setLocalError(error)
    }
  }, [error])

  // Fund account with DONOTUSE tokens using standalone client
  const fundAccount = async (accountAddress: string) => {
    console.log('=== FAUCET: Starting fund for:', accountAddress)
    setIsFunding(true)
    try {
      console.log('=== FAUCET: Calling tempo_fundAddress RPC...')
      const result = await faucetClient.request({
        method: 'tempo_fundAddress' as any,
        params: [accountAddress as `0x${string}`],
      }) as `0x${string}`[] | `0x${string}`
      console.log('=== FAUCET: RPC result:', result)
      const hash = Array.isArray(result) ? result[0] : result
      console.log('=== FAUCET: Tx hash:', hash)
      if (hash) {
        console.log('=== FAUCET: Waiting for confirmation...')
        await faucetClient.waitForTransactionReceipt({ hash })
        console.log('=== FAUCET: Transaction confirmed!')
      }
    } catch (err) {
      console.error('=== FAUCET ERROR:', err)
    }
    setIsFunding(false)
    console.log('=== FAUCET: Done')
  }

  const showSuccessAndClose = () => {
    setShowSuccess(true)
    setTimeout(() => {
      onClose()
      setShowSuccess(false)
    }, 1200)
  }

  const clearError = useCallback(() => {
    setLocalError(null)
    reset()
  }, [reset])

  if (!mounted || !isOpen) return null

  const webAuthnConnector = connectors.find(c => c.id === 'webAuthn')
  const otherConnectors = connectors.filter(c => c.id !== 'webAuthn')

  const handleSignUp = async () => {
    clearError()
    if (webAuthnConnector) {
      try {
        const result = await connectAsync(
          { connector: webAuthnConnector, capabilities: { type: 'sign-up' } } as any
        )
        const newAddress = result.accounts[0]
        console.log('Sign-up successful, funding account:', newAddress)
        await fundAccount(newAddress)
        showSuccessAndClose()
      } catch (err: any) {
        console.error('Sign-up failed:', err)
      }
    }
  }

  const handleSignIn = () => {
    clearError()
    if (webAuthnConnector) {
      connect(
        { connector: webAuthnConnector },
        {
          onSuccess: () => {
            showSuccessAndClose()
          },
        }
      )
    }
  }

  const handleOtherWallet = (connector: typeof connectors[0]) => {
    clearError()
    connect(
      { connector },
      {
        onSuccess: () => {
          showSuccessAndClose()
        },
      }
    )
  }

  const friendlyError = getFriendlyErrorMessage(localError)

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#0a0a0a] border border-[#222] rounded-2xl w-full max-w-[380px] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="font-serif text-xl">
            {showSuccess ? 'Connected' : 'Connect Wallet'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#151515] hover:bg-[#222] text-[#666] hover:text-white transition-all"
            aria-label="Close modal"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Funding State */}
        {isFunding ? (
          <div className="px-6 pb-8 pt-4 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
              <span className="w-8 h-8 border-3 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            </div>
            <p className="text-base font-medium text-blue-400">Funding Your Wallet</p>
            <p className="text-[11px] text-[#555] mt-1">Adding testnet tokens...</p>
          </div>
        ) : showSuccess ? (
          <div className="px-6 pb-8 pt-4 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-base font-medium text-green-400">Wallet Connected</p>
            <p className="text-[11px] text-[#555] mt-1">Redirecting...</p>
          </div>
        ) : (
          <>
            {/* Passkey Section */}
            {webAuthnConnector && (
              <div className="px-6 pb-6">
                <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                        <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Passkey</p>
                      <p className="text-[10px] text-[#555]">Recommended • No extension needed</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleSignUp}
                      disabled={isPending}
                      className="w-full py-3.5 bg-white text-black font-bold text-xs tracking-wide uppercase rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-[#eee]"
                    >
                      {isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Creating...
                        </span>
                      ) : (
                        'Create New Wallet'
                      )}
                    </button>
                    <button
                      onClick={handleSignIn}
                      disabled={isPending}
                      className="w-full py-3.5 bg-transparent text-white font-bold text-xs tracking-wide uppercase rounded-lg border border-[#333] transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:border-white enabled:hover:bg-white/5"
                    >
                      {isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connecting...
                        </span>
                      ) : (
                        'I Have a Passkey'
                      )}
                    </button>
                  </div>

                  {localError && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-xs text-red-400 mb-2">{friendlyError}</p>
                      <button
                        onClick={clearError}
                        className="text-[10px] font-bold text-red-400 uppercase tracking-wider hover:text-red-300 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Other Wallets */}
            {otherConnectors.length > 0 && (
              <div className="px-6 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-[#222]" />
                  <span className="text-[10px] text-[#444] uppercase tracking-wider">Or</span>
                  <div className="flex-1 h-px bg-[#222]" />
                </div>
                <div className="space-y-2">
                  {otherConnectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => handleOtherWallet(connector)}
                      disabled={isPending}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-[#111] border border-[#222] rounded-xl transition-all duration-200 group disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:border-[#444] enabled:hover:bg-[#151515]"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden">
                        <svg width="36" height="36" viewBox="0 0 318.6 318.6">
                          <path fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" d="m274.1 35.5-99.5 73.9 18.4-43.6z"/>
                          <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="m44.4 35.5 98.7 74.6-17.5-44.3zm193.9 171.3-26.5 40.6 56.7 15.6 16.3-55.3zm-204.4.9 16.2 55.3 56.7-15.6-26.5-40.6z"/>
                          <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="m103.6 138.2-15.8 23.9 56.3 2.5-2-60.5zm111.3 0-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zm71.1-16.5 33.9 16.5-4.7-39.3z"/>
                          <path fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" d="m211.8 247.4-33.9-16.5 2.7 22.1-.3 9.3zm-105 0 31.5 14.9-.2-9.3 2.5-22.1z"/>
                          <path fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" d="m138.8 193.5-28.2-8.3 19.9-9.1zm40.9 0 8.3-17.4 20 9.1z"/>
                          <path fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" d="m106.8 247.4 4.8-40.6-31.3.9zM207 206.8l4.8 40.6 26.5-39.7zm23.8-44.7-56.2 2.5 5.2 28.9 8.3-17.4 20 9.1zm-120.2 23.1 20-9.1 8.2 17.4 5.3-28.9-56.3-2.5z"/>
                          <path fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" d="m87.8 162.1 23.6 46-.8-22.9zm120.3 23.1-.9 22.9 23.7-46zm-64-20.6-5.3 28.9 6.6 34.1 1.5-44.9zm30.5 0-2.7 18 1.2 45 6.7-34.1z"/>
                          <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="m179.8 193.5-6.7 34.1 4.8 3.3 29.2-22.8.9-22.9zm-69.2-8.3.8 22.9 29.2 22.8 4.8-3.3-6.6-34.1z"/>
                          <path fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" d="m180.3 262.3.3-9.3-2.5-2.2h-37.7l-2.3 2.2.2 9.3-31.5-14.9 11 9 22.3 15.5h38.3l22.4-15.5 11-9z"/>
                          <path fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" d="m177.9 230.9-4.8-3.3h-27.7l-4.8 3.3-2.5 22.1 2.3-2.2h37.7l2.5 2.2z"/>
                          <path fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" d="m278.3 114.2 8.5-40.8-12.7-37.9-96.2 71.4 37 31.3 52.3 15.3 11.6-13.5-5-3.6 8-7.3-6.2-4.8 8-6.1zM31.8 73.4l8.5 40.8-5.4 4 8 6.1-6.1 4.8 8 7.3-5 3.6 11.5 13.5 52.3-15.3 37-31.3-96.2-71.4z"/>
                          <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="m267.2 153.5-52.3-15.3 15.9 23.9-23.7 46 31.2-.4h46.5zm-163.6-15.3-52.3 15.3-17.4 54.2h46.4l31.1.4-23.6-46zm71 26.4 3.3-57.7 15.2-41.1h-67.5l15 41.1 3.5 57.7 1.2 18.2.1 44.8h27.7l.2-44.8z"/>
                        </svg>
                      </div>
                      
                      <span className="flex-1 text-left">
                        <span className="block text-sm font-medium">{connector.name === 'Injected' ? 'MetaMask' : connector.name}</span>
                      </span>

                      <svg className="w-4 h-4 text-[#444] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#151515]">
              <p className="text-[10px] text-[#444] text-center">
                Secure • No extensions required • Works on all devices
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

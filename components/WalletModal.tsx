'use client'

import { useConnect } from 'wagmi'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, connectors, isPending, error } = useConnect()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  const webAuthnConnector = connectors.find(c => c.id === 'webAuthn')
  const otherConnectors = connectors.filter(c => c.id !== 'webAuthn')

  const handleSignUp = () => {
    if (webAuthnConnector) {
      connect({ connector: webAuthnConnector, createAccount: true } as any)
    }
  }

  const handleSignIn = () => {
    if (webAuthnConnector) {
      connect({ connector: webAuthnConnector })
    }
  }

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center p-6 py-12">
        <div 
          className="bg-[#0a0a0a] border border-[#222] w-full max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#222]">
            <h2 className="text-sm font-bold tracking-[0.1em] uppercase">Connect</h2>
            <button
              onClick={onClose}
              className="text-[#555] hover:text-white transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Passkey Section */}
          {webAuthnConnector && (
            <div className="p-6 border-b border-[#222]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                    <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold">Passkey</p>
                  <p className="text-[10px] text-[#555] uppercase tracking-wider">Recommended</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSignUp}
                  disabled={isPending}
                  className="px-4 py-3 bg-white text-black font-bold text-xs tracking-wider uppercase hover:bg-white/90 transition-all disabled:opacity-50"
                >
                  {isPending ? 'Creating...' : 'Sign Up'}
                </button>
                <button
                  onClick={handleSignIn}
                  disabled={isPending}
                  className="px-4 py-3 border-2 border-white text-white font-bold text-xs tracking-wider uppercase hover:bg-white hover:text-black transition-all disabled:opacity-50"
                >
                  {isPending ? 'Signing in...' : 'Sign In'}
                </button>
              </div>

              {error && (
                <p className="mt-3 text-xs text-red-400">{error.message}</p>
              )}
            </div>
          )}

          {/* Other Wallets */}
          {otherConnectors.length > 0 && (
            <div className="p-3">
              <p className="px-4 py-2 text-[10px] text-[#444] uppercase tracking-wider">Or connect wallet</p>
              {otherConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => {
                    connect({ connector })
                    onClose()
                  }}
                  disabled={isPending}
                  className="w-full flex items-center gap-4 px-4 py-4 hover:bg-[#111] transition-all duration-200 group disabled:opacity-50"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#627EEA] to-[#3C3C3D] rounded-xl flex items-center justify-center">
                    <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
                      <path d="M6.99999 0L6.83667 0.555006V15.0454L6.99999 15.2085L13.5 11.2086L6.99999 0Z" fill="white"/>
                      <path d="M7 0L0.5 11.2086L7 15.2085V8.14015V0Z" fill="white" fillOpacity="0.8"/>
                    </svg>
                  </div>
                  
                  <span className="flex-1 text-left">
                    <span className="block text-sm font-medium group-hover:text-white transition-colors">
                      {connector.name}
                    </span>
                  </span>

                  <span className="text-[11px] text-[#555]">Detected</span>
                </button>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#222]">
            <p className="text-[10px] text-[#444] text-center tracking-wider">
              Passkeys are stored securely on your device
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

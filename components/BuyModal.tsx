'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { MARKET_ABI, USDC_ABI, USDC_ADDRESS } from '@/constants/contracts'
import { Project } from '@/types'

interface BuyModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  isYes: boolean
}

export function BuyModal({ isOpen, onClose, project, isYes }: BuyModalProps) {
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<'input' | 'approve' | 'buy' | 'success'>('input')
  const { address } = useAccount()

  const { writeContract: approveUSDC, data: approveHash } = useWriteContract()
  const { writeContract: buyShares, data: buyHash } = useWriteContract()

  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isSuccess: buySuccess } = useWaitForTransactionReceipt({ hash: buyHash })

  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, project.marketAddress as `0x${string}`] : undefined,
  })

  const { data: sharesOutData } = useReadContract({
    address: project.marketAddress as `0x${string}`,
    abi: MARKET_ABI,
    functionName: 'calculateSharesOut',
    args: amount ? [isYes, parseEther(amount)] : undefined,
  })
  const sharesOut = sharesOutData as bigint | undefined

  useEffect(() => {
    if (approveSuccess && step === 'approve') {
      setStep('buy')
      handleBuy()
    }
  }, [approveSuccess, step])

  useEffect(() => {
    if (buySuccess && step === 'buy') {
      setStep('success')
    }
  }, [buySuccess, step])

  const handleApprove = async () => {
    if (!amount || !address) return

    setStep('approve')
    const amountWei = parseEther(amount)

    approveUSDC({
      address: USDC_ADDRESS as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [project.marketAddress as `0x${string}`, amountWei],
    })
  }

  const handleBuy = async () => {
    if (!amount || !address) return

    const amountWei = parseEther(amount)

    buyShares({
      address: project.marketAddress as `0x${string}`,
      abi: MARKET_ABI,
      functionName: 'buyShares',
      args: [isYes, amountWei],
    })
  }

  const handleSubmit = async () => {
    if (!amount || !address) return

    const amountWei = parseEther(amount)
    const currentAllowance = (allowance as bigint) || 0n

    if (currentAllowance < amountWei) {
      await handleApprove()
    } else {
      setStep('buy')
      await handleBuy()
    }
  }

  const resetAndClose = () => {
    setAmount('')
    setStep('input')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border border-[#222] max-w-md w-full">
        {step === 'success' ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 border-2 border-white flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="font-serif text-3xl mb-3">Success</h3>
            <p className="text-[#666] text-sm mb-8">
              You purchased {sharesOut ? parseFloat(formatEther(sharesOut)).toFixed(2) : '0'} {isYes ? 'YES' : 'NO'} shares
            </p>
            <button
              onClick={resetAndClose}
              className="btn-primary w-full py-3 text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
              <h3 className="text-xs font-bold tracking-[0.15em] uppercase">
                Buy {isYes ? 'Yes' : 'No'} Shares
              </h3>
              <button
                onClick={resetAndClose}
                className="text-[#555] hover:text-white text-xl transition-colors"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Project info */}
              <div className="border border-[#222] p-4 mb-6">
                <h4 className="font-serif text-xl mb-1">{project.name}</h4>
                <p className="text-[11px] text-[#555] uppercase tracking-wider">
                  Current odds: {isYes ? project.yesOdds : 100 - project.yesOdds}%
                </p>
              </div>

              {/* Amount input */}
              <div className="mb-6">
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[#555] mb-3">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-4 bg-black border border-[#333] text-xl font-mono focus:outline-none focus:border-white transition-colors"
                  disabled={step !== 'input'}
                />
              </div>

              {/* Shares preview */}
              {amount && sharesOut && (
                <div className="border border-[#333] p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#555] uppercase tracking-wider">You receive</span>
                    <span className="font-mono font-bold">
                      {parseFloat(formatEther(sharesOut)).toFixed(4)} shares
                    </span>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!amount || parseFloat(amount) <= 0 || step !== 'input'}
                className="btn-primary w-full py-4 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {step === 'input' && 'Confirm Purchase'}
                {step === 'approve' && 'Approving...'}
                {step === 'buy' && 'Processing...'}
              </button>

              <p className="text-[10px] text-[#444] text-center mt-4 tracking-wider">
                Winning shares settle at $1 each
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

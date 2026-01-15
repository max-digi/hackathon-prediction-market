'use client'

import { useState } from 'react'
import { useAccount, useReadContract, usePublicClient, useWriteContract } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { parseUnits, formatUnits } from 'viem'
import Link from 'next/link'
import { MARKET_ABI, USDC_ABI } from '@/constants/contracts'
import { Project } from '@/types'

// Tempo mainnet faucet stablecoin (TIP-20 DONOTUSE)
const USDC_ADDRESS = '0x20C000000000000000000000033aBB6ac7D235e5' as `0x${string}`
// Fee token for gas (same as USDC on this network)
const FEE_TOKEN = USDC_ADDRESS

interface BuyModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  isYes: boolean
}

export function BuyModal({ isOpen, onClose, project, isYes }: BuyModalProps) {
  const [amount, setAmount] = useState('1')
  const [status, setStatus] = useState<'input' | 'approving' | 'buying' | 'success' | 'error'>('input')
  const [statusText, setStatusText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [purchasedShares, setPurchasedShares] = useState<string>('0')
  const [purchaseAmount, setPurchaseAmount] = useState<string>('0')
  const [txHash, setTxHash] = useState<string | null>(null)
  const MIN_BET = 1
  
  const { address } = useAccount()
  const publicClient = usePublicClient()
  
  // Use wagmi's writeContract hook for buyShares
  const { writeContractAsync } = useWriteContract()
  
  // Use Tempo's token.useApprove for TIP-20 approval
  const approveToken = Hooks.token.useApproveSync()

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, project.marketAddress as `0x${string}`] : undefined,
  })

  const { data: sharesOutData } = useReadContract({
    address: project.marketAddress as `0x${string}`,
    abi: MARKET_ABI,
    functionName: 'calculateSharesOut',
    args: amount && parseFloat(amount) >= 1 ? [isYes, parseUnits(amount, 6)] : undefined,
  })
  const sharesOut = sharesOutData as bigint | undefined

  const handleSubmit = async () => {
    console.log('handleSubmit called', { amount, address })
    
    if (!amount || !address) {
      console.log('Missing amount or address')
      return
    }
    if (!publicClient) {
      setErrorMessage('Network error. Please refresh.')
      setStatus('error')
      return
    }

    try {
      setPurchaseAmount(amount)
      if (sharesOut) {
        setPurchasedShares(formatUnits(sharesOut, 6))
      }

      const amountWei = parseUnits(amount, 6)
      
      // Check current allowance
      const { data: currentAllowance } = await refetchAllowance()
      const allowanceValue = (currentAllowance as bigint) || 0n

      // Step 1: Approve if needed
      if (allowanceValue < amountWei) {
        setStatus('approving')
        setStatusText('Confirm approval in wallet...')
        
        console.log('Calling approve via Tempo token.useApproveSync')
        
        await approveToken.mutateAsync({
          token: USDC_ADDRESS,
          spender: project.marketAddress as `0x${string}`,
          amount: amountWei,
          feeToken: FEE_TOKEN,
        })
        
        console.log('Approval confirmed')
      }

      // Step 2: Buy shares
      setStatus('buying')
      setStatusText('Confirm purchase in wallet...')
      
      console.log('Calling buyShares on market:', project.marketAddress)
      
      const buyHash = await writeContractAsync({
        address: project.marketAddress as `0x${string}`,
        abi: MARKET_ABI,
        functionName: 'buyShares',
        args: [isYes, amountWei],
        feeToken: FEE_TOKEN,
      } as any)
      
      setTxHash(buyHash)
      setStatusText('Waiting for confirmation...')
      await publicClient.waitForTransactionReceipt({ hash: buyHash })
      
      // Success!
      setStatus('success')
      
    } catch (error: any) {
      console.error('Transaction error:', error)
      setErrorMessage(error?.message?.slice(0, 200) || 'Transaction failed')
      setStatus('error')
    }
  }

  const resetAndClose = () => {
    setAmount('1')
    setStatus('input')
    setStatusText('')
    setErrorMessage('')
    setPurchasedShares('0')
    setPurchaseAmount('0')
    setTxHash(null)
    onClose()
  }

  if (!isOpen) return null

  const isLoading = status === 'approving' || status === 'buying'
  const sharesValue = parseFloat(purchasedShares)
  const winValue = sharesValue.toFixed(2)

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border border-[#222] max-w-md w-full">
        {status === 'success' ? (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 border-2 border-white flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="font-serif text-3xl mb-2">Purchase Complete</h3>
              <p className="text-[#666] text-sm">Your position has been confirmed</p>
            </div>

            <div className="border border-[#222] divide-y divide-[#222] mb-6">
              <div className="p-4">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#555] block mb-1">Market</span>
                <span className="font-serif text-lg">{project.name}</span>
              </div>
              <div className="p-4">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#555] block mb-1">Position</span>
                <span className={`font-mono font-bold text-lg ${isYes ? 'text-white' : 'text-[#888]'}`}>
                  {isYes ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#555] block mb-1">Amount Paid</span>
                  <span className="font-mono">${parseFloat(purchaseAmount).toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#555] block mb-1">Shares Received</span>
                  <span className="font-mono">{parseFloat(purchasedShares).toFixed(4)}</span>
                </div>
              </div>
              <div className="p-4 bg-[#111]">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#555] block mb-3">Potential Outcomes</span>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#888]">If you WIN</span>
                  <span className="font-mono text-white">${winValue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#888]">If you LOSE</span>
                  <span className="font-mono text-[#555]">$0.00</span>
                </div>
              </div>
              {txHash && (
                <div className="p-4 border-t border-[#222]">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#555] block mb-2">Transaction</span>
                  <a 
                    href={`https://explore.mainnet.tempo.xyz/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-[#888] hover:text-white transition-colors break-all"
                  >
                    {txHash.slice(0, 10)}...{txHash.slice(-8)} ↗
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Link href="/portfolio" onClick={resetAndClose} className="btn-primary w-full py-3 text-sm block text-center">
                View Portfolio
              </Link>
              <button onClick={resetAndClose} className="w-full py-3 text-sm border border-[#333] hover:border-white transition-colors">
                Done
              </button>
            </div>
          </div>
        ) : status === 'error' ? (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 border-2 border-[#555] flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">✕</span>
              </div>
              <h3 className="font-serif text-3xl mb-2">Transaction Failed</h3>
              <p className="text-[#666] text-sm break-words">{errorMessage}</p>
            </div>
            <div className="space-y-3">
              <button onClick={() => setStatus('input')} className="btn-primary w-full py-3 text-sm">
                Try Again
              </button>
              <button onClick={resetAndClose} className="w-full py-3 text-sm border border-[#333] hover:border-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
              <h3 className="text-xs font-bold tracking-[0.15em] uppercase">Buy {isYes ? 'Yes' : 'No'} Shares</h3>
              <button onClick={resetAndClose} className="text-[#555] hover:text-white text-xl transition-colors">×</button>
            </div>

            <div className="p-6">
              <div className="border border-[#222] p-4 mb-6">
                <h4 className="font-serif text-xl mb-1">{project.name}</h4>
                <p className="text-[11px] text-[#555] uppercase tracking-wider">
                  Current odds: {isYes ? project.yesOdds : 100 - project.yesOdds}%
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[#555] mb-3">Amount (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1"
                  min="1"
                  step="1"
                  className="w-full px-4 py-4 bg-black border border-[#333] text-xl font-mono focus:outline-none focus:border-white transition-colors"
                  disabled={isLoading}
                />
              </div>

              {amount && sharesOut && (
                <div className="border border-[#333] p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#555] uppercase tracking-wider">You receive</span>
                    <span className="font-mono font-bold">{parseFloat(formatUnits(sharesOut, 6)).toFixed(4)} shares</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!amount || parseFloat(amount) < MIN_BET || isLoading}
                className="btn-primary w-full py-4 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isLoading ? statusText : 'Confirm Purchase'}
              </button>

              <p className="text-[10px] text-[#444] text-center mt-4 tracking-wider">
                Minimum bet $1 • Winning shares settle at $1 each
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

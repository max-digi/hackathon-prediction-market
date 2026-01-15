'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useDisconnect } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { Header } from '@/components/Header'
import { tempo } from '@/lib/wagmi'

const PATHUSD_ADDRESS = '0x20C000000000000000000000033aBB6ac7D235e5'
const DEPLOYER_ADDRESS = '0x42C772D84f361478C66fDc2993208989e4EBE80E'

const PATHUSD_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export default function FundPage() {
  const [amount, setAmount] = useState('1')
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  
  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  const { isSuccess, isLoading } = useWaitForTransactionReceipt({ hash: txHash })

  const { data: balance } = useReadContract({
    address: PATHUSD_ADDRESS,
    abi: PATHUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: tempo.id,
  })

  const { data: deployerBalance } = useReadContract({
    address: PATHUSD_ADDRESS,
    abi: PATHUSD_ABI,
    functionName: 'balanceOf',
    args: [DEPLOYER_ADDRESS],
    chainId: tempo.id,
  })

  const handleTransfer = () => {
    writeContract({
      address: PATHUSD_ADDRESS,
      abi: PATHUSD_ABI,
      functionName: 'transfer',
      args: [DEPLOYER_ADDRESS, parseUnits(amount, 6)],
      chainId: tempo.id,
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl mb-8">Fund Deployer</h1>
        
        <div className="border border-[#222] p-6 mb-6">
          <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-2">
            Your Wallet
          </p>
          <p className="font-mono text-sm mb-2">{address || 'Not connected'}</p>
          <p className="font-mono text-lg">
            {balance ? formatUnits(balance as bigint, 6) : '0'} PathUSD
          </p>
        </div>

        <div className="border border-[#222] p-6 mb-6">
          <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-2">
            Deployer Wallet
          </p>
          <p className="font-mono text-sm mb-2">{DEPLOYER_ADDRESS}</p>
          <p className="font-mono text-lg">
            {deployerBalance ? formatUnits(deployerBalance as bigint, 6) : '0'} PathUSD
          </p>
          <p className="text-[#555] text-sm mt-2">Needs ~0.3 PathUSD for deployment</p>
        </div>

        {isConnected ? (
          <div className="space-y-4">
            <button
              onClick={() => {
                disconnect()
                localStorage.clear()
                window.location.reload()
              }}
              className="w-full py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-sm"
            >
              Disconnect & Clear Passkey (to switch to mainnet)
            </button>
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-[#555] uppercase mb-2">
                Amount to Send
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-[#333] font-mono"
                placeholder="1"
              />
            </div>

            <button
              onClick={handleTransfer}
              disabled={isPending || isLoading}
              className="btn-primary w-full py-4"
            >
              {isPending ? 'Confirming...' : isLoading ? 'Processing...' : `Send ${amount} PathUSD`}
            </button>

            {isSuccess && txHash && (
              <div className="text-center space-y-2">
                <p className="text-green-400">Transfer successful!</p>
                <a 
                  href={`https://explore.mainnet.tempo.xyz/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[#888] hover:text-white transition-colors"
                >
                  View transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)} ↗
                </a>
              </div>
            )}
            {error && (
              <p className="text-red-400 text-center text-sm">{error.message}</p>
            )}
          </div>
        ) : (
          <p className="text-[#555] text-center">Connect your passkey wallet to continue</p>
        )}
      </main>
    </div>
  )
}

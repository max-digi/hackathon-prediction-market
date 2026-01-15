'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, usePublicClient, useWriteContract } from 'wagmi'
import { Header } from '@/components/Header'
import Link from 'next/link'
import { MARKET_ABI } from '@/constants/contracts'

const USDC_ADDRESS = '0x20C000000000000000000000033aBB6ac7D235e5' as `0x${string}`

interface MarketInfo {
  address: string
  name: string
  teamName: string
  settled: boolean
  yesWon: boolean
}

const MARKETS: MarketInfo[] = [
  { address: '0x2462C067eE3992612cA786037E4F8d36C3232Ada', name: 'Tempo Directory', teamName: 'Steffi', settled: false, yesWon: false },
  { address: '0x94Bd897F7A0148aa7afD0e31389109D63464611E', name: 'Legal Directory', teamName: 'Lindsey', settled: false, yesWon: false },
  { address: '0xe01d9bC1a3e979937E30A10379CceE17596117dB', name: 'X Dashboard', teamName: 'Juan', settled: false, yesWon: false },
  { address: '0x32E90FF95d9f0701241049Bf2e624798f4899ABC', name: 'Chain/Stablecoin TVL flow dashboard', teamName: 'Karina', settled: false, yesWon: false },
  { address: '0x6533Bd6aFC2f96D29B58e97c86B134848620Ce37', name: 'Compliance App', teamName: 'Gina', settled: false, yesWon: false },
  { address: '0x06BC94549Df915A3D43d976e6C244351077387f5', name: 'LinkedIn Connect', teamName: 'Teresa', settled: false, yesWon: false },
]

function MarketRow({ market }: { market: MarketInfo }) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const [settling, setSettling] = useState<'yes' | 'no' | null>(null)
  const [error, setError] = useState('')
  const [settleTxHash, setSettleTxHash] = useState<string | null>(null)

  const { data: owner } = useReadContract({
    address: market.address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: 'owner',
  })

  const { data: settled, refetch: refetchSettled } = useReadContract({
    address: market.address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: 'settled',
  })

  const { data: yesWon, refetch: refetchYesWon } = useReadContract({
    address: market.address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: 'yesWon',
  })

  const isOwner = address && owner && address.toLowerCase() === (owner as string).toLowerCase()
  const isSettled = settled as boolean

  const handleSettle = async (yesWins: boolean) => {
    if (!publicClient) return
    setSettling(yesWins ? 'yes' : 'no')
    setError('')
    setSettleTxHash(null)

    try {
      const hash = await writeContractAsync({
        address: market.address as `0x${string}`,
        abi: MARKET_ABI,
        functionName: 'settle',
        args: [yesWins],
        feeToken: USDC_ADDRESS,
      } as any)

      setSettleTxHash(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      await refetchSettled()
      await refetchYesWon()
    } catch (err: any) {
      console.error('Settlement error:', err)
      setError(err?.message?.slice(0, 100) || 'Settlement failed')
    } finally {
      setSettling(null)
    }
  }

  return (
    <div className="border border-[#222] bg-[#0a0a0a] p-6 hover:border-[#333] transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-serif text-xl mb-1">{market.name}</h3>
          <p className="text-[11px] tracking-[0.15em] uppercase text-[#555]">by {market.teamName}</p>
          <p className="text-[10px] font-mono text-[#333] mt-2 break-all">{market.address}</p>
        </div>

        <div className="flex items-center gap-4">
          {isSettled ? (
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 border text-xs font-bold tracking-wider uppercase ${
                yesWon 
                  ? 'border-white bg-white text-black' 
                  : 'border-[#555] text-[#555]'
              }`}>
                {yesWon ? '✓ YES Won' : '✓ NO Won'}
              </span>
            </div>
          ) : isOwner ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSettle(true)}
                disabled={settling !== null}
                className="btn-yes px-4 py-2 text-xs disabled:opacity-50"
              >
                {settling === 'yes' ? 'Settling...' : 'Settle YES'}
              </button>
              <button
                onClick={() => handleSettle(false)}
                disabled={settling !== null}
                className="btn-no px-4 py-2 text-xs disabled:opacity-50"
              >
                {settling === 'no' ? 'Settling...' : 'Settle NO'}
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-[#555] uppercase tracking-wider">
              {address ? 'Not owner' : 'Connect wallet'}
            </span>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-xs mt-3 break-words">{error}</p>
      )}
      {settleTxHash && (
        <div className="mt-3">
          <a 
            href={`https://explore.mainnet.tempo.xyz/tx/${settleTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-[#888] hover:text-white transition-colors"
          >
            View tx: {settleTxHash.slice(0, 10)}...{settleTxHash.slice(-8)} ↗
          </a>
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const { address, isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-black text-white noise">
      <Header />

      <div className="border-b border-[#222]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
          <p className="text-[11px] tracking-[0.3em] text-[#555] uppercase mb-4">
            Owner Only
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight">
            Admin
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-10">
        {!isConnected ? (
          <div className="border border-[#222] bg-[#0a0a0a] p-12 text-center">
            <h2 className="font-serif text-2xl mb-4">Connect Wallet</h2>
            <p className="text-[#555] text-sm">Connect the owner wallet to settle markets</p>
          </div>
        ) : (
          <>
            <div className="mb-8 p-4 border border-[#222] bg-[#111]">
              <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-2">Connected As</p>
              <p className="font-mono text-sm break-all">{address}</p>
            </div>

            <p className="text-[10px] tracking-[0.2em] text-[#555] uppercase mb-6">
              Markets ({MARKETS.length})
            </p>

            <div className="space-y-4">
              {MARKETS.map((market) => (
                <MarketRow key={market.address} market={market} />
              ))}
            </div>

            <div className="mt-12 p-6 border border-[#222] bg-[#0a0a0a]">
              <h3 className="font-serif text-xl mb-4">Settlement Rules</h3>
              <ul className="space-y-2 text-sm text-[#888]">
                <li>• Only the contract owner can settle each market</li>
                <li>• <span className="text-white font-bold">Settle YES</span> = this project won the hackathon</li>
                <li>• <span className="text-white font-bold">Settle NO</span> = this project did not win</li>
                <li>• Settlement is permanent and cannot be undone</li>
                <li>• After settlement, users can claim winnings ($1 per winning share)</li>
              </ul>
            </div>
          </>
        )}

        <div className="mt-8">
          <Link
            href="/"
            className="text-[11px] tracking-[0.2em] text-[#555] uppercase hover:text-white transition-colors"
          >
            ← Back to Markets
          </Link>
        </div>
      </div>

      <footer className="border-t border-[#222] py-8 sm:py-10 mt-12">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between">
          <span className="text-[10px] tracking-[0.2em] text-[#444] uppercase">
            Built on Tempo
          </span>
          <span className="text-[10px] tracking-[0.2em] text-[#444] uppercase">
            2025
          </span>
        </div>
      </footer>
    </div>
  )
}

import { createWalletClient, createPublicClient, http, encodeFunctionData } from 'viem'
import { tempo as tempoChain } from 'viem/chains'
import { Account } from 'viem/tempo'

const PRIVATE_KEY = process.argv[2]
const MARKET_ADDRESS = process.argv[3]
const YES_WON = process.argv[4] === 'true'

if (!PRIVATE_KEY || !MARKET_ADDRESS) {
  console.log('Usage: node scripts/settle.mjs <private_key> <market_address> <true|false>')
  process.exit(1)
}

const FEE_TOKEN = '0x20C000000000000000000000033aBB6ac7D235e5'

const tempo = {
  ...tempoChain,
  feeToken: FEE_TOKEN,
  rpcUrls: {
    default: { http: ['https://eng:aphex-twin-jeff-mills@rpc.mainnet.tempo.xyz'] },
  },
}

const MARKET_ABI = [
  {
    type: 'function',
    name: 'settle',
    inputs: [{ name: '_yesWon', type: 'bool' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
]

async function main() {
  const account = Account.fromSecp256k1(`0x${PRIVATE_KEY.replace('0x', '')}`)
  console.log('Settling with account:', account.address)
  console.log('Market:', MARKET_ADDRESS)
  console.log('YES won:', YES_WON)

  const publicClient = createPublicClient({
    chain: tempo,
    transport: http(),
  })

  const walletClient = createWalletClient({
    account,
    chain: tempo,
    transport: http(),
  })

  const data = encodeFunctionData({
    abi: MARKET_ABI,
    functionName: 'settle',
    args: [YES_WON],
  })

  console.log('Sending transaction...')
  const hash = await walletClient.sendTransaction({
    to: MARKET_ADDRESS,
    data,
  })

  console.log('Transaction hash:', hash)
  console.log('Waiting for confirmation...')
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log('Confirmed in block:', receipt.blockNumber)
  console.log('Status:', receipt.status === 'success' ? 'SUCCESS' : 'FAILED')
}

main().catch(console.error)

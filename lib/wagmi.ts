import { http, createConfig } from 'wagmi'
import { webAuthn, KeyManager } from 'wagmi/tempo'
import { metaMask } from 'wagmi/connectors'
import { tempo as tempoMainnet } from 'viem/chains'

// DONOTUSE faucet token for gas fees on mainnet
const DONOTUSE_TOKEN = '0x20C000000000000000000000033aBB6ac7D235e5' as const

export const tempo = {
  ...tempoMainnet,
  feeToken: DONOTUSE_TOKEN,
  rpcUrls: {
    default: {
      http: ['https://eng:aphex-twin-jeff-mills@rpc.mainnet.tempo.xyz'],
    },
  },
} as const

export const config = createConfig({
  chains: [tempo],
  connectors: [
    webAuthn({
      keyManager: KeyManager.localStorage(),
      createOptions: {
        label: 'Hackathon Bets',
      },
    }),
    metaMask({
      dappMetadata: {
        name: 'Hackathon Prediction Market',
      },
    }),
  ],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempo.id]: http('https://eng:aphex-twin-jeff-mills@rpc.mainnet.tempo.xyz'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

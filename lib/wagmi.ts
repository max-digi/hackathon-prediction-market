import { http, createConfig } from 'wagmi'
import { webAuthn, KeyManager } from 'wagmi/tempo'
import { injected } from 'wagmi/connectors'
import { tempo } from 'viem/chains'

export { tempo }

export const config = createConfig({
  chains: [tempo],
  connectors: [
    webAuthn({
      keyManager: KeyManager.localStorage(),
      createOptions: {
        label: 'Hackathon Bets',
      },
    }),
    injected(),
  ],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempo.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

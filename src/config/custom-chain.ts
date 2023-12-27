import { defineChain } from 'viem';

export const bitindi = defineChain({
  id: 4099,
  name: 'Bitindi Mainnet',
  network: 'Bitindi Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Bitindi',
    symbol: '$BNI',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-mainnet.bitindi.org/'],
      webSocket: ['wss://mainnet-rpc.bitindi.org'],
    },
    public: {
      http: ['https://mainnet-rpc.bitindi.org/'],
      webSocket: ['wss://mainnet-rpc.bitindi.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Bitindiscan',
      url: 'https://bitindiscan.com',
    },
  },
  contracts: {

  },
})

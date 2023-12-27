import config from "@/config";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { configureChains, createConfig } from "wagmi";

const projectId = config.walletConnectProjectId;

// Wagmi client
const { publicClient } = configureChains(config.chains, [
  w3mProvider({ projectId }),
]);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains: config.chains }),
  publicClient,
});

// Web3Modal Ethereum Client
export const ethereumClient = new EthereumClient(wagmiConfig, config.chains);

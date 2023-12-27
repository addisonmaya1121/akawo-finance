import config from "@/config";
import { useMemo } from "react";
import { useNetwork, usePublicClient, useWalletClient } from "wagmi";

const useWeb3Client = () => {
  const { chain } = useNetwork();
  const defaultChain = useMemo(
    () => (chain && !chain.unsupported ? chain : config.chains[0]),
    [chain]
  );
  const publicClient = usePublicClient({ chainId: defaultChain.id });
  const { data: walletClient } = useWalletClient();

  return { publicClient, walletClient, chain: defaultChain };
};

export default useWeb3Client;

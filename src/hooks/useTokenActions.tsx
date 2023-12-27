import { Address, getContract } from "viem";
import useWeb3Client from "./useWeb3Client";
import { erc20ABI } from "wagmi";

const useTokenActions = () => {
  const { publicClient } = useWeb3Client();
  const getTokenInfo = (address: Address) => {
    const tokenContract = getContract({
      address,
      abi: erc20ABI,
      publicClient,
    });

    return Promise.all([
      address,
      tokenContract.read.name(),
      tokenContract.read.symbol(),
      tokenContract.read.decimals(),
    ]);
  };

  return { getTokenInfo };
};

export default useTokenActions;

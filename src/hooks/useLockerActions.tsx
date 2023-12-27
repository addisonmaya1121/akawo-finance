import { useMemo } from "react";
import useWeb3Client from "./useWeb3Client";
import { Address, SimulateContractReturnType, getContract } from "viem";
import { lockAbi } from "@/contracts/abis/lockAbi";
import { erc20ABI, useAccount } from "wagmi";
import config from "@/config";
import { toast } from "react-toastify";

type LockTokenParams = {
  tokenAddress: Address;
  amount: bigint;
  description: string;

  unlockDate?: number;
  tgeDate?: number;
  tgeBps?: number;
  cycle?: number;
  cycleBps?: number;
};

const useLockerActions = () => {
  const { chain, publicClient, walletClient } = useWeb3Client();
  const { address } = useAccount();
  const lockContract = useMemo(
    () =>
      getContract({
        abi: lockAbi,
        address: config.lockContractAddress[chain.id],
        publicClient,
        walletClient: walletClient || undefined,
      }),
    [chain, publicClient, walletClient]
  );

  const checkAllowance = async (
    tokenAddress: Address,
    spender: Address,
    amount: bigint
  ) => {
    if (!address || !walletClient) return;
    const tokenContract = getContract({
      address: tokenAddress,
      abi: erc20ABI,
      publicClient,
      walletClient: walletClient || undefined,
    });
    const allowance = await tokenContract.read.allowance([address, spender]);

    if (allowance < amount) {
      const hash = await tokenContract.write.approve([spender, amount]);

      await publicClient.waitForTransactionReceipt({ hash });

      toast.success("Spend approved");
    }
  };

  const lockToken = async (
    isVesting: boolean,
    values: LockTokenParams,
    fee: bigint
  ) => {
    if (!address || !walletClient) return;
    try {
      let simulate: SimulateContractReturnType;

      await checkAllowance(
        values.tokenAddress,
        lockContract.address,
        values.amount
      );

      const ethBalance = await publicClient.getBalance({ address });
      if (ethBalance < fee) {
        toast.error("Insufficient ETH balance for lock fee");
        return;
      }

      if (!isVesting) {
        simulate = await lockContract.simulate.lock(
          [
            address,
            values.tokenAddress,
            values.amount,
            BigInt(values.unlockDate || ""),
            values.description,
          ],
          {
            account: address,
            value: fee,
          }
        );
      } else {
        // 60 seconds for testnet, 1 day for mainnet
        const time = chain.testnet ? 60 : 86400;

        simulate = await lockContract.simulate.vestingLock(
          [
            address,
            values.tokenAddress,
            values.amount,
            BigInt(values.tgeDate || 0),
            BigInt((values.tgeBps || 0) * 100),
            BigInt((values.cycle || 0) * time),
            BigInt((values.cycleBps || 0) * 100),
            values.description,
          ],
          {
            account: address,
            value: fee,
          }
        );
      }

      const hash = await walletClient.writeContract(simulate.request);
      toast.success("Transaction confirmed");

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return { receipt };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast.error(e?.walk()?.message || e?.message || "signing failed");
    }
  };

  const unlockToken = async (id: bigint) => {
    if (!address || !walletClient) return;
    try {
      const simulate = await lockContract.simulate.unlock([id], {
        account: address,
      });

      const hash = await walletClient.writeContract(simulate.request);
      toast.success("Transaction confirmed");

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return { receipt };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast.error(e?.walk()?.message || e?.message || "signing failed");
    }
  };

  const fetchLocksForUser = (address: Address) =>
    lockContract.read.normalLocksForUser([address]);

  const fetchTotalCount = () => lockContract.read.allNormalTokenLockedCount();

  const fetchTokenLockInfo = (start: bigint, end: bigint) =>
    lockContract.read.getCumulativeNormalTokenLockInfo([start, end]);

  const fetchTotalLockCountForToken = (tokenAddress: Address) =>
    lockContract.read.totalLockCountForToken([tokenAddress]);

  const fetchLockInfoForToken = (
    tokenAddress: Address,
    start: bigint,
    end: bigint
  ) => lockContract.read.getLocksForToken([tokenAddress, start, end]);

  const fetchLockById = (id: bigint) => lockContract.read.getLockById([id]);

  const fetchWithdrawableTokens = (id: bigint) =>
    lockContract.read.withdrawableTokens([id]);

  const fetchServiceFee = () => lockContract.read.serviceFee();

  return {
    lockToken,
    unlockToken,
    fetchLockById,
    fetchTotalCount,
    fetchServiceFee,
    fetchLocksForUser,
    fetchTokenLockInfo,
    fetchLockInfoForToken,
    fetchWithdrawableTokens,
    fetchTotalLockCountForToken,
  };
};

export default useLockerActions;

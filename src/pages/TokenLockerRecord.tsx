/* eslint-disable react-hooks/exhaustive-deps */
import LoadingBlock from "@/components/LoadingBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useLockerActions from "@/hooks/useLockerActions";
import useTokenActions from "@/hooks/useTokenActions";
import useWeb3Client from "@/hooks/useWeb3Client";
import { Token } from "@/types/Token";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import Countdown, { zeroPad } from "react-countdown";
import { toast } from "react-toastify";
import { Loader2Icon } from "lucide-react";

type LockInfo = {
  id: bigint;
  token: `0x${string}`;
  owner: `0x${string}`;
  amount: bigint;
  lockDate: bigint;
  tgeDate: bigint;
  tgeBps: bigint;
  cycle: bigint;
  cycleBps: bigint;
  unlockedAmount: bigint;
  description: string;
};

const isEqual = (a?: string, b?: string) =>
  a?.toLowerCase() === b?.toLowerCase();

export default function TokenLockerRecord() {
  const { lockId } = useParams<{ lockId: string }>();
  const { address } = useAccount();
  const { chain } = useWeb3Client();
  const { getTokenInfo } = useTokenActions();
  const { fetchWithdrawableTokens, fetchLockById, unlockToken } =
    useLockerActions();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<Token | null>(null);
  const [lockInfo, setLockInfo] = useState<LockInfo | null>(null);
  const [withdrawableTokens, setWithdrawableTokens] = useState<bigint>(0n);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canUnlock = useMemo(() => {
    if (!lockInfo || !isEqual(lockInfo.owner, address)) return false;
    if (dayjs.unix(Number(lockInfo.tgeDate)).isAfter(dayjs())) return false;
    if (
      (lockInfo.tgeBps && withdrawableTokens === 0n) ||
      lockInfo.unlockedAmount >= lockInfo.amount
    )
      return false;

    return true;
  }, [lockInfo, address, withdrawableTokens]);

  const availableTokens = useMemo(() => {
    if (!lockInfo) return 0n;
    return lockInfo.tgeBps > 0n ? withdrawableTokens : lockInfo.amount;
  }, [lockInfo, withdrawableTokens]);

  const vestingInfo = useMemo(() => {
    if (!lockInfo) return [];
    const vestingInfo = [
      {
        percent: Number(lockInfo.tgeBps) / 100,
        unlockDate: Number(lockInfo.tgeDate),
        unlockedAmount: (lockInfo.amount * lockInfo.tgeBps) / 10000n,
      },
    ];

    if (lockInfo.cycleBps > 0n) {
      const numberOfCycles = (10000n - lockInfo.tgeBps) / lockInfo.cycleBps;
      for (let i = 1; i <= Number(numberOfCycles); i++) {
        vestingInfo.push({
          percent: Number(lockInfo.cycleBps) / 100,
          unlockDate: Number(lockInfo.tgeDate) + Number(lockInfo.cycle) * i,
          unlockedAmount: (lockInfo.amount * lockInfo.cycleBps) / 10000n,
        });
      }
    }

    return vestingInfo;
  }, [lockInfo]);

  const nextUnlockDate = useMemo(() => {
    return vestingInfo.find((item) => item.unlockDate > dayjs().unix());
  }, [vestingInfo]);

  const loadData = async () => {
    if (!lockId) return;
    setIsLoading(true);
    try {
      const data = await fetchLockById(BigInt(lockId));
      setLockInfo({ ...data });
      const [, name, symbol, decimals] = await getTokenInfo(data.token);
      setToken({ name, symbol, decimals, contract_address: data.token });
      if (isEqual(data.owner, address) && data.cycle > 0n) {
        const withdrawable = await fetchWithdrawableTokens(BigInt(lockId));
        setWithdrawableTokens(withdrawable);
      }
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  };

  const blockExplorerUrl = chain.blockExplorers?.default.url;
  const cycleUint = chain.testnet ? 60 : 86400;

  const formatBigInt = (value: bigint) => {
    return Number(formatUnits(value, token?.decimals || 18)).toLocaleString();
  };

  const submitUnlock = async () => {
    if (!lockInfo) return;
    setIsSubmitting(true);
    const res = await unlockToken(lockInfo.id);
    if (res?.receipt) {
      toast.success("You have successfully unlocked tokens 🎉");
      loadData();
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockId]);

  return (
    <main>
      {lockInfo && (
        <Card className="relative mb-6 overflow-hidden">
          {isLoading && <LoadingBlock absolute />}
          <CardContent>
            {lockInfo.unlockedAmount < lockInfo.amount ? (
              <>
                {nextUnlockDate ? (
                  <>
                    <p className="mb-4 text-xl text-center">Next Unlocks In</p>
                    <div className="flex items-center justify-center mb-4">
                      <Countdown
                        date={nextUnlockDate.unlockDate * 1000}
                        renderer={({ days, hours, minutes, seconds }) => {
                          return (
                            <div className="flex items-center justify-center gap-4 ">
                              <div className="w-12 p-3 text-center rounded-md bg-secondary/30 dark:text-secondary text-secondary-foreground">
                                {zeroPad(days)}
                              </div>
                              <div className="w-12 p-3 text-center rounded-md bg-secondary/30 dark:text-secondary text-secondary-foreground">
                                {zeroPad(hours)}
                              </div>
                              <div className="w-12 p-3 text-center rounded-md bg-secondary/30 dark:text-secondary text-secondary-foreground">
                                {zeroPad(minutes)}
                              </div>
                              <div className="w-12 p-3 text-center rounded-md bg-secondary/30 dark:text-secondary text-secondary-foreground">
                                {zeroPad(seconds)}
                              </div>
                            </div>
                          );
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="mb-4 text-xl text-center">
                    You can unlock tokens now
                  </p>
                )}
                <div className="flex justify-center">
                  <Button
                    disabled={!canUnlock || isSubmitting}
                    onClick={() => submitUnlock()}
                  >
                    {isSubmitting && (
                      <Loader2Icon size={16} className="mr-2 animate-spin" />
                    )}
                    Unlock
                    {canUnlock &&
                      ` (${formatBigInt(availableTokens)} ${token?.symbol})`}
                  </Button>
                </div>
              </>
            ) : (
              <p className="my-8 text-xl text-center text-primary">
                You have unlocked all tokens 🎉
              </p>
            )}
          </CardContent>
        </Card>
      )}
      <Card className="relative mb-6 overflow-hidden rounded-md bg-card">
        {isLoading && <LoadingBlock absolute />}

        <CardHeader>
          <CardTitle>Token Info</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="px-4 py-4">Token Address</td>
                <td className="px-4 py-4 text-right">
                  {token?.contract_address && (
                    <a
                      href={
                        blockExplorerUrl
                          ? `${blockExplorerUrl}/address/${token?.contract_address}`
                          : "#"
                      }
                      className="text-primary hover:underline"
                    >
                      {token?.contract_address}
                    </a>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">Token Name</td>
                <td className="px-4 py-4 text-right">{token?.name}</td>
              </tr>
              <tr>
                <td className="px-4 py-4">Token Symbol</td>
                <td className="px-4 py-4 text-right">{token?.symbol}</td>
              </tr>
              <tr>
                <td className="px-4 py-4">Token Decimals</td>
                <td className="px-4 py-4 text-right">{token?.decimals}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="relative mb-6 overflow-hidden rounded-md bg-card">
        {isLoading && <LoadingBlock absolute />}

        <CardHeader>
          <CardTitle>Token Info</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="px-4 py-4">Title</td>
                <td className="px-4 py-4 text-right">
                  {lockInfo?.description}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">Total Amount Locked</td>
                <td className="px-4 py-4 text-right">
                  {lockInfo?.amount !== undefined &&
                    formatBigInt(lockInfo?.amount)}{" "}
                  {token?.symbol}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">Owner</td>
                <td className="px-4 py-4 text-right">
                  {lockInfo?.owner && (
                    <a
                      href={
                        blockExplorerUrl
                          ? `${blockExplorerUrl}/address/${lockInfo?.owner}`
                          : "#"
                      }
                      className="text-primary hover:underline"
                    >
                      {lockInfo?.owner.slice(0, 6)}...
                      {lockInfo?.owner.slice(-4)}
                    </a>
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">Lock Date</td>
                <td className="px-4 py-4 text-right">
                  {!!lockInfo?.lockDate &&
                    dayjs
                      .unix(Number(lockInfo?.lockDate))
                      .format("YYYY.MM.DD HH:mm")}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">TGE Date</td>
                <td className="px-4 py-4 text-right">
                  {!!lockInfo &&
                    dayjs
                      .unix(Number(lockInfo?.tgeDate))
                      .format("YYYY.MM.DD HH:mm")}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">TGE Percent</td>
                <td className="px-4 py-4 text-right">
                  {lockInfo?.tgeBps ? Number(lockInfo?.tgeBps) / 100 : "-"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">Cycle</td>
                <td className="px-4 py-4 text-right">
                  {lockInfo?.cycle ? Number(lockInfo?.cycle) / cycleUint : "-"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">Cycle Release Percent</td>
                <td className="px-4 py-4 text-right">
                  {lockInfo?.cycleBps ? Number(lockInfo?.cycleBps) / 100 : "-"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4">Unlocked Amount</td>
                <td className="px-4 py-4 text-right">
                  {" "}
                  {lockInfo?.unlockedAmount !== undefined &&
                    formatBigInt(lockInfo.unlockedAmount)}{" "}
                  {token?.symbol}
                </td>
              </tr>
            </tbody>
          </table>
          {vestingInfo.length > 1 && (
            <div className="my-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="vesting-info">
                  <AccordionTrigger className="px-4 py-4">
                    Vesting Info
                  </AccordionTrigger>
                  <AccordionContent>
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-4 text-center">Unlock #</th>
                          <th className="px-4 py-4 text-center">Time</th>
                          <th className="px-4 py-4 text-center">
                            Unlocked tokens
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {vestingInfo.map((item, key) => (
                          <tr key={key} className="border-b last:border-b-0">
                            <td className="px-4 py-4 text-center">{key + 1}</td>
                            <td className="px-4 py-4 text-center">
                              {dayjs
                                .unix(item.unlockDate)
                                .format("YYYY.MM.DD HH:mm")}
                            </td>
                            <td className="px-4 py-4 text-center">
                              {formatBigInt(item.unlockedAmount)} (
                              {item.percent}%)
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

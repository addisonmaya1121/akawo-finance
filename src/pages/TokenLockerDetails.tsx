import LoadingBlock from "@/components/LoadingBlock";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useLockerActions from "@/hooks/useLockerActions";
import useTokenActions from "@/hooks/useTokenActions";
import useWeb3Client from "@/hooks/useWeb3Client";
import { Token } from "@/types/Token";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Address, formatUnits, isAddress } from "viem";

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

export default function TokenLockerDetails() {
  const { chain } = useWeb3Client();
  const { getTokenInfo } = useTokenActions();
  const { fetchTotalLockCountForToken, fetchLockInfoForToken } =
    useLockerActions();
  const { address } = useParams<{ address: Address }>();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<Token | null>(null);
  const [lockInfos, setLockInfos] = useState<LockInfo[]>([]);

  const loadData = async () => {
    if (!address || !isAddress(address)) return;
    setIsLoading(true);
    try {
      const [, name, symbol, decimals] = await getTokenInfo(address);
      setToken({ name, symbol, decimals, contract_address: address });
      const total = await fetchTotalLockCountForToken(address);
      const data = await fetchLockInfoForToken(address, 0n, total);
      setLockInfos([...data]);
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  };

  const blockExplorerUrl = chain.blockExplorers?.default.url;
  const cycleUint = chain.testnet ? 60 : 86400;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);
  return (
    <main>
      <Card className="relative mb-6 overflow-hidden">
        {isLoading && <LoadingBlock absolute />}

        <CardHeader>
          <CardTitle>Lock Info</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="px-4 py-4">Current Locked Amount</td>
                <td className="px-4 py-4 text-right">
                  {lockInfos
                    .reduce(
                      (prev, current) =>
                        prev +
                        +formatUnits(current.amount, token?.decimals || 18),
                      0
                    )
                    .toLocaleString()}{" "}
                  {token?.symbol}
                </td>
              </tr>
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
          <CardTitle>Lock records</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-4 text-left">Wallet</th>
                <th className="px-4 py-4 text-left">Amount</th>
                <th className="px-4 py-4 text-left">Cycle(d)</th>
                <th className="px-4 py-4 text-left">Cycle Release(%)</th>
                <th className="px-4 py-4 text-left">TGE(%)</th>
                <th className="px-4 py-4 text-left">Unlock time</th>
                <th className="px-4 py-4 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {lockInfos.length > 0 ? (
                lockInfos.map((item, key) => (
                  <tr key={key} className="border-b last:border-b-0">
                    <td className="px-4 py-4">
                      {item.owner && (
                        <a
                          href={
                            blockExplorerUrl
                              ? `${blockExplorerUrl}/address/${item.owner}`
                              : "#"
                          }
                          className="text-primary hover:underline"
                        >
                          {item.owner.slice(0, 6)}...{item.owner.slice(-4)}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {Number(
                        formatUnits(item.amount, token?.decimals || 18)
                      ).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      {item.cycle ? Number(item.cycle) / cycleUint : "-"}
                    </td>
                    <td className="px-4 py-4">
                      {item.cycleBps ? Number(item.cycleBps) / 100 : "-"}
                    </td>
                    <td className="px-4 py-4">
                      {item.tgeBps ? Number(item.tgeBps) / 100 : "-"}
                    </td>
                    <td className="px-4 py-4">
                      {dayjs
                        .unix(Number(item.tgeDate))
                        .format("YYYY.MM.DD HH:mm")}
                    </td>
                    <td className="px-4 py-4">
                      <Button variant={"outline"} asChild>
                        <Link to={`/token-locker/record/${item.id}`}>
                          {" "}
                          View
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6">
                    <p className="text-lg font-semibold text-center ">
                      No data
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
}

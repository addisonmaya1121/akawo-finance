import LoadingBlock from "@/components/LoadingBlock";
import Pagination from "@/components/Pagination";
import TokenLockerNavigations from "@/components/TokenLockerNavigations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import config from "@/config";
import useLockerActions from "@/hooks/useLockerActions";
import useTokenActions from "@/hooks/useTokenActions";
import useWeb3Client from "@/hooks/useWeb3Client";
import { LockTokenInfo } from "@/types/LockTokenInfo";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { formatUnits } from "viem";

export default function TokenLocker() {
  const { chain } = useWeb3Client();
  const { getTokenInfo } = useTokenActions();
  const { search } = useLocation();
  const { fetchTotalCount, fetchTokenLockInfo } = useLockerActions();
  const [lockTokenInfos, setLockTokenInfos] = useState<LockTokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPage, setLastPage] = useState(0);
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const page = +(query.get("page") || 1);
  const perPage = 10;

  const loadData = async () => {
    if (!config.lockContractAddress[chain.id]) return;
    setIsLoading(true);

    const from = BigInt((page - 1) * perPage);
    const to = BigInt(page * perPage);
    const totalCount = await fetchTotalCount();
    if (totalCount === 0n) return setIsLoading(false);

    setLastPage(Math.ceil(Number(totalCount) / perPage));

    const data = await fetchTokenLockInfo(from, to);
    const tokenAddresses = [...new Set(data.map((d) => d.token))];
    const tokens = await Promise.all(tokenAddresses.map(getTokenInfo));
    setLockTokenInfos(
      data.map((d) => {
        const token = tokens.find((t) => t[0] === d.token);
        return {
          amount: d.amount,
          tokenAddress: d.token,
          token: {
            name: token?.[1] || "",
            symbol: token?.[2] || "",
            decimals: token?.[3] || 0,
          },
        };
      })
    );
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, search]);

  return (
    <main>
      <Card className="relative overflow-hidden">
        {isLoading && <LoadingBlock absolute />}
        <CardHeader>
          <CardTitle className="font-normal">Token Locker</CardTitle>
        </CardHeader>
        <CardContent>
          <TokenLockerNavigations />
          <table className="w-full mt-6">
            <thead className="border-b">
              <tr>
                <th className="px-4 py-4 text-left">Token</th>
                <th className="px-4 py-4 text-left">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lockTokenInfos.length > 0 ? (
                lockTokenInfos.map((info) => (
                  <tr
                    key={info.tokenAddress}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-12 h-12 uppercase rounded-full bg-muted">
                          {info.token.symbol[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {info.token.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {info.token.symbol}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm">
                        {Number(
                          formatUnits(info.amount, info.token.decimals)
                        ).toLocaleString()}{" "}
                        {info.token.symbol}
                      </span>
                    </td>
                    <td>
                      <Button variant={"outline"} asChild>
                        <Link to={`/token-locker/details/${info.tokenAddress}`}>
                          View
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-6">
                    <p className="text-lg font-semibold text-center ">
                      No data
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {lastPage > 1 && <Pagination page={page} lastPage={lastPage} />}
        </CardContent>
      </Card>
    </main>
  );
}

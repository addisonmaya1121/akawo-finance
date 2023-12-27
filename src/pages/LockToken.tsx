/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import TextField from "@/components/form/TextField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import useWeb3Client from "@/hooks/useWeb3Client";
import useWeb3Query from "@/hooks/useWeb3Query";
import { Token } from "@/types/Token";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useDebounce } from "react-use";
import { Address, formatEther, getContract, isAddress, parseUnits } from "viem";
import { erc20ABI } from "wagmi";
import { z } from "zod";
import dayjs from "dayjs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import useLockerActions from "@/hooks/useLockerActions";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import config from "@/config";

const formSchema = z.object({
  token_address: z
    .string()
    .min(0, "Token address is required")
    .refine((val) => isAddress(val), "Invalid token address"),
  title: z.string().min(0, "Title is required"),
  amount: z.coerce.number().min(0, "Amount is required"),
  lock_until: z
    .string()
    .refine((data) => !data || dayjs(data).isValid(), "Invalid date format")
    .refine(
      (data) => !data || dayjs().isBefore(data),
      "Lock until date must be in the future"
    )
    .optional(),

  tge_date: z
    .string()
    .refine((data) => !data || dayjs(data).isValid(), "Invalid date format")
    .refine(
      (data) => !data || dayjs().isBefore(data),
      "TGE date must be in the future"
    )
    .optional(),

  tge_percent: z.coerce.number().optional(),
  cycle: z.coerce.number().optional(),
  cycle_release_percent: z.coerce.number().optional(),
});

const LockToken = () => {
  const navigate = useNavigate();
  const { lockToken, fetchServiceFee } = useLockerActions();
  const { chain, publicClient } = useWeb3Client();
  const [isVesting, setIsVesting] = useState(false);
  const isSupportedChain = !!config.lockContractAddress[chain.id];
  const [serviceFee, setServiceFee] = useState<bigint>(0n);
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "all",
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const tokenAddresses: Record<string, string> = {
    AKAWO: "0xAKAWOContractAddress",
    AFC: "0xcA8BB0adfD235820f7f58dDE509714405f1dCE7A",
    BNB: "0xBNBContractAddress",
    ETH: "0xETHContractAddress",
    BTC: "0xBTCContractAddress",
  };

  const handleTokenButtonClick = (token: string) => {
    const tokenAddress = tokenAddresses[token] || '';
    form.setValue('token_address', tokenAddress);

    // Manually trigger the tokenInfoRequest
    tokenInfo.fetch();
  };

  const tokenInfoRequest = async () => {
    const tokenAddress = form.getValues("token_address") as Address;

    if (!tokenAddress || !isAddress(tokenAddress)) return;

    const tokenContract = getContract({
      address: tokenAddress,
      abi: erc20ABI,
      publicClient,
    });

    const [name, symbol, decimals] = await Promise.all([
      tokenContract.read.name(),
      tokenContract.read.symbol(),
      tokenContract.read.decimals(),
    ]);

    return { name, symbol, decimals };
  };

  const tokenInfo = useWeb3Query<Omit<Token, "contract_address"> | undefined>(
    tokenInfoRequest
  );

  useDebounce(tokenInfo.fetch, 500, [form.getValues("token_address")]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isSupportedChain) return;
    const res = await lockToken(
      isVesting,
      {
        amount: parseUnits(`${values.amount}`, tokenInfo.data?.decimals || 18),
        tokenAddress: values.token_address as Address,
        description: values.title,
        unlockDate: values.lock_until
          ? dayjs(values.lock_until).unix()
          : undefined,
        tgeDate: values.tge_date ? dayjs(values.tge_date).unix() : undefined,
        tgeBps: values.tge_percent,
        cycle: values.cycle,
        cycleBps: values.cycle_release_percent,
      },
      serviceFee
    );

    if (res?.receipt) {
      toast.success("You have successfully locked your tokens 🎉");
      navigate("/token-locker");
    }
  };

  useEffect(() => {
    if (isVesting) {
      form.setValue("lock_until", "");
    } else {
      form.setValue("tge_date", "");
      form.setValue("tge_percent", "" as any);
      form.setValue("cycle", "" as any);
      form.setValue("cycle_release_percent", "" as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVesting]);

  useEffect(() => {
    if (config.lockContractAddress[chain.id]) {
      fetchServiceFee().then(setServiceFee);
    }
  }, [chain]);

  return (
    <main>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>Create your lock</CardTitle>
            <p className="text-sm text-secondary">
              Lock Fee: {formatEther(serviceFee)} {chain.nativeCurrency.symbol}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {!isSupportedChain && (
            <div className="p-4 mb-4 text-red-600 rounded-md bg-red-500/30">
              <p>
                This chain is not supported token locker. Please switch your
                network to{" "}
                {Object.keys(config.lockContractAddress)
                  .map(
                    (id) =>
                      config.chains.find((chain) => chain.id === +id)?.name
                  )
                  .join(", ")}{" "}
                chain.
              </p>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-3">
                <TextField
                  control={form.control}
                  name="token_address"
                  className="flex-1"
                  input={{ required: true }}
                />
                <div className="space-y-2">
                  {tokenInfo.loading && (
                    <Loader2Icon className="animate-spin " />
                  )}
                  {tokenInfo.error && (
                    <p className="text-sm text-destructive">
                      {tokenInfo.error}
                    </p>
                  )}
                  <div className="flex flex-col text-sm font-medium divide-y">
                    {tokenInfo.data &&
                      Object.entries(tokenInfo.data).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between gap-2 py-2"
                        >
                          <span className="capitalize">{key}</span>
                          <span className="text-primary">{value}</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  {['AKAWO', 'AFC', 'BNB', 'ETH', 'BTC'].map((token) => (
                    <Button
                      key={token}
                      onClick={() => handleTokenButtonClick(token)}
                      className="px-4 py-2 bg-primary text-white rounded-md"
                    >
                      {token}
                    </Button>
                  ))}
                </div>
              </div>
              <TextField
                control={form.control}
                name="title"
                input={{ required: true }}
              />
              <TextField
                control={form.control}
                name="amount"
                input={{ required: true, type: "number" }}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_vesting"
                  checked={isVesting}
                  onCheckedChange={(value) => setIsVesting(Boolean(value))}
                />
                <label
                  htmlFor="is_vesting"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Use vesting?
                </label>
              </div>
              {isVesting ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  <TextField
                    control={form.control}
                    name="tge_date"
                    label="TGE Date"
                    input={{
                      required: true,
                      type: "datetime-local",
                      min: dayjs().format("YYYY-MM-DDTHH:mm"),
                    }}
                  />
                  <TextField
                    control={form.control}
                    name="tge_percent"
                    label="TGE Percent"
                    input={{
                      required: true,
                      type: "number",
                    }}
                  />
                  <TextField
                    control={form.control}
                    name="cycle"
                    label={`Cycle ${
                      chain.testnet ? "(in mintues)" : "(in days)"
                    }`}
                    input={{
                      required: true,
                      type: "number",
                    }}
                  />
                  <TextField
                    control={form.control}
                    name="cycle_release_percent"
                    input={{
                      required: true,
                      type: "number",
                    }}
                  />
                </div>
              ) : (
                <TextField
                  control={form.control}
                  name="lock_until"
                  input={{
                    required: true,
                    type: "datetime-local",
                    min: dayjs().format("YYYY-MM-DDTHH:mm"),
                  }}
                />
              )}
              <Button
                className="mx-auto"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2Icon className="mr-2 animate-spin" size={16} />
                )}
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
};

export default LockToken;

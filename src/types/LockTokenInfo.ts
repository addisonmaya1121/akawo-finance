import { Token } from "./Token";

export type LockTokenInfo = {
  amount: bigint;
  tokenAddress: string;
  token: Omit<Token, "contract_address">;
};

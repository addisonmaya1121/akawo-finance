import { Address } from "viem";

export type Token = {
  id?: number;
  name: string;
  symbol: string;
  contract_address: Address;
  decimals: number;
};

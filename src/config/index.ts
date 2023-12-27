import { Address, Chain } from "viem";
import {
  bsc,
  bscTestnet,
  mainnet,
  polygon,
  base,
  localhost,
} from "viem/chains";

const config = {
  chainDetails: {
    [bsc.id]: {
      name: "BSC",
      img: "/images/chains/binance.svg",
    },
    [polygon.id]: {
      name: "Polygon",
      img: "/images/chains/polygon-matic-logo.svg",
    },
    [mainnet.id]: {
      name: "Ethereum",
      img: "/images/chains/ethereum.svg",
    },
    [localhost.id]: {
      name: "Ethereum",
      img: "/images/chains/ethereum.svg",
    },
    [base.id]: {
      name: "Base",
      img: "/images/chains/ethereum.svg",
    },
  } as {
    [key: number]: {
      name: string;
      img: string;
    };
  },

  chains: [bscTestnet] as Chain[],

  walletConnectProjectId: "3009561c87bcbdfb620794c51596781c",

  lockContractAddress: {
    [bscTestnet.id]: "0xc87423b6FB681000CFCF14bB393199F47A7D52e3",
  } as Record<number, Address>,
};

export default config;

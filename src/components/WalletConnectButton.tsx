import { useWeb3Modal } from "@web3modal/react";
import { Button } from "./ui/button";
import { useAccount } from "wagmi";

export default function WalletConnectButton() {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  return (
    <Button onClick={() => open()}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="lg:mr-2"
      >
        <path
          d="M13 9H7"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M22 10.97V13.03C22 13.58 21.56 14.03 21 14.05H19.04C17.96 14.05 16.97 13.26 16.88 12.18C16.82 11.55 17.06 10.96 17.48 10.55C17.85 10.17 18.36 9.95001 18.92 9.95001H21C21.56 9.97001 22 10.42 22 10.97Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M17.48 10.55C17.06 10.96 16.82 11.55 16.88 12.18C16.97 13.26 17.96 14.05 19.04 14.05H21V15.5C21 18.5 19 20.5 16 20.5H7C4 20.5 2 18.5 2 15.5V8.5C2 5.78 3.64 3.88 6.19 3.56C6.45 3.52 6.72 3.5 7 3.5H16C16.26 3.5 16.51 3.50999 16.75 3.54999C19.33 3.84999 21 5.76 21 8.5V9.95001H18.92C18.36 9.95001 17.85 10.17 17.48 10.55Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <span className="hidden lg:inline">
        {isConnected && address
          ? address.slice(0, 6) + "..." + address.slice(-4)
          : "Connect Wallet"}
      </span>
    </Button>
  );
}
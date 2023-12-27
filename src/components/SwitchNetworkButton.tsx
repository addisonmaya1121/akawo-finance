import { useNetwork } from "wagmi";
import config from "../config/index";
import { useWeb3Modal } from "@web3modal/react";
import { Button } from "./ui/button";

export default function SwitchNetworkButton() {
  const { open } = useWeb3Modal();
  const { chain } = useNetwork();
  const currentChain = chain || config.chains[0];

  return (
    <Button
      variant={"outline"}
      className="hidden bg-card lg:flex"
      onClick={() => open({ route: "SelectNetwork" })}
    >
      {config.chainDetails[currentChain.id] && (
        <img
          src={config.chainDetails[currentChain.id].img}
          className="object-contain w-5 h-5 lg:mr-2"
        />
      )}
      <span className="hidden lg:block">
        {config.chainDetails[currentChain.id]?.name || "Not Supported Chain"}
      </span>
    </Button>
  );
}

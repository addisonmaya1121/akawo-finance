import ReactDOM from "react-dom/client";
import { ethereumClient, wagmiConfig } from "./lib/wagmi.ts";
import { WagmiConfig } from "wagmi";
import { Web3Modal } from "@web3modal/react";
import config from "./config/index.ts";
import { ToastContainer } from "react-toastify";
import "./i18n";
// import styles
import "./index.css";
import "react-toastify/ReactToastify.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <>
    <WagmiConfig config={wagmiConfig}>
      <RouterProvider router={router} />
    </WagmiConfig>

    <Web3Modal
      projectId={config.walletConnectProjectId}
      ethereumClient={ethereumClient}
      defaultChain={config.chains[0]}
    />

    <ToastContainer
      theme="dark"
      closeOnClick
      pauseOnHover
      position="bottom-center"
      hideProgressBar={true}
    />
  </>
);

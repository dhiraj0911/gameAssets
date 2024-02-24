"use client";

import {
  ThirdwebProvider,
  ConnectWallet,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  trustWallet
} from "@thirdweb-dev/react";
import Script from "next/script";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { Navbar, Footer } from "../components";
import "../styles/globals.css";
import { NFTProvider } from "../context/NFTContext";

const projectId = `${process.env.NEXT_PUBLIC_WALLETCONNECT}`;

const MyApp = ({ Component, pageProps }) => (
  <ThirdwebProvider
    activeChain="mumbai"
    clientId={projectId}
    supportedWallets={[
      metamaskWallet(),
      coinbaseWallet(),
      walletConnect(),
      trustWallet(),
    ]}
  >
    <NFTProvider>
      <ThemeProvider enableSystem attribute="class">
        <div className="dark:bg-nft-dark bg-white min-h-screen">
          <Navbar />
          <div className="pt-65">
            <Component {...pageProps} />
            <Toaster position="top-right" />
          </div>
          <Footer />
        </div>
        <Script
          src="https://kit.fontawesome.com/a9d6f93c97.js"
          crossorigin="anonymous"
        />
      </ThemeProvider>
    </NFTProvider>
  </ThirdwebProvider>
);

export default MyApp;

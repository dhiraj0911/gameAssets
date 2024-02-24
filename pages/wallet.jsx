import React, { useContext, useEffect } from "react";
import { NFTContext } from "../context/NFTContext";
import {
  ConnectWallet,
  useConnectionStatus,
  useDisconnect,
  useAddress,
} from "@thirdweb-dev/react"; // Import useWallet
import {} from "@thirdweb-dev/react";

import axios from "axios"; // Ensure you've installed axios

const Wallet = () => {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_PRODUCTION === "true"
      ? process.env.NEXT_PUBLIC_BASE_URL
      : "http://localhost:5000";

  const address = useConnectionStatus() === "connected" ? useAddress().toLowerCase() : null;

  const handleConnect = async () => {
    // try {
    //   let vendorId = window.localStorage.getItem("vendor");
    //   await axios.post(`${API_BASE_URL}/api/address`, {
    //     vendorId,
    //     address: address,
    //   });
    // } catch (error) {
    //   console.error("Not signed In:", error);
    // }
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w mx-auto rounded-xl shadow-md flex items-center space-x-4">
        <div>
          <ConnectWallet theme="dark" onConnect={handleConnect} />
        </div>
      </div>
    </div>
  );
};

export default Wallet;

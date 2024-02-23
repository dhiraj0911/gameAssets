import React, { useContext, useEffect } from "react";
import { NFTContext } from "../context/NFTContext";
import { ConnectWallet } from "@thirdweb-dev/react";
import axios from "axios"; // Ensure you've installed axios
import { useRouter } from "next/router"; // Import useRouter

const Wallet = () => {
  const {
    connectWallet,
    isSigned,
    isSignedUp,
    setCurrentAccount,
    currentAccount,
    checkIfWalletIsConnected,
  } = useContext(NFTContext);
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_PRODUCTION === "true"
      ? process.env.NEXT_PUBLIC_BASE_URL
      : "http://localhost:5000";

  const router = useRouter(); // Initialize useRouter

  // Function to make the API call
  const makeApiCall = async (account) => {
    try {
      // let vendorId = window.localStorage.getItem("vendor");
      // const response = await axios.post(
      //   `${process.env.API_BASE_URL}/api/address/`,
      //   {
      //     vendorId,
      //     address: account,
      //   }
      // );
      // console.log("API call successful:", response.data);
      console.log(account);
      router.push("/"); // Redirect to root after successful API call
    } catch (error) {
      console.error("API call error:", error);
    }
  };

  // Effect hook to react to wallet connection
  useEffect(() => {
    checkIfWalletIsConnected();
    // if (currentAccount) {
      makeApiCall(currentAccount);
    // }
  }, [currentAccount]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w mx-auto rounded-xl shadow-md flex items-center space-x-4">
        <div>
          <ConnectWallet />
        </div>
      </div>
    </div>
  );
};

export default Wallet;

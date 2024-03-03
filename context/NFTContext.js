import React, { useState, useEffect, useRef } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";
import {
  useConnectionStatus,
  useDisconnect,
  useAddress,
} from "@thirdweb-dev/react"; 
import { MarketAddress, MarketAddressABI, WETHAddress, WETHAddressABI } from "./constants";
import toast from "react-hot-toast";

export const NFTContext = React.createContext();
const fetchContract = (signerORProvider) =>
  new ethers.Contract(MarketAddress, MarketAddressABI, signerORProvider);

export const NFTProvider = ({ children }) => {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_PRODUCTION === "true"
      ? process.env.NEXT_PUBLIC_BASE_URL
      : "http://localhost:5000";
  // const [currentAccount, setCurrentAccount] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);
  // const nftCurrency = "MATIC";

  const [isSigned, setIsSigned] = useState(false);
  const [isSingedUp, setIsSingedUp] = useState(false);
  const [wrongOTP, setWrongOTP] = useState(false);

  const disconnect = useDisconnect();
  const currentAddress = useConnectionStatus() === "connected" ? useAddress() : "";

  useEffect(() => {
    const userdata = window.localStorage.getItem("userdata");
    if (userdata) {
      let parsedData = JSON.parse(userdata);
      let avatarurl = parsedData.avatarurl;
      setAvatar(avatarurl);
      setIsSigned(true);
    }
  }, []);

  const nftCurrency = (nft) => {
    if (nft.isWETH === 'true' || nft.isWETH === true) {
      return "WETH";
    }
    else
      return "MATIC";
  }

  const signIn = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/vendor/signin`, {
        email,
        password,
      });
  
      if (response.status === 200) {
        const token = response.data.token;
        if (token) {
          window.localStorage.setItem("userdata", JSON.stringify(response.data))
          window.localStorage.setItem("vendor", response.data.vendorId);
          setIsSigned(true);
          // window.location.href = "/";
        } else {
          throw new Error("Authentication failed");
        }
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      throw error; // This will reject the promise returned by signIn
    }
  };
  
  const signUp = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/vendor/signup`, {
        email,
        password
      });
      if (response.status) {
        setIsSingedUp(true);
      } else {
        console.log("Authentication failed");
      }
    } catch (error) {
      console.error("Error during sign-up:", error);
    }
  };

  const verify = async (email, otp) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/vendor/verify`, {
        email,
        otp,
      });
      console.log(response)
      window.localStorage.setItem("vendor", response.data.vendorId);

      if (response.status === 200) {
        const token = window.localStorage.setItem("userdata", JSON.stringify(response.data));
        if (token) {
          setIsSigned(true);
        }
        setWrongOTP(false);
        window.location.href = "/";
      } else {
        setWrongOTP(true);
        console.log("Authentication failed");
      }
    } catch (error) {
      setWrongOTP(true);
      console.error("Error during sign-in:", error);
    }
  };

  const signOut = async () => {
    window.localStorage.clear();
    setIsSigned(false);
    setIsSingedUp(false);
    // setCurrentAccount("");
    disconnect();
    window.location.href = "/";
  };

  const userOf = async (id) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const user = await contract.getUserOf(id);
    return user;
  };

  const createSale = async (
    url,
    isWETH,
    forminputPrice,
    forminputRentPrice,
    forSale,
    forRent
  ) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const priceInWei = ethers.utils.parseUnits(forminputPrice, "ether");
    const rentPriceInWei = ethers.utils.parseUnits(forminputRentPrice, "ether");

    const listingPrice = ethers.utils.parseUnits("0.00001", "ether");
    const transaction = await contract.createToken(
      url,
      isWETH,
      priceInWei,
      rentPriceInWei,
      forSale,
      forRent,
      { value: listingPrice.toString() }
    );
    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  const reSale = async (
    tokenId,
    isWETH,
    forminputPrice,
    forminputRentPrice,
    forRent,
    forSale
  ) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const priceInWei = ethers.utils.parseUnits(forminputPrice, "ether");
    const rentPriceInWei = ethers.utils.parseUnits(forminputRentPrice, "ether");

    const listingPrice = ethers.utils.parseUnits("0.00001", "ether");
    const transaction = await contract.resellToken(
      tokenId,
      isWETH,
      priceInWei,
      rentPriceInWei,
      forRent,
      forSale,
      { value: listingPrice.toString() }
    );
    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  const importNFT = async (
    collection,
    tokenId,
    isWETH,
    rentPrice,
  ) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const rentPriceInWei = ethers.utils.parseUnits(rentPrice, "ether");
    const listingPrice = ethers.utils.parseUnits("0.00001", "ether");

    const transaction = await contract.importToken(
      collection,
      tokenId,
      isWETH,
      rentPriceInWei,
      { value: listingPrice.toString() }
    );
    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  }

  const buyNft = async (nft) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      MarketAddress,
      MarketAddressABI,
      signer
    );
    let transaction;
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    if (nft.isWETH === 'true' || nft.isWETH === true) {
      const wethContract = new ethers.Contract(
        WETHAddress,
        WETHAddressABI,
        signer
      );

      const approvalTx = await wethContract.approve(MarketAddress, price);
      await approvalTx.wait();
      transaction = await contract.createMarketSale(nft.tokenId);
    } else {
      transaction = await contract.createMarketSale(nft.tokenId, {
        value: price,
      });
    }

    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  const rentImportedNFT = async (nft, rentalPeriodInDays) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      MarketAddress,
      MarketAddressABI,
      signer
    );

    const totalRentPrice = nft.rentPrice * rentalPeriodInDays;
    const rentPrice = ethers.utils.parseUnits(
      totalRentPrice.toString(),
      "ether"
    );

    // const expiry = Math.floor(Date.now() / 1000) + rentalPeriodInDays * 24 * 60 * 60;
    //for 2 minute
    const expiry = Math.floor(Date.now() / 1000) + 120;
    let transaction;

    if (nft.isWETH === 'true' || nft.isWETH === true) {
      const wethContract = new ethers.Contract(
        WETHAddress,
        WETHAddressABI,
        signer
      );

      const approvalTx = await wethContract.approve(MarketAddress, rentPrice);
      await approvalTx.wait();
      transaction = await contract.rentImportedNFT(nft.tokenId, nft.collection, expiry);

    } else {
      transaction = await contract.rentImportedNFT(nft.tokenId, nft.collection, expiry, {
        value: rentPrice,
      });
    }

    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  }

  const rentNFT = async (nft, rentalPeriodInDays) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      MarketAddress,
      MarketAddressABI,
      signer
    );

    const totalRentPrice = nft.rentPrice * rentalPeriodInDays;
    const rentPrice = ethers.utils.parseUnits(
      totalRentPrice.toString(),
      "ether"
    );

    // const expiry = Math.floor(Date.now() / 1000) + rentalPeriodInDays * 24 * 60 * 60;
    //for 2 minute
    const expiry = Math.floor(Date.now() / 1000) + 120;
    let transaction;

    if (nft.isWETH === 'true' || nft.isWETH === true) {
      const wethContract = new ethers.Contract(
        WETHAddress,
        WETHAddressABI,
        signer
      );

      const approvalTx = await wethContract.approve(MarketAddress, rentPrice);
      await approvalTx.wait();
      transaction = await contract.rentOutToken(nft.tokenId, expiry);

    } else {
      transaction = await contract.rentOutToken(nft.tokenId, expiry, {
        value: rentPrice,
      });
    }

    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };


  const fetchNFTs = async () => {
    console.log("Fetching assets...");
    setIsLoadingNFT(false);
    const RPC_URL =
      process.env.NEXT_PUBLIC_TESTNET === "true"
        ? process.env.NEXT_PUBLIC_RPC_URL
        : process.env.NEXT_PUBLIC_LOCAL_RPC_URL;

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = fetchContract(provider);

    const data = await contract.fetchMarketItems();
    const items = await Promise.all(
      data.map(
        async ({
          tokenId,
          owner,
          isWETH,
          price: unformmattedPrice,
          rentPrice: unformmattedRentPrice,
          forRent,
          forSale,
          sold,
          rented,
        }) => {
          const tokenURI = await contract.tokenURI(tokenId);
          const {
            data: { name, id, description },
          } = await axios.get(`https://ipfs.io/ipfs/${tokenURI}`);
          const price = ethers.utils.formatUnits(
            unformmattedPrice.toString(),
            "ether"
          );
          const rentPrice = ethers.utils.formatUnits(
            unformmattedRentPrice.toString(),
            "ether"
          );
          return {
            tokenId: tokenId.toNumber(),
            owner,
            isWETH,
            price,
            rentPrice,
            forRent,
            forSale,
            sold,
            rented,
            name,
            id,
            description,
            tokenURI,
          };
        }
      )
    );
    setIsLoadingNFT(false);
    return items;
  };

  const fetchImportedNFTs = async () => {
    console.log("Fetching imported assets...");
    setIsLoadingNFT(false);
    const RPC_URL =
      process.env.NEXT_PUBLIC_TESTNET === "true"
        ? process.env.NEXT_PUBLIC_RPC_URL
        : process.env.NEXT_PUBLIC_LOCAL_RPC_URL;

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = fetchContract(provider);

    const data = await contract.fetchImportedMarketItems();
    const items = await Promise.all(
      data.map(
        async ({
          tokenId,
          collection,
          owner,
          rentalPrice,
          isWETH
        }) => {
          const tokenURI = await contract.getTokenURLFromImportedNFT(collection, tokenId);
          const {
            data: { name, description },
          } = await axios.get(`https://ipfs.io/ipfs/${tokenURI}`);
          const rentPrice = ethers.utils.formatUnits(
            rentalPrice.toString(),
            "ether"
          );
          return {
            tokenId: tokenId.toNumber(),
            owner,
            isWETH,
            rentPrice,
            collection,
            name,
            description,
            tokenURI,
          };
        }
      )
    );
    setIsLoadingNFT(false);
    return items;
  }

  const fetchMyRentedImportedNFTs = async () => {
    setIsLoadingNFT(false);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const data = await contract.fetchMyRentedImportedNFTs();
    const items = await Promise.all(
      data.map(
        async ({
          tokenId,
          collection,
          owner,
          rentalPrice,
          isWETH,
          expiry,
          renter,
          rented
        }) => {
          const tokenURI = await contract.getTokenURLFromImportedNFT(collection, tokenId);
          const {
            data: { name, description },
          } = await axios.get(`https://ipfs.io/ipfs/${tokenURI}`);
          const rentPrice = ethers.utils.formatUnits(
            rentalPrice.toString(),
            "ether"
          );
          return {
            tokenId: tokenId.toNumber(),
            owner,
            rentPrice,
            collection,
            name,
            description,
            tokenURI,
            isWETH,
            expiry,
            renter,
            rented
          };
        }
      )
    );
    setIsLoadingNFT(false);
    return items;
  }
  const fetchMyNFTs = async () => {
    setIsLoadingNFT(false);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const data = await contract.fetchMyNFTs();
    const items = await Promise.all(
      data.map(
        async ({
          tokenId,
          owner,
          isWETH,
          price: unformmattedPrice,
          rentPrice: unformmattedRentPrice,
          forRent,
          forSale,
          sold,
          rented,
        }) => {
          console.log(tokenId);
          const tokenURI = await contract.tokenURI(tokenId);

          const {
            data: { name, id, description },
          } = await axios.get(`https://ipfs.io/ipfs/${tokenURI}`);
          const price = ethers.utils.formatUnits(
            unformmattedPrice.toString(),
            "ether"
          );
          const rentPrice = ethers.utils.formatUnits(
            unformmattedRentPrice.toString(),
            "ether"
          );

          return {
            tokenId: tokenId.toNumber(),
            owner,
            isWETH,
            price,
            rentPrice,
            forRent,
            forSale,
            sold,
            rented,
            name,
            id,
            description,
            tokenURI,
          };
        }
      )
    );

    return items;
  };

  //fetch nft from my digital wallet using https://testnets-api.opensea.io/api/v2/chain/mumbai/account/0x158f65db710824CE337c91efC379FEBc985Cf59E/nfts
  const fetchMyAllNFTs = async () => {
    try {
      const response = await axios.get(
        `https://testnets-api.opensea.io/api/v2/chain/mumbai/account/${currentAddress}/nfts`
      );
      console.log(response.data.nfts);
  
      const items = await Promise.all(
        response.data.nfts.map(async (nft) => {
  
          const tokenId = parseInt(nft.identifier);
          const owner = currentAddress; // This might be different based on your implementation
          const tokenURI = nft.metadata_url;
          const isWETH = false;
          const price = "0";
          const rentPrice = "0";
          const forRent = false;
          const forSale = false;
          const sold = false;
          const rented = false;

          return {
            tokenId,
            owner,
            isWETH,
            price,
            rentPrice,
            forRent,
            forSale,
            sold,
            rented,
            name: nft.name,
            id: tokenId, // Assuming the id is the same as tokenId
            description: nft.description,
            tokenURI,
          };
        })
      );

      return items;
    } catch (error) {
      console.error("Error during fetching NFTs:", error);
    }
  };
  


  const fetchMyRentedNFT = async () => {
    setIsLoadingNFT(false);

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const data = await contract.fetchMyRentedNFTs();

    const items = await Promise.all(
      data.map(
        async ({
          tokenId,
          owner,
          isWETH,
          price: unformmattedPrice,
          rentPrice: unformmattedRentPrice,
          forRent,
          forSale,
          sold,
          rented,
          renter,
          expires: unformmattedExpries,
        }) => {
          const tokenURI = await contract.tokenURI(tokenId);
          const {
            data: { name, id, description },
          } = await axios.get(`https://ipfs.io/ipfs/${tokenURI}`);
          const price = ethers.utils.formatUnits(
            unformmattedPrice.toString(),
            "ether"
          );
          const rentPrice = ethers.utils.formatUnits(
            unformmattedRentPrice.toString(),
            "ether"
          );
          // expires in string
          const expires = new Date(unformmattedExpries * 1000).toLocaleString();

          return {
            tokenId: tokenId.toNumber(),
            owner,
            isWETH,
            price,
            rentPrice,
            forRent,
            forSale,
            sold,
            rented,
            renter,
            expires,
            name,
            id,
            description,
            tokenURI,
          };
        }
      )
    );

    return items;
  };

  useEffect(async () => {
      // checkIfWalletIsConnected();
      if(!window.ethereum) {
        toast.error("Please Install Ethereum wallet first!", {
          position: "top-right",
          style: { marginTop: "70px" },
        });
        return;
      }
  }, []);

  return (
    <NFTContext.Provider
      value={{
        nftCurrency,
        fetchNFTs,
        buyNft,
        fetchImportedNFTs,
        importNFT,
        rentImportedNFT,
        createSale,
        rentNFT,
        fetchMyNFTs,
        fetchMyAllNFTs,
        fetchMyRentedNFT,
        userOf,
        reSale,
        signIn,
        signUp,
        isSigned,
        signOut,
        isLoadingNFT,
        verify,
        isSingedUp,
        wrongOTP,
        avatar, 
        setAvatar
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};

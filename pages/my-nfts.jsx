import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import {
  useConnectionStatus,
  useDisconnect,
  useAddress,
} from "@thirdweb-dev/react";
import { NFTContext } from "../context/NFTContext";
import { Loader, BuyCard, ListCard, RentCard, Banner, SearchBar } from "../components";
import images from "../assets";
import { shortenAddress } from "../utils/shortenAddress";

const MyNFTs = () => {
  const { fetchMyRentedImportedNFT, fetchMyRentedNFT, fetchMyAllNFTs, avatar } =
    useContext(NFTContext);
  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rentedNfts, setRentedNfts] = useState([]);
  const [importedRented, setImportedRented] = useState([]);
  const [listedNfts, setListedNfts] = useState([]);
  const [activeTab, setActiveTab] = useState("ownedNfts"); // Added for tab selection
  const currentAccount =
    useConnectionStatus() === "connected" ? useAddress() : null;

  useEffect(() => {
    let isMounted = true; // Flag to track mounted state

    const fetchData = async () => {
      if (isMounted) {
        setIsLoading(true);
      }
      if (currentAccount) {
        const ownedNfts = await fetchMyAllNFTs();
        const rentedNFTs = await fetchMyRentedNFT();
        const importedRentedNFTs = await fetchMyRentedImportedNFT();

        if (isMounted) {
          setNftsCopy(ownedNfts);
          setRentedNfts(rentedNFTs);
          setImportedRented(importedRentedNFTs);
          setNfts(ownedNfts);
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMounted = false;
    };
  }, [currentAccount]);

  // Determine which NFTs to display based on the active tab
  const displayedNfts = () => {
    switch (activeTab) {
      case "ownedNfts":
        return nfts;
      case "rentedNfts":
        return importedRented.concat(rentedNfts);
      default:
        return nfts;
    }
  };

  if (isLoading) {
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );
  }

  const onHandleSearch = (value) => {
    const filteredNfts = displayedNfts().filter(({ name }) =>
      name.toLowerCase().includes(value.toLowerCase())
    );

    if (filteredNfts.length) {
      setNfts(filteredNfts);
    } else {
      setNfts(nftsCopy);
    }
  };

  const onClearSearch = () => {
    setNfts(nftsCopy);
  };

  return (
    <div className="w-full flex justify-start items-center flex-col min-h-screen">
      <div className="w-full flexCenter flex-col">
        <Banner
          name="Your Assets"
          childStyles="text-center mb-4"
          parentStyles="h-80 justify-center"
        />

        <div className="flexCenter flex-col -mt-20 z-0">
          <div className="flexCenter w-40 h-40 sm:w-36 sm:h-36 p-1 bg-nft-black-2 rounded-full">
            <img
              src={
                avatar
                  ? avatar
                  : "https://vendorsprofile.s3.amazonaws.com/creator1.png"
              }
              className="h-40 w-40 rounded-full object-cover"
            />
          </div>
          <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-2xl mt-6">
            {shortenAddress(currentAccount)}
          </p>
        </div>
      </div>

      <div className="w-full p-4 flex justify-center gap-x-4">
        <button
          className={`py-2 px-4 border ${
            activeTab === "ownedNfts" ? "border-blue-500" : "border-transparent"
          }`}
          onClick={() => setActiveTab("ownedNfts")}
        >
          Owned NFTs
        </button>
        <button
          className={`py-2 px-4 border ${
            activeTab === "rentedNfts"
              ? "border-blue-500"
              : "border-transparent"
          }`}
          onClick={() => setActiveTab("rentedNfts")}
        >
          Rented NFTs
        </button>
      </div>
      <div className="mt-3 w-full flex flex-wrap">
        {displayedNfts().map((nft) =>
          activeTab === "ownedNfts" ? (
            <ListCard nft={nft} />
          ) : (
            <RentCard nft={nft} key={nft.tokenId} />
          )
        )}
      </div>
    </div>
  );
};

export default MyNFTs;

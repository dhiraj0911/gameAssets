import React, { useContext, useState } from "react";
import Link from "next/link";
import { NFTContext } from "../context/NFTContext";
import {
  useConnectionStatus,
  useDisconnect,
  useAddress,
} from "@thirdweb-dev/react";
import { Button, Loader } from "../components";
import MintAssetModal from "../components/MintAssetModal";

const ListCard = ({ nft }) => {
  const { nftCurrency, importNFT, reSale } = useContext(NFTContext);
  const ownerAddress = nft.owner.toLowerCase();
  const currentAccountAddress =
    useConnectionStatus() === "connected" ? useAddress().toLowerCase() : null;
  const contract = nft.contract.toLowerCase();
  const platformContract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS.toLowerCase();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleImport = async () => {
    handleOpenModal(); // Open the modal when the button is clicked
  };

  return (
    <div
      className="flex flex-col rounded-3xl border-solid hover:border-dotted m-3"
      style={{ backgroundColor: "#011627 " }}
    >
      <div className="px-4 py-7 sm:p-10 sm:pb-6">
        <div className="grid items-center justify-center w-full grid-cols-1 text-left">
          <div>
            <h2 className="text-lg font-medium tracking-tighter text-white lg:text-3xl">
              {nft.name}
            </h2>
            <p className="mt-6 text-sm text-gray-100">tokenId: {nft.tokenId}</p>
            <p className="mt-6 text-sm text-gray-100">
              contract: {nft.contract}
            </p>
            <p className="mt-6 text-sm text-gray-100">
              Collection: {nft.collection}
            </p>
            <a
              href={`https://sepolia.arbiscan.io/token/${nft.contract}?a=${nft.tokenId}`}
              aria-describedby="tier-starter"
              className="items-center justify-center w-1/2 px-2 py-2.5 text-center text-black duration-50 bg-white border-2 border-white rounded inline-flex hover:bg-transparent hover:border-white hover:text-white focus:outline-none focus-visible:outline-white text-xs focus-visible:ring-white"
              target="_blank"
            >
              View on Explorer
            </a>
          </div>
          {contract === platformContract ? (
            <Link href={{ pathname: "/nft-details", query: nft }}>
              <div className="flex px-6 pb-8 sm:px-8">
                <a
                  aria-describedby="tier-starter"
                  className="ml-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-800"
                >
                  View More
                </a>
              </div>
            </Link>
          ) : (
            <Button
              btnName="Import NFT"
              type="submit"
              handleClick={handleImport}
              classStyles="ml-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-800"
            />
          )}
        </div>
      </div>
      <MintAssetModal
        contract={contract}
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        currentAsset={nft} // Pass the current NFT details to the modal
      />
    </div>
  );
};

export default ListCard;

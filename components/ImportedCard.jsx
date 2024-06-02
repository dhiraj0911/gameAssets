import React, { useContext, useState } from "react";
import Link from "next/link";
import { NFTContext } from "../context/NFTContext";
import {
  useConnectionStatus,
  useAddress,
} from "@thirdweb-dev/react";
import { Button } from "../components";

const ImportedCard = ({ nft }) => {
  const { nftCurrency, buyImportedNFT, rentImportedNFT } =
    useContext(NFTContext);
  const ownerAddress = nft.owner.toLowerCase();
  const currentAccountAddress =
    useConnectionStatus() === "connected" ? useAddress().toLowerCase() : null;

  const [rentalPeriodInDays, setRentalPeriodInDays] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBuy = async () => {
    await buyImportedNFT(nft, currentAccountAddress);
  };

  const handleRent = async () => {
    await rentImportedNFT(nft, rentalPeriodInDays);
    setIsModalOpen(false); // Close the modal after renting
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      className="flex flex-col w-[40%] rounded-3xl border-solid hover:border-dotted m-3"
      style={{ backgroundColor: "#011627 " }}
    >
      <div className="px-4 py-7 sm:p-10 sm:pb-6">
        <div className="grid items-center justify-center grid-cols-1 text-left">
          <div>
            <h2 className="text-lg font-medium tracking-tighter text-white lg:text-3xl">
              {nft.name}
            </h2>
            <div className="flex flex-row">
              <p className="mt-6 text-base font-bold text-gray-100">tokenId:</p>
              <p className="mt-6 text-base text-gray-100">{nft.tokenId}</p>
            </div>
            <div className="flex flex-row items-center">
              <p className="mt-2 mr-2 text-base font-bold text-gray-100">
                contract:
              </p>
              <p className="mt-2 text-sm text-gray-100">{nft.contract}</p>
            </div>
            {nft.collection && (
              <p className="mt-6 text-sm text-gray-100">
                Collection: {nft.collection}
              </p>
            )}
          </div>
          {ownerAddress !== currentAccountAddress ? (
            <div className="flex flex-row justify-between mt-4">
              <div>
                <Button
                  btnName="Buy"
                  handleClick={handleBuy}
                  classStyles="ml-3 px-4 text-white bg-green-500 rounded-lg text-sm "
                />
                <Button
                  btnName="Rent"
                  handleClick={openModal}
                  classStyles="ml-3 px-4 text-white bg-green-500 rounded-lg text-sm"
                />
              </div>

              <a
                href={`https://sepolia.etherscan.io/nft/${nft.contract}/${nft.tokenId}`}
                aria-describedby="tier-starter"
                className="items-center justify-center px-2 py-2.5 text-center text-black duration-50 bg-white border-2 border-white rounded inline-flex hover:bg-transparent hover:border-white hover:text-white focus:outline-none focus-visible:outline-white text-xs focus-visible:ring-white"
                target="_blank"
              >
                View on Explorer
              </a>
            </div>
          ) : (
            <a
              href={`https://sepolia.etherscan.io/nft/${nft.contract}/${nft.tokenId}`}
              aria-describedby="tier-starter"
              className="items-center justify-center w-1/2 px-2 py-2.5 text-center text-black duration-50 bg-white border-2 border-white rounded inline-flex hover:bg-transparent hover:border-white hover:text-white focus:outline-none focus-visible:outline-white text-xs focus-visible:ring-white"
              target="_blank"
            >
              View on Explorer
            </a>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-green p-4 rounded-lg border-left has-background-black">
            <h2 className="text-lg font-medium mb-4">Enter Rental Period (Days)</h2>
            <input
              type="number"
              value={rentalPeriodInDays}
              onChange={(e) => setRentalPeriodInDays(Number(e.target.value))}
              className="border p-2 rounded"
              min="1"
            />
            <div className="flex justify-end mt-4">
              <Button
                btnName="Cancel"
                handleClick={closeModal}
                classStyles="mr-2 px-4 text-black bg-gray-300 rounded-lg text-sm"
              />
              <Button
                btnName="Submit"
                handleClick={handleRent}
                classStyles="px-4 text-white bg-green-500 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportedCard;

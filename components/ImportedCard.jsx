import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { NFTContext } from "../context/NFTContext";
import {
  useConnectionStatus,
  useDisconnect,
  useAddress,
} from "@thirdweb-dev/react";
import { Button, Modal, Loader } from "../components";
const ImportedCard = ({ nft }) => {
  const { nftCurrency, buyImportedNFT, rentImportedNFT } =
    useContext(NFTContext);
  const ownerAddress = nft.owner.toLowerCase();
  const currentAccountAddress =
    useConnectionStatus() === "connected" ? useAddress().toLowerCase() : null;
  const contract = nft.contract.toLowerCase();

  const handleList = async () => {
    // await importNFT(contract, nft.tokenId, false, '0.001', '0.001', true, true);
    console.log("working");
  };

  const handleBuy = async () => {
    await buyImportedNFT(nft, currentAccountAddress);
  };

  const handleRent = async () => {
    await rentImportedNFT(nft, currentAccountAddress);
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
                  // handleClick={handleRent}
                  classStyles="ml-3 px-4 text-white bg-green-500 rounded-lg text-sm"
                />
              </div>

              {/* <Link
                // href={`https://sepolia.arbiscan.io/token/${nft.contract}?a=${nft.tokenId}`}
                href={{
                  pathname: `https://sepolia.etherscan.io/nft/${nft.contract}/${nft.tokenId}`,
                }}
              >
                <a
                  aria-describedby="tier-starter"
                  className="items-center justify-center px-2 py-2.5 text-center text-black duration-50 bg-white border-2 border-white rounded inline-flex hover:bg-transparent hover:border-white hover:text-white focus:outline-none focus-visible:outline-white text-xs focus-visible:ring-white"
                  target="_blank"
                >
                  View on Explorer
                </a>
              </Link> */}
              {/* Network */}
              <a
                href={`https://sepolia.arbiscan.io/token/${nft.contract}?a=${nft.tokenId}`}
                aria-describedby="tier-starter"
                className="items-center justify-center px-2 py-2.5 text-center text-black duration-50 bg-white border-2 border-white rounded inline-flex hover:bg-transparent hover:border-white hover:text-white focus:outline-none focus-visible:outline-white text-xs focus-visible:ring-white"
                target="_blank"
              >
                View on Explorer
              </a>
            </div>
          ): (
            <>
            {/* Network */}
              <a
                href={`https://sepolia.arbiscan.io/token/${nft.contract}?a=${nft.tokenId}`}
                aria-describedby="tier-starter"
                className="items-center justify-center w-1/2 px-2 py-2.5 text-center text-black duration-50 bg-white border-2 border-white rounded inline-flex hover:bg-transparent hover:border-white hover:text-white focus:outline-none focus-visible:outline-white text-xs focus-visible:ring-white"
                target="_blank"
              >
                View on Explorer
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportedCard;

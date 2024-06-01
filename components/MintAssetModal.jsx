import React, { useState, useContext } from 'react';
import { NFTContext } from '../context/NFTContext';
import { Modal, Loader, Button } from '.';
import axios from 'axios';

const MintAssetModal = ({ contract, isModalOpen, handleCloseModal, currentAsset }) => {
  const { isLoadingNFT, importNFT } = useContext(NFTContext);
  const [isForSale, setIsForSale] = useState(false);
  const [isForRent, setIsForRent] = useState(false);
  const [isWETH, setIsWETH] = useState(false);
  const [price, setPrice] = useState("0");
  const [rentPrice, setRentPrice] = useState("0");
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_PRODUCTION === "true"
      ? process.env.NEXT_PUBLIC_BASE_URL
      : "http://localhost:5000";

  const handleMint = async (e) => {
    e.preventDefault();
    if (currentAsset) {
      // let response;
      // try {
      //   response = await axios.post(
      //     `${API_BASE_URL}/api/mint-asset`,
      //     currentAsset
      //   );
      // } catch (error) {
      //   console.error("Error:", error);
      // }
      // const uri = response.data.ipfsResult.IpfsHash;
      await importNFT(contract, currentAsset.tokenId, isWETH, price, rentPrice, isForSale, isForRent);
      handleCloseModal();
      // const ownerId = window.localStorage.getItem("vendor");
      // const { id } = currentAsset;
      // try {
      //   const assets = await axios.post(`${API_BASE_URL}/api/assets/`, {
      //     id,
      //     uri,
      //     isForSale,
      //     isForRent,
      //     isWETH,
      //     price,
      //     rentPrice,
      //     owner: ownerId,
      //   });
      //   const assetId = assets.data.id;
      //   const vendorId = window.localStorage.getItem("vendor");
      //   await axios.post(`${API_BASE_URL}/api/transaction`, {
      //     assetId,
      //     vendorId,
      //     transactionType: "Create",
      //   });
      // } catch (error) {
      //   console.error("Error in storing asset in backend", error);
      // }
    }
  };

  return (
    isModalOpen && (
      <div
        id="mint-asset-modal"
        aria-hidden="true"
        className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center"
      >
        <div className="relative w-full max-w-lg px-4 md:px-0">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 mx-auto">
            {isLoadingNFT ? (
              <Modal
                header="Minting asset..."
                body={
                  <div className="flexCenter flex-col text-center">
                    <div className="relative w-52 h-52">
                      <Loader />
                    </div>
                  </div>
                }
                handleClose={() => setIsModalOpen(false)}
              />
            ) : (
              <>
                <div className="flex justify-between items-start p-4 rounded-t border-b dark:border-gray-600">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Asset Details
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={handleCloseModal}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-center">
                  <form
                    className="w-full px-5 py-2 lg:px-10 sm:pb-6 xl:pb-8 space-y-2"
                    action="#"
                  >
                    <div>
                      <label
                        htmlFor="assetName"
                        className="block mb-2 text-sm font-small text-gray-600 dark:text-white"
                      >
                        Contract
                      </label>
                      <input
                        type="text"
                        id="assetName"
                        name="assetName"
                        defaultValue={contract}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        readOnly
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="assetName"
                        className="block mb-2 text-sm font-small text-gray-600 dark:text-white"
                      >
                        Asset Name
                      </label>
                      <input
                        type="text"
                        id="assetName"
                        name="assetName"
                        defaultValue={currentAsset && currentAsset.name}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        readOnly
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="assetId"
                        className="block mb-2 text-sm font-small text-gray-600 dark:text-white"
                      >
                        Asset ID
                      </label>
                      <input
                        type="text"
                        id="assetId"
                        name="assetId"
                        defaultValue={currentAsset && currentAsset.tokenId}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        readOnly
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="description"
                        className="block mb-2 text-sm font-small text-gray-600 dark:text-white"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        defaultValue={currentAsset && currentAsset.description}
                        rows="3"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        readOnly
                      ></textarea>
                    </div>
                    <div className="flex gap-6 mb-6">
                      <div className="flex items-center mt-3">
                        <input
                          type="checkbox"
                          id="saleCheckbox"
                          checked={isForSale}
                          onChange={(e) => {
                            setIsForSale(e.target.checked);
                            // If the checkbox is checked, unlock the price input field
                            if (!isForSale) {
                              setPrice("0");
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        <label
                          htmlFor="saleCheckbox"
                          className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          For Sale
                        </label>
                      </div>
                      <div className="flex items-center mt-3">
                        <input
                          type="checkbox"
                          id="rentCheckbox"
                          checked={isForRent}
                          onChange={(e) => {
                            setIsForRent(e.target.checked);
                            // If the checkbox is checked, unlock the rent price input field
                            if (!isForRent) {
                              setRentPrice("0");
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        <label
                          htmlFor="rentCheckbox"
                          className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          For Rent
                        </label>
                      </div>
                    </div>

                    {isForSale || isForRent ? (
                      <div className="mb-9">
                        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                          Choose Currency
                        </h3>
                        <div className="flex justify-center w-1/2 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600">
                          <div className="flex items-center w-1/2 border-r border-gray-200 dark:border-gray-600">
                            <input
                              id="currency-radio-matic"
                              type="radio"
                              value="MATIC"
                              name="currency"
                              checked={!isWETH}
                              onChange={() => setIsWETH(false)}
                              className="ml-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                            />
                            <label
                              htmlFor="currency-radio-matic"
                              className="ml-2 py-3 text-sm font-medium text-gray-900 dark:text-gray-300"
                            >
                              MATIC
                            </label>
                          </div>
                          <div className="flex items-center w-1/2">
                            <input
                              id="currency-radio-weth"
                              type="radio"
                              value="WETH"
                              name="currency"
                              checked={isWETH}
                              onChange={() => setIsWETH(true)}
                              className="ml-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                            />
                            <label
                              htmlFor="currency-radio-weth"
                              className="ml-2 py-3 text-sm font-medium text-gray-900 dark:text-gray-300"
                            >
                              WETH
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {isForSale ? (
                      <div className="mb-6">
                        <label
                          htmlFor="price"
                          className="block mb-2 text-sm font-small text-gray-600 dark:text-white"
                        >
                          Sale Price
                        </label>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          min="0"
                          step="0.01"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          disabled={!isForSale}
                        />
                      </div>
                    ) : null}

                    {isForRent ? (
                      <div className="mb-6">
                        <label
                          htmlFor="rentPrice"
                          className="block mb-2 text-sm font-small text-gray-600 dark:text-white"
                        >
                          Rent Price (per day)
                        </label>
                        <input
                          type="number"
                          id="rentPrice"
                          name="rentPrice"
                          value={rentPrice}
                          onChange={(e) => setRentPrice(e.target.value)}
                          min="0"
                          step="0.01"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          disabled={!isForRent}
                        />
                      </div>
                    ) : null}

                    <Button
                      btnName="Mint"
                      classStyles="rounded-xl mt-8"
                      handleClick={handleMint}
                    />
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default MintAssetModal;

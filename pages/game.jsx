import React, { useState, useMemo, useCallback, useContext } from 'react';

import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useTheme } from 'next-themes';

import { NFTContext } from '../context/NFTContext';
import { Button, Input, Loader } from '../components';
// import images from '../assets';


const Game = () => {
  const [vendorEndpoint, setVendorEndpoint] = useState('');
  const [deployedAssets, setDeployedAssets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const { isLoadingNFT, createSale } = useContext(NFTContext);
  const [mintedAssets, setMintedAssets] = useState({});
  const [price, setPrice] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const router = useRouter();

  const handleOpenModal = (asset) => {
    setCurrentAsset(asset);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleMint = async (e) => {
    e.preventDefault();
    if (currentAsset) {
      // Assuming currentAsset contains the URL and other details needed for the NFT creation
      // and price and rentPrice are state variables holding the input values
      const url = currentAsset.ipfsHash;
      await createSale( url, price, rentPrice, true, true, true);
      setMintedAssets(prev => ({ ...prev, [currentAsset.id]: true }));
      // Reset state if needed
      setPrice('');
      setRentPrice('');
      setCurrentAsset(null);
      
      setIsModalOpen(false);
  
      // Optional: Redirect after successful minting
      // router.push('/path-to-redirect-after-mint'); // Update this path as needed
    }
  };
  
  const handleFetchAssets = async () => {
    try {
      // Make sure the user has provided an endpoint
      if (!vendorEndpoint) {
        alert('Please provide a valid API endpoint');
        return;
      }

      // Make a request to your backend with the dynamic API endpoint
      const response = await fetch(`http://localhost:3001/fetch-assets/${encodeURIComponent(vendorEndpoint)}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update the state with the received deployed assets
      setDeployedAssets(data.deployedAssets);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const { theme } = useTheme();

  return (
    <div className={`flex justify-center ${theme === 'dark' ? 'dark' : ''} sm:px-4 p-12`}>
      <div className="w-3/5 md:w-full">
        <div className="mt-16 ">
          <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xl">Data Endpoint</p>
          <div className="mt-4">
            <input
              type="text"
              value={vendorEndpoint}
              onChange={(e) => setVendorEndpoint(e.target.value)}
              className="dark:bg-nft-black-1 bg-white border dark:border-white border-nft-gray-2 p-2 rounded-md mb-4 w-full dark:text-white text-nft-black-1 text-m"
              placeholder="Enter API Endpoint"
            />

            <button
              onClick={handleFetchAssets}
              className="mt-3 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded w-full dark:bg-nft-black-1 dark:text-white font-semibold text-m py-3 mx-auto col-span-2"
            >
              Fetch and Mint Asset
            </button>
          </div>

          {/* Cards container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">
            {deployedAssets.map((asset, index) => (
                <div key={index} className="max-w-sm p-6 bg-white bg-opacity-20 border border-gray-200 rounded-lg shadow dark:bg-black-800 dark:border-gray-700 dark:bg-opacity-10">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{asset.name}</h5>
                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Unique ID: {asset.id}</p>
                    {/* <a href="#" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        Mint
                        <svg className="ml-2 w-3.5 h-3.5" aria-hidden="true" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                        </svg>
                    </a> */}
                    {mintedAssets[asset.id] ? (
                      <button
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-green-700 rounded-lg"
                        disabled
                      >
                        Minted
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenModal(asset)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        Mint
                        <svg className="ml-2 w-3.5 h-3.5" aria-hidden="true" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                        </svg>
                      </button>
                    )}
                </div>
            ))}
            {isModalOpen && (
              <div id="mint-asset-modal" aria-hidden="true" className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center">
                <div className="relative w-full max-w-lg px-4 md:px-0">
                  <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 mx-auto">
                    <div className="flex justify-between items-start p-4 rounded-t border-b dark:border-gray-600">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Asset Details
                      </h3>
                      <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={handleCloseModal}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <form className="w-full px-5 py-2 lg:px-10 sm:pb-6 xl:pb-8 space-y-2" action="#">
                        <div>
                          <label htmlFor="assetName" className="block mb-2 text-sm font-small text-gray-600 dark:text-white">Asset Name</label>
                          <input type="text" id="assetName" name="assetName" defaultValue={currentAsset && currentAsset.name} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white" readOnly />
                        </div>
                        <div>
                          <label htmlFor="assetId" className="block mb-2 text-sm font-small text-gray-600 dark:text-white">Asset ID</label>
                          <input type="text" id="assetId" name="assetId" defaultValue={currentAsset && currentAsset.id} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white" readOnly />
                        </div>
                        <div>
                          <label htmlFor="description" className="block mb-2 text-sm font-small text-gray-600 dark:text-white">Description</label>
                          <textarea id="description" name="description" defaultValue={currentAsset && currentAsset.description} rows="3" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white" readOnly></textarea>
                        </div>
                        <div>
                          <label htmlFor="price" className="block mb-2 text-sm font-small text-gray-600 dark:text-white">Price</label>
                          <input
                            type="number"
                            id="price"
                            name="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="rentPrice" className="block mb-2 text-sm font-small text-gray-600 dark:text-white">Rent Price per day</label>
                          <input
                            type="number"
                            id="rentPrice"
                            name="rentPrice"
                            value={rentPrice}
                            onChange={(e) => setRentPrice(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            required
                          />
                        </div>
                        {/* <div>

                          <label htmlFor="sale" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">For Sale</label>
                          <select id="sale" name="sale" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="rent" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">For Rent</label>
                          <select id="rent" name="rent" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </div> */}
                        {/* {currentAsset && currentAsset.forRent === 'yes' && ( */}
                          
                        {/* )} */}
                        <div className="flex items-center justify-end p-4 rounded-b border-t border-gray-200 dark:border-gray-600">
                          <Button
                            btnName="Cancel"
                            classStyles="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-4 py-2 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-600"
                            handleClick={handleCloseModal}
                          />
                          <Button
                            btnName="Mint"
                            type="submit"
                            handleClick={handleMint}
                            classStyles="ml-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-800"
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;

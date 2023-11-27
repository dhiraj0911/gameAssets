import React, { useState } from 'react';
import { useTheme } from 'next-themes';  // Import the theme hook if needed

const Game = () => {
  const [vendorEndpoint, setVendorEndpoint] = useState("");
  const [ipfsHash, setIpfsHash] = useState(null);

  const handleFetchAssets = async () => {
    try {
      // Make sure the user has provided an endpoint
      if (!vendorEndpoint) {
        console.error("Please provide a valid API endpoint");
        return;
      }

      // Make a request to your backend with the dynamic API endpoint
      const response = await fetch((`http://localhost:3001/fetch-assets/${encodeURIComponent(vendorEndpoint)}`), {
        method: 'POST',
      });

      const data = await response.json();

      // Update the state with the received IPFS hash
      setIpfsHash(data.ipfsHashes);
    } catch (error) {
      console.error(error);
    }
  };

  const { theme } = useTheme(); 

  return (
    <div className="flex justify-center sm:px-4 p-12">
      <div className="w-3/5 md:w-full">
        <h1 className="flex-1 font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold sm:mb-4">Fetch Assets</h1>

        <div className="mt-16 ">
          <p className="flex-1 font-poppins dark:text-white text-nft-black-1 font-semibold text-xl">Enter API Endpoint</p>
          <div className="mt-4">
            <input
              type="text"
              value={vendorEndpoint}
              onChange={(e) => setVendorEndpoint(e.target.value)}
              className="dark:bg-nft-black-1 bg-white border dark:border-white border-nft-gray-2 p-2 rounded-md"
              placeholder="Enter API Endpoint"
            />

            <button
              onClick={handleFetchAssets}
              className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full dark:bg-nft-black-1 dark:text-white text-nft-black-1 font-semibold text-m py-3 mx-auto col-span-2"
            >
              Fetch Assets
            </button>
            <br></br>
            <br></br>
            <br></br>

            {/* Display IPFS hash if available */}
            {ipfsHash && (
              <div className="mt-4">
                <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xl">IPFS Hashes:</p>
                <ul>
                  {ipfsHash.map((hash, index) => (
                    <h3><li key={index} className="font-poppins dark:text-white text-nft-black-1 text-xl">{hash}</li></h3>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { NFTContext } from "../context/NFTContext";
import { Loader, Button, Input } from "../components";

const ResellNFT = () => {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_PRODUCTION === "true"
      ? process.env.NEXT_PUBLIC_BASE_URL
      : "http://localhost:5000";
  const { reSale, isLoadingNFT } = useContext(NFTContext);
  const router = useRouter();
  const { tokenId, tokenURI } = router.query;
  const [isWETH, setIsWETH] = useState(false);
  const [price, setPrice] = useState("0");
  const [rentPrice, setRentPrice] = useState("0");
  const [name, setName] = useState("");
  // const [description, setDescription] = useState("");
  const [id, setId] = useState("");
  const [isForSale, setIsForSale] = useState(false);
  const [isForRent, setIsForRent] = useState(false);

  useEffect(async () => {
    if (!tokenURI) return;
    const {
      data: { id, name },
    } = await axios.get(`https://ipfs.io/ipfs/${tokenURI}`);

    setName(name);
    setId(id);
    // setDescription(description);
  }, []);

  const resell = async () => {
    await reSale(tokenId, isWETH, price, rentPrice, isForRent, isForSale, true);
    await axios.put(`${API_BASE_URL}/api/assets/${id}`, {
      isForSale,
      isForRent,
      price,
      rentPrice,
      owner: `${process.env.NEXT_PUBLIC_OBJECTID}`,
      seller: window.localStorage.getItem("objectId"),
    });
    router.push("/");
  };

  if (isLoadingNFT) {
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4 lg:p-12">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-semibold text-center text-nft-black-1 dark:text-white">
          Sell/Lease Asset
        </h1>

        {/* Asset Card */}
        <div className="my-6">
          <div className="card bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-2 border-gray-900 rounded-lg overflow-hidden shadow-lg transition-all hover:brightness-90">
            <div className="p-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="bg-pink-500 w-10 h-10 rounded-full mb-4 mr-4"></span>
                  <div>
                    <div className="text-xl font-bold">{name}</div>
                    <div className="text-gray-300 uppercase tracking-widest">{id}</div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{price}</p>
                  <p className="text-gray-400">Perfect everywhere</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* For Rent Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rentCheckbox"
                checked={isForRent}
                onChange={(e) => setIsForRent(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="rentCheckbox" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                For Rent
              </label>
            </div>

            {/* For Sale Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="saleCheckbox"
                checked={isForSale}
                onChange={(e) => setIsForSale(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="saleCheckbox" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                For Sale
              </label>
            </div>
          </div>

          {/* Currency Selection */}
          {isForSale || isForRent ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Choose Currency
              </h3>
              <div className="flex space-x-4 mt-2">
                {/* MATIC Radio Button */}
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="MATIC"
                    name="currency"
                    checked={!isWETH}
                    onChange={() => setIsWETH(false)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">MATIC</span>
                </label>

                {/* WETH Radio Button */}
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="WETH"
                    name="currency"
                    checked={isWETH}
                    onChange={() => setIsWETH(true)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">WETH</span>
                </label>
              </div>
            </div>
          ) : null}

          {/* Price Input */}
          {isForSale && (
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price
              </label>
              <input
                type="number"
                id="price"
                name="price"
                placeholder="Enter price"
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          )}

          {/* Rent Price Input */}
          {isForRent && (
            <div>
              <label htmlFor="rentPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rent Price per day
              </label>
              <input
                type="number"
                id="rentPrice"
                name="rentPrice"
                placeholder="Enter rent price"
                onChange={(e) => setRentPrice(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              onClick={resell}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              List NFT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResellNFT;
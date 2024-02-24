import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { NFTContext } from "../context/NFTContext";
import { Loader, Button, Input, Modal } from "../components";

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

  const [buySuccessModal, setBuySuccessModal] = useState(false);

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
    await reSale(tokenId, isWETH, price, rentPrice, isForRent, isForSale);
    await axios.put(`${API_BASE_URL}/api/assets/${id}`, {
      sold: false,
      isForSale,
      isForRent,
      isWETH,
      price,
      rentPrice,
    });
    const asset = await axios.get(`${API_BASE_URL}/api/assets/${id}`);
    const vendorId = window.localStorage.getItem("vendor");
    await axios.post(`${API_BASE_URL}/api/transaction`, {
      assetId: asset.data._id,
      vendorId,
      transactionType: "Resell",
    });
    router.push("/");
    setBuySuccessModal(true);
  };

  // if (isLoadingNFT) {
  //   return (
  //     <div className="flexStart min-h-screen">
  //       <Loader />
  //     </div>
  //   );
  // }

  return (
    <div className="flex justify-center sm:px-4 p-12">
      <div className="w-3/5 md:w-full">
        <h1 className="font-poppins dark:text-white text-nft-black-1 font-semibold text-2xl">
          Sell/Lease Asset
        </h1>

        <div className="relative flex-1 flexCenter sm:px-0 p-0 border-r md:border-r-0 md:border-b dark:border-nft-black-1 border-nft-gray-1 ">
          <div className="relative  h- minmd:w-2/3 sm:w-full sm:h-300 h-100">
            <div className="card m-auto text-gray-300 w-[clamp(400px,80%,10px)] hover:brightness-90 transition-all group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-2 border-gray-900 m-4 rounded-lg overflow-hidden relative">
              <div className="px-8 py-8 mr-10 pr-20">
                <div className="bg-pink-500 w-10 h-10 rounded-full rounded-tl-none mb-4 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-pink-900 transition-all"></div>
                <div className="uppercase font-bold text-xl">{name}</div>
                <div className="text-gray-300 uppercase tracking-widest">
                  {id}
                </div>
                <div className="text-gray-400 mt-8">
                  <p className="font-bold">{price}</p>
                  <p>Perfect everywhere</p>
                </div>
              </div>
              <div className="h-2 w-full bg-gradient-to-l via-pink-500 group-hover:blur-xl blur-2xl m-auto rounded transition-all absolute bottom-0"></div>
              <div className="h-0.5 group-hover:w-full bg-gradient-to-l  via-yellow-950 group-hover:via-pink-500 w-[70%] m-auto rounded transition-all"></div>
            </div>
          </div>
        </div>
        {isForSale || isForRent ? (
          <div className="flex justify-center m-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Choose Currency
            </h3>
            <div className="flex space-x-4 ml-5">
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
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  MATIC
                </span>
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
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  WETH
                </span>
              </label>
            </div>
          </div>
        ) : null}
        {buySuccessModal && (
          <Modal
            header="Listing NFT Successfull"
            body={
              <div className="flexCenter flex-col text-center">
                <div className="relative w-87 h- minmd:w-2/3 sm:w-full sm:h-300 h-100">
                  <div className="card m-auto text-gray-300 w-[clamp(260px,80%,300px)] hover:brightness-90 transition-all group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-2 border-gray-900 m-4 rounded-lg overflow-hidden relative">
                    <div className="px-8 py-10">
                      <div className="bg-pink-500 w-10 h-10 rounded-full rounded-tl-none mb-4 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-pink-900 transition-all"></div>
                      <div className="uppercase font-bold text-xl">
                        {name}
                      </div>
                      <div className="text-gray-300 uppercase tracking-widest">
                        {id}
                      </div>
                      <div className="text-gray-400 mt-8">
                        <p className="font-bold">39.00 MLC</p>
                        <p>Perfect everywhere</p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gradient-to-l via-pink-500 group-hover:blur-xl blur-2xl m-auto rounded transition-all absolute bottom-0"></div>
                    <div className="h-0.5 group-hover:w-full bg-gradient-to-l  via-yellow-950 group-hover:via-pink-500 w-[70%] m-auto rounded transition-all"></div>
                  </div>
                </div>
                <p className="font-poppins dark:text-white text-nft-black-1 text-sm minlg:text-xl font-normal mt-10">
                  {" "}
                  You successfully listed{" "}
                  <span className="font-semibold">{name}</span> from{" "}
                  {/* <span className="font-semibold">
                    {shortenAddress(owner)}
                  </span> */}
                  .
                </p>
              </div>
            }
            footer={
              <div className="flexCenter flex-col">
                <Button
                  btnName="Check it out"
                  classStyles="sm:mr-0 sm:mb-5 rounded-xl"
                  handleClick={() => router.push("/")}
                />
              </div>
            }
            handleClose={() => setBuySuccessModal(false)}
          />
        )}
        {isLoadingNFT && (
          <Modal
            header="Listing NFT..."
            body={
              <div className="flexCenter flex-col text-center">
                <div className="relative w-52 h-52">
                  <Loader />
                </div>
              </div>
            }
            handleClose={() => setPaymentModal(false)}
          />
        )}

        <div className="flex justify-center sm:px-4 p-12">
          <div className="w-3/5 md:w-full">
            <div className="flex justify-between">
              <div className="flex-1 mr-2">
                <div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700">
                  <input
                    id="bordered-checkbox-sale"
                    type="checkbox"
                    checked={isForSale}
                    onChange={(e) => setIsForSale(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="bordered-checkbox-sale"
                    className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    For Sale
                  </label>
                </div>
                {isForSale && (
                  <Input
                    inputType="number"
                    title="Sale Price"
                    placeholder="Sale Price"
                    handleClick={(e) => setPrice(e.target.value)}
                    classStyles="mt-2"
                  />
                )}
              </div>
              <div className="flex-1 ml-2">
                <div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700">
                  <input
                    id="bordered-checkbox-rent"
                    type="checkbox"
                    checked={isForRent}
                    onChange={(e) => setIsForRent(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="bordered-checkbox-rent"
                    className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    For Rent
                  </label>
                </div>
                {isForRent && (
                  <Input
                    inputType="number"
                    title="Rent Price"
                    placeholder="Rent Price per day"
                    handleClick={(e) => setRentPrice(e.target.value)}
                    classStyles="mt-2"
                  />
                )}
              </div>
            </div>

            <div className="mt-7 w-full flex justify-end">
              <div className="w-full flex justify-center mt-7">
                <Button
                  btnName="List NFT"
                  btnType="primary"
                  classStyles="rounded-xl"
                  handleClick={resell}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResellNFT;

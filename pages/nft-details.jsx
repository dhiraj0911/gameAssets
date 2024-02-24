import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import {
  useConnectionStatus,
  useAddress,
} from "@thirdweb-dev/react";
import { NFTContext } from "../context/NFTContext";
import { Loader, Button, Modal } from "../components";

import { shortenAddress } from "../utils/shortenAddress";

const calculateRentalCost = (nft, rentalPeriodInDays) => {
  const dailyRate = nft.rentPrice;
  return dailyRate * rentalPeriodInDays;
};

const PaymentBodyCmp = ({ nft, currency }) => (
  <div className="flex flex-col">
    <div className="flexBetween">
      <p className="font-poppins dark:text-white text-nft-black-1 minlg:text-xl text-base font-semibold ">
        Items
      </p>
      <p className="font-poppins dark:text-white text-nft-black-1 minlg:text-xl text-base font-semibold ">
        Subtotal
      </p>
    </div>
    <div className="flex justify-between">
      <div>
        <div className="uppercase font-bold text-xl mt-5">{nft.name}</div>
        <div className="text-gray-300 uppercase tracking-widest">{nft.id}</div>
      </div>
      <div className="pt-5">
        {nft.price} {currency}
      </div>
    </div>
    <div className="flexBetween mt-10">
      <p className="font-poppins dark:text-white text-nft-black-1 font-normal  text-base minlg:text-xl">
        Total
      </p>
      <p className="font-poppins dark:text-white text-nft-black-1 font-normal  text-sm minlg:text-xl">
        {nft.price} <span className="font-semibold">{currency}</span>
      </p>
    </div>
  </div>
);

const RentBobyCmp = ({ nft, nftCurrency, rentalPeriod, setRentalPeriod }) => (
  <div className="flex flex-col">
    <div className="flex justify-between">
      <p className="font-poppins dark:text-white text-nft-black-1 minlg:text-xl text-base font-semibold">
        Items
      </p>
      <p className="font-poppins dark:text-white text-nft-black-1 minlg:text-xl mr-20 text-base font-semibold">
        Subtotal
      </p>
    </div>

    <div className="flex justify-between items-start">
      <div>
        <div className="uppercase font-bold text-xl mt-5">{nft.name}</div>
        <div className="text-gray-300 uppercase tracking-widest">{nft.id}</div>
        <div className="mt-5">
          <label
            htmlFor="rentalDays"
            className="font-poppins dark:text-white text-nft-black-1 text-base font-semibold mr-10 "
          >
            Rental Period (Days):
          </label>
        </div>
      </div>

      <div>
        <div className="pt-5 ml-20 pl-20">
          {nft.rentPrice} {nftCurrency} {"/ day"}
        </div>
        <div className="mt-8 px-10 pr-10">
          <input
            min="1"
            placeholder="Enter number of days"
            value={rentalPeriod}
            onChange={(e) => setRentalPeriod(e.target.value)}
            type="number"
            id="rentalDays"
            className="w-30 ml-10 pl-5 py-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required
          />
        </div>
      </div>
    </div>

    <div className="flex justify-between mt-10">
      <p className="font-poppins dark:text-white text-nft-black-1 font-normal text-base minlg:text-xl">
        Total
      </p>
      <p className="font-poppins dark:text-white text-nft-black-1 font-normal text-xl minlg:text-xl mr-20">
        {rentalPeriod === 0 || rentalPeriod === ""
          ? "0"
          : `${rentalPeriod} x ${nft.rentPrice} = `}
        {rentalPeriod !== 0 && rentalPeriod !== "" && (
          <span className="font-bold">
            {`${calculateRentalCost(nft, rentalPeriod)} ${nftCurrency}`}
          </span>
        )}
      </p>
    </div>
  </div>
);

const NFTDetails = () => {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_PRODUCTION === "true"
      ? process.env.NEXT_PUBLIC_BASE_URL
      : "http://localhost:5000";
  const { isLoadingNFT, buyNft, rentNFT, userOf } =
    useContext(NFTContext);
  const [currency, setCurrency] = useState("MATIC");
  const currentAccount = useConnectionStatus() === 'connected' ? useAddress().toLowerCase() : "";

  const [nft, setNft] = useState({
    description: "",
    id: "",
    name: "",
    price: "",
    rentPrice: "",
    forSale: "",
    forRent: "",
    owner: "",
    isWETH: "",
    rented: "",
    sold: "",
    tokenId: "",
    tokenURI: "",
    avatar:""
  });
  const router = useRouter();
  const [paymentModal, setPaymentModal] = useState(false);
  const [rentPaymentModal, setRentPaymentModal] = useState(false);
  const [buySuccessModal, setBuySuccessModal] = useState(false);
  const [rentSuccessModal, setRentSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rentalPeriod, setRentalPeriod] = useState(0);
  const [user, setUser] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    setNft(router.query);
    setIsLoading(false);
  }, [router.isReady]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const address = await userOf(nft.tokenId);
        setUser(address);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    if (nft.isWETH === 'true' || nft.isWETH === true) {
      setCurrency("WETH");
    }
    if (nft && nft.tokenId) {
      fetchUser();
    }
  }, [nft, nft.tokenId, userOf]);

  const fetchNftOwnerDetails = async (address) =>{
    try {
      const res = await axios.get(`${API_BASE_URL}/api/address/vendorinfo/${address}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }

  useEffect(() => {
    if (nft.owner) {
      fetchNftOwnerDetails(nft.owner.toLowerCase()).then((res) => {
        console.log(res);
        if(res && res.avatarurl){
          setNft({...nft, avatar: res.avatarurl})
        }
      });
    }
  }, [nft.owner])

  const buyCheckout = async () => {
    try {
      await buyNft(nft);
      await axios.put(`${API_BASE_URL}/api/assets/${nft.id}`, {
        sold: true,
        isForSale: false,
        isForRent: false,
        isWETH: false,
        price: null,
        rentPrice: null,
        owner: window.localStorage.getItem("vendor"),
      });
      const asset = await axios.get(`${API_BASE_URL}/api/assets/${nft.id}`);
      const vendorId = window.localStorage.getItem("vendor");
      await axios.post(`${API_BASE_URL}/api/transaction`, {
        assetId: asset.data._id,
        vendorId,
        transactionType: "Buy",
      });
      setPaymentModal(false);
      setBuySuccessModal(true);
    } catch (error) {
      console.error("Error buying NFT:", error);
    }
  };

  const rentCheckout = async (rentalPeriodInDays) => {
    try {
      await rentNFT(nft, rentalPeriodInDays);
      await axios.put(`${API_BASE_URL}/api/assets/${nft.id}`, {
        rented: true,
        rentStart: Math.floor(Date.now() / 1000),
        rentEnd:
          Math.floor(Date.now() / 1000) + rentalPeriodInDays * 24 * 60 * 60,
        renter: window.localStorage.getItem("vendor"),
      });
      const asset = await axios.get(`${API_BASE_URL}/api/assets/${nft.id}`);
      const vendorId = window.localStorage.getItem("vendor");
      await axios.post(`${API_BASE_URL}/api/transaction`, {
        assetId: asset.data._id,
        vendorId,
        transactionType: "Rent",
      });
      setRentPaymentModal(false);
      setRentSuccessModal(true);
    } catch (error) {
      console.error("Error renting NFT:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative flex justify-center md:flex-col mb-10 pb-20">
      <div className="relative flex-1 flexCenter sm:px-0 p-0 border-r md:border-r-0 md:border-b dark:border-nft-black-1 border-nft-gray-1 ">
        <div className="relative  h- minmd:w-2/3 sm:w-full sm:h-300 h-100">
          <div className="cardtext-gray-300 w-[clamp(400px,80%,10px)] hover:brightness-90 transition-all group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-2 border-gray-900 m-4 rounded-lg overflow-hidden relative">
            <div className="px-8 py-8 mr-10 pr-20">
              <div className="bg-pink-500 w-10 h-10 rounded-full rounded-tl-none mb-4 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-pink-900 transition-all"></div>
              <div className="uppercase font-bold text-xl">{nft.name}</div>
              <div className="text-gray-300 uppercase tracking-widest">
                {nft.id}
              </div>
              <div className="text-gray-400 mt-8">
                <p className="font-bold">{nft.price}</p>
                <p>Perfect everywhere</p>
              </div>
            </div>
            <div className="h-2 w-full bg-gradient-to-l via-pink-500 group-hover:blur-xl blur-2xl m-auto rounded transition-all absolute bottom-0"></div>
            <div className="h-0.5 group-hover:w-full bg-gradient-to-l  via-yellow-950 group-hover:via-pink-500 w-[70%] m-auto rounded transition-all"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 justify-start sm:px-4 p-12 sm:pb-4">
        <div className="flex flex-row sm:flex-col">
          <h2 className="font-poppins dark:text-white text-nft-black-1 font-semibold text-2xl minlg:text-3xl">
            {nft.name}
          </h2>
        </div>
        <div className="mt-10 flex flex-col">
          <div className="w-full border-b dark:border-nft-black-1 border-nft-gray-1 flex flex-row">
            <p className="font-poppins dark:text-white text-nft-black-1 text-base minlg:text-base font-medium mb-2">
              Details{" "}
            </p>
          </div>
          <div className="mt-3">
            <p className="font-poppins dark:text-white text-nft-black-1 text-base font-normal">
              {nft.description}
            </p>
          </div>
        </div>
        <div className="mt-10 ">
          <p className="font-poppins dark:text-white text-nft-black-1 text-xs minlg:text-base font-normal ">
            Owner
          </p>
          <div className="flex flex-row items-center mt-3">
            <div className="relative w-12 h-12 minlg:w-20 minlg:h-20 mr-2">
              <img
                src={nft.avatar ? nft.avatar : "https://vendorsprofile.s3.amazonaws.com/creator1.png"}
                className="rounded-full"
              />
            </div>
            <p className="font-poppins dark:text-white text-nft-black-1 text-xs minlg:text-base font-semibold ">
              {nft.owner}
            </p>
          </div>
        </div>
        <div className="mt-10 flex pr-32">
          {/* For Rent Section */}
          <div className="mr-14">
            <p className="font-poppins dark:text-white text-nft-black-1 text-xs minlg:text-base font-normal">
              For Rent
            </p>
            {nft.forRent == "true" ? (
              <div className="flex flex-row sm:flex-col mt-5 ">
                {currentAccount === nft.owner.toLowerCase() ? (
                  <p className="font-mono dark:text-white text-nft-black-1 text-xs border border-gray p-2">
                    You Cannot rent Your Own NFT
                  </p>
                ) : (
                  <Button
                    btnName={`Rent for ${nft.rentPrice} ${currency}`}
                    classStyles="mr-5 sm:mr-0 rounded-xl"
                    handleClick={() => setRentPaymentModal(true)}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-row sm:flex-col mt-5 ">
                {currentAccount === user.toLowerCase() ? (
                  <p className="font-mono dark:text-white text-nft-black-1 text-s border border-gray p-2">
                    You Have rented this Asset
                  </p>
                ) : (
                  <p className="font-mono dark:text-white text-nft-black-1 text-s border border-gray p-2">
                    Not available for Renting
                  </p>
                )}
              </div>
            )}
          </div>
          <div>
            <p className="font-poppins dark:text-white text-nft-black-1 text-xs minlg:text-base font-normal">
              For Sale
            </p>
            {nft.forSale == "true" ? (
              <div className="flex flex-row sm:flex-col mt-5 ">
                {currentAccount === nft.owner.toLowerCase() ? (
                  <p className="font-mono dark:text-white text-nft-black-1 text-sm border border-gray p-2">
                    You Cannot Buy Your Own Asset
                  </p>
                ) : (
                  <Button
                    btnName={`Buy for ${nft.price} ${currency}`}
                    classStyles="mr-5 sm:mr-0 rounded-xl"
                    handleClick={() => setPaymentModal(true)}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-row sm:flex-col mt-5 text-s">
                {currentAccount === nft.owner.toLowerCase() ? (
                  <Button
                    btnName="List on MarketPlace"
                    classStyles="mr-5 sm:mr-0 sm:mb-5 rounded-xl"
                    handleClick={() =>
                      router.push(
                        `/resell-nft?tokenId=${nft.tokenId}&tokenURI=${nft.tokenURI}`
                      )
                    }
                  />
                ) : (
                  <p className="font-mono dark:text-white text-nft-black-1 text-sm border border-gray p-2">
                    Not available for Selling
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {paymentModal && (
        <Modal
          header="Check Out"
          body={<PaymentBodyCmp nft={nft} nftCurrency={currency} />}
          footer={
            <div className="flex flex-row sm:flex-col">
              <Button
                btnName="Checkout"
                classStyles="mr-5 sm:mr-0 sm:mb-5 rounded-xl"
                handleClick={buyCheckout}
              />
              <Button
                btnName="Cancel"
                classStyles="mr-5 sm:mr-0 rounded-xl"
                handleClick={() => setPaymentModal(false)}
              />
            </div>
          }
          handleClose={() => setPaymentModal(false)}
        />
      )}
      {rentPaymentModal && (
        <Modal
          header="Rent asset on day basis"
          body={
            <RentBobyCmp
              nft={nft}
              nftCurrency={currency}
              rentalPeriod={rentalPeriod}
              setRentalPeriod={setRentalPeriod}
            />
          }
          footer={
            <div className="flex flex-row sm:flex-col">
              <Button
                btnName="Checkout"
                classStyles="mr-5 sm:mr-0 sm:mb-5 rounded-xl"
                handleClick={() => rentCheckout(rentalPeriod)}
              />
              <Button
                btnName="Cancel"
                classStyles="mr-5 sm:mr-0 rounded-xl"
                handleClick={() => setRentPaymentModal(false)}
              />
            </div>
          }
          handleClose={() => setRentPaymentModal(false)}
        />
      )}
      {isLoadingNFT && (
        <Modal
          header="Buying NFT..."
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
      {buySuccessModal && (
        <Modal
          header="Payment Successfull"
          body={
            <div className="flexCenter flex-col text-center">
              <div className="relative w-87 h- minmd:w-2/3 sm:w-full sm:h-300 h-100">
                <div className="card text-gray-300 w-[clamp(260px,80%,300px)] hover:brightness-90 transition-all group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-2 border-gray-900 m-4 rounded-lg overflow-hidden relative">
                  <div className="px-8 py-10">
                    <div className="bg-pink-500 w-10 h-10 rounded-full rounded-tl-none mb-4 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-pink-900 transition-all"></div>
                    <div className="uppercase font-bold text-xl">
                      {nft.name}
                    </div>
                    <div className="text-gray-300 uppercase tracking-widest">
                      {nft.id}
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
                You successfully purchased{" "}
                <span className="font-semibold">{nft.name}</span> from{" "}
                <span className="font-semibold">
                  {shortenAddress(nft.owner)}
                </span>
                .
              </p>
            </div>
          }
          footer={
            <div className="flexCenter flex-col">
              <Button
                btnName="Check it out"
                classStyles="sm:mr-0 sm:mb-5 rounded-xl"
                handleClick={() => router.push("/my-nfts")}
              />
            </div>
          }
          handleClose={() => setBuySuccessModal(false)}
        />
      )}
      {isLoadingNFT && (
        <Modal
          header="Renting NFT..."
          body={
            <div className="flexCenter flex-col text-center">
              <div className="relative w-52 h-52">
                <Loader />
              </div>
            </div>
          }
          handleClose={() => setRentPaymentModal(false)}
        />
      )}
      {rentSuccessModal && (
        <Modal
          header="Renting Successfull"
          body={
            <div className="flexCenter flex-col text-center">
              <div className="relative w-87 h- minmd:w-2/3 sm:w-full sm:h-300 h-100">
                <div className="card text-gray-300 w-[clamp(260px,80%,300px)] hover:brightness-90 transition-all group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-2 border-gray-900 m-4 rounded-lg overflow-hidden relative">
                  <div className="px-8 py-10">
                    <div className="bg-pink-500 w-10 h-10 rounded-full rounded-tl-none mb-4 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-pink-900 transition-all"></div>
                    <div className="uppercase font-bold text-xl">
                      {nft.name}
                    </div>
                    <div className="text-gray-300 uppercase tracking-widest">
                      {nft.id}
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
                You successfully rented{" "}
                <span className="font-semibold">{nft.name}</span> from{" "}
                <span className="font-semibold">
                  {shortenAddress(nft.owner)}
                </span>
                .
              </p>
            </div>
          }
          footer={
            <div className="flexCenter flex-col">
              <Button
                btnName="Check it out"
                classStyles="sm:mr-0 sm:mb-5 rounded-xl"
                handleClick={() => router.push("/my-nfts")}
              />
            </div>
          }
          handleClose={() => setRentSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default NFTDetails;

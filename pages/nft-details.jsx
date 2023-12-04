import { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { NFTContext } from '../context/NFTContext';
import { Loader, Button, Modal } from '../components';

import images from '../assets';
import { shortenAddress } from '../utils/shortenAddress';

const PaymentBodyCmp = ({ nft, nftCurrency }) => (
  <div className="flex flex-col">
    <div className="flexBetween">
      <p className="font-poppins dark:text-white text-nft-black-1 minlg:text-xl text-base font-semibold ">
        Items
      </p>
      <p className="font-poppins dark:text-white text-nft-black-1 minlg:text-xl text-base font-semibold ">
        Subtotal
      </p>
    </div>
    <div className='flex justify-between'>
      <div>
        <div className="uppercase font-bold text-xl mt-5">
          {nft.name}
        </div>
        <div className="text-gray-300 uppercase tracking-widest">
          {nft.id}
        </div>
      </div>
      <div className="pt-5">
        {nft.price / 1e18} {nftCurrency}
      </div>
    </div>
    <div className="flexBetween mt-10">
      <p className="font-poppins dark:text-white text-nft-black-1 font-normal  text-base minlg:text-xl">
        Total
      </p>
      <p className="font-poppins dark:text-white text-nft-black-1 font-normal  text-sm minlg:text-xl">
        {nft.price / 1e18} <span className="font-semibold">{nftCurrency}</span>
     </p>
    </div>
  </div>
);

const NFTDetails = () => {
  const { isLoadingNFT, currentAccount, nftCurrency, buyNft } = useContext(NFTContext);
  const [nft, setNft] = useState({
    tokenId: '',
    name: '',
    owner: '',
    price: '',
    seller: '',
    forRent: '',
    forSale: '',
    tokenURI: '',
  });
  const router = useRouter();
  const [paymentModal, setPaymentModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    setNft(router.query);
    setIsLoading(false);
  }, [router.isReady]);

  const checkout = async () => {
    await buyNft(nft);

    setPaymentModal(false);
    setSuccessModal(true);
  };

  if (isLoading) {
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative flex justify-center md:flex-col min-h-screen ">
      <div className="relative flex-1 flexCenter sm:px-4 p-12 border-r md:border-r-0 md:border-b dark:border-nft-black-1 border-nft-gray-1 ">
        <div className="relative w-700 h- minmd:w-2/3 sm:w-full sm:h-300 h-557">
           <div className="card m-auto text-gray-300 w-[clamp(260px,80%,300px)] hover:brightness-90 transition-all group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-2 border-gray-900 m-4 rounded-lg overflow-hidden relative">
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
              Details{' '}
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
            Creator
          </p>
          <div className="flex flex-row items-center mt-3">
            <div className="relative w-12 h-12 minlg:w-20 minlg:h-20 mr-2">
              <Image
                src={images.creator1}
                className="rounded-full"
                objectFit="cover"
              />
            </div>
            <p className="font-poppins dark:text-white text-nft-black-1 text-xs minlg:text-base font-semibold ">
              {/* {shortenAddress(nft.seller)} */}
              {nft.seller}
            </p>
          </div>
        </div>
        <div className="mt-10 flex pr-32">
          {/* For Rent Section */}
          <div className="mr-14">
            <p className="font-poppins dark:text-white text-nft-black-1 text-xs minlg:text-base font-normal">
              For Rent
            </p>
            {nft.forRent == 'true' ? (
              <div className="flex flex-row sm:flex-col mt-5 ">
                {currentAccount === nft.seller.toLowerCase() ? (
                  <p className="font-mono dark:text-white text-nft-black-1 text-xs border border-gray p-2">
                    You Cannot rent Your Own NFT
                  </p>
                ) : currentAccount === nft.owner.toLowerCase() ? (
                  <Button
                    btnName="List on MarketPlace"
                    classStyles="mr-5 sm:mr-0 sm:mb-5 rounded-xl"
                    handleClick={() => router.push(`/resell-nft?tokenId=${nft.tokenId}&tokenURI=${nft.tokenURI}`)}
                  />
                ) : (
                  <Button
                    btnName={`Rent for ${nft.rentPrice / 1e18} ${nftCurrency}`}
                    classStyles="mr-5 sm:mr-0 rounded-xl"
                    handleClick={() => setPaymentModal(true)}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-row sm:flex-col mt-5 ">
                <p className="font-mono dark:text-white text-nft-black-1 text-sm border border-gray p-2">
                  Not available for Renting
                </p>
              </div>
            )}
          </div>
          <div>
            <p className="font-poppins dark:text-white text-nft-black-1 text-xs minlg:text-base font-normal">
              For Sale
            </p>
            {nft.forSale == 'true' ? (
              <div className="flex flex-row sm:flex-col mt-5 ">
                {currentAccount === nft.seller.toLowerCase() ? (
                  <p className="font-mono dark:text-white text-nft-black-1 text-sm border border-gray p-2">
                    You Cannot Buy Your Own NFT
                  </p>
                ) : currentAccount === nft.owner.toLowerCase() ? (
                  <Button
                    btnName="List on MarketPlace"
                    classStyles="mr-5 sm:mr-0 sm:mb-5 rounded-xl"
                    handleClick={() => router.push(`/resell-nft?tokenId=${nft.tokenId}&tokenURI=${nft.tokenURI}`)}
                  />
                ) : (
                  <Button
                    btnName={`Buy for ${nft.price / 1e18} ${nftCurrency}`}
                    classStyles="mr-5 sm:mr-0 rounded-xl"
                    handleClick={() => setPaymentModal(true)}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-row sm:flex-col mt-5 ">
                <p className="font-mono dark:text-white text-nft-black-1 text-sm border border-gray p-2">
                  Not available for Selling
                </p>
              </div>
            )}
          </div>
        </div>        
        
      </div>
      {paymentModal && (
        <Modal
          header="Check Out"
          body={<PaymentBodyCmp nft={nft} nftCurrency={nftCurrency} />}
          footer={(
            <div className="flex flex-row sm:flex-col">
              <Button
                btnName="Checkout"
                classStyles="mr-5 sm:mr-0 sm:mb-5 rounded-xl"
                handleClick={checkout}
              />
              <Button
                btnName="Cancel"
                classStyles="mr-5 sm:mr-0 rounded-xl"
                handleClick={() => setPaymentModal(false)}
              />
            </div>
          )}
          handleClose={() => setPaymentModal(false)}
        />
      )}
      {isLoadingNFT && (
        <Modal
          header="Buying NFT..."
          body={(
            <div className="flexCenter flex-col text-center">
              <div className="relative w-52 h-52">
                <Loader />
              </div>
            </div>
          )}
          handleClose={() => setPaymentModal(false)}
        />
      )}
      {successModal && (
        <Modal
          header="Payment Successfull"
          body={(
            <div
              className="flexCenter flex-col text-center"
              onClick={() => setSuccessModal(false)}
            >
              <div className="relative w-52 h-52">
                <Image
                  src={nft.image || images[`nft${nft.i}`]}
                  objectFit="cover"
                  layout="fill"
                />
              </div>
              <p className="font-poppins dark:text-white text-nft-black-1 text-sm minlg:text-xl font-normal mt-10">
                {' '}
                You successfully purchased{' '}
                <span className="font-semibold">{nft.name}</span> from{' '}
                <span className="font-semibold">
                  {shortenAddress(nft.seller)}
                </span>
                .
              </p>
            </div>
          )}
          footer={(
            <div className="flexCenter flex-col">
              <Button
                btnName="Check it out"
                classStyles="sm:mr-0 sm:mb-5 rounded-xl"
                handleClick={() => router.push('/my-nfts')}
              />
            </div>
          )}
          handleClose={() => setSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default NFTDetails;

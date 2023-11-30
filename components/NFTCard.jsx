// import { useContext } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { NFTContext } from '../context/NFTContext';

// import images from '../assets';
// // import { shortenAddress } from '../utils/shortenAddress';

// const NFTCard = ({ nft, onProfilePage }) => {
//   const { nftCurrency } = useContext(NFTContext);
//   return (
//     <Link href={{ pathname: '/nft-details', query: nft }}>

//       <div className="flex-1 min-w-215 max-w-max xs:max-w-none sm:w-full sm:min-w-155 minmd:min-w-256 minlg:min-w-327 dark:bg-nft-black-3 bg-white rounded-2xl p-4 m-4 minlg:m-8 sm:my-2 sm:mx-2 cursor-pointer shadow-md">
//         <div className="relative w-full h-52 sm:h-36 minmd:h-60 minlg:h-300 rounded-2xl overflow-hidden">
//           {/* <Image
//             src={nft.image || images[`nft${nft.i}`]}
//             layout="fill"
//             objectFit="cover"
//             alt={`nft-${nft.i}`}
//           /> */}
//           <h1>{nft.name}</h1>
//         </div>
//         <div className="mt-3 flex flex-col ">
//           <p className="font-poppins ...">{nft.name}</p>
//             {/* Display additional information */}
//             <p className="font-poppins ...">ID: {nft.id}</p>
//             {nft.forSale && (
//               <p className="font-poppins ...">Price: {nft.price} {nftCurrency}</p>
//             )}
//             {nft.forRent && (
//               <p className="font-poppins ...">Rent Price: {nft.rentPrice} {nftCurrency}</p>
//             )}
//             {/* View More Button */}
//             <button className="mt-2 ...">View More</button>
//         </div>
//       </div>

//     </Link>
//   );
// };

// export default NFTCard;

import React, { useContext } from 'react';
import Link from 'next/link';
import { NFTContext } from '../context/NFTContext';

const NFTCard = ({ nft, onProfilePage }) => {
  const { nftCurrency } = useContext(NFTContext);
  return (
    <Link href={{ pathname: '/nft-details', query: nft }}>

      <div className="w-[11.875em] h-[15.875em] p-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg transition-all duration-300 ease-in-out hover:shadow-[0_0_20px_1px_#ffbb763f] hover:border-opacity-45">
        <h1 className="text-2xl font-semibold tracking-wide">{nft.name}</h1>
        <div>
          <div>
            <p>ID: {nft.id}</p>
            {/* {nft.forSale && (
              <p>Price: {nft.price} {nftCurrency}</p>
            )} */}
            {/* {nft.forRent && (
              <p>Rent Price: {nft.rentPrice} {nftCurrency}</p>
            )} */}
            {/* <button>View More</button> */}
          </div>
        </div>
      </div>

    </Link>
  );
};

export default NFTCard;

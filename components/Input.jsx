import { useContext } from 'react';
import { NFTContext } from '../context/NFTContext';

const Input = ({ inputType,
  title,
  placeHolder,
  handleClick }) => {
  const { nftCurrency } = useContext(NFTContext);
  return (
    <div className="mt-10 w-full">
      <p className="flex-1 font-poppins dark:text-white text-nft-black-1 font-semibold text-xl">{title}</p>
      {inputType === 'number' ? (
        <div className="dark:bg-nft-black-1 bg-white border dark:border-nft-black-1 border-nft-gray-2 rounded-lg w-full outline-none font-poppins dark:text-white text-nft-gray-2 text-base px-4 py-2 mt-4 flexBetween flex-row">
          <input
            type="number"
            className="flex w-full dark:bg-nft-black-1 bg-white outline-none"
            placeholder={placeHolder}
            onChange={handleClick}
          />
          <p className="flex-1 font-poppins dark:text-white text-nft-black-1 font-semibold text-xl">{nftCurrency}</p>
        </div>
      ) : inputType === 'textarea' ? (
        <textarea
          rows="10"
          className="dark:bg-nft-black-1 bg-white border dark:border-nft-black-1 border-nft-gray-2 rounded-lg w-full outline-none font-poppins dark:text-white text-nft-gray-2 text-base px-4 py-2 mt-4"
          placeholder={placeHolder}
          onChange={handleClick}
        />
      ) : (
        <input
          type={inputType}
          className="dark:bg-nft-black-1 bg-white border dark:border-nft-black-1 border-nft-gray-2 rounded-lg w-full outline-none font-poppins dark:text-white text-nft-gray-2 text-base px-4 py-2 mt-4"
          placeholder={placeHolder}
          onChange={handleClick}
        />
      )}

    </div>
  );
};

export default Input;

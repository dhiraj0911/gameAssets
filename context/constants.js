import rentableMarketPlace from './RentableNFTMarketplace.json';
import wethABI from './WETH.json';

export const MarketAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const MarketAddressABI = rentableMarketPlace.abi;

export const WETHAddress = process.env.NEXT_PUBLIC_WETH_ADDRESS;
export const WETHAddressABI = wethABI.abi;
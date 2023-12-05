import React, { useState, useEffect, useRef } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';

import axios from 'axios';
import { create as ipfsHttpClient } from 'ipfs-http-client';

import { MarketAddress, MarketAddressABI } from './constants';

export const NFTContext = React.createContext();
const fetchContract = (signerORProvider) => new ethers.Contract(MarketAddress, MarketAddressABI, signerORProvider);

export const NFTProvider = ({ children }) => {
  const auth = useRef('');
  const client = useRef({});
  const [currentAccount, setCurrentAccount] = useState('');
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);
  const nftCurrency = 'ETH';

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return alert('Please install Metamask wallet');
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length) {
      setCurrentAccount(accounts[0]);
    } else {
      console.log('No accounts found');
    }
  };
  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install Metamask wallet');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setCurrentAccount(accounts[0]);
    window.location.reload();
  };

  const uploadToIPFS = async (file) => {
    const subdomain = 'https://cryptoketnft.infura-ipfs.io';
    try {
      const added = await client.current.add({ content: file });
      const URL = `${subdomain}/ipfs/${added.path}`;
      return URL;
    } catch (error) {
      console.log('Error uploading file to IPFS.', error);
    }
  };
  const fetchAuth = async () => {
    const response = await fetch('/api/secure');
    const data = await response.json();
    return data;
  };
  const getClient = (author) => {
    const responseClient = ipfsHttpClient({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      apiPath: '/api/v0',
      headers: {
        authorization: author,
      },
    });
    return responseClient;
  };


  const CreateNFT = async (formInput, fileUrl, router) => {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    const data = JSON.stringify({ name, description, image: fileUrl });
    try {
      const added = await client.current.add(data);
      const subdomain = 'https://cryptoketnft.infura-ipfs.io';
      const URL = `${subdomain}/ipfs/${added.path}`;
      await createSale(URL, price);
      router.push('/');
    } catch (error) {
      console.log('Error uploading file to IPFS', error);
    }
  };


  const fetchMyNFTsOrListedNFTs = async (type) => {
    setIsLoadingNFT(false);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);

    const data = type === 'fetchItemsListed'
      ? await contract.fetchItemsListed()
      : await contract.fetchMyNFTs();

    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformmattedPrice }) => {
      const tokenURI = await contract.tokenURI(tokenId);
      const { data: { image, name, description } } = await axios.get(`https://ipfs.io/ipfs/${tokenURI}`);
      const price = ethers.utils.formatUnits(unformmattedPrice.toString(), 'ether');

      return {
        price,
        tokenId: tokenId.toNumber(),
        seller,
        owner,
        image,
        name,
        description,
        tokenURI,
      };
    }));

    return items;
  };

  const createSale = async (url, forminputPrice, forminputRentPrice, forSale, forRent, member) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const priceInWei = ethers.utils.parseUnits(forminputPrice, 'ether');
    const rentPriceInWei = ethers.utils.parseUnits(forminputRentPrice, 'ether');

    const listingPrice = ethers.utils.parseUnits('0.01', 'ether');
    const transaction = await contract.createToken( url, priceInWei, rentPriceInWei, forSale, forRent, member, { value: listingPrice.toString() })
    //   : await contract.resellToken(id, price, { value: listingPrice.toString() });
    setIsLoadingNFT(true);
    await transaction.wait();
};

const buyNft = async (nft) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(MarketAddress, MarketAddressABI, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
    console.log(nft);
    const transaction = await contract.createMarketSale(nft.tokenId, { value: price });
    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
};

const rentNFT = async (nft, rentalPeriodInDays) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(MarketAddress, MarketAddressABI, signer);

    const totalRentPrice = nft.rentPrice * rentalPeriodInDays;
    // Assuming rentalPeriodInDays is the number of days the user wants to rent the NFT
    const rentPrice = ethers.utils.parseUnits(totalRentPrice.toString(), 'ether');
    // Calculate the expiry time as the current time plus the rental period in seconds
    const expiry = Math.floor(Date.now() / 1000) + rentalPeriodInDays * 24 * 60 * 60;

    // Send the transaction with the value to rent the NFT
    const transaction = await contract.rentOutToken(
        nft.tokenId, // The ID of the token to rent
        expiry, // The expiration time of the rental
        { value: rentPrice } // The rental price to pay
    );

    await transaction.wait(); // Wait for the transaction to be confirmed
    console.log(`NFT with tokenId ${nft.tokenId} rented successfully! to ${signer.address}`);
};

const fetchNFTs = async () => {
  console.log("fetching nfts");
  setIsLoadingNFT(false);
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  const signer = provider.getSigner();
  const contract = fetchContract(signer);

  const data = await contract.fetchMarketItems();

  const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformmattedPrice, rentPrice: unformmattedRentPrice , forRent, forSale, sold }) => {
    const tokenURI = await contract.tokenURI(tokenId);
    const { data: { name, id, description } } = await axios.get(`https://ipfs.io/ipfs/${tokenURI}`);
    const price = ethers.utils.formatUnits(unformmattedPrice.toString(), 'ether');
    const rentPrice = ethers.utils.formatUnits(unformmattedRentPrice.toString(), 'ether');

    return {  
      price,
      rentPrice,
      forRent,
      forSale,
      tokenId: tokenId.toNumber(),
      seller,
      owner,
      name,
      id,
      description,
      tokenURI,
    };
  }));
  return items;
};

const fetchMyNFTs = async () => {
  setIsLoadingNFT(false);
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const contract = fetchContract(signer);

  const data = await contract.fetchMyNFTs();

  const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price, rentPrice, forRent, forSale, sold: unformmattedPrice }) => {
    const tokenURI = await contract.tokenURI(tokenId);
    const { data: { name, id, description } } = await axios.get(tokenURI);
    // const price = ethers.utils.formatUnits(unformmattedPrice.toString(), 'ether');

    return {
      price,
      rentPrice,
      forRent,
      forSale,
      tokenId: tokenId.toNumber(),
      seller,
      owner,
      name,
      id,
      description,
      tokenURI,
    };
  }));

  return items;
};

  useEffect(async () => {
    checkIfWalletIsConnected();
    const { data } = await fetchAuth();
    auth.current = data;
    client.current = getClient(auth.current);
  }, []);

  return (
    <NFTContext.Provider value={{ nftCurrency, connectWallet, currentAccount, uploadToIPFS, CreateNFT, fetchNFTs, fetchMyNFTsOrListedNFTs, buyNft, createSale, rentNFT, fetchMyNFTs, isLoadingNFT }}>
      {children}
    </NFTContext.Provider>
  );
};

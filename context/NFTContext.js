import React, { useState, useEffect, useRef } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';

import { MarketAddress, MarketAddressABI } from './constants';

export const NFTContext = React.createContext();
const fetchContract = (signerORProvider) => new ethers.Contract(MarketAddress, MarketAddressABI, signerORProvider);

export const NFTProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);
  const nftCurrency = 'ETH';

  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    const jwt = window.localStorage.getItem('token');
    if (jwt) {
      setIsSigned(true);
    } else {
      setIsSigned(false);
    }
  }, []);

  const signIn = async (email, password) => {
    try {
      const response = await axios.post('ec2-3-82-136-125.compute-1.amazonaws.com/api/vendor/signin', {
        email,
        password,
      });
      window.localStorage.setItem('objectId', response.data.vendorId);

      if (response.status === 200) {
        const token = window.localStorage.setItem('token', response.data.token);
        if (token) {
          setIsSigned(true);
        } else {
          setIsSigned(false);
        }
        window.location.href = '/';
      } else {
        console.log('Authentication failed');
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  const signUp = async (email, password, name, ethAddress) => {
    try {
      const response = await axios.post('ec2-3-82-136-125.compute-1.amazonaws.com/api/vendor/signup', {
        email,
        password,
        name,
        ethAddress,
      });

      if (response.status) {
        window.location.href = '/';
      } else {
        console.log('Authentication failed');
      }
    } catch (error) {
      console.error('Error during sign-up:', error);
    }
  }

  const signOut = async () => {
    window.localStorage.clear();
    window.location.href = '/';
  }

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
  
  const userOf = async (id) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const user = await contract.userOf(id);
    return user;
  }

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
      const { data: { image, name, description } } = await axios.get(`https://gateway.pinata.cloud/ipfs/${tokenURI}`);
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
    const transaction = await contract.createToken(url, priceInWei, rentPriceInWei, forSale, forRent, member, { value: listingPrice.toString() })
    setIsLoadingNFT(true);
    await transaction.wait();
  };

  const reSale = async (tokenId, forminputPrice, forminputRentPrice, forRent, forSale, member) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const priceInWei = ethers.utils.parseUnits(forminputPrice, 'ether');
    const rentPriceInWei = ethers.utils.parseUnits(forminputRentPrice, 'ether');

    const listingPrice = ethers.utils.parseUnits('0.01', 'ether');
    const transaction = await contract.resellToken(tokenId, priceInWei, rentPriceInWei, forRent, forSale, member, { value: listingPrice.toString() });
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
    const rentPrice = ethers.utils.parseUnits(totalRentPrice.toString(), 'ether');
    // const expiry = Math.floor(Date.now() / 1000) + rentalPeriodInDays * 24 * 60 * 60;
    //for 2 minute
    const expiry = Math.floor(Date.now() / 1000) + 60;

    // Send the transaction with the value to rent the NFT
    const transaction = await contract.rentOutToken(
      nft.tokenId,
      expiry,
      { value: rentPrice }
    );

    await transaction.wait(); // Wait for the transaction to be confirmed
    console.log(`NFT with tokenId ${nft.tokenId} rented successfully! to ${signer.address}`);
  };

  const fetchNFTs = async () => {
    console.log("Fetching assets...");
    setIsLoadingNFT(false);
    const mumbaiRPC = 'https://rpc-mumbai.maticvigil.com';

    // Use provider directly for read-only operations
    const provider = new ethers.providers.JsonRpcProvider(mumbaiRPC);
    const contract = fetchContract(provider); // Use provider instead of signer

    const data = await contract.fetchMarketItems();
    console.log(data);
    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformmattedPrice, rentPrice: unformmattedRentPrice, forRent, forSale, sold, rented, expires }) => {
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
        sold,
        rented,
        expires
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
    var i = 0;
    console.log(data.length);
    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformmattedPrice, rentPrice: unformmattedRentPrice, forRent, forSale, sold, rented, expires }) => {
      console.log(tokenId)
      const tokenURI = await contract.tokenURI(tokenId);

      console.log(tokenURI, i++, tokenId._hex);
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
        sold,
        rented,
        expires
      };
    }));

    return items;
  };

  const fetchMyRentedNFT = async () => {
    setIsLoadingNFT(false);

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const data = await contract.fetchMyRentedNFTs();

    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformmattedPrice, rentPrice: unformmattedRentPrice, forRent, forSale, sold, rented, expires: unformmattedExpries }) => {
      const tokenURI = await contract.tokenURI(tokenId);
      const { data: { name, id, description } } = await axios.get(`https://ipfs.io/ipfs/${tokenURI}`);
      const price = ethers.utils.formatUnits(unformmattedPrice.toString(), 'ether');
      const rentPrice = ethers.utils.formatUnits(unformmattedRentPrice.toString(), 'ether');
      // expires in string
      const expires = new Date(unformmattedExpries * 1000).toLocaleString();

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
        sold,
        rented,
        expires
      };
    }));

    return items;
  };

  useEffect(async () => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <NFTContext.Provider value={{ nftCurrency, connectWallet, currentAccount, fetchNFTs, fetchMyNFTsOrListedNFTs, buyNft, createSale, rentNFT, fetchMyNFTs, fetchMyRentedNFT, userOf, reSale, signIn, signUp, isSigned, signOut, isLoadingNFT }}>
      {children}
    </NFTContext.Provider>
  );
};

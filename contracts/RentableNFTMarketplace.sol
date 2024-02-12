// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ERC4907.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IWETH {
    function transferFrom(address sender, address recipient, uint amount) external returns (bool);
}

contract RentableNFTMarketplace is
    ERC4907,
    KeeperCompatibleInterface
{
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIds;
    Counters.Counter public _itemsSold;
    Counters.Counter public _itemsRented;
    mapping(uint256 => string) public tokenURIs;

    uint256 listingPrice = 0.01 ether;
    address payable public owner;
    address public WETH_ADDRESS;

    mapping(uint256 => MarketItem) public idToMarketItem;
    mapping(uint256 => RentedItem) public idToRentedItem;

    uint256[] public rentedTokenIds;
    IERC20 weth;

    struct MarketItem {
        uint256 tokenId;
        address payable owner;
        bool isWETH;
        uint256 price;
        uint256 rentPrice;
        bool forRent;
        bool forSale;
        bool sold;
        bool rented;
    }

    struct RentedItem {
        uint256 tokenId;
        address renter;
        uint64 expires;
    }

    struct FullRentedItem {
        uint256 tokenId;
        address payable owner;
        bool isWETH;
        uint256 price;
        uint256 rentPrice;
        bool forRent;
        bool forSale;
        bool sold;
        bool rented;
        address renter;
        uint64 expires;
    }

    event MarketItemCreated(
        uint256 indexed tokenId,
        address owner,
        bool isWETH,
        uint256 price,
        uint256 rentPrice,
        bool forRent,
        bool forSale,
        bool sold,
        bool rented
    );

    modifier onlyContractOwner() {
        require(owner == msg.sender, "Only contract owner can perform this action");
        _;
    }

    constructor(address _wethAddress) ERC4907("Rentable", "RT") {
        owner = payable(msg.sender);
        WETH_ADDRESS = _wethAddress;
        weth = IERC20(WETH_ADDRESS);
    }

    function updateListingPrice(uint _listingPrice) public onlyContractOwner {
        listingPrice = _listingPrice;
    }

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function createToken(
        string memory _tokenURI,
        bool isWETH,
        uint256 price,
        uint256 rentPrice,
        bool forSale,
        bool forRent
    ) public payable {
        require(msg.value == listingPrice, "Price must be equal to listing price");
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);
        tokenURIs[newTokenId] = _tokenURI;
        createMarketItem(newTokenId, isWETH, price, rentPrice, forSale, forRent);
    }

    function createMarketItem(
        uint256 tokenId,
        bool isWETH,
        uint256 price,
        uint256 rentPrice,
        bool forSale,
        bool forRent
    ) private {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can list the token");
        require(!forSale || price > 0, "price required");
        require(!forRent || rentPrice > 0, "rent price required");

        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            isWETH,
            price,
            rentPrice,
            forRent,
            forSale,
            false,
            false
        );
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            isWETH,
            price,
            rentPrice,
            forRent,
            forSale,
            false,
            false
        );
    }

    function resellToken(
        uint256 tokenId,
        bool isWETH,
        uint256 price,
        uint256 rentPrice,
        bool forRent,
        bool forSale
    ) public payable {
        require(idToMarketItem[tokenId].owner == msg.sender, "Only item owner can resell");
        require(msg.value == listingPrice, "Price must be equal to listing price");
        idToMarketItem[tokenId].isWETH = isWETH;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].rentPrice = rentPrice;
        idToMarketItem[tokenId].forRent = forRent;
        idToMarketItem[tokenId].forSale = forSale;
        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].rented = false;
        _itemsSold.decrement();
    }

    // function createMarketSale(uint256 tokenId) public payable {
    //     uint price = idToMarketItem[tokenId].price;
    //     address currOwner = idToMarketItem[tokenId].owner;
    //     require(msg.value == price, "Please pay the asking price in order to complete the purchase");
    //     idToMarketItem[tokenId].owner = payable(msg.sender);
    //     idToMarketItem[tokenId].sold = true;
    //     idToMarketItem[tokenId].forSale = false;
    //     idToMarketItem[tokenId].forRent = false;
    //     _itemsSold.increment();
    //     _transfer(currOwner, msg.sender, tokenId);
    //     payable(currOwner).transfer(msg.value);
    // }

    function createMarketSale(uint256 tokenId) public payable {
        address currOwner = idToMarketItem[tokenId].owner;
        MarketItem storage item = idToMarketItem[tokenId];
        uint price = item.price;

        require(item.forSale, "Item not for sale");
        require(item.isWETH ? msg.value == 0 : msg.value == price, "Incorrect payment");

        if(item.isWETH) {
            require(IWETH(WETH_ADDRESS).transferFrom(msg.sender, item.owner, price), "Failed to transfer WETH");
        } else {
            require(msg.value == price, "Please pay the asking price in MATIC to complete the purchase");
            payable(item.owner).transfer(msg.value);
        }

        item.owner = payable(msg.sender);
        item.sold = true;
        item.forSale = false;
        item.forRent = false;
        _itemsSold.increment();
        _transfer(currOwner, msg.sender, tokenId);
    }

    // function rentOutToken(uint256 _tokenId, uint64 _expires) public payable {
    //     require(idToMarketItem[_tokenId].forRent, "Token is not available for rent");
    //     require(userOf(_tokenId) == address(0), "Token is already rented");
    //     require(msg.value >= idToMarketItem[_tokenId].rentPrice, "Insufficient funds to rent the token");

    //     address currOwner = idToMarketItem[_tokenId].owner;

    //     idToMarketItem[_tokenId].rented = true;

    //     _itemsRented.increment();
    //     idToRentedItem[_tokenId] = RentedItem(_tokenId, msg.sender, _expires);
    //     rentedTokenIds.push(_tokenId);
    //     _setUser(_tokenId, msg.sender, _expires);
    //     payable(currOwner).transfer(msg.value);
    // }

    function rentOutToken(uint256 _tokenId, uint64 _expires) public payable {
        MarketItem storage item = idToMarketItem[_tokenId];
        
        require(item.forRent, "Token is not available for rent");
        require(userOf(_tokenId) == address(0), "Token is already rented");
        require(item.isWETH ? msg.value == 0 : msg.value >= item.rentPrice, "Incorrect payment method or amount");
        
        if(item.isWETH) {
            require(IWETH(WETH_ADDRESS).transferFrom(msg.sender, item.owner, item.rentPrice), "Failed to transfer WETH for rent");
        } else {
            require(msg.value >= item.rentPrice, "Insufficient funds to rent the token in MATIC");
            payable(item.owner).transfer(msg.value);
        }

        item.rented = true;
        _itemsRented.increment();
        idToRentedItem[_tokenId] = RentedItem(_tokenId, msg.sender, _expires);
        rentedTokenIds.push(_tokenId);
        _setUser(_tokenId, msg.sender, _expires);
    }


    // Chainlink Automation: Check if any rented NFT's rental period has expired
    function checkUpkeep(bytes calldata /*checkData*/)
        external
        override
        view
        returns (bool upkeepNeeded, bytes memory performData)
    {
        for (uint i = 0; i < rentedTokenIds.length; i++) {
            uint256 tokenId = rentedTokenIds[i];
            RentedItem storage item = idToRentedItem[tokenId];
            if (block.timestamp >= item.expires) {
                return (true, abi.encode(tokenId));
            }
        }
        return (false, "");
    }

    // Chainlink Automation: Perform the return of the NFT
    function performUpkeep(bytes calldata performData) external override {
        uint256 tokenId = abi.decode(performData, (uint256));
        RentedItem storage item = idToRentedItem[tokenId];
        if (block.timestamp >= item.expires) {
            _returnToken(tokenId);
        }
    }

    function _returnToken(uint256 _tokenId) private {
        MarketItem storage marketItem = idToMarketItem[_tokenId];
        marketItem.rented = false;
        _setUser(_tokenId, address(0), 0);

        for (uint i = 0; i < rentedTokenIds.length; i++) {
            if (rentedTokenIds[i] == _tokenId) {
                rentedTokenIds[i] = rentedTokenIds[rentedTokenIds.length - 1];
                rentedTokenIds.pop();
                break;
            }
        }
    }
    
    // Add a new function to return all available items for buy and rent
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].forSale || idToMarketItem[i + 1].forRent) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].forSale || idToMarketItem[i + 1].forRent) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // Add a new function to return all items owned by the user
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender && !idToMarketItem[i + 1].rented) {
                itemCount += 1;
            }
        }
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender && !idToMarketItem[i + 1].rented) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchMyRentedNFTs() public view returns (FullRentedItem[] memory) {
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint[] memory rentedItemIds = new uint[](totalItemCount);

        for (uint i = 0; i < totalItemCount; i++) {
            if (userOf(i + 1) == msg.sender && idToMarketItem[i + 1].rented) {
                rentedItemIds[itemCount] = i + 1;
                itemCount += 1;
            }
        }

        FullRentedItem[] memory items = new FullRentedItem[](itemCount);

        for (uint i = 0; i < itemCount; i++) {
            uint currentId = rentedItemIds[i];
            MarketItem storage marketItem = idToMarketItem[currentId];
            RentedItem storage rentedItem = idToRentedItem[currentId];
            items[i] = FullRentedItem(
                currentId,
                marketItem.owner,
                marketItem.isWETH,
                marketItem.price,
                marketItem.rentPrice,
                marketItem.forRent,
                marketItem.forSale,
                marketItem.sold,
                marketItem.rented,
                rentedItem.renter,
                rentedItem.expires
            );
        }
        return items;
    }

    // function updateRentPrice(uint256 _tokenId, uint256 rent_price) public {
    //     require(idToMarketItem[_tokenId].owner == msg.sender, "Only item owner can perform this operation");
    //     idToMarketItem[_tokenId].rentPrice = rent_price;
    // }

    // function updatePrice(uint256 _tokenId, uint256 price) public {
    //     require(idToMarketItem[_tokenId].owner == msg.sender, "Only item owner can perform this operation");
    //     idToMarketItem[_tokenId].price = price;
    // }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        // return string(abi.encodePacked("ipfs://",tokenURIs[_tokenId],"/metadata.json"));
        return string(abi.encodePacked(tokenURIs[_tokenId]));
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        uint balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    function getUserOf(uint256 tokenId) public view returns (address) {
        return userOf(tokenId);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

interface IWETH {
    function transferFrom(address sender, address recipient, uint amount) external returns (bool);
}

contract RentableNFTMarketplace is
    ERC721,
    AutomationCompatible
{
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIds;
    Counters.Counter public _itemsSold;
    Counters.Counter public _itemsRented;
    mapping(uint256 => string) public tokenURIs;

    uint256 listingPrice = 0.00001 ether;
    address payable public owner;
    address public WETH_ADDRESS;

    mapping(uint256 => MarketItem) public idToMarketItem;
    mapping(uint256 => RentedItem) public idToRentedItem;
    mapping(bytes32 => ImportedItem) public idToImportedItem;

    uint256[] public rentedTokenIds;
    bytes32[] public importedTokenIds;

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

    struct ImportedItem {
        uint256 tokenId;
        address collection;
        address owner;
        bool isWETH;
        uint256 price;
        uint256 rentalPrice;
        bool forSale;
        bool forRent;
        uint256 expiry;
        address renter;
        bool sold;
        bool rented;
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

    constructor(address _wethAddress) ERC721("Rentable", "RT") {
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

    function decodeImportedRentedKey(bytes32 rentalId) public view returns (address, uint256) {
        ImportedItem storage info = idToImportedItem[rentalId];
        return (info.collection, info.tokenId);
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

    function importNFT(
        address _collection, 
        uint256 _tokenId, 
        bool _isWETH, 
        uint256 _rentalPrice,
        uint256 _price,
        bool _forSale,
        bool _forRent
    ) public payable{
        require(!_forSale || _price > 0, "price required");
        require(!_forRent || _rentalPrice > 0, "rent price required");
        require(IERC721(_collection).ownerOf(_tokenId) == msg.sender, "You are not the owner of this NFT");
        require(msg.value == listingPrice, "Price must be equal to listing price");
        require(IERC721(_collection).getApproved(_tokenId) == address(this), "Contract must be approved to transfer NFT");

        bytes32 newId = keccak256(abi.encodePacked(_collection, _tokenId));
        importedTokenIds.push(newId);
        idToImportedItem[newId] = ImportedItem({
            tokenId: _tokenId,
            collection: _collection,
            owner: msg.sender,
            isWETH: _isWETH,
            price: _price,
            rentalPrice: _rentalPrice,
            forSale: _forSale,
            forRent: _forRent,
            sold: false,
            rented: false,
            expiry: 0,
            renter: address(0)
        });
    }

    function resellImportedNFT(uint256 _tokenId, address _collection, bool _isWETH, uint256 _price, uint256 _rentalPrice, bool _forSale, bool _forRent) public payable {
        bytes32 tokenId = keccak256(abi.encodePacked(_collection, _tokenId));
        ImportedItem storage item = idToImportedItem[tokenId];
        require(item.owner == msg.sender, "Only the owner can resell the token");
        require(msg.value == listingPrice, "Price must be equal to listing price");
        require(IERC721(_collection).getApproved(_tokenId) == address(this), "Contract must be approved to transfer NFT");

        importedTokenIds.push(tokenId);
        item.isWETH = _isWETH;
        item.price = _price;
        item.rentalPrice = _rentalPrice;
        item.forSale = _forSale;
        item.forRent = _forRent;
        item.sold = false;
        item.rented = false;
    }

    function rentImportedNFT(uint256 _tokenId, address _collection, uint64 _expires) public payable {
        bytes32 tokenId = keccak256(abi.encodePacked(_collection, _tokenId));
        ImportedItem storage item = idToImportedItem[tokenId];
        
        require(_expires > block.timestamp, "Expiration must be in the future");
        require(item.rented == false, "Item already rented");
        require(IERC721(_collection).ownerOf(_tokenId) == item.owner, "Item is not owned by the importer");

        if (item.isWETH) {
            require(IWETH(WETH_ADDRESS).transferFrom(msg.sender, item.owner, item.rentalPrice), "Failed to transfer WETH for rent");
        } else {
            require(msg.value >= item.rentalPrice, "Insufficient funds to rent the token");
            payable(item.owner).transfer(msg.value);
        }
        IERC721(_collection).transferFrom(item.owner, msg.sender, _tokenId);
        for (uint i = 0; i < importedTokenIds.length; i++) {
            if (importedTokenIds[i] == tokenId) {
                importedTokenIds[i] = importedTokenIds[importedTokenIds.length - 1];
                importedTokenIds.pop();
            }
        }
        item.renter = msg.sender;
        item.rented = true;
        item.expiry = _expires;
    }

    function purchaseImportedNFT(uint256 _tokenId, address _collection) public payable {
        bytes32 tokenId = keccak256(abi.encodePacked(_collection, _tokenId));
        ImportedItem storage item = idToImportedItem[tokenId];

        require(IERC721(_collection).ownerOf(_tokenId) == item.owner, "Item is not owned by the imported");
        require(item.forSale == true, "Not Listed for purchase");

        if (item.isWETH) {
            require(IWETH(WETH_ADDRESS).transferFrom(msg.sender, item.owner, item.price), "Failed to transfer WETH for rent");
        } else {
            require(msg.value == item.price, "Insufficient funds to rent the token");
            payable(item.owner).transfer(msg.value);
        }
        IERC721(_collection).transferFrom(item.owner, msg.sender, _tokenId);
        for (uint i = 0; i < importedTokenIds.length; i++) {
            if (importedTokenIds[i] == tokenId) {
                importedTokenIds[i] = importedTokenIds[importedTokenIds.length - 1];
                importedTokenIds.pop();
            }
        }
        item.owner = msg.sender;
        item.sold = true;
        item.price = 0;
        item.forSale = false;
        item.forRent = false;
    }

    function rentOutToken(uint256 _tokenId, uint64 _expires) public payable {
        MarketItem storage item = idToMarketItem[_tokenId];
        
        require(item.forRent, "Token is not available for rent");
        require(ownerOf(_tokenId) == item.owner, "Item is not owned by the importer");
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
        _transfer(item.owner, msg.sender, _tokenId);
    }

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

    // Chainlink Automation: Check if any rented NFT's rental period has expired
    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory performData) {
        uint256[] memory expiredTokenIds = new uint256[](rentedTokenIds.length);
        bytes32[] memory expiredImportedTokenIds = new bytes32[](importedTokenIds.length);
        uint256 expiredCount = 0;
        uint256 importedExpiredCount = 0;

        for (uint256 i = 0; i < rentedTokenIds.length; i++) {
            uint256 tokenId = rentedTokenIds[i];
            RentedItem memory rentedItem = idToRentedItem[tokenId];
            if (block.timestamp >= rentedItem.expires) {
                expiredTokenIds[expiredCount] = tokenId;
                expiredCount++;
            }
        }

        for (uint256 i = 0; i < importedTokenIds.length; i++) {
            bytes32 rentalId = importedTokenIds[i];
            ImportedItem memory importedItem = idToImportedItem[rentalId];
            if (block.timestamp >= importedItem.expiry) {
                expiredImportedTokenIds[importedExpiredCount] = rentalId;
                importedExpiredCount++;
            }
        }

        if (expiredCount > 0 || importedExpiredCount > 0) {
            upkeepNeeded = true;
            performData = abi.encode(expiredTokenIds, expiredCount, expiredImportedTokenIds, importedExpiredCount);
        } else {
            upkeepNeeded = false;
            performData = bytes("");
        }
    }

    function performUpkeep(bytes calldata performData) external override {
        (
            uint256[] memory expiredTokenIds,
            uint256 expiredCount,
            bytes32[] memory expiredImportedTokenIds,
            uint256 importedExpiredCount
        ) = abi.decode(performData, (uint256[], uint256, bytes32[], uint256));

        for (uint256 i = 0; i < expiredCount; i++) {
            uint256 tokenId = expiredTokenIds[i];
            if (tokenId != 0) {
                _returnToken(tokenId);
            }
        }

        for (uint256 i = 0; i < importedExpiredCount; i++) {
            bytes32 rentalId = expiredImportedTokenIds[i];
            if (rentalId != bytes32(0)) {
                ImportedItem memory importedItem = idToImportedItem[rentalId];
                _returnImportedToken(importedItem.tokenId, importedItem.collection);
            }
        }
    }
    
    function _returnImportedToken(uint256 _tokenId, address _collection) private {
        bytes32 rentalId = keccak256(abi.encodePacked(_collection, _tokenId));
        ImportedItem storage importedItem = idToImportedItem[rentalId];

        require(importedItem.rented, "Token is not currently rented");
        require(block.timestamp >= importedItem.expiry, "Rental period has not expired yet");

        IERC721(_collection).transferFrom(importedItem.renter, importedItem.owner, _tokenId);
        importedTokenIds.push(rentalId);
        importedItem.rented = false;
        importedItem.renter = address(0);
        importedItem.expiry = 0;
    }

    function _returnToken(uint256 _tokenId) private {
        MarketItem storage marketItem = idToMarketItem[_tokenId];
        RentedItem storage rentedItem = idToRentedItem[_tokenId];
        marketItem.rented = false;
        transferFrom(rentedItem.renter, marketItem.owner, _tokenId);
        _itemsRented.decrement();
        for (uint i = 0; i < rentedTokenIds.length; i++) {
            if (rentedTokenIds[i] == _tokenId) {
                rentedTokenIds[i] = rentedTokenIds[rentedTokenIds.length - 1];
                rentedTokenIds.pop();
                break;
            }
        }
    }
    
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

    function fetchImportedMarketItems() public view returns (ImportedItem[] memory) {
        uint itemCount = 0;
        uint currentIndex = 0;
        for (uint i = 0; i < importedTokenIds.length; i++) {
            if (idToImportedItem[importedTokenIds[i]].rented == false) {
                itemCount += 1;
            }
        }

        ImportedItem[] memory items = new ImportedItem[](itemCount);
        for (uint i = 0; i < importedTokenIds.length; i++) {
            if (idToImportedItem[importedTokenIds[i]].rented == false) {
                ImportedItem storage currentItem = idToImportedItem[importedTokenIds[i]];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

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
            if ((ownerOf(i + 1) == msg.sender) && idToMarketItem[i + 1].rented) {
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

    function fetchMyRentedImportedNFTs() public view returns (ImportedItem[] memory) {
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < importedTokenIds.length; i++) {
            if (idToImportedItem[importedTokenIds[i]].rented && idToImportedItem[importedTokenIds[i]].renter == msg.sender) {
                itemCount += 1;
            }
        }
        ImportedItem[] memory items = new ImportedItem[](itemCount);
        for (uint i = 0; i < importedTokenIds.length; i++) {
            if (idToImportedItem[importedTokenIds[i]].rented && idToImportedItem[importedTokenIds[i]].renter == msg.sender) {
                ImportedItem storage currentItem = idToImportedItem[importedTokenIds[i]];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchMyOwnedImportedNFTs() public view returns (ImportedItem[] memory) {
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < importedTokenIds.length; i++) {
            if (idToImportedItem[importedTokenIds[i]].owner == msg.sender) {
                itemCount += 1;
            }
        }
        ImportedItem[] memory items = new ImportedItem[](itemCount);
        for (uint i = 0; i < importedTokenIds.length; i++) {
            if (idToImportedItem[importedTokenIds[i]].owner == msg.sender) {
                ImportedItem storage currentItem = idToImportedItem[importedTokenIds[i]];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        // return string(abi.encodePacked("ipfs://",tokenURIs[_tokenId],"/metadata.json"));
        return string(abi.encodePacked(tokenURIs[_tokenId]));
    }

    function getTokenURLFromImportedNFT(address _nftContract, uint256 _tokenId) public view returns (string memory) {
        IERC721Metadata nftContract = IERC721Metadata(_nftContract);
        return nftContract.tokenURI(_tokenId);
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        uint balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    function getUserOf(uint256 tokenId, address _collection) public view returns (address) {
        return IERC721(_collection).ownerOf(tokenId);
    }
}
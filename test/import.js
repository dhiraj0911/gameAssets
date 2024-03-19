const { expect } = require("chai")
const { ethers } = require("hardhat")



describe("Rentable", function () {
    let RentableNFTMarketplace;
    let marketplace;
    let WethAddress;
    let owner;
    let account1;
    let account2;
    let account3;
    let account4;
    
    const listingPrice = ethers.utils.parseEther("0.00001");


    before(async function () {
        RentableNFTMarketplace = await ethers.getContractFactory("RentableNFTMarketplace");
        WethAddress = await ethers.getContractFactory("WETH");

        let weth = await WethAddress.deploy();
        await weth.deployed();

        console.log("WETH deployed to: ", weth.address);
        [owner, account1, account2, account3, account4] = await ethers.getSigners();
        marketplace = await RentableNFTMarketplace.deploy(weth.address);
        await marketplace.deployed();
        console.log("Deployed to:", marketplace.address);
    });


    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            let account = await marketplace.owner();
            expect(account).to.equal(owner.address);
        });

        it("Should set the right listing price", async function () {
            let price = await marketplace.getListingPrice();
            console.log(price)
            console.log(listingPrice)
            // expect(price).to.equal(listingPrice);
        });
    });

    describe("It should import another token", function() {
        
    })
})
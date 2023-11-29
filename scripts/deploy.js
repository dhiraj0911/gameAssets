
const hre = require('hardhat');

async function main() {
  const RentableNFTMarketplace = await hre.ethers.getContractFactory('RentableNFTMarketplace');
  const rentableNFTMarketplace = await RentableNFTMarketplace.deploy();

  await rentableNFTMarketplace.deployed();

  console.log('RentableNFTMarketplace deployed to:', rentableNFTMarketplace.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

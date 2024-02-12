
const hre = require('hardhat');

async function main() {
  const wethER20 = await hre.ethers.getContractFactory('WETH');
  const weth = await wethER20.deploy();

  await weth.deployed();

  console.log('WETH deployed to:', weth.address);

  const RentableNFTMarketplace = await hre.ethers.getContractFactory('RentableNFTMarketplace');
  const rentableNFTMarketplace = await RentableNFTMarketplace.deploy(weth.address);

  await rentableNFTMarketplace.deployed();

  console.log('RentableNFTMarketplace deployed to:', rentableNFTMarketplace.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

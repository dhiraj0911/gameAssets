
const hre = require('hardhat');

async function main() {
  const wethER20 = await hre.ethers.getContractFactory('WETH');
  const weth = await wethER20.deploy();

  await weth.deployed();

  

  const RentableNFTMarketplace = await hre.ethers.getContractFactory('RentableNFTMarketplace');
  const rentableNFTMarketplace = await RentableNFTMarketplace.deploy(weth.address);

  await rentableNFTMarketplace.deployed();

  console.log('NEXT_PUBLIC_CONTRACT_ADDRESS=',rentableNFTMarketplace.address);
  console.log('NEXT_PUBLIC_WETH_ADDRESS=',weth.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

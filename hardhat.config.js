require('@nomiclabs/hardhat-waffle');
require('dotenv').config({ path: '.env' });

module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    hardhat: {
    },
    mumbai: {
      url: "https://polygon-mainnet.infura.io/v3/a267d177c62044519523fc2e35cad350",
      accounts: ["24d22ddbd5ee6c95e67cb20f94ee356a90bd1b1cdaf5b4d1025f055bd14ae566"],
    },
  },
  settings: { optimizer: { enabled: true, runs: 200 } },  
};

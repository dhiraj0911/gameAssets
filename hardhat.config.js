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
      // url: "http://localhost:8545",
      chainId: 1337,
    },
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/g5OuSq_e4E-J7W0gRlcXXHTkL6_HsdA0",
      accounts: ["24d22ddbd5ee6c95e67cb20f94ee356a90bd1b1cdaf5b4d1025f055bd14ae566"],
      chainId: 80001,
    },
  },
  settings: { optimizer: { enabled: true, runs: 200 } },  
};

require('@nomiclabs/hardhat-waffle');
require('dotenv').config({ path: '.env' });

const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  allowUnlimitedContractSize: true,
  networks: {
    hardhat: {
      // allowUnlimitedContractSize: true,
      chainId: 1337,
    },
    mumbai: {
      url: API_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
    },
  },
  settings: { optimizer: { enabled: true, runs: 200 } },  
};

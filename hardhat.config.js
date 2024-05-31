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
    amoy: {
      url: API_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
    },
    arb_sepolia: {
      url: "https://arb-sepolia.g.alchemy.com/v2/jojD2pcZBUa_hixqqp4jnHsLWf4zQfiF",
      accounts: [PRIVATE_KEY],
      chainId: 421614,
    },
  },
  settings: { optimizer: { enabled: true, runs: 200 } },  
};

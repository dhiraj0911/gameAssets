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
  },
  settings: { optimizer: { enabled: true, runs: 200 } },
};

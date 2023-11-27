require('@nomiclabs/hardhat-waffle');
require('dotenv').config({ path: '.env' });

module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
    },
  },
  settings: { optimizer: { enabled: true, runs: 200 } },
};

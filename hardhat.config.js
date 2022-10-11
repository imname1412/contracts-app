require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // networks: {
  //   goerli: {
  //     url: process.env.INFURA_NODE_ENDPOINT,
  //     accounts: [process.env.WALLET_PRIVATE_KEY]
  //   }
  // },
  solidity: {
    compilers: [
      {
        version: "0.7.6",
      },
      {
        version: "0.8.13",
        settings: {},
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};

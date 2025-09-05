require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@nomicfoundation/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  namedAccounts: {
    firstAccount: {
      default: 0, // here this will by default take the first account as firstAccount
    },
  },
};

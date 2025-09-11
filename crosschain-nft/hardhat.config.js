require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@nomicfoundation/hardhat-ethers");
require("@chainlink/env-enc").config();
require("./task")


const PRIVATE_KEY = process.env.PRIVATE_KEY
const SEPOLIA_PRC_URL = process.env.SEPOLIA_PRC_URL
const AMOY_PRC_URL = process.env.AMOY_PRC_URL
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  namedAccounts: {
    firstAccount: {
      default: 0, // here this will by default take the first account as firstAccount
    },
  },
  networks: {
    sepolia: {
      url: SEPOLIA_PRC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
      companionNetworks: {
        destChain: "amoy",
      }
    },
    amoy: {
      url: AMOY_PRC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80002,
      blockConfirmations: 6,
      companionNetworks: {
        destChain: "sepolia",
      }
    },
  }
};

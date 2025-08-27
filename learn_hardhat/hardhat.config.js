require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  //配置网络
  networks:{
    sepolia:{
      url:`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts:[process.env.PK],
    },
    mainnet:{
      url:`https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts:[process.env.PK],
    }
  }
};

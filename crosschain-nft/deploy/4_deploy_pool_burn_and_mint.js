const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { firstAccount } = await getNamedAccounts();
  
  log("Deploying NFTPoolBurnAndMint contract...");

  let destChainRouter
  let linkTokenAddress
  if (developmentChains.includes(network.name)) {
    const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator");
    const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", ccipSimulatorDeployment.address);
    const ccipConfig = await ccipSimulator.configuration();
    destChainRouter = ccipConfig.destinationRouter_;
    linkTokenAddress = ccipConfig.linkToken_;
  } else { 
destChainRouter = networkConfig[network.config.chainId].router
linkTokenAddress = networkConfig[network.config.chainId].linkToken
  }

  const wnftDeployment = await deployments.get("WrappedMyToken");
  const wnftAddress = wnftDeployment.address;

  await deploy("NFTPoolBurnAndMint", {
    contract: "NFTPoolBurnAndMint",
    from: firstAccount,
    args: [destChainRouter, linkTokenAddress, wnftAddress], // Constructor arguments
    log: true,
  });
    
  log("NFTPoolBurnAndMint contract deployed successfully");
};
// add tags and dependencies
module.exports.tags = ["destchain", "all"];
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { network } = require("hardhat");


module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { firstAccount } = await getNamedAccounts();
  
  log("Deploying NFTPoolLockAndRelease contract...");

  let sourceChainRouter
  let linkTokenAddress
  if (developmentChains.includes(network.name)) {
    const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator");
    const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", ccipSimulatorDeployment.address);

    const ccipConfig = await ccipSimulator.configuration();
    sourceChainRouter = ccipConfig.sourceRouter_;
    linkTokenAddress = ccipConfig.linkToken_;
  } else { 
    sourceChainRouter = networkConfig[network.config.chainId].router
    linkTokenAddress = networkConfig[network.config.chainId].linkToken

  }



  const nftDeployment = await deployments.get("MyToken");
  const nftAddress = nftDeployment.address;

  await deploy("NFTPoolLockAndRelease", {
    contract: "NFTPoolLockAndRelease",
    from: firstAccount,
    args: [sourceChainRouter, linkTokenAddress, nftAddress], // Constructor arguments
    log: true,
  });
    
  log("NFTPoolLockAndRelease contract deployed successfully");
};
// add tags and dependencies
module.exports.tags = ["sourcechain", "all"];
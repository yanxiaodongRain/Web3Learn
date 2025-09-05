module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { firstAccount } = await getNamedAccounts();
  
  log("Deploying NFTPoolBurnAndMint contract...");

  const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator");
  const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", ccipSimulatorDeployment.address);

  const ccipConfig = await ccipSimulator.configuration();
  const destChainRouter = ccipConfig.destinationRouter_;
  const linkTokenAddress = ccipConfig.linkToken_;
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
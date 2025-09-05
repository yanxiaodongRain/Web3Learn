module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { firstAccount } = await getNamedAccounts();
  
  log("Deploying NFTPoolLockAndRelease contract...");

  const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator");
  const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", ccipSimulatorDeployment.address);

  const ccipConfig = await ccipSimulator.configuration();
  const sourceChainRouter = ccipConfig.sourceRouter_;
  const linkTokenAddress = ccipConfig.linkToken_;
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
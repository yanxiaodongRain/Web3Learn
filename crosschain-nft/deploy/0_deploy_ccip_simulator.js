module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { firstAccount } = await getNamedAccounts();
  
  log("Deploying CCIPSimulator contract...");

  await deploy("CCIPLocalSimulator", {
    contract: "CCIPLocalSimulator",
    from: firstAccount,
    args: [], // Constructor arguments
    log: true,
  });
    
  log("CCIPSimulator contract deployed successfully");
};
// add tags and dependencies
module.exports.tags = ["test", "all"];
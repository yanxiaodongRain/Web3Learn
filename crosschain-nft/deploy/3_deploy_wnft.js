module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { firstAccount } = await getNamedAccounts();
  
  log("Deploying WrappedMyToken contract...");

  await deploy("WrappedMyToken", {
    contract: "WrappedMyToken",
    from: firstAccount,
    args: ["WrappedMyToken", "WMTK"], // Constructor arguments
    log: true,
  });
    
  log("WrappedMyToken contract deployed successfully");
};
// add tags and dependencies
module.exports.tags = ["destchain", "all"];
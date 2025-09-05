module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { firstAccount } = await getNamedAccounts();
  
  log("Deploying nft contract...");

  await deploy("MyToken", {
    contract: "MyToken",
    from: firstAccount,
    args: ["MyToken", "MTK"], // Constructor arguments
    log: true,
  });
    
  log("nft contract deployed successfully");
};
// add tags and dependencies
module.exports.tags = ["sourcechain", "all"];
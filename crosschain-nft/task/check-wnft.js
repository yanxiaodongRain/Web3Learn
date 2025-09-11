const { task } = require("hardhat/config");

task("check-wnft").setAction(async (taskArgs, hre) => { 
    const { firstAccount } = await getNamedAccounts();
    const wnftDeployment = await deployments.get("WrappedMyToken");
    const wnft = await ethers.getContractAt("WrappedMyToken", wnftDeployment.address);


    console.log(`Checking NFTs owned by account: ${firstAccount}`);
    const totalSupply = await wnft.totalSupply();
    for (let i = 0; i < totalSupply; i++) { 
        const owner = await wnft.ownerOf(i);
        console.log(`Token ID ${i} is owned by ${owner}`);  
    }
});

module.exports = {};
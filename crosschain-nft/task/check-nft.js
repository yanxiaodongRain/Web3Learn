const { task } = require("hardhat/config");

task("check-nft").setAction(async (taskArgs, hre) => { 
    const { firstAccount } = await getNamedAccounts();
    const nftDeployment = await deployments.get("MyToken");
    const nft = await ethers.getContractAt("MyToken", nftDeployment.address);


    console.log(`Checking NFTs owned by account: ${firstAccount}`);
    const totalSupply = await nft.totalSupply();
    for (let i = 0; i < totalSupply; i++) { 
        const owner = await nft.ownerOf(i);
        console.log(`Token ID ${i} is owned by ${owner}`);  
    }
});

module.exports = {};
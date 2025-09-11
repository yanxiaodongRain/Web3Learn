const { task } = require("hardhat/config");

task("mint-nft").setAction(async (taskArgs, hre) => { 
    const { firstAccount } = await getNamedAccounts();
    const nftDeployment = await deployments.get("MyToken");
    const nft = await ethers.getContractAt("MyToken", nftDeployment.address);

    console.log(`Minting a new NFT to account: ${firstAccount}`);
    await nft.safeMint(firstAccount);

    console.log(`NFT minted successfully to ${firstAccount}`);
});

module.exports = {};
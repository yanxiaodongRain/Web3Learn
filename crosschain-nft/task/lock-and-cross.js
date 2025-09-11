const { task } = require("hardhat/config");
const { networkConfig } = require("../helper-hardhat-config");

task("lock-and-cross")
    .addOptionalParam("chainselector", "chain selector of dest chain")
    .addOptionalParam("tokenId", "receiver address on dest chain")
    .addParam("tokenid", " token id to be crossed chain")
    .setAction(async (taskArgs, hre) => {
      
        let chainSelector 
        let receiver;
        const tokenId = taskArgs.tokenid;
        const { firstAccount} = await hre.getNamedAccounts();

        if (taskArgs.chainSelector) {
            chainSelector = taskArgs.chainSelector;
        } else { 
            chainSelector = networkConfig[network.config.chainId].companionChainSelector
        }

        console.log(`chain selector ${chainSelector}`);

        if (taskArgs.receiver) {
            receiver = taskArgs.receiver;
        } else { 
            const nftPollBurnAndMintDeployment = await hre.companionNetworks["destChain"]. deployments.get("NFTPoolBurnAndMint");
            receiver = nftPollBurnAndMintDeployment.address;    
        }

        console.log(`receiver ${receiver}`);

        const linkTokenAddress = networkConfig[network.config.chainId].linkToken
        const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddress);
        const nftPoolLockAndRelease = await ethers.getContractAt("NFTPoolLockAndRelease", firstAccount);
        await linkToken.transfer(nftPoolLockAndRelease.target, ethers.parseEther("10"));

        const balance = await linkToken.balanceOf(nftPoolLockAndRelease.target);

        console.log(`Funded pool contract with ${ethers.formatEther(balance)} LINK`);


        const nft = await ethers.getContractAt("MyToken", firstAccount);
        await nft.approve(nftPoolLockAndRelease.target, tokenId);

        console.log(`Approved pool contract to transfer NFT ID ${tokenId}`);



        const lockAndSendNFTtx = nftPoolLockAndRelease.lockAndSendNFT(tokenId, firstAccount, chainSelector, receiver);
        console.log(`Lock and send NFT transaction submitted: ${lockAndSendNFTtx.hash}`);

    });

    module.exports = {};
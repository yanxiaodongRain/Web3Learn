const { task } = require("hardhat/config");
const { networkConfig } = require("../helper-hardhat-config");

task("burn-and-cross")
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
            const nftPoolLockAndReleaseDeployment = await hre.companionNetworks["destChain"]. deployments.get("NFTPoolLockAndRelease");
            receiver = nftPoolLockAndReleaseDeployment.address;    
        }

        console.log(`receiver ${receiver}`);

        const linkTokenAddress = networkConfig[network.config.chainId].linkToken
        const linkToken = await ethers.getContractAt("LinkToken", linkTokenAddress);
        const nftPollBurnAndMint = await ethers.getContractAt("NFTPoolBurnAndMint", firstAccount);
        await linkToken.transfer(nftPollBurnAndMint.target, ethers.parseEther("10"));

        const balance = await linkToken.balanceOf(nftPollBurnAndMint.target);

        console.log(`Funded pool contract with ${ethers.formatEther(balance)} LINK`);


        const wnft = await ethers.getContractAt("WrappedMyToken", firstAccount);
        await wnft.approve(nftPollBurnAndMint.target, tokenId);

        console.log(`Approved pool contract to transfer NFT ID ${tokenId}`);



        const burnAndSendNFTtx = nftPollBurnAndMint.burnAndSendNFT(tokenId, firstAccount, chainSelector, receiver);
        console.log(`Burn and send NFT transaction submitted: ${burnAndSendNFTtx.hash}`);

    });

    module.exports = {};
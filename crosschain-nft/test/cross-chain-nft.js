//source chain -> dest chain
// test if user can mint a nft from nft contract successfully


// 


// test if user can get a wrapped nft in dest chain

//dest chain -> source chain
// test if user can burn the wnft and send ccip message on dest chain

// test if user have the nft unloacked on source chain



const { ethers, getNamedAccounts } = require("hardhat");
const { expect } = require("chai");

let firstAccount
    let ccipSimulator
    let nft
    let nftPoolLockAndRelease
    let wnft
let wnftPoolBurnAndMint
    let chainSelector
before(async function () {
        
    firstAccount = (await getNamedAccounts()).firstAccount;
    
        await deployments.fixture(["all"]);

        const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator");
    ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", ccipSimulatorDeployment.address);
    const nftDeployment = await deployments.get("MyToken");
    nft = await ethers.getContractAt("MyToken", nftDeployment.address);
    const nftPoolLockAndReleaseDeployment = await deployments.get("NFTPoolLockAndRelease");
    nftPoolLockAndRelease = await ethers.getContractAt("NFTPoolLockAndRelease", nftPoolLockAndReleaseDeployment.address);
    const wnftDeployment = await deployments.get("WrappedMyToken");
    wnft = await ethers.getContractAt("WrappedMyToken", wnftDeployment.address);
    const wnftPoolBurnAndMintDeployment = await deployments.get("NFTPoolBurnAndMint");
    wnftPoolBurnAndMint = await ethers.getContractAt("NFTPoolBurnAndMint", wnftPoolBurnAndMintDeployment.address);
    
    const ccipConfig = await ccipSimulator.configuration();
    chainSelector = ccipConfig.chainSelector_;
  const sourceChainRouter = ccipConfig.sourceRouter_;
  const linkTokenAddress = ccipConfig.linkToken_;

    });


describe("source chain -> dest chain", async function () { 

    it("test if user can mint a nft from nft contract successfully", async function () {
        await nft.safeMint(firstAccount);
        expect(await nft.ownerOf(0)).to.equal(firstAccount);
    })


    it("test if user can lock the nft in pool contract and send ccip message on source chain", async function () { 

        await nft.approve(nftPoolLockAndRelease.target, 0);

        ccipSimulator.requestLinkFromFaucet(nftPoolLockAndRelease, ethers.parseEther("10"));

        nftPoolLockAndRelease.lockAndSendNFT(0, firstAccount, chainSelector, wnftPoolBurnAndMint.target);

        expect(await nft.ownerOf(0)).to.equal(firstAccount);

    })

});

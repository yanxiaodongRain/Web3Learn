const { ethers, upgrades} = require("hardhat")
const path = require("path");
const fs = require("fs");


module.exports = async ({ getNamedAccounts, deployments }) => {
    const {save} = deployments;
    const {deployer} = await getNamedAccounts();

    console.log("部署用户地址： ", deployer)

    //读取 ./cache/proxyNftAuction.json
    const storePath = path.resolve(__dirname,"./cache/proxyNftAuction.json")
    const storeData = fs.readFileSync(storePath, "utf-8");
    const {proxyAddress, implAddress, abi} = JSON.parse(storeData);

    //升级版的业务合约
    const NftAuctionV2 = await ethers.getContractFactory("NftAuctionV2");

    const nftAuctionProxyV2 = await upgrades.upgradeProxy(proxyAddress, NftAuctionV2)
    await nftAuctionProxyV2.waitForDeployment()

    const proxyAddressV2 = await nftAuctionProxyV2.getAddress()

    const  storePathV2 = path.resolve(__dirname, "./cache/proxyNftAuctionV2.json")

    fs.writeFileSync(storePathV2, JSON.stringify({proxyAddress, proxyAddressV2, abi: nftAuctionProxyV2.interface.format("json")}))


    await save("NftAuctionProxyV2", {
        abi: nftAuctionProxyV2.interface.format("json"),
        address: proxyAddress,
        args:[],
        log: true,
    })
};

module.exports.tags = ['upgradeNftAuction'];

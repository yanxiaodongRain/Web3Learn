const {ethers, deployments, upgrades} = require("hardhat")
const {expect} = require("chai")


describe("Test upgrade", async () => {

    it('Should be able to deploy', async () => {

        //1. 部署业务合约
        await deployments.fixture(["deployNftAuction"])
        const nftAuctionProxy = await deployments.get("NftAuctionProxy");


        //2. 调用 createAuction 方法创建拍卖
        const nftAuction = await ethers.getContractAt("NftAuction", nftAuctionProxy.address)
        await nftAuction.createAuction(100 * 1000, 5, ethers.ZeroAddress, 1)

        const auction = await nftAuction.auctions(0)
        console.log("创建拍卖成功：", auction)


        const  implAddress1 = await upgrades.erc1967.getImplementationAddress(
            nftAuctionProxy.address
        )
        //3. 升级合约
        await deployments.fixture(["upgradeNftAuction"])

        const  implAddress2 = await upgrades.erc1967.getImplementationAddress(
            nftAuctionProxy.address
        )

        // 3.1 重新取升级后的代理地址（fixture 已把最新实现写进 deployments）
        const nftAuctionProxyAfterUpgrade = await deployments.get("NftAuctionProxyV2");

        // 3.2 重新绑定 ABI，得到「升级后的」合约对象
        const nftAuctionV2 = await ethers.getContractAt(
            "NftAuctionV2",          // 升级后的合约名
            nftAuctionProxyAfterUpgrade.address
        );

        const hello = await nftAuctionV2.testHello()
        console.log("新增的方法： ",hello)

        //4. 读取合约的 auction[0]
        const auctionV2 = await nftAuctionV2.auctions(0)
        console.log("升级后读取拍卖成功：", auctionV2)
        expect(auctionV2.startTime).to.equal(auction.startTime)

        console.log("implAddress1: ",implAddress1)
        console.log("implAddress2: ",implAddress2)
        expect(implAddress1).to.not.equal(implAddress2)

    });
})
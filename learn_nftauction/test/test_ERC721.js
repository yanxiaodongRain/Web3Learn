const {ethers, deployments} = require("hardhat")
const {expect} = require("chai");

describe("Test auction", async () => {

    it('Should be ok', async () => {

        await deployments.fixture(["deployNftAuction"])
        const nftAuctionProxy = await deployments.get("NftAuctionProxy")

        const [signer, buyer] = await ethers.getSigners()

        // 1. 部署ERC721 合约
        const TestERC721 = await ethers.getContractFactory("TestERC721")
        const testERC721 = await TestERC721.deploy()
        await testERC721.waitForDeployment()
        const testERC721Address = await testERC721.getAddress()
        console.log("testERC721Address:  ", testERC721Address)

        //mint 10个NFT
        for (let i = 0; i < 10; i++) {
            await testERC721.mint(signer, i + 1);
        }

        // 给代理合约授权
        await testERC721.connect(signer).setApprovalForAll(nftAuctionProxy.address, true);

        //2. 调用createAuction方法创建拍卖
        const tokenId = 1
        const nftAuction = await ethers.getContractAt(
            "NftAuction",
            nftAuctionProxy.address
        )

        await nftAuction.createAuction(11 * 1000, ethers.parseEther("0.01"), testERC721Address, tokenId)

        const auction = await nftAuction.auctions(0)

        console.log("创建拍卖成功： ",auction)

        //3.购买者参与拍卖
        await nftAuction.connect(buyer).placeBid(0,{value: ethers.parseEther("0.01")})


        //4. 结束拍卖
        //等待10s
        await new Promise(resolve => setTimeout(resolve, 11 * 1000))

        await nftAuction.connect(signer).endAuction(0)

        const auctionResult = await nftAuction.auctions(0)
        console.log("结束拍卖后读取拍卖成功： ",auctionResult)
        expect(auctionResult.highestBidder).to.equal(buyer.address)
        expect(auctionResult.highestBid).to.equal(ethers.parseEther("0.01"))

        //5. 验证结果
        const owner = await testERC721.ownerOf(tokenId);
        console.log("owner: ",owner)
        expect(owner).to.equal(buyer.address)
    });
})

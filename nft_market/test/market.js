const {ethers} = require("hardhat")
const {expect} = require("chai")


describe("Market", async () => {
    let usdt, nft, market,account1, account2;

   beforeEach(async () => {
     [deployer, account1, account2] = await ethers.getSigners();

    let USDT = await ethers.getContractFactory("cUSDT");
    usdt = await USDT.connect(deployer).deploy();
    await usdt.waitForDeployment();

    let NFT = await ethers.getContractFactory("NFTM");
    nft = await NFT.connect(deployer).deploy(deployer.address);
    await nft.waitForDeployment();

    let Market = await ethers.getContractFactory("Market");
    market = await Market.connect(deployer).deploy(usdt.target, nft.target);
    await market.waitForDeployment();

    await nft.safeMint(account1.address);
    await nft.safeMint(account1.address);
    await nft.connect(account1).approve(market.target, 0);
    await nft.connect(account1).approve(market.target, 1);

    await usdt.approve(market.target, ethers.parseEther("1000"));

   })

   it("erc20 address should be usdt", async () => {
      expect(await market.erc20()).to.equal(usdt.target);
   })

    it("erc721 address should be nft", async () => {
      expect(await market.erc721()).to.equal(nft.target);
   })

   it("account1 should have two nfts", async () => {
      expect(await nft.balanceOf(account1.address)).to.equal(2);
   })

   it("usdt should approve market 1000", async () => {
      expect(await usdt.allowance(deployer, market.target)).to.equal(ethers.parseEther("1000"));
   })

    it("deployer should have usdt", async () => {
      expect(await usdt.balanceOf(deployer.address)).to.equal("100000000000000000000000000");
   })

   it("account1 can list two nfts to market", async () => {
    const price = "0x0000000000000000000000000000000000000000000000000000000000000032";
    expect(await nft.connect(account1)['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 0, price)).to.emit(market, "NewOrder");
    expect(await nft.connect(account1)['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 1, price)).to.emit(market, "NewOrder");

    expect(await nft.balanceOf(account1.address)).to.equal(0);
    expect(await nft.balanceOf(market.target)).to.equal(2);

    expect(await market.isListed(0)).to.equal(true);
    expect(await market.isListed(1)).to.equal(true);

    expect(await market.getOrdersLength()).to.equal(2);
    expect((await market.connect(deployer).getOrders())[0][0]).to.equal(account1.address);
    expect((await market.connect(deployer).getOrders())[0][1]).to.equal(0);
    expect((await market.connect(deployer).getOrders())[0][2]).to.equal(price);

    expect((await market.connect(deployer).getOrders())[1][0]).to.equal(account1.address);
    expect((await market.connect(deployer).getOrders())[1][1]).to.equal(1);
    expect((await market.connect(deployer).getOrders())[1][2]).to.equal(price);


    expect((await market.connect(account1).getMyNFTs())[0][0]).to.equal(account1.address);
    expect((await market.connect(account1).getMyNFTs())[0][1]).to.equal(0);
    expect((await market.connect(account1).getMyNFTs())[0][2]).to.equal(price);
   })


})
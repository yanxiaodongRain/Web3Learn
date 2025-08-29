const {ethers} = require("hardhat")


describe("Starting", async () => {

    let account1, account2

    it('Should be able to deploy', async () => {

        [account1, account2] = await ethers.getSigners();

        console.log("account1 address: ",account1.address)
        console.log("account2 address: ",account2.address)

        const Contract = await ethers.getContractFactory("NftAuction");
        const contract = await Contract.deploy()
        await contract.waitForDeployment()

        await contract.initialize()

        await contract.createAuction(100 * 1000, 5, ethers.ZeroAddress, 1)

        const auction = await contract.auctions(0)

        console.log(auction)
    });
})
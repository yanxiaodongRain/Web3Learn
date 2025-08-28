const {expect} = require("chai");
const hre = require("hardhat");


describe("MyToken Test", function () {


    let myTokenContract;

    let account1, account2;

    const initialSupply = 10000

    before(async () => {

        [account1, account2] = await hre.ethers.getSigners();

        console.log(account1,"==========account1==========");
        console.log(account2,"==========account2==========");

        const MyToken = await hre.ethers.getContractFactory("MyToken");

        myTokenContract = await MyToken.connect(account2).deploy(initialSupply);//不加connect()，默认是account1

        await myTokenContract.waitForDeployment();

        const contractAddress = await myTokenContract.getAddress()

        console.log(contractAddress)

        expect(myTokenContract).to.not;

    })

    it('验证合约发name, symbol, decimal', async () => {

        const name = await myTokenContract.name();

        const symbol = await myTokenContract.symbol();

        const decimal = await myTokenContract.decimals();

        console.log(name, symbol, decimal, "   aaaaaaaaaaaaaaaaaaaa");

        expect(name).to.eq("MyToken");

        expect(symbol).to.eq("MTK");

        expect(decimal).to.eq(18);

    });

    it('测试转账', async () => {

        // const balanceOfAccount1 = await myTokenContract.balanceOf(account1);
        //
        // console.log("=======balanceOfAccount1========",balanceOfAccount1);
        //
        // expect(balanceOfAccount1).to.eq(initialSupply);

        const result = await myTokenContract.transfer(account1, initialSupply / 2)

        const balanceOfAccount2 = await myTokenContract.balanceOf(account2)

        expect(balanceOfAccount2).to.equal(initialSupply / 2);

    });

});
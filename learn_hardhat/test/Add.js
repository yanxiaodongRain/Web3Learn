const { expect } = require("chai");

describe("Add", function () {
    it("should return the sum of two numbers", async function () {
        const Add = await ethers.getContractFactory("Add");
        const add = await Add.deploy();

        const result = await add.add(2, 3);
        expect(result).to.equal(5);
    });
});
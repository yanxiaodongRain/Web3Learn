# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js

npx hardhat export-abi --no-compile   //编译输出abi
npx hardhat coverage                  //查看测试覆盖率
npx hardhat flatten > tmp.sol         //扁平化到文件中

```

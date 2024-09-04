const {run} = require("hardhat");
/*
bscTestnet、arbitrumSepolia、sepolia、、、
hardhat deploy --network sepolia --tags 2
*/
module.exports = async function ({ethers, getNamedAccounts, deployments, getChainId, getUnnamedAccounts}) {
    const {deploy, execute, log} = deployments;
    const {deployer, alex} = await getNamedAccounts();
    // await deploy('StakedListaBNB', {
    //     from: deployer, args: [], log: true, skipIfAlreadyDeployed: false,
    //     proxy: {
    //         proxyContract: 'UUPS',
    //         execute: {
    //             init: {methodName: 'initialize', args: [multisig],},
    //         }
    //     }
    // });
    //
    // log("verify...");
    // const impl = await get('StakedListaBNB_Implementation');
    // log("impl: ", impl.address);
    // await run("verify:verify", {address: impl.address, constructorArguments: []});


    // let usdt = await deploy('USDTTest.sol', {
    //     from: deployer, args: [], log: true, skipIfAlreadyDeployed: true,
    // });
    // let usdc = await deploy('USDCTest.sol', {
    //     from: deployer, args: [], log: true, skipIfAlreadyDeployed: true,
    // });
    // let ezETH = await deploy('RenzoRestakedETH', {
    //     from: deployer, args: [], log: true, skipIfAlreadyDeployed: true,
    // });

    log("verify...");
    // if (usdt.newlyDeployed) {
    //     await run("verify:verify", {
    //         address: usdt.address, constructorArguments: [],
    //         contract: "contracts/mocks/USDTTest.sol:USDTTest.sol"
    //     });
    //     await execute('USDTTest.sol', {from: deployer, log: true}, 'mint', alex, 1e8 * 10 ^ 6);
    // }
    // if (usdc.newlyDeployed) {
    //     await run("verify:verify", {
    //         address: usdc.address, constructorArguments: [],
    //         contract: "contracts/mocks/USDCTest.sol:USDCTest.sol"
    //     });
    //     await execute('USDCTest.sol', {from: deployer, log: true}, 'mint', alex, 1e8 * 10 ^ 6);
    // }
    // if (ezETH.newlyDeployed) {
    //     await run("verify:verify", {
    //         address: ezETH.address, constructorArguments: [],
    //         contract: "contracts/mocks/RenzoRestakedETH.sol:RenzoRestakedETH"
    //     });
    //     await execute('RenzoRestakedETH', {from: deployer, log: true}, 'mint', alex, ethers.parseEther('100000'));
    // }
};

module.exports.tags = ['2'];
module.exports.dependencies = [];
const {run} = require("hardhat");

module.exports = async function ({
    ethers, 
    getNamedAccounts, 
    deployments, 
    getChainId, 
    getUnnamedAccounts
}) {
    const {deploy} = deployments;
    const BNB_CHAIN_TESTNET_WRAPPED = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd';
    const BNB_CHAIN_WRAPPED = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
    const EarnImplementation = await ethers.getContract('Earn_Implementation');
    const Timelock = await ethers.getContract('Timelock');
    const WithdrawVault = await ethers.getContract('WithdrawVault');

    await run(
        "verify:verify", 
        {
            address: EarnImplementation.address,
            constructorArguments: [BNB_CHAIN_TESTNET_WRAPPED, Timelock.address, WithdrawVault.address]
        }
    );
};

module.exports.tags = ['EarnVerify'];
module.exports.dependencies = ['EarnImplementation'];

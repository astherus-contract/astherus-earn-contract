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
    const AstherusEarnVaultImplementation = await ethers.getContract('AstherusEarnVault_Implementation');
    const AstherusEarnTimelock = await ethers.getContract('AstherusEarnTimelock');

    await run(
        "verify:verify", 
        {
            address: AstherusEarnVaultImplementation.address,
            constructorArguments: [BNB_CHAIN_TESTNET_WRAPPED, AstherusEarnTimelock.address]
        }
    );
};

module.exports.tags = ['AstherusEarnVaultVerify'];
module.exports.dependencies = ['AstherusEarnVaultImplementation'];

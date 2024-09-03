const {run} = require("hardhat");

module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts
}) {
    const {deploy} = deployments;
    const WithdrawVaultImplementation = await ethers.getContract('WithdrawVault_Implementation');
    const Timelock = await ethers.getContract('Timelock');

    await run(
        "verify:verify",
        {
            address: WithdrawVaultImplementation.address,
            constructorArguments: [Timelock.address]
        }
    );
};

module.exports.tags = ['WithdrawVaultVerify'];
module.exports.dependencies = ['WithdrawVaultImplementation'];

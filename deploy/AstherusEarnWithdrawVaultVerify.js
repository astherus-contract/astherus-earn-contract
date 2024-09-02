const {run} = require("hardhat");

module.exports = async function ({
    ethers,
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts
}) {
    const {deploy} = deployments;
    const AstherusEarnWithdrawVaultImplementation = await ethers.getContract('AstherusEarnWithdrawVault_Implementation');
    const AstherusEarnTimelock = await ethers.getContract('AstherusEarnTimelock');

    await run(
        "verify:verify",
        {
            address: AstherusEarnWithdrawVaultImplementation.address,
            constructorArguments: [AstherusEarnTimelock.address]
        }
    );
};

module.exports.tags = ['AstherusEarnWithdrawVaultVerify'];
module.exports.dependencies = ['AstherusEarnWithdrawVaultImplementation'];

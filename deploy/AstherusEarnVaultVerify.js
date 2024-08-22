const {run} = require("hardhat");

module.exports = async function ({
    ethers, 
    getNamedAccounts, 
    deployments, 
    getChainId, 
    getUnnamedAccounts
}) {
    const {deploy} = deployments;
    const AstherusEarnVaultImplementation = await ethers.getContract('AstherusEarnVault_Implementation');
    await run(
        "verify:verify", 
        {
            address: AstherusEarnVaultImplementation.target,
            constructorArguments: []
        }
    );
};

module.exports.tags = ['AstherusEarnVaultVerify'];
module.exports.dependencies = ['AstherusEarnVaultImplementation'];

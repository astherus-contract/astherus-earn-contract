module.exports = async function ({
    ethers, 
    getNamedAccounts, 
    deployments, 
    getChainId, 
    getUnnamedAccounts
}) {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    const Timelock = await ethers.getContract('Timelock');
    const deployment = await deploy('WithdrawVault_Implementation', {
        contract: "WithdrawVault",
        from: deployer,
        args: [Timelock.address],
        log: true, 
        skipIfAlreadyDeployed: false,
    });
};

module.exports.tags = ['WithdrawVaultImplementation'];
module.exports.dependencies = [];

module.exports = async function ({
    ethers, 
    getNamedAccounts, 
    deployments, 
    getChainId, 
    getUnnamedAccounts
}) {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    const AstherusEarnTimelock = await ethers.getContract('AstherusEarnTimelock');
    const deployment = await deploy('AstherusEarnWithdrawVault_Implementation', {
        contract: "AstherusEarnWithdrawVault",
        from: deployer,
        args: [AstherusEarnTimelock.address],
        log: true, 
        skipIfAlreadyDeployed: false,
    });
};

module.exports.tags = ['AstherusEarnWithdrawVaultImplementation'];
module.exports.dependencies = [];

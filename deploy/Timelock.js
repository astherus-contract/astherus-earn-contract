const {TimeLockConfig} = require('../timelock.config.js');

module.exports = async function ({
    ethers, 
    getNamedAccounts, 
    deployments, 
    getChainId, 
    getUnnamedAccounts
}) {
    const {deploy} = deployments;
    const {deployer, proposer, executor} = await getNamedAccounts();

    const deployment = await deploy('Timelock', {
        contract: "Timelock",
        from: deployer, 
        args: [
            TimeLockConfig['default'].TimeLock.minDelay,
            TimeLockConfig['default'].TimeLock.maxDelay,
            [proposer],
            [executor],
        ], 
        log: true, 
        skipIfAlreadyDeployed: true,
    });
};

module.exports.tags = ['Timelock'];
module.exports.dependencies = [];

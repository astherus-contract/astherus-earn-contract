const {run} = require("hardhat");
const {TimeLockConfig} = require("../timelock.config");

module.exports = async function ({
    ethers, 
    getNamedAccounts, 
    deployments, 
    getChainId, 
    getUnnamedAccounts
}) {
    const {deployer, proposer, executor} = await getNamedAccounts();
    const Timelock = await ethers.getContract('Timelock');

    await run(
        "verify:verify", 
        {
            address: Timelock.address,
            constructorArguments: [
                TimeLockConfig['default'].TimeLock.minDelay,
                TimeLockConfig['default'].TimeLock.maxDelay,
                [proposer],
                [executor],
            ]
        }
    );
};

module.exports.tags = ['TimelockVerify'];
module.exports.dependencies = [];

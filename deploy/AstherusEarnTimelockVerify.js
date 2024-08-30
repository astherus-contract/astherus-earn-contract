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
    const AstherusEarnTimelock = await ethers.getContract('AstherusEarnTimelock');

    await run(
        "verify:verify", 
        {
            address: AstherusEarnTimelock.address,
            constructorArguments: [
                TimeLockConfig['default'].TimeLock.minDelay,
                TimeLockConfig['default'].TimeLock.maxDelay,
                [proposer],
                [executor],
            ]
        }
    );
};

module.exports.tags = ['AstherusEarnTimelockVerify'];
module.exports.dependencies = [];

module.exports = async function ({
    ethers, 
    getNamedAccounts, 
    deployments, 
    getChainId, 
    getUnnamedAccounts
}) {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    const BNB_CHAIN_TESTNET_WRAPPED = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd';
    const BNB_CHAIN_WRAPPED = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
    const deployment = await deploy('AstherusEarnVault_Implementation', {
        contract: "AstherusEarnVault",
        from: deployer, 
        args: [BNB_CHAIN_TESTNET_WRAPPED],
        log: true, 
        skipIfAlreadyDeployed: false,
    });
};

module.exports.tags = ['AstherusEarnVaultImplementation'];
module.exports.dependencies = [];

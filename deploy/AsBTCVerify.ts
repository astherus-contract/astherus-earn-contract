import {run} from "hardhat";

import {type DeployFunction} from 'hardhat-deploy/types'

const tag = 'asBTCVerify'

const name = 'Astherus BTC'
const symbol = 'asBTC'

const deploy: DeployFunction = async (hre) => {
    const {getNamedAccounts, deployments, ethers} = hre

    const {deployer} = await getNamedAccounts()

    const AssXXX = await ethers.getContract('asBTC');

    const endpointV2Deployment = await hre.deployments.get('EndpointV2')
    console.log(`EndpointV2: ${endpointV2Deployment.address}`)

    const timelock = await ethers.getContract('Timelock');

    await run(
        "verify:verify",
        {
            address: AssXXX.address,
            constructorArguments: [
                name, // name
                symbol, // symbol
                [], //_transferLimitConfigs
                endpointV2Deployment.address, // LayerZero's EndpointV2 address
                deployer, // _defaultAdmin
                timelock.address //timelock
            ]
        }
    );
}

deploy.tags = [tag]

export default deploy


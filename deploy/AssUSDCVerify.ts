import {run} from "hardhat";

import {type DeployFunction} from 'hardhat-deploy/types'

const tag = 'AssUSDCVerify'

const name = 'Astherus AssUSDC'
const symbol = 'AssUSDC'

const deploy: DeployFunction = async (hre) => {
    const {getNamedAccounts, deployments, ethers} = hre

    const {deployer} = await getNamedAccounts()

    const AssXXX = await ethers.getContract('AssXXX');

    const endpointV2Deployment = await hre.deployments.get('EndpointV2')
    console.log(`EndpointV2: ${endpointV2Deployment.address}`)

    await run(
        "verify:verify",
        {
            address: AssXXX.address,
            constructorArguments: [
                name, // name
                symbol, // symbol
                [], //_transferLimitConfigs
                endpointV2Deployment.address, // LayerZero's EndpointV2 address
                deployer, // owner
            ]
        }
    );
}

deploy.tags = [tag]

export default deploy


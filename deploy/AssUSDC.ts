import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'AssXXX'

const name='Astherus AssUSDC'
const symbol='AssUSDC'

const deploy: DeployFunction = async (hre) => {
    const {getNamedAccounts, deployments, ethers} = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    const endpointV2Deployment = await hre.deployments.get('EndpointV2')
    console.log(`EndpointV2: ${endpointV2Deployment.address}`)

    const timelock = await ethers.getContract('Timelock');

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            name, // name
            symbol, // symbol
            [], //_transferLimitConfigs
            endpointV2Deployment.address, // LayerZero's EndpointV2 address
            deployer, // _defaultAdmin
            timelock.address //timelock
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(`Deployed contract: ${symbol}, network: ${hre.network.name}, address: ${address}`)
}

deploy.tags = [symbol]

export default deploy

const path = require('path');
const fs = require('fs');
const prompt = require('prompt-sync')();
require("@nomicfoundation/hardhat-toolbox");

task("upgrade:WithdrawVault", "update WithdrawVault.sol contract")
    .setAction(async ({facets}) => {
        const WithdrawVault = await ethers.getContract('WithdrawVault')
        const WithdrawVaultImplementation = await ethers.getContract('WithdrawVault_Implementation');
        const Timelock = await ethers.getContract('Timelock');
        const provider = new ethers.providers.JsonRpcProvider(network.config.url);


        const storage = `0x${(BigInt(ethers.utils.id('eip1967.proxy.implementation'), 16) - 1n).toString(16)}`;
        const currentImplementation = ethers.utils.defaultAbiCoder.decode(['address'], await provider.getStorageAt(WithdrawVault.address, storage))[0];
        if (currentImplementation.toLowerCase() === WithdrawVaultImplementation.address.toLowerCase()) {
            console.log(`already updated. implementation: ${currentImplementation}`);
            return;
        }

        const ABI = '[{"inputs":[{"internalType":"address","name":"target","type":"address"},{"internalType":"string","name":"functionSignature","type":"string"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"executeTask","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"target","type":"address"},{"internalType":"string","name":"functionSignature","type":"string"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"scheduleTask","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
        const target = WithdrawVault.address;
        const functionSignature = 'upgradeToAndCall(address,bytes)';
        const data = '0x' + WithdrawVault.interface.encodeFunctionData('upgradeToAndCall', [WithdrawVaultImplementation.address, '0x']).substring(10);
        console.log(`ABI: ${ABI}`);
        console.log(`target: ${target}`);
        console.log(`functionSignature: ${functionSignature}`);
        console.log(`data: ${data}`);

        //console.log(`data: ${data}`);
        const signers = (await ethers.getSigners()).map(s => s.address);
        const {proposer, executor} = await ethers.getNamedSigners();
        const hasProposer = signers.includes(proposer.address);
        const hasExecutor = signers.includes(executor.address);
        if (hasProposer) {
            let tx = await Timelock.connect(proposer).scheduleTask(target, functionSignature, data);
            tx = await tx.wait();
            console.log(`schedule finish. txHash: ${tx.transactionHash}`);
        }
        if (hasExecutor) {
            const minDelay = Number(await Timelock.getMinDelay()) + 10;
            console.log(`delay ${minDelay} seconds for execute`);
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
            await delay(minDelay * 1000)
            let tx = await Timelock.connect(executor).executeTask(target, functionSignature, data);
            tx = await tx.wait();
            console.log(`execute finish. txHash: ${tx.transactionHash}`);
        }
    });

module.exports = {};


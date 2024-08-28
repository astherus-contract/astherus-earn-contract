const path = require('path');
const fs = require('fs');
const prompt = require('prompt-sync')();
require("@nomicfoundation/hardhat-toolbox");

task("upgrade:AstherusEarnVault", "update AstherusEarnVault contract")
    .setAction(async ({facets}) => {
        const AstherusEarnVault = await ethers.getContract('AstherusEarnVault')
        const AstherusEarnVaultImplementation = await ethers.getContract('AstherusEarnVault_Implementation');
        const AstherusEarnTimelock = await ethers.getContract('AstherusEarnTimelock');

        const storage = `0x${(BigInt(ethers.id('eip1967.proxy.implementation'), 16) - 1n).toString(16)}`;
        const currentImplementation = ethers.AbiCoder.defaultAbiCoder().decode(['address'], await ethers.provider.getStorage(AstherusEarnVault.target, storage))[0];
        if (currentImplementation.toLowerCase() === AstherusEarnVaultImplementation.target.toLowerCase()) {
            console.log(`already updated. implementation: ${currentImplementation}`);
            return;
        }
        const ABI = '[{"inputs":[{"internalType":"address","name":"target","type":"address"},{"internalType":"string","name":"functionSignature","type":"string"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"executeTask","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"target","type":"address"},{"internalType":"string","name":"functionSignature","type":"string"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"scheduleTask","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
        const target = AstherusEarnVault.target;
        const functionSignature = 'upgradeToAndCall(address,bytes)';
        const data = '0x' + AstherusEarnVault.interface.encodeFunctionData('upgradeToAndCall', [AstherusEarnVaultImplementation.target, '0x']).substring(10);
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
            let tx = await AstherusEarnTimelock.connect(proposer).scheduleTask(target, functionSignature, data);
            tx = await tx.wait();
            console.log(`schedule finish. txHash: ${tx.hash}`);
        }
        if (hasExecutor) {
            const minDelay = Number(await AstherusEarnTimelock.getMinDelay()) + 10;
            console.log(`delay ${minDelay} seconds for execute`);
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
            await delay(minDelay * 1000) 
            let tx = await AstherusEarnTimelock.connect(executor).executeTask(target, functionSignature, data);
            tx = await tx.wait();
            console.log(`execute finish. txHash: ${tx.hash}`);
        }
    });

module.exports = {};


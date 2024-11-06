const path = require('path');
const fs = require('fs');
const prompt = require('prompt-sync')();
require("@nomicfoundation/hardhat-toolbox");

//秒
// const maxDelay = 2 * 24 * 60 * 60

const minDelay = 6 * 60 * 60



task("change:timelock_min_delay", "change timelock_min_delay")
    .setAction(async ({facets}) => {
        const Contract = await ethers.getContract('Timelock');
        const Timelock = await ethers.getContract('Timelock');
        const provider = new ethers.providers.JsonRpcProvider(network.config.url);

        const target = Contract.address;
        const functionSignature = 'updateDelay(uint256)';
        const data = '0x' + Contract.interface.encodeFunctionData('updateDelay', [minDelay]).substring(10);

        // const functionSignature = 'setMaxDelay(uint256)';
        // const data = '0x' + Contract.interface.encodeFunctionData('setMaxDelay', [maxDelay]).substring(10);


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


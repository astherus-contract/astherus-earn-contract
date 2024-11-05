const path = require('path');
const fs = require('fs');
const prompt = require('prompt-sync')();
require("@nomicfoundation/hardhat-toolbox");

//CANCELLER_ROLE
const role='0xfd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783'
//EXECUTOR_ROLE
//const role='0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63'
//PROPOSER_ROLE
//const role='0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1'

//多签地址
const address = '';

task("grantRole:timelock", "grantRole for timelock")
    .setAction(async ({facets}) => {
        const Timelock = await ethers.getContract('Timelock');
        const provider = new ethers.providers.JsonRpcProvider(network.config.url);

        const target = Timelock.address;
        const functionSignature = 'grantRole(bytes32,address)';
        const data = '0x' + Timelock.interface.encodeFunctionData('grantRole', [role, address]).substring(10);

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


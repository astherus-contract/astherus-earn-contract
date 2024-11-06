const path = require('path');
const fs = require('fs');
const prompt = require('prompt-sync')();
require("@nomicfoundation/hardhat-toolbox");

//BOT_ROLE
// const role='0x6d5c9827c1f410bbb61d3b2a0a34b6b30492d9a1fd38588edca7ec4562ab9c9b'

//ADMIN_ROLE
// const role='0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775'

//PAUSE_ROLE
// const role='0x139c2898040ef16910dc9f44dc697df79363da767d8bc92f2e310312b816e46d'


const address = '';

task("grantRole:earn", "grantRole for earn")
    .setAction(async ({facets}) => {
        const Earn = await ethers.getContract('Earn')
        const Timelock = await ethers.getContract('Timelock');
        const provider = new ethers.providers.JsonRpcProvider(network.config.url);

        const target = Earn.address;
        const functionSignature = 'grantRole(bytes32,address)';
        const data = '0x' + Earn.interface.encodeFunctionData('grantRole', [role, address]).substring(10);

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


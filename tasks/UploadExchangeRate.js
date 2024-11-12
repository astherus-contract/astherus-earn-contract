const path = require('path');
const fs = require('fs');
const prompt = require('prompt-sync')();
require("@nomicfoundation/hardhat-toolbox");

task("uploadExchangeRate", "uploadExchangeRate")
    .setAction(async ({facets}) => {
        const Earn = await ethers.getContract('Earn');
        const AssBTC = await ethers.getContract('AssBTC');

        const {deployer} = await ethers.getNamedSigners();
        const provider = new ethers.providers.JsonRpcProvider(network.config.url);

        const values = [[
            [AssBTC.address, 100000001, (await provider.getBlock()).timestamp + 60 * 60 * 24 * 30]
        ], 1735660800]

        const types = ["tuple(address, uint256,uint256)[]", "uint256"];

        const encodeData = ethers.utils.defaultAbiCoder.encode(types, values);
        const messageHash = ethers.utils.keccak256(encodeData);

        console.log(`message=${encodeData}`);

        const signature = await deployer.signMessage(ethers.utils.arrayify(messageHash));

        console.log(`signature=${signature}`);

        const recoveredAddress = ethers.utils.verifyMessage(ethers.utils.arrayify(messageHash), signature);
        console.log(`recoveredAddress=${recoveredAddress}`);

        let tx = await Earn.connect(deployer).uploadExchangeRate(encodeData, signature);
        tx = await tx.wait();
        console.log(`uploadExchangeRate finish. txHash: ${tx.transactionHash}`);
    });

module.exports = {};


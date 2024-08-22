require("dotenv/config")
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-ethers");
require('hardhat-deploy');
require("hardhat-deploy-ethers");
require('hardhat-abi-exporter');

const fs = require("fs");
const accounts = [];
(async function() {
    const file = '.secret';
    try {
        var info = fs.statSync(file);
        if (!info.isDirectory()) {
            const content = fs.readFileSync(file, 'utf8');
            let lines = content.split('\n');
            for (let index = 0; index < lines.length; index++) {
                let line = lines[index];
                if (line == undefined || line == '') {
                    continue;
                }
                if (!line.startsWith('0x') || !line.startsWith('0x')) {
                    line = '0x' + line;
                }
                accounts.push(line);
            }
        }
    } catch(err) {
    }
})()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.25",
        settings: {
            optimizer: {
                enabled: true,
                runs: 90000000
            }
        }
    },
    namedAccounts: {
        deployer: {
            default: 0,
            56: '0xee19c397d3c467065482b19bd612A585a0Dcc198',
            1: '0xee19c397d3c467065482b19bd612A585a0Dcc198'
        },
        multisig: {
            default: '0xafaaddc7f7af9ebd3cb7458689c67750021205ff',
            56: '0xa8c0C6Ee62F5AD95730fe23cCF37d1c1FFAA1c3f',
            1: '0x1FE3Fe2Ddd19AB58B0c56054a5AF217Afb27eCEA'
        },
        alex: '0xE90F9596e3Bfd49e9f4c2E0eA48830DC47e6997b',
        signer: {
            default: 0,
            56: '0xc0ea6bcf47b7e5c8db54e27608c30038db1a8681',
            1: '0x58eeebfd2a03083023c8894e7150a7931f2ca5af'
        }
    },
    networks: {
        hardhat: {
            forking: {
                enabled: process.env.FORKING_ENABLED ? true : false,
                url: process.env.FORKING_URL ? process.env.FORKING_URL : "",
                blockNumber: process.env.FORKING_BLOCK_NUMBER,
            },
            tags: ["local"],
        },
        bscTestnet: {
            url: "https://bsc-testnet.nodereal.io/v1/a8b33fb257454456a1fbf28404a75070",
            accounts: accounts,
            tags: ['testnet']
        },
        arbitrumSepolia: {
            url: "https://arbitrum-sepolia.blockpi.network/v1/rpc/4666c5c0d05d6d2937c393ef0d3a7670686d9484",
            accounts: accounts,
            tags: ['testnet']
        },
        sepolia: {
            url: "https://1rpc.io/sepolia",
            accounts: accounts,
            tags: ['testnet']
        },
        bsc: {
            url: "https://bsc-mainnet.nodereal.io/v1/f3eb169f671348bf9cdb16c1b05798c8",
            accounts: accounts,
            tags: ['mainnet']
        },
        arbitrumOne: {
            url: "https://open-platform.nodereal.io/633b481108014b1d83948275252c1c2c/arbitrum-nitro",
            accounts: accounts,
            // gasMultiplier: 1.35,
            tags: ['mainnet']
        },
        mainnet: {
            url: "https://eth-pokt.nodies.app",
            accounts: accounts,
            tags: ['mainnet']
        }
    },
    sourcify: {
        // 无需指定 API key
        // 默认关闭。
        enabled: true
    },
    etherscan: {
        // npx hardhat verify --network sepolia <address> <Constructor argument>
        apiKey: {
            // 查看有哪些 apiKey 配置的命令: npx hardhat verify --list-networks
            bsc: "TDID7NM35CIQ35RU4TUV5XQV9GBDKCBJYI",
            bscTestnet: "TDID7NM35CIQ35RU4TUV5XQV9GBDKCBJYI",
            arbitrumOne: "P2VMXQIWGWYHE95AHGAFT1P1IN37FJZUB2",
            arbitrumSepolia: "P2VMXQIWGWYHE95AHGAFT1P1IN37FJZUB2",
            sepolia: "A6KG1SUCYWFDX5MC6YMR7TD1IYNRNMVKPD",
            mainnet: "A6KG1SUCYWFDX5MC6YMR7TD1IYNRNMVKPD"
        },
        // 要了解如何添加自定义网络，请按照以下说明操作： https://hardhat.org/verify-custom-networks
        // customChains: [{
        //     network: "opbnb", chainId: 204,
        //     urls: {
        //         apiURL: "https://api-opbnb.bscscan.com/api",
        //         browserURL: "https://opbnb.bscscan.com",
        //         // 在 https://opbnbscan.com 上验证时使用下面两个
        //         // apiURL: "https://open-platform.nodereal.io/601cc1bd40144cfdbbca9a9f6c2a61f0/op-bnb-mainnet/contract/",
        //         // browserURL: "https://opbnbscan.com"
        //     }
        // }, {
        //     network: "opbnbTestnet", chainId: 5611,
        //     urls: {
        //         apiURL: "https://api-opbnb-testnet.bscscan.com/api",
        //         browserURL: "https://opbnb-testnet.bscscan.com",
        //         // 在 https://testnet.opbnbscan.com 上验证时使用下面两个
        //         // apiURL: "https://open-platform.nodereal.io/7c6721489d57430fbe12e979e3248c8c/op-bnb-testnet/contract/",
        //         // browserURL: "https://testnet.opbnbscan.com"
        //     }
        // }]
    }
};

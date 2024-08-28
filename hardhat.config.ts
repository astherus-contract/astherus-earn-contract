// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
import 'dotenv/config'

import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-ethers";
import '@layerzerolabs/toolbox-hardhat'
import 'hardhat-deploy';
import "hardhat-deploy-ethers";
import 'hardhat-abi-exporter';
require('./tasks/index.js');

import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'
import { EndpointId } from '@layerzerolabs/lz-definitions'


// Set your preferred authentication method
//
// If you prefer using a mnemonic, set a MNEMONIC environment variable
// to a valid mnemonic
const MNEMONIC = process.env.MNEMONIC

// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY

const accounts: HttpNetworkAccountsUserConfig | undefined = MNEMONIC
    ? { mnemonic: MNEMONIC }
    : PRIVATE_KEY
      ? [PRIVATE_KEY]
      : undefined

if (accounts == null) {
    console.warn(
        'Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example.'
    )
}

const config: HardhatUserConfig = {
    paths: {
        cache: 'cache/hardhat',
    },
    solidity: {
        compilers: [
            {
                version: '0.8.22',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        'bscTestnet': {
            eid: EndpointId.BSC_TESTNET,
            url: process.env.RPC_URL_SEPOLIA || 'https://data-seed-prebsc-1-s1.bnbchain.org:8545/',
            accounts,
            tags: ['testnet']
        },
        'bscTestnet-BTC': {
            eid: EndpointId.BSC_TESTNET,
            url: process.env.RPC_URL_SEPOLIA || 'https://data-seed-prebsc-1-s1.bnbchain.org:8545/',
            accounts,
            tags: ['testnet']
        },
        'bscTestnet-BNB': {
            eid: EndpointId.BSC_TESTNET,
            url: process.env.RPC_URL_SEPOLIA || 'https://data-seed-prebsc-1-s1.bnbchain.org:8545/',
            accounts,
            tags: ['testnet']
        },
        'bscTestnet-USDT': {
            eid: EndpointId.BSC_TESTNET,
            url: process.env.RPC_URL_SEPOLIA || 'https://data-seed-prebsc-1-s1.bnbchain.org:8545/',
            accounts,
            tags: ['testnet']
        },
        'bscTestnet-USDC': {
            eid: EndpointId.BSC_TESTNET,
            url: process.env.RPC_URL_SEPOLIA || 'https://data-seed-prebsc-1-s1.bnbchain.org:8545/',
            accounts,
            tags: ['testnet']
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, // wallet address of index[0], of the mnemonic in .env
        },
        multisig: {
            default: '0xf4903f4544558515b26ec4C6D6e91D2293b27275',
            56: '0xa8c0C6Ee62F5AD95730fe23cCF37d1c1FFAA1c3f',
            1: '0x1FE3Fe2Ddd19AB58B0c56054a5AF217Afb27eCEA'
        },
        proposer: {
            default: '0xf4903f4544558515b26ec4C6D6e91D2293b27275',
            56: '0xa8c0C6Ee62F5AD95730fe23cCF37d1c1FFAA1c3f',
            1: '0x1FE3Fe2Ddd19AB58B0c56054a5AF217Afb27eCEA'
        },
        executor: {
            default: '0xf4903f4544558515b26ec4C6D6e91D2293b27275',
            56: '0xa8c0C6Ee62F5AD95730fe23cCF37d1c1FFAA1c3f',
            1: '0x1FE3Fe2Ddd19AB58B0c56054a5AF217Afb27eCEA'
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
}

export default config

// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
import 'dotenv/config'

import 'hardhat-deploy'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import '@layerzerolabs/toolbox-hardhat'
import 'hardhat-abi-exporter'
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
    },
}

export default config

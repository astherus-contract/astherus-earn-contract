import {EndpointId} from "@layerzerolabs/lz-definitions";

const bscTestnet_USDCContract = {
    eid: EndpointId.BSC_V2_TESTNET,
    contractName: "AssXXX"
};
const sepoliaTestnet_USDCContract = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: "AssXXX"
};
export default {
    contracts: [{contract: bscTestnet_USDCContract}, {contract: sepoliaTestnet_USDCContract}],
    connections: [{
        from: bscTestnet_USDCContract,
        to: sepoliaTestnet_USDCContract,
        config: {
            sendLibrary: "0x55f16c442907e86D764AFdc2a07C2de3BdAc8BB7",
            receiveLibraryConfig: {receiveLibrary: "0x188d4bbCeD671A7aA2b5055937F79510A32e9683", gracePeriod: 0},
            sendConfig: {
                executorConfig: {
                    maxMessageSize: 10000,
                    executor: "0x31894b190a8bAbd9A067Ce59fde0BfCFD2B18470"
                },
                ulnConfig: {
                    confirmations: 5,
                    requiredDVNs: ["0x0eE552262f7B562eFcED6DD4A7e2878AB897d405"],
                    optionalDVNs: [],
                    optionalDVNThreshold: 0
                }
            },
            receiveConfig: {
                ulnConfig: {
                    confirmations: 2,
                    requiredDVNs: ["0x0eE552262f7B562eFcED6DD4A7e2878AB897d405"],
                    optionalDVNs: [],
                    optionalDVNThreshold: 0
                }
            }
        }
    }, {
        from: sepoliaTestnet_USDCContract,
        to: bscTestnet_USDCContract,
        config: {
            sendLibrary: "0xcc1ae8Cf5D3904Cef3360A9532B477529b177cCE",
            receiveLibraryConfig: {receiveLibrary: "0xdAf00F5eE2158dD58E0d3857851c432E34A3A851", gracePeriod: 0},
            sendConfig: {
                executorConfig: {
                    maxMessageSize: 10000,
                    executor: "0x718B92b5CB0a5552039B593faF724D182A881eDA"
                },
                ulnConfig: {
                    confirmations: 2,
                    requiredDVNs: ["0x8eebf8b423B73bFCa51a1Db4B7354AA0bFCA9193"],
                    optionalDVNs: [],
                    optionalDVNThreshold: 0
                }
            },
            receiveConfig: {
                ulnConfig: {
                    confirmations: 5,
                    requiredDVNs: ["0x8eebf8b423B73bFCa51a1Db4B7354AA0bFCA9193"],
                    optionalDVNs: [],
                    optionalDVNThreshold: 0
                }
            }
        }
    }]
};

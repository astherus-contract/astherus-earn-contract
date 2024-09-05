import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const bsctestContract: OmniPointHardhat = {
    eid: EndpointId.BSC_V2_TESTNET,
    contractName: 'AssXXX',
}

const sepoliaContract: OmniPointHardhat = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'AssXXX',
}

const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: bsctestContract,
        },
        {
            contract: sepoliaContract,
        },
    ],
    connections: [
        {
            from: bsctestContract,
            to: sepoliaContract,
        },
        {
            from: sepoliaContract,
            to: bsctestContract,
        },
    ],
}

export default config

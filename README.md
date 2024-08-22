# 安装依赖
pnpm install

# mac 安装 forge
npm install -g @forge/cli
foundryup

# 编译
pnpm compile

# 生成abi
npx hardhat export-abi

# 代理合约部署
hardhat deploy --network bscTestnet --tags AstherusEarnVault

# 验证合约
hardhat deploy --network bscTestnet --tags AstherusEarnVaultVerify

# 合约升级
hardhat deploy --network bscTestnet --tags AstherusEarnVaultImplementation

# AssXXX 部署
hardhat deploy --network bscTestnet-BTC --tags AssXXX
hardhat deploy --network bscTestnet-BNB --tags AssBNB
hardhat deploy --network bscTestnet-USDT --tags AssUSDT
hardhat deploy --network bscTestnet-USDC --tags AssUSDC

# 部署测试asset BTC BNB USDT USDC
hardhat deploy --network bscTestnet-BNB --tags BNBTest
hardhat deploy --network bscTestnet-BTC --tags BTCTest
hardhat deploy --network bscTestnet-USDT --tags USDTTest
hardhat deploy --network bscTestnet-USDC --tags USDCTest


# verify

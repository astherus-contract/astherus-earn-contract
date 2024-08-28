# 安装依赖
pnpm install

# mac 安装 forge
npm install -g @forge/cli
foundryup

# 编译
pnpm compile

# 生成abi
npx hardhat export-abi

# 时间锁合约
hardhat deploy --network bscTestnet --tags AstherusEarnTimelock

# 代理合约部署
hardhat deploy --network bscTestnet --tags AstherusEarnVault

# 验证合约
hardhat deploy --network bscTestnet --tags AstherusEarnTimelockVerify
hardhat deploy --network bscTestnet --tags AstherusEarnVaultVerify

# 合约升级
hardhat deploy --network bscTestnet --tags AstherusEarnVaultImplementation

# AssXXX 部署
hardhat deploy --network bscTestnet-BTC --tags AssXXX
hardhat deploy --network bscTestnet-BNB --tags AssXXX
hardhat deploy --network bscTestnet-USDT --tags AssXXX
hardhat deploy --network bscTestnet-USDC --tags AssXXX

# 部署测试asset BTC BNB USDT USDC
hardhat deploy --network bscTestnet-BNB --tags BNBTest
hardhat deploy --network bscTestnet-BTC --tags BTCTest
hardhat deploy --network bscTestnet-USDT --tags USDTTest
hardhat deploy --network bscTestnet-USDC --tags USDCTest


# 测试合约升级
npx hardhat upgrade:AstherusEarnVault --network bscTestnet


# 分配权限


# 注意
如果执行脚本报错,TypeError: Cannot read properties of undefined (reading 'JsonRpcProvider') 注释 hardhat.config.ts 文件中的  import '@layerzerolabs/toolbox-hardhat'
因为 它与@nomicfoundation/hardhat-ethers有冲突
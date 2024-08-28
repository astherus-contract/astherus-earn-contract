### 安装依赖

```shell
pnpm install
```

### mac 安装 forge
```shell
npm install -g @forge/cli
foundryup
```

### 编译
```shell
pnpm compile
```

### 生成abi：
npx hardhat 尝试使用全局安装的 Hardhat，但 Hardhat 需要在本地项目中安装才能正常工作
```shell
pnpm install --save-dev hardhat
npx hardhat export-abi
```

# 时间锁合约
```shell
npx hardhat deploy --network bscTestnet --tags AstherusEarnTimelock
```

### 代理合约部署
```shell
npx hardhat deploy --network bscTestnet --tags AstherusEarnVault
```

# 验证合约
```shell
npx hardhat deploy --network bscTestnet --tags AstherusEarnTimelockVerify
npx hardhat deploy --network bscTestnet --tags AstherusEarnVaultVerify
```

# 合约升级
hardhat deploy --network bscTestnet --tags AstherusEarnVaultImplementation

# AssXXX 部署
```shell
npx hardhat deploy --network bscTestnet-BTC --tags AssXXX
npx hardhat deploy --network bscTestnet-BNB --tags AssXXX
npx hardhat deploy --network bscTestnet-USDT --tags AssXXX
npx hardhat deploy --network bscTestnet-USDC --tags AssXXX
```


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
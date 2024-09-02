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

### 代理合约部署[AstherusEarnWithdrawVault]
```shell
npx hardhat deploy --network bscTestnet --tags AstherusEarnWithdrawVault
```


### 代理合约部署[AstherusEarnVault]
```shell
npx hardhat deploy --network bscTestnet --tags AstherusEarnVault
```

# 验证合约
```shell
npx hardhat deploy --network bscTestnet --tags AstherusEarnTimelockVerify
```
```shell
npx hardhat deploy --network bscTestnet --tags AstherusEarnWithdrawVaultVerify
```
```shell
npx hardhat deploy --network bscTestnet --tags AstherusEarnVaultVerify
```

# 合约升级
```shell
hardhat deploy --network bscTestnet --tags AstherusEarnWithdrawVaultImplementation
```

```shell
hardhat deploy --network bscTestnet --tags AstherusEarnVaultImplementation
```

# AssXXX 部署
```shell
npx hardhat deploy --network bscTestnet-BTC --tags AssBTC
```
```shell
npx hardhat deploy --network bscTestnet-BNB --tags AssBNB
```
```shell
npx hardhat deploy --network bscTestnet-USDT --tags AssUSDT
```
```shell
npx hardhat deploy --network bscTestnet-USDC --tags AssUSDC
```


# 部署测试asset BTC BNB USDT USDC
```shell
hardhat deploy --network bscTestnet-BNB --tags BNBTest
```
```shell
hardhat deploy --network bscTestnet-BTC --tags BTCTest
```
```shell
hardhat deploy --network bscTestnet-USDT --tags USDTTest
```
```shell
hardhat deploy --network bscTestnet-USDC --tags USDCTest
```

# 测试合约升级
```shell
npx hardhat upgrade:AstherusEarnWithdrawVault --network bscTestnet
```

```shell
npx hardhat upgrade:AstherusEarnVault --network bscTestnet
```

# 分配权限
## AssXXX 合约
grantRole: 把 AstherusEarnVault合约地址加到 MINTER_AND_BURN_ROLE 角色下
approve: 授权spender(AstherusEarnVault合约地址)使用多少数量的token

## XXX 合约
approve: 授权spender(AstherusEarnVault合约地址)使用多少数量的token


## AstherusEarnVault
grantRole: 把 bot(后端发起交易地址)地址加到 BOT_ROLE 角色下


#
[{"assTokenAddress":"0x9746235a82B3ca8D28E25CeD9344f04dC5ff42f0","sourceTokenAmount":"1000000000000000000","requestWithdrawNo":2,"receipt":"0xf4903f4544558515b26ec4C6D6e91D2293b27275"}]
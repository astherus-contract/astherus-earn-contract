// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import {ZERO, ONE, UC, uc, into} from "unchecked-counter/src/UC.sol";
import "./interface/IAss.sol";
import "./interface/IAstherusEarnWithdrawVault.sol";


contract AstherusEarnVault is Initializable, PausableUpgradeable, AccessControlEnumerableUpgradeable, UUPSUpgradeable, ReentrancyGuardUpgradeable {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAUSE_ROLE = keccak256("PAUSE_ROLE");
    bytes32 public constant BOT_ROLE = keccak256("BOT_ROLE");


    using Address for address payable;
    using SafeERC20 for IERC20;

    event AddToken(address indexed assTokenAddress, address indexed sourceTokenAddress);
    event UpdateDepositEnabled(address indexed assTokenAddress, bool oldDepositEnabled, bool newDepositEnabled);
    event UpdateWithdrawEnabled(address indexed assTokenAddress, bool oldWithdrawEnabled, bool newWithdrawEnabled);
    event UpdateCeffuAddress(address indexed assTokenAddress, address oldCeffuAddress, address newCeffuAddress);
    event UpdateTransferToCeffuEnabled(address indexed assTokenAddress, bool oldTransferToCeffuEnabled, bool newTransferToCeffuEnabled);
    event MintAssXXX(address indexed sender, address indexed sourceTokenAddress, address indexed assTokenAddress, uint256 amountIn, uint256 assXXXAmount, uint256 assToSourceExchangeRate);
    event TransferToCeffu(address indexed sourceTokenAddress, uint256 sourceTokenAmount, address sefu);
    event UploadExchangeRate(address indexed assTokenAddress, uint256 assToSourceExchangeRate, uint256 exchangeRateExpiredTimestamp);
    event RequestWithdraw(address indexed from, address indexed assTokenAddress, uint256 assTokenAmount, uint256 requestWithdrawNo);
    event DistributeWithdraw(address indexed assTokenAddress, address indexed sourceTokenAddress, uint256 assTokenAmount, uint256 sourceTokenAmount, uint256 requestWithdrawNo);
    event ClaimWithdraw(address indexed receipt, address indexed assTokenAddress, address indexed sourceTokenAddress, uint256 assTokenAmount, uint256 sourceTokenAmount, uint256 requestWithdrawNo);


    struct Token {
        //assTokenDecimals=18
        address assTokenAddress;
        address sourceTokenAddress;
        uint8 sourceTokenDecimals;
        //assToSourceExchangeRate Decimals=8;assToSourceExchangeRate= XXX amount/(assXXX total supply)
        uint256 assToSourceExchangeRate;
        uint256 exchangeRateExpiredTimestamp;
        bool depositEnabled;
        bool withdrawEnabled;
        address ceffuAddress;
        bool transferToCeffuEnabled;
    }

    struct ExchangeRateInfo {
        address assTokenAddress;
        uint256 assToSourceExchangeRate;
        uint256 exchangeRateExpiredTimestamp;
    }

    struct DistributeWithdrawInfo {
        address assTokenAddress;
        uint256 sourceTokenAmount;
        uint256 requestWithdrawNo;
        address receipt;
    }

    struct RequestWithdrawInfo {
        address assTokenAddress;
        uint256 assTokenAmount;
        uint256 sourceTokenAmount;
        uint256 applyTimestamp;
        bool canClaimWithdraw;
    }


    address public immutable TIMELOCK_ADDRESS;
    address public immutable  NATIVE_WRAPPED;
    address public immutable WITHDRAW_VAULT;

    mapping(address => Token) public supportAssToken;
    mapping(address => address) public supportSourceToken;
    mapping(address => uint256) public sourceTokenTreasury;
    mapping(address => uint256) public lastMintedAt;
    mapping(address => mapping(uint256 => RequestWithdrawInfo)) public requestWithdraws;

    uint256 private requestWithdrawMaxNo;
    IAstherusEarnWithdrawVault private _withdrawVault;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address nativeWrapped, address timelockAddress, address withdrawVault) {
        NATIVE_WRAPPED = nativeWrapped;
        TIMELOCK_ADDRESS = timelockAddress;
        WITHDRAW_VAULT = withdrawVault;
        _withdrawVault = IAstherusEarnWithdrawVault(withdrawVault);
        _disableInitializers();
    }

    modifier onlyTImelock() {
        require(msg.sender == TIMELOCK_ADDRESS, "only timelock");
        _;
    }

    function initialize(address defaultAdmin) initializer public {
        __Pausable_init();
        __AccessControlEnumerable_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ADMIN_ROLE, defaultAdmin);
        _grantRole(PAUSE_ROLE, defaultAdmin);
    }

    function pause() external onlyRole(PAUSE_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSE_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation) internal onlyTImelock override {}

    function addToken(
        address assTokenAddress,
        address sourceTokenAddress,
        address ceffuAddress,
        uint256 exchangeRateExpiredTimestamp,
        bool depositEnabled,
        bool withdrawEnabled,
        bool transferToCeffuEnabled
    ) external onlyRole(ADMIN_ROLE) {
        require(assTokenAddress != address(0), "assTokenAddress cannot be a zero address");
        require(sourceTokenAddress != address(0), "sourceTokenAddress cannot be a zero address");
        require(ceffuAddress != address(0), "ceffuAddress cannot be a zero address");

        uint8 correctDecimals = IERC20Metadata(sourceTokenAddress).decimals();

        Token storage token = supportAssToken[assTokenAddress];
        require(token.assTokenAddress == address(0), "duplicate add");
        require(supportSourceToken[sourceTokenAddress] == address(0), "duplicate add");

        token.assTokenAddress = assTokenAddress;
        token.sourceTokenAddress = sourceTokenAddress;
        token.ceffuAddress = ceffuAddress;
        token.sourceTokenDecimals = correctDecimals;
        token.assToSourceExchangeRate = 1e8;
        token.exchangeRateExpiredTimestamp = exchangeRateExpiredTimestamp;
        token.depositEnabled = depositEnabled;
        token.withdrawEnabled = withdrawEnabled;
        token.transferToCeffuEnabled = transferToCeffuEnabled;

        supportSourceToken[token.sourceTokenAddress] = assTokenAddress;

        emit AddToken(assTokenAddress, sourceTokenAddress);
    }

    function updateDepositEnabled(address assTokenAddress, bool enabled) external onlyRole(ADMIN_ROLE) {
        require(assTokenAddress != address(0), "assTokenAddress cannot be a zero address");

        Token storage token = supportAssToken[assTokenAddress];
        require(token.assTokenAddress != address(0), "not exist");

        bool oldDepositEnabled = token.depositEnabled;

        token.depositEnabled = enabled;

        emit UpdateDepositEnabled(assTokenAddress, oldDepositEnabled, token.depositEnabled);
    }

    function updateWithdrawEnabled(address assTokenAddress, bool enabled) external onlyRole(ADMIN_ROLE) {
        require(assTokenAddress != address(0), "assTokenAddress cannot be a zero address");

        Token storage token = supportAssToken[assTokenAddress];
        require(token.assTokenAddress != address(0), "not exist");

        bool oldWithdrawEnabled = token.withdrawEnabled;

        token.withdrawEnabled = enabled;

        emit UpdateWithdrawEnabled(assTokenAddress, oldWithdrawEnabled, token.withdrawEnabled);
    }

    function updateCeffuAddress(address assTokenAddress, address ceffuAddress) external onlyRole(ADMIN_ROLE) {
        require(assTokenAddress != address(0), "assTokenAddress cannot be a zero address");
        require(ceffuAddress != address(0), "ceffuAddress cannot be a zero address");

        Token storage token = supportAssToken[assTokenAddress];
        require(token.assTokenAddress != address(0), "not exist");

        address oldCeffuAddress = token.ceffuAddress;

        token.ceffuAddress = ceffuAddress;

        emit UpdateCeffuAddress(assTokenAddress, oldCeffuAddress, token.ceffuAddress);
    }

    function updateTransferToCeffuEnabled(address assTokenAddress, bool enabled) external onlyRole(ADMIN_ROLE) {
        require(assTokenAddress != address(0), "assTokenAddress cannot be a zero address");

        Token storage token = supportAssToken[assTokenAddress];
        require(token.assTokenAddress != address(0), "not exist");

        bool oldTransferToCeffuEnabled = token.transferToCeffuEnabled;

        token.transferToCeffuEnabled = enabled;

        emit UpdateWithdrawEnabled(assTokenAddress, oldTransferToCeffuEnabled, token.transferToCeffuEnabled);
    }

    function deposit(address sourceTokenAddress, uint256 amountIn) external nonReentrant whenNotPaused {
        _mintAssXXX(sourceTokenAddress, amountIn);
    }

    function depositNative() external payable nonReentrant whenNotPaused {
        uint256 amount = msg.value;
        _mintAssXXX(NATIVE_WRAPPED, amount);
    }

    function _mintAssXXX(address sourceTokenAddress, uint256 amountIn) private {
        require(sourceTokenAddress != address(0), "sourceTokenAddress cannot be a zero address");
        require(amountIn > 0, 'invalid amount');

        address assTokenAddress = supportSourceToken[sourceTokenAddress];
        require(assTokenAddress != address(0), "currency not support");

        Token storage token = supportAssToken[assTokenAddress];
        require(token.depositEnabled == true, "pause deposit");
        require(block.timestamp < token.exchangeRateExpiredTimestamp, "exchange rate expired");

        //assToSourceExchangeRate=token.assToSourceExchangeRate # XXX amount/(assXXX total supply)
        //assXXXAmount=1/(assToSourceExchangeRate/1e8) * amountIn/(10 ** token.sourceTokenDecimals) * 1e18
        uint256 assXXXAmount = amountIn * 1e26 / (token.assToSourceExchangeRate * (10 ** token.sourceTokenDecimals));

        _transferToVault(msg.sender, sourceTokenAddress, amountIn);
        sourceTokenTreasury[sourceTokenAddress] += amountIn;

        lastMintedAt[msg.sender] = block.timestamp;
        IAss(assTokenAddress).mint(msg.sender, assXXXAmount);
        emit MintAssXXX(msg.sender, sourceTokenAddress, token.assTokenAddress, amountIn, assXXXAmount, token.assToSourceExchangeRate);
    }

    function transferToCeffu(address[] calldata assTokenAddressList) external nonReentrant onlyRole(BOT_ROLE) {
        uint256 length = assTokenAddressList.length;
        for (UC i = ZERO; i < uc(length); i = i + ONE) {
            address assTokenAddress = assTokenAddressList[i.into()];
            Token storage token = supportAssToken[assTokenAddress];

            if (token.transferToCeffuEnabled) {
                require(token.ceffuAddress != address(0), "ceffuAddress cannot be a zero address");
                uint256 amount = _transferToCeffu(token.ceffuAddress, token.sourceTokenAddress);
                emit TransferToCeffu(token.sourceTokenAddress, amount, token.ceffuAddress);
            }
        }
    }

    function uploadExchangeRate(ExchangeRateInfo[] calldata exchangeRateInfoList) external nonReentrant onlyRole(BOT_ROLE) {
        uint256 length = exchangeRateInfoList.length;
        for (UC i = ZERO; i < uc(length); i = i + ONE) {
            ExchangeRateInfo calldata exchangeRateInfo = exchangeRateInfoList[i.into()];

            Token storage token = supportAssToken[exchangeRateInfo.assTokenAddress];
            require(token.assTokenAddress != address(0), "not exist");

            token.assToSourceExchangeRate = exchangeRateInfo.assToSourceExchangeRate;
            token.exchangeRateExpiredTimestamp = exchangeRateInfo.exchangeRateExpiredTimestamp;
            emit UploadExchangeRate(token.assTokenAddress, token.assToSourceExchangeRate, token.exchangeRateExpiredTimestamp);
        }
    }

    function requestWithdraw(address assTokenAddress, uint256 assTokenAmount) external nonReentrant whenNotPaused {
        require(assTokenAddress != address(0), "sourceTokenAddress cannot be a zero address");
        require(assTokenAmount > 0, 'invalid amount');

        Token storage token = supportAssToken[assTokenAddress];
        require(token.assTokenAddress != address(0), "currency not support");
        require(token.withdrawEnabled == true, "pause withdraw");

        uint256 assTokenBalance = IERC20(assTokenAddress).balanceOf(msg.sender);
        require(assTokenAmount <= assTokenBalance, "insufficient balance");

        _lock(msg.sender, assTokenAddress, assTokenAmount);

        requestWithdrawMaxNo += 1;
        RequestWithdrawInfo memory requestWithdrawInfo = RequestWithdrawInfo({
            assTokenAddress: assTokenAddress,
            assTokenAmount: assTokenAmount,
            applyTimestamp: block.timestamp,
            sourceTokenAmount: 0,
            canClaimWithdraw: false
        });
        requestWithdraws[msg.sender][requestWithdrawMaxNo] = requestWithdrawInfo;

        emit RequestWithdraw(msg.sender, assTokenAddress, assTokenAmount, requestWithdrawMaxNo);
    }

    function distributeWithdraw(DistributeWithdrawInfo[] calldata distributeWithdrawInfoList) external nonReentrant whenNotPaused onlyRole(BOT_ROLE) {
        uint256 length = distributeWithdrawInfoList.length;
        for (UC i = ZERO; i < uc(length); i = i + ONE) {
            DistributeWithdrawInfo calldata distributeWithdrawInfo = distributeWithdrawInfoList[i.into()];
            Token storage token = supportAssToken[distributeWithdrawInfo.assTokenAddress];
            require(token.assTokenAddress != address(0), "not exist");
            require(token.withdrawEnabled == true, "pause withdraw");

            RequestWithdrawInfo storage requestWithdrawInfo = requestWithdraws[distributeWithdrawInfo.receipt][distributeWithdrawInfo.requestWithdrawNo];
            require(requestWithdrawInfo.assTokenAddress != address(0), "not exist");
            require(requestWithdrawInfo.canClaimWithdraw == false, "can not claim");

            requestWithdrawInfo.sourceTokenAmount = distributeWithdrawInfo.sourceTokenAmount;
            requestWithdrawInfo.canClaimWithdraw = true;

            IAss(token.assTokenAddress).burn(address(this), requestWithdrawInfo.assTokenAmount);

            emit DistributeWithdraw(requestWithdrawInfo.assTokenAddress, token.sourceTokenAddress, requestWithdrawInfo.assTokenAmount, requestWithdrawInfo.sourceTokenAmount, distributeWithdrawInfo.requestWithdrawNo);
        }
    }

    function claimWithdraw(uint256[] calldata requestWithdrawNos) external nonReentrant whenNotPaused {
        uint256 length = requestWithdrawNos.length;
        for (UC i = ZERO; i < uc(length); i = i + ONE) {
            uint256 requestWithdrawNo = requestWithdrawNos[i.into()];
            RequestWithdrawInfo storage requestWithdrawInfo = requestWithdraws[msg.sender][requestWithdrawNo];
            require(requestWithdrawInfo.assTokenAddress != address(0), "not exist");
            require(requestWithdrawInfo.canClaimWithdraw == true, "can not claim");

            Token storage token = supportAssToken[requestWithdrawInfo.assTokenAddress];
            require(token.assTokenAddress != address(0), "currency not support");
            require(token.withdrawEnabled == true, "pause withdraw");

            delete requestWithdraws[msg.sender][requestWithdrawNo];

            _withdraw(msg.sender, token.sourceTokenAddress, requestWithdrawInfo.sourceTokenAmount);
            sourceTokenTreasury[token.sourceTokenAddress] -= requestWithdrawInfo.sourceTokenAmount;

            emit ClaimWithdraw(msg.sender, requestWithdrawInfo.assTokenAddress, token.sourceTokenAddress, requestWithdrawInfo.assTokenAmount, requestWithdrawInfo.sourceTokenAmount, requestWithdrawNo);
        }
    }

    function balance(address currency) external view returns (uint256) {
        return IERC20(currency).balanceOf(address(this));
    }

    function _transferToVault(address from, address token, uint256 amount) private {
        if (token != NATIVE_WRAPPED) {
            IERC20(token).safeTransferFrom(from, address(this), amount);
        } else {
            require(msg.value >= amount, "insufficient balance");
        }
    }

    function _lock(address from, address token, uint256 amount) private {
        IERC20(token).safeTransferFrom(from, address(this), amount);
    }

    function _transferToCeffu(address receipt, address token) private returns (uint256){
        if (token != NATIVE_WRAPPED) {
            uint256 amount = IERC20(token).balanceOf(address(this));
            if (amount <= 0) {
                return amount;
            }
            IERC20(token).safeTransfer(receipt, amount);
            return amount;
        } else {
            uint256 amount = address(this).balance;
            if (amount <= 0) {
                return amount;
            }
            payable(receipt).sendValue(amount);
            return amount;
        }
    }

    function _withdraw(address receipt, address token, uint256 amount) private {
        if (token != NATIVE_WRAPPED) {
            _withdrawVault.transfer(receipt, token, amount);
        } else {
            _withdrawVault.transferNative(receipt, amount);
        }
    }
}

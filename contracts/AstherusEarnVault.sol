// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

interface IAss {
    function mint(address to, uint256 amount) external;

    function burnFrom(address account, uint256 amount) external;
}

interface IWBNB {
    function deposit() external payable;

    function withdraw(uint) external;
}

contract AstherusEarnVault is Initializable, PausableUpgradeable, AccessControlEnumerableUpgradeable, UUPSUpgradeable {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAUSE_ROLE = keccak256("PAUSE_ROLE");

    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    using Address for address payable;
    using SafeERC20 for IERC20;
    using SignatureChecker for address;

    event MintAssXXX(address indexed sender, address indexed sourceTokenAddress, uint256 amountIn, uint256 assXXXAmount);
    event NewSigner(address oldSigner, address newSigner);
    event AddToken(address indexed currency);
    event UpdateDepositEnabled(address indexed currency);
    event UpdateWithdrawEnabled(address indexed currency);


    error ZeroAddress();
    error ZeroAmount();

    struct Token {
        //assTokenDecimals=18
        address assTokenAddress;
        address sourceTokenAddress;
        uint8 sourceTokenDecimals;
        //assToSourceExchangeRate Decimals=8;assToSourceExchangeRate= XXX amount/(assXXX total supply)
        uint256 assToSourceExchangeRate;
        uint256 exchangeRateTimestamp;
        bool depositEnabled;
        bool withdrawEnabled;
    }

    address public immutable TIMELOCK_ADDRESS;
    address public immutable  NATIVE_WRAPPED;

    address public signer;
    mapping(address => Token) public supportAssToken;
    mapping(address => address) public supportSourceToken;
    mapping(address => uint256) public treasury;
    mapping(address => uint256) public lastMintedAt;

    //Used in ReentrancyGuard
    uint256 private status;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address nativeWrapped, address timelockAddress) {
        NATIVE_WRAPPED = nativeWrapped;
        TIMELOCK_ADDRESS = timelockAddress;
        _disableInitializers();
    }

    modifier onlyTImelock() {
        require(msg.sender == TIMELOCK_ADDRESS, "only timelock");
        _;
    }



    modifier nonReentrant() {
        require(status != _ENTERED, "reentrant call");
        status = _ENTERED;
        _;
        status = _NOT_ENTERED;
    }

    function initialize(address defaultAdmin) initializer public {
        __Pausable_init();
        __AccessControlEnumerable_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ADMIN_ROLE, defaultAdmin);

    }

    function pause() external onlyRole(PAUSE_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSE_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation) internal onlyTImelock override {}


    function changeSigner(address newSigner) external onlyRole(ADMIN_ROLE) {
        if (newSigner == address(0)) revert ZeroAddress();
        address oldSigner = signer;
        signer = newSigner;
        emit NewSigner(oldSigner, newSigner);
    }

    function addToken(
        address assTokenAddress,
        address sourceTokenAddress,
        uint256 exchangeRateTimestamp,
        bool depositEnabled,
        bool withdrawEnabled
    ) external onlyRole(ADMIN_ROLE) {

        if (assTokenAddress == address(0) || sourceTokenAddress == address(0)) revert ZeroAddress();

        uint8 correctDecimals = IERC20Metadata(sourceTokenAddress).decimals();

        Token storage token = supportAssToken[assTokenAddress];
        require(token.assTokenAddress == address(0), "Duplicate add");

        token.assTokenAddress = assTokenAddress;
        token.sourceTokenAddress = sourceTokenAddress;
        token.sourceTokenDecimals = correctDecimals;
        token.assToSourceExchangeRate = 1e8;
        token.exchangeRateTimestamp = exchangeRateTimestamp;
        token.depositEnabled = depositEnabled;
        token.withdrawEnabled = withdrawEnabled;

        supportSourceToken[token.sourceTokenAddress] = assTokenAddress;

        emit AddToken(assTokenAddress);
    }

    function updateDepositEnabled(address assTokenAddress, bool enabled) external onlyRole(ADMIN_ROLE) {
        if (assTokenAddress == address(0)) revert ZeroAddress();
        Token storage token = supportAssToken[assTokenAddress];
        require(token.assTokenAddress != address(0), "Not exist");

        token.depositEnabled = enabled;

        emit UpdateDepositEnabled(assTokenAddress);
    }

    function updateWithdrawEnabled(address assTokenAddress, bool enabled) external onlyRole(ADMIN_ROLE) {
        if (assTokenAddress == address(0)) revert ZeroAddress();
        Token storage token = supportAssToken[assTokenAddress];
        require(token.assTokenAddress != address(0), "Not exist");

        token.withdrawEnabled = enabled;

        emit UpdateWithdrawEnabled(assTokenAddress);
    }

    function deposit(address sourceTokenAddress, uint256 amountIn) external nonReentrant whenNotPaused{
        _mintAssXXX(sourceTokenAddress, amountIn);
    }

    function depositNative() external payable nonReentrant whenNotPaused{
        uint256 amount = msg.value;
        _mintAssXXX(NATIVE_WRAPPED, amount);
    }

    function _mintAssXXX(address sourceTokenAddress, uint256 amountIn) private {
        if (sourceTokenAddress == address(0)) revert ZeroAddress();
        if (amountIn == 0) revert ZeroAmount();

        address assTokenAddress = supportSourceToken[sourceTokenAddress];
        require(assTokenAddress != address(0), "currency not support");

        Token storage token = supportAssToken[assTokenAddress];
        require(token.depositEnabled == true, "Pause deposit");
        require(block.timestamp < token.exchangeRateTimestamp, "Price expired");

        //assToSourceExchangeRate=token.assToSourceExchangeRate # XXX amount/(assXXX total supply)
        //assXXXAmount=1/(assToSourceExchangeRate/1e8) * amountIn/(10 ** token.sourceTokenDecimals) * 1e18
        uint256 assXXXAmount = amountIn * 1e26 / (token.assToSourceExchangeRate * (10 ** token.sourceTokenDecimals));

        _transferFrom(sourceTokenAddress, msg.sender, amountIn);
        treasury[sourceTokenAddress] += amountIn;

        lastMintedAt[msg.sender] = block.timestamp;
        IAss(assTokenAddress).mint(msg.sender, assXXXAmount);
        emit MintAssXXX(msg.sender, sourceTokenAddress, amountIn, assXXXAmount);
    }

    function balance(address currency) external view returns (uint256) {
        return IERC20(currency).balanceOf(address(this));
    }

    function _transferFrom(address token, address from, uint256 amount) private {
        if (token != NATIVE_WRAPPED) {
            IERC20(token).safeTransferFrom(from, address(this), amount);
        } else {
            require(msg.value >= amount, "insufficient transfers");
            IWBNB(token).deposit{value: amount}();
        }
    }
}

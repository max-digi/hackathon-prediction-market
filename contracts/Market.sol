// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Market is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;

    string public projectName;
    string public projectDescription;

    // AMM pools for YES and NO shares
    uint256 public yesPool;
    uint256 public noPool;
    uint256 public constant INITIAL_LIQUIDITY = 100 * 1e6; // 6 decimals for pathUSD

    // User positions
    mapping(address => uint256) public yesShares;
    mapping(address => uint256) public noShares;

    // Settlement
    bool public settled;
    bool public yesWon;

    // Stats
    uint256 public totalVolume;

    event SharesPurchased(
        address indexed buyer,
        bool isYes,
        uint256 usdcAmount,
        uint256 sharesReceived,
        uint256 newYesPool,
        uint256 newNoPool
    );

    event MarketSettled(bool yesWon);
    event WinningsClaimed(address indexed user, uint256 amount);

    constructor(
        address _usdc,
        string memory _projectName,
        string memory _projectDescription,
        address _owner
    ) Ownable(_owner) {
        usdc = IERC20(_usdc);
        projectName = _projectName;
        projectDescription = _projectDescription;

        // Initialize pools with equal liquidity (50/50 odds)
        yesPool = INITIAL_LIQUIDITY;
        noPool = INITIAL_LIQUIDITY;
    }

    uint256 public constant MIN_BET = 1e6; // $1 minimum (6 decimals)

    /**
     * @notice Buy YES or NO shares with USDC using constant product formula
     * @param isYes True to buy YES shares, false for NO shares
     * @param usdcAmount Amount of USDC to spend (18 decimals)
     */
    function buyShares(bool isYes, uint256 usdcAmount) external nonReentrant {
        require(!settled, "Market already settled");
        require(usdcAmount >= MIN_BET, "Minimum bet is $1");

        // Transfer USDC from user
        require(
            usdc.transferFrom(msg.sender, address(this), usdcAmount),
            "USDC transfer failed"
        );

        // Calculate shares to give using constant product formula
        // k = yesPool * noPool
        // When buying YES: new_k = (yesPool - sharesOut) * (noPool + usdcIn)
        // We want k to remain constant, so: yesPool * noPool = (yesPool - sharesOut) * (noPool + usdcIn)

        uint256 sharesOut;
        uint256 newYesPool;
        uint256 newNoPool;

        if (isYes) {
            // Buying YES: add to NO pool, remove from YES pool
            newNoPool = noPool + usdcAmount;
            // k = yesPool * noPool
            // newYesPool = k / newNoPool = (yesPool * noPool) / (noPool + usdcAmount)
            newYesPool = (yesPool * noPool) / newNoPool;
            sharesOut = yesPool - newYesPool;

            require(sharesOut > 0, "Insufficient shares");

            yesShares[msg.sender] += sharesOut;
            yesPool = newYesPool;
            noPool = newNoPool;
        } else {
            // Buying NO: add to YES pool, remove from NO pool
            newYesPool = yesPool + usdcAmount;
            newNoPool = (yesPool * noPool) / newYesPool;
            sharesOut = noPool - newNoPool;

            require(sharesOut > 0, "Insufficient shares");

            noShares[msg.sender] += sharesOut;
            yesPool = newYesPool;
            noPool = newNoPool;
        }

        totalVolume += usdcAmount;

        emit SharesPurchased(
            msg.sender,
            isYes,
            usdcAmount,
            sharesOut,
            yesPool,
            noPool
        );
    }

    /**
     * @notice Settle the market (admin only)
     * @param _yesWon True if YES won, false if NO won
     */
    function settle(bool _yesWon) external onlyOwner {
        require(!settled, "Already settled");

        settled = true;
        yesWon = _yesWon;

        emit MarketSettled(_yesWon);
    }

    /**
     * @notice Claim winnings after settlement
     */
    function claimWinnings() external nonReentrant {
        require(settled, "Market not settled");

        uint256 winningShares = yesWon ? yesShares[msg.sender] : noShares[msg.sender];
        require(winningShares > 0, "No winning shares");

        // Clear user's shares
        yesShares[msg.sender] = 0;
        noShares[msg.sender] = 0;

        // Winning shares are worth $1 each
        require(
            usdc.transfer(msg.sender, winningShares),
            "USDC transfer failed"
        );

        emit WinningsClaimed(msg.sender, winningShares);
    }

    /**
     * @notice Get current odds for YES (returns percentage with 6 decimals)
     * @return Odds percentage (e.g., 65% = 65 * 1e6)
     */
    function getCurrentOdds() external view returns (uint256) {
        // YES odds = yesPool / (yesPool + noPool)
        // Note: In CPMM, higher pool means lower price/odds
        // So we invert: noPool / (yesPool + noPool) gives YES odds
        uint256 totalPool = yesPool + noPool;
        return (noPool * 100 * 1e6) / totalPool;
    }

    /**
     * @notice Get project information
     */
    function getProjectInfo() external view returns (
        string memory name,
        string memory description,
        uint256 volume,
        bool isSettled,
        bool didYesWin
    ) {
        return (projectName, projectDescription, totalVolume, settled, yesWon);
    }

    /**
     * @notice Get user's shares
     */
    function getUserShares(address user) external view returns (
        uint256 yes,
        uint256 no
    ) {
        return (yesShares[user], noShares[user]);
    }

    /**
     * @notice Calculate how many shares user would get for a given USDC amount
     */
    function calculateSharesOut(bool isYes, uint256 usdcAmount) external view returns (uint256) {
        if (isYes) {
            uint256 newNoPool = noPool + usdcAmount;
            uint256 newYesPool = (yesPool * noPool) / newNoPool;
            return yesPool - newYesPool;
        } else {
            uint256 newYesPool = yesPool + usdcAmount;
            uint256 newNoPool = (yesPool * noPool) / newYesPool;
            return noPool - newNoPool;
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @notice Mock USDC token for testing purposes
 */
contract MockUSDC is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Mock USDC", "USDC") Ownable(initialOwner) {
        // Mint 1 million USDC to deployer for testing
        _mint(initialOwner, 1_000_000 * 10**18);
    }

    /**
     * @notice Mint tokens to any address (for testing)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Faucet function - anyone can mint 1000 USDC for testing
     */
    function faucet() external {
        _mint(msg.sender, 1000 * 10**18);
    }

    /**
     * @notice Override decimals to match USDC (6 decimals)
     * Note: For simplicity in the MVP, we're using 18 decimals
     */
    function decimals() public pure override returns (uint8) {
        return 18; // Simplified for MVP
    }
}

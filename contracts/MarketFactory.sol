// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Market.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MarketFactory is Ownable {
    address public immutable usdc;

    // Array of all markets
    address[] public markets;

    // Mapping from market address to index
    mapping(address => uint256) public marketIndex;

    // Project metadata
    struct ProjectMetadata {
        string projectName;
        string projectDescription;
        string category;
        string teamName;
        uint256 createdAt;
    }

    mapping(address => ProjectMetadata) public projectMetadata;

    event MarketCreated(
        address indexed marketAddress,
        string projectName,
        string projectDescription,
        uint256 timestamp
    );

    constructor(address _usdc, address initialOwner) Ownable(initialOwner) {
        usdc = _usdc;
    }

    /**
     * @notice Create a new prediction market for a project
     * @param _projectName Name of the project
     * @param _projectDescription Brief description of the project
     * @param _category Category of the project (e.g., "DeFi", "NFT", "Gaming")
     * @param _teamName Name of the team
     */
    function createMarket(
        string memory _projectName,
        string memory _projectDescription,
        string memory _category,
        string memory _teamName
    ) external onlyOwner returns (address) {
        return _createMarketInternal(_projectName, _projectDescription, _category, _teamName);
    }

    function _createMarketInternal(
        string memory _projectName,
        string memory _projectDescription,
        string memory _category,
        string memory _teamName
    ) internal returns (address) {
        // Deploy new Market contract
        Market newMarket = new Market(
            usdc,
            _projectName,
            _projectDescription,
            owner()
        );

        address marketAddress = address(newMarket);

        // Store market
        markets.push(marketAddress);
        marketIndex[marketAddress] = markets.length;

        // Store metadata
        projectMetadata[marketAddress] = ProjectMetadata({
            projectName: _projectName,
            projectDescription: _projectDescription,
            category: _category,
            teamName: _teamName,
            createdAt: block.timestamp
        });

        emit MarketCreated(
            marketAddress,
            _projectName,
            _projectDescription,
            block.timestamp
        );

        return marketAddress;
    }

    /**
     * @notice Get all market addresses
     */
    function getAllMarkets() external view returns (address[] memory) {
        return markets;
    }

    /**
     * @notice Get total number of markets
     */
    function getMarketCount() external view returns (uint256) {
        return markets.length;
    }

    /**
     * @notice Get market at specific index
     */
    function getMarket(uint256 index) external view returns (address) {
        require(index < markets.length, "Index out of bounds");
        return markets[index];
    }

    /**
     * @notice Get project metadata for a market
     */
    function getProjectMetadata(address marketAddress) external view returns (
        string memory projectName,
        string memory projectDescription,
        string memory category,
        string memory teamName,
        uint256 createdAt
    ) {
        ProjectMetadata memory metadata = projectMetadata[marketAddress];
        return (
            metadata.projectName,
            metadata.projectDescription,
            metadata.category,
            metadata.teamName,
            metadata.createdAt
        );
    }

    /**
     * @notice Batch create multiple markets (useful for initial setup)
     */
    function batchCreateMarkets(
        string[] memory _projectNames,
        string[] memory _projectDescriptions,
        string[] memory _categories,
        string[] memory _teamNames
    ) external onlyOwner {
        require(
            _projectNames.length == _projectDescriptions.length &&
            _projectNames.length == _categories.length &&
            _projectNames.length == _teamNames.length,
            "Array lengths must match"
        );

        for (uint256 i = 0; i < _projectNames.length; i++) {
            _createMarketInternal(
                _projectNames[i],
                _projectDescriptions[i],
                _categories[i],
                _teamNames[i]
            );
        }
    }
}

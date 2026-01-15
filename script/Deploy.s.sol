// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MarketFactory} from "../contracts/MarketFactory.sol";

contract DeployScript is Script {
    // Tempo mainnet faucet stablecoin
    address constant TEMPO_PATHUSD = 0x20C000000000000000000000033aBB6ac7D235e5;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying with account:", deployer);
        console.log("Chain ID:", block.chainid);
        
        require(block.chainid == 4217, "Must deploy to Tempo mainnet (chain ID 4217)");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy MarketFactory with Tempo's native pathUSD
        console.log("Deploying MarketFactory with pathUSD...");
        MarketFactory factory = new MarketFactory(TEMPO_PATHUSD, deployer);
        console.log("MarketFactory deployed to:", address(factory));
        
        // Create hackathon markets
        string[] memory names = new string[](6);
        string[] memory descriptions = new string[](6);
        string[] memory categories = new string[](6);
        string[] memory teams = new string[](6);
        
        // TODO: Customize these for your hackathon
        names[0] = "DeFi Yield Optimizer";
        names[1] = "NFT Marketplace";
        names[2] = "DAO Governance Tool";
        names[3] = "Cross-Chain Bridge";
        names[4] = "Wallet Analytics";
        names[5] = "Social Token Platform";
        
        descriptions[0] = "Automated yield farming strategy optimizer";
        descriptions[1] = "Decentralized marketplace for digital collectibles";
        descriptions[2] = "On-chain voting and proposal management";
        descriptions[3] = "Seamless asset transfers across blockchains";
        descriptions[4] = "Portfolio tracking and on-chain analytics";
        descriptions[5] = "Creator economy with tokenized communities";
        
        categories[0] = "DeFi";
        categories[1] = "NFT";
        categories[2] = "DAO";
        categories[3] = "Infrastructure";
        categories[4] = "Analytics";
        categories[5] = "Social";
        
        // TODO: Replace with your participant names
        teams[0] = "Alice";
        teams[1] = "Bob";
        teams[2] = "Charlie";
        teams[3] = "Diana";
        teams[4] = "Eve";
        teams[5] = "Frank";
        
        console.log("Creating 6 hackathon markets...");
        factory.batchCreateMarkets(names, descriptions, categories, teams);
        
        vm.stopBroadcast();
        
        // Print all market addresses
        console.log("");
        console.log("=== MARKET ADDRESSES ===");
        for (uint256 i = 0; i < 6; i++) {
            address marketAddr = factory.getMarket(i);
            console.log(names[i], ":", marketAddr);
        }
        
        console.log("");
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("USDC Address:", TEMPO_PATHUSD);
        console.log("Factory Address:", address(factory));
        console.log("");
        console.log("Add to .env.local:");
        console.log("NEXT_PUBLIC_FACTORY_ADDRESS=", address(factory));
    }
}

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
        
        names[0] = "Tempo Directory";
        names[1] = "Legal Directory";
        names[2] = "X Dashboard";
        names[3] = "Data Chatbot";
        names[4] = "Compliance App";
        names[5] = "LinkedIn Connect";
        
        descriptions[0] = "A comprehensive directory for discovering and navigating the Tempo ecosystem";
        descriptions[1] = "Decentralized legal services directory powered by blockchain";
        descriptions[2] = "Real-time analytics and monitoring dashboard for X/Twitter metrics";
        descriptions[3] = "AI-powered chatbot for querying and analyzing blockchain data";
        descriptions[4] = "Streamlined compliance management and regulatory reporting tool";
        descriptions[5] = "Professional networking integration for Web3 identity and credentials";
        
        categories[0] = "Discovery";
        categories[1] = "Legal";
        categories[2] = "Analytics";
        categories[3] = "AI";
        categories[4] = "Compliance";
        categories[5] = "Social";
        
        teams[0] = "Steffi";
        teams[1] = "Lindsey";
        teams[2] = "Juan";
        teams[3] = "Karina";
        teams[4] = "Gina";
        teams[5] = "Teresa";
        
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

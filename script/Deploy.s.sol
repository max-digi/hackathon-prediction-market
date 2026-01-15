// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MarketFactory} from "../contracts/MarketFactory.sol";
import {MockUSDC} from "../contracts/MockUSDC.sol";

contract DeployScript is Script {
    // Tempo testnet pathUSD stablecoin
    address constant TEMPO_PATHUSD = 0x20C0000000000000000000000000000000000000;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying with account:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Check if we're on Tempo mainnet (4217), testnet (42431), or local
        address usdcAddress;
        if (block.chainid == 4217 || block.chainid == 42431) {
            console.log("Using Tempo's native pathUSD...");
            usdcAddress = TEMPO_PATHUSD;
        } else {
            console.log("Deploying MockUSDC...");
            MockUSDC usdc = new MockUSDC(deployer);
            usdcAddress = address(usdc);
            console.log("MockUSDC deployed to:", usdcAddress);
        }
        
        // Deploy MarketFactory
        console.log("Deploying MarketFactory...");
        MarketFactory factory = new MarketFactory(usdcAddress, deployer);
        console.log("MarketFactory deployed to:", address(factory));
        
        // Create initial markets
        string[] memory names = new string[](12);
        string[] memory descriptions = new string[](12);
        string[] memory categories = new string[](12);
        string[] memory teams = new string[](12);
        
        names[0] = "DeFi Yield Aggregator";
        names[1] = "NFT Marketplace for Musicians";
        names[2] = "Web3 Gaming Platform";
        names[3] = "DAO Governance Tool";
        names[4] = "Decentralized Social Network";
        names[5] = "Carbon Credit Marketplace";
        names[6] = "Crypto Payment Gateway";
        names[7] = "Identity Verification Protocol";
        names[8] = "Prediction Market Platform";
        names[9] = "Supply Chain Tracker";
        names[10] = "Decentralized Exchange";
        names[11] = "AI-Powered Trading Bot";
        
        descriptions[0] = "Automated yield optimization across multiple protocols";
        descriptions[1] = "Platform for musicians to mint and sell music NFTs";
        descriptions[2] = "Play-to-earn gaming ecosystem with token rewards";
        descriptions[3] = "Streamlined voting and proposal management for DAOs";
        descriptions[4] = "Privacy-focused social media on blockchain";
        descriptions[5] = "Tokenized carbon credits trading platform";
        descriptions[6] = "Easy crypto payments for e-commerce";
        descriptions[7] = "Decentralized identity and KYC solution";
        descriptions[8] = "Bet on future events with transparent odds";
        descriptions[9] = "Blockchain-based supply chain transparency";
        descriptions[10] = "Fast and cheap token swaps with minimal slippage";
        descriptions[11] = "Automated trading strategies using machine learning";
        
        categories[0] = "DeFi";
        categories[1] = "NFT";
        categories[2] = "Gaming";
        categories[3] = "DAO";
        categories[4] = "Social";
        categories[5] = "Climate";
        categories[6] = "Payments";
        categories[7] = "Identity";
        categories[8] = "Prediction";
        categories[9] = "Supply Chain";
        categories[10] = "DeFi";
        categories[11] = "Trading";
        
        teams[0] = "Yield Masters";
        teams[1] = "SoundChain";
        teams[2] = "GameFi Studios";
        teams[3] = "GovTech";
        teams[4] = "SocialWeb3";
        teams[5] = "GreenChain";
        teams[6] = "PayFlow";
        teams[7] = "TrustID";
        teams[8] = "FutureBets";
        teams[9] = "ChainTrace";
        teams[10] = "SwapLab";
        teams[11] = "BotTraders";
        
        console.log("Creating 12 markets...");
        factory.batchCreateMarkets(names, descriptions, categories, teams);
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("USDC Address:", usdcAddress);
        console.log("Factory Address:", address(factory));
        console.log("");
        console.log("Add to .env.local:");
        console.log("NEXT_PUBLIC_USDC_ADDRESS=", usdcAddress);
        console.log("NEXT_PUBLIC_FACTORY_ADDRESS=", address(factory));
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MarketFactory} from "../contracts/MarketFactory.sol";

contract CreateMarketsScript is Script {
    address constant FACTORY = 0xf77D5a5b26526E3E2A694453D28cC9b09930B801;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        MarketFactory factory = MarketFactory(FACTORY);
        
        // Batch 3: Markets 9-12
        factory.createMarket("Prediction Market Platform", "Bet on future events with transparent odds", "Prediction", "FutureBets");
        factory.createMarket("Supply Chain Tracker", "Blockchain-based supply chain transparency", "Supply Chain", "ChainTrace");
        factory.createMarket("Decentralized Exchange", "Fast and cheap token swaps with minimal slippage", "DeFi", "SwapLab");
        factory.createMarket("AI-Powered Trading Bot", "Automated trading strategies using machine learning", "Trading", "BotTraders");
        
        vm.stopBroadcast();
        
        console.log("Created final 4 markets (9-12)");
    }
}

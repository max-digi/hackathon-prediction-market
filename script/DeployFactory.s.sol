// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MarketFactory} from "../contracts/MarketFactory.sol";

contract DeployFactoryScript is Script {
    address constant TEMPO_PATHUSD = 0x20C0000000000000000000000000000000000000;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying with account:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        MarketFactory factory = new MarketFactory(TEMPO_PATHUSD, deployer);
        console.log("MarketFactory deployed to:", address(factory));
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("NEXT_PUBLIC_FACTORY_ADDRESS=", address(factory));
    }
}

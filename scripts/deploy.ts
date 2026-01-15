import { ethers } from "hardhat";

// Tempo testnet predeployed pathUSD stablecoin
const TEMPO_PATHUSD = "0x20c0000000000000000000000000000000000000";

async function main() {
  console.log("Deploying contracts...");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check if we're on Tempo (use pathUSD) or local (deploy MockUSDC)
  const network = await ethers.provider.getNetwork();
  const isTempoTestnet = network.chainId === 42431n;

  let usdcAddress: string;

  if (isTempoTestnet) {
    console.log("\n1. Using Tempo's native pathUSD stablecoin...");
    usdcAddress = TEMPO_PATHUSD;
    console.log("pathUSD address:", usdcAddress);
  } else {
    console.log("\n1. Deploying MockUSDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy(deployer.address);
    await usdc.waitForDeployment();
    usdcAddress = await usdc.getAddress();
    console.log("MockUSDC deployed to:", usdcAddress);
  }

  // Deploy MarketFactory
  console.log("\n2. Deploying MarketFactory...");
  const MarketFactory = await ethers.getContractFactory("MarketFactory");
  const factory = await MarketFactory.deploy(usdcAddress, deployer.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("MarketFactory deployed to:", factoryAddress);

  // Create initial markets
  console.log("\n3. Creating initial markets...");
  const projects = [
    {
      name: "DeFi Yield Aggregator",
      description: "Automated yield optimization across multiple protocols",
      category: "DeFi",
      team: "Yield Masters"
    },
    {
      name: "NFT Marketplace for Musicians",
      description: "Platform for musicians to mint and sell music NFTs",
      category: "NFT",
      team: "SoundChain"
    },
    {
      name: "Web3 Gaming Platform",
      description: "Play-to-earn gaming ecosystem with token rewards",
      category: "Gaming",
      team: "GameFi Studios"
    },
    {
      name: "DAO Governance Tool",
      description: "Streamlined voting and proposal management for DAOs",
      category: "DAO",
      team: "GovTech"
    },
    {
      name: "Decentralized Social Network",
      description: "Privacy-focused social media on blockchain",
      category: "Social",
      team: "SocialWeb3"
    },
    {
      name: "Carbon Credit Marketplace",
      description: "Tokenized carbon credits trading platform",
      category: "Climate",
      team: "GreenChain"
    },
    {
      name: "Crypto Payment Gateway",
      description: "Easy crypto payments for e-commerce",
      category: "Payments",
      team: "PayFlow"
    },
    {
      name: "Identity Verification Protocol",
      description: "Decentralized identity and KYC solution",
      category: "Identity",
      team: "TrustID"
    },
    {
      name: "Prediction Market Platform",
      description: "Bet on future events with transparent odds",
      category: "Prediction",
      team: "FutureBets"
    },
    {
      name: "Supply Chain Tracker",
      description: "Blockchain-based supply chain transparency",
      category: "Supply Chain",
      team: "ChainTrace"
    },
    {
      name: "Decentralized Exchange",
      description: "Fast and cheap token swaps with minimal slippage",
      category: "DeFi",
      team: "SwapLab"
    },
    {
      name: "AI-Powered Trading Bot",
      description: "Automated trading strategies using machine learning",
      category: "Trading",
      team: "BotTraders"
    }
  ];

  const projectNames = projects.map(p => p.name);
  const projectDescriptions = projects.map(p => p.description);
  const categories = projects.map(p => p.category);
  const teamNames = projects.map(p => p.team);

  const tx = await factory.batchCreateMarkets(
    projectNames,
    projectDescriptions,
    categories,
    teamNames
  );
  await tx.wait();

  const marketCount = await factory.getMarketCount();
  console.log(`Created ${marketCount} markets`);

  // Print all market addresses
  console.log("\n4. Market Addresses:");
  for (let i = 0; i < Number(marketCount); i++) {
    const marketAddress = await factory.getMarket(i);
    const metadata = await factory.getProjectMetadata(marketAddress);
    console.log(`   ${i + 1}. ${metadata.projectName}: ${marketAddress}`);
  }

  // Print summary
  console.log("\n=== Deployment Summary ===");
  console.log("MockUSDC:", usdcAddress);
  console.log("MarketFactory:", factoryAddress);
  console.log("Total Markets:", marketCount.toString());
  console.log("\nTo interact with the contracts, add these to your .env:");
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);
  console.log(`NEXT_PUBLIC_FACTORY_ADDRESS=${factoryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TipJar contract...");

  // Get the contract factory
  const TipJar = await ethers.getContractFactory("TipJar");

  // Deploy the contract with your address as initial owner
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from account:", deployer.address);

  const tipJar = await TipJar.deploy(deployer.address);
  await tipJar.deployed();

  console.log("TipJar deployed to:", tipJar.address);
  console.log("Owner address:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
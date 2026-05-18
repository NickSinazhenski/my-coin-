const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying SoulboundVisitCardERC721 with account:", deployer.address);

  const SoulboundVisitCardERC721 = await ethers.getContractFactory(
    "SoulboundVisitCardERC721"
  );
  const visitCard = await SoulboundVisitCardERC721.deploy();
  await visitCard.deployed();

  console.log("SoulboundVisitCardERC721 deployed to:", visitCard.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const baseURI = process.env.GAME_CHARACTER_BASE_URI || "ipfs://REPLACE_WITH_METADATA_CID/{id}.json";

  console.log("Deploying GameCharacterCollectionERC1155 with account:", deployer.address);
  console.log("Base metadata URI:", baseURI);

  const GameCharacterCollectionERC1155 = await ethers.getContractFactory(
    "GameCharacterCollectionERC1155"
  );
  const gameCharacters = await GameCharacterCollectionERC1155.deploy(baseURI);
  await gameCharacters.deployed();

  console.log("GameCharacterCollectionERC1155 deployed to:", gameCharacters.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

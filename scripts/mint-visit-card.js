const { ethers } = require("hardhat");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main() {
  const contractAddress = requireEnv("VISIT_CARD_CONTRACT_ADDRESS");
  const studentWallet = requireEnv("STUDENT_WALLET");
  const visitCardURI = requireEnv("VISIT_CARD_URI");

  const visitCard = await ethers.getContractAt("SoulboundVisitCardERC721", contractAddress);
  const mintTx = await visitCard.mintVisitCard(studentWallet, visitCardURI);
  const receipt = await mintTx.wait();

  console.log("Visit card contract:", contractAddress);
  console.log("Student wallet:", studentWallet);
  console.log("Mint tx hash:", receipt.transactionHash);
  console.log("Student balance:", (await visitCard.balanceOf(studentWallet)).toString());
  console.log("Token metadata URI:", await visitCard.tokenURI(1));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

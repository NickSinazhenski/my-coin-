const { ethers } = require("hardhat");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main() {
  const contractAddress = requireEnv("GAME_CHARACTER_CONTRACT_ADDRESS");
  const studentWallet = requireEnv("STUDENT_WALLET");

  const gameCharacters = await ethers.getContractAt(
    "GameCharacterCollectionERC1155",
    contractAddress
  );
  const [owner] = await ethers.getSigners();

  const allIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const allAmounts = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

  const mintTx = await gameCharacters.mintBatchCharacters(
    owner.address,
    allIds,
    allAmounts,
    "0x"
  );
  const mintReceipt = await mintTx.wait();

  const transferIds = [1, 2];
  const transferAmounts = [1, 1];
  const transferTx = await gameCharacters.safeBatchTransferFrom(
    owner.address,
    studentWallet,
    transferIds,
    transferAmounts,
    "0x"
  );
  const transferReceipt = await transferTx.wait();

  console.log("Game character contract:", contractAddress);
  console.log("Mint batch tx hash:", mintReceipt.transactionHash);
  console.log("Batch transfer tx hash:", transferReceipt.transactionHash);
  console.log(
    "Student balances for ids 1 and 2:",
    (
      await gameCharacters.balanceOfBatch(
        [studentWallet, studentWallet],
        transferIds
      )
    ).map((value) => value.toString())
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

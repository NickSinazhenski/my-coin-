const { ethers } = require("hardhat");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main() {
  const proxyAddress = requireEnv("TOKEN_PROXY_ADDRESS");
  const recipient = requireEnv("RECIPIENT_ADDRESS");
  const secondRecipient = requireEnv("SECOND_RECIPIENT_ADDRESS");
  const [owner] = await ethers.getSigners();

  const token = await ethers.getContractAt("MyTokenV1", proxyAddress);
  const mintAmount = ethers.utils.parseEther("1000");
  const transferAmount = ethers.utils.parseEther("250");

  console.log("Using proxy:", proxyAddress);
  console.log("Owner:", owner.address);

  const mintTx = await token.mint(recipient, mintAmount);
  const mintReceipt = await mintTx.wait();
  console.log("Mint tx hash:", mintReceipt.transactionHash);

  const transferTx = await token.transfer(secondRecipient, transferAmount);
  const transferReceipt = await transferTx.wait();
  console.log("Transfer tx hash:", transferReceipt.transactionHash);

  console.log("Owner balance:", (await token.balanceOf(owner.address)).toString());
  console.log("Recipient balance:", (await token.balanceOf(recipient)).toString());
  console.log(
    "Second recipient balance:",
    (await token.balanceOf(secondRecipient)).toString()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

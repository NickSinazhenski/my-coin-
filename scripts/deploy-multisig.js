const { ethers } = require("hardhat");

function parseOwners(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((owner) => owner.trim())
    .filter(Boolean);
}

async function main() {
  const signers = await ethers.getSigners();
  const envOwners = parseOwners(process.env.MULTISIG_OWNERS);
  const owners =
    envOwners.length > 0 ? envOwners : signers.slice(0, 3).map((signer) => signer.address);
  const requiredConfirmations = Number(process.env.MULTISIG_REQUIRED || 2);

  console.log("Deploying MultiSigWallet with signer:", signers[0].address);
  console.log("Owners:", owners.join(", "));
  console.log("Required confirmations:", requiredConfirmations);

  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
  const wallet = await MultiSigWallet.deploy(owners, requiredConfirmations);
  await wallet.deployed();

  console.log("MultiSigWallet deployed to:", wallet.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

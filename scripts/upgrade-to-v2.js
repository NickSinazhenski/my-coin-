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
  const [owner] = await ethers.getSigners();

  const tokenV1 = await ethers.getContractAt("MyTokenV1", proxyAddress);
  const ownerAddress = await tokenV1.owner();
  const balanceBefore = await tokenV1.balanceOf(ownerAddress);
  const totalSupplyBefore = await tokenV1.totalSupply();

  console.log("Upgrading proxy:", proxyAddress);
  console.log("Upgrade signer:", owner.address);
  console.log("Proxy owner:", ownerAddress);
  console.log("Owner balance before upgrade:", balanceBefore.toString());
  console.log("Total supply before upgrade:", totalSupplyBefore.toString());

  const MyTokenV2 = await ethers.getContractFactory("MyTokenV2");
  const implementationV2 = await MyTokenV2.deploy();
  await implementationV2.deployed();

  console.log("V2 implementation deployed to:", implementationV2.address);

  const upgradeTx = await tokenV1.upgradeToAndCall(implementationV2.address, "0x");
  const upgradeReceipt = await upgradeTx.wait();

  const tokenV2 = await ethers.getContractAt("MyTokenV2", proxyAddress);
  const balanceAfter = await tokenV2.balanceOf(ownerAddress);
  const totalSupplyAfter = await tokenV2.totalSupply();

  console.log("Upgrade tx hash:", upgradeReceipt.transactionHash);
  console.log("Owner balance after upgrade:", balanceAfter.toString());
  console.log("Total supply after upgrade:", totalSupplyAfter.toString());
  console.log("version():", await tokenV2.version());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

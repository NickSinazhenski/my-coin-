const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const initialSupply = ethers.utils.parseEther("1000000");

  console.log("Deploying contracts with account:", deployer.address);

  const MyTokenV1 = await ethers.getContractFactory("MyTokenV1");
  const implementation = await MyTokenV1.deploy();
  await implementation.deployed();

  const initData = implementation.interface.encodeFunctionData("initialize", [
    deployer.address,
    initialSupply,
  ]);

  const MyTokenProxy = await ethers.getContractFactory("MyTokenProxy");
  const proxy = await MyTokenProxy.deploy(implementation.address, initData);
  await proxy.deployed();

  const token = await ethers.getContractAt("MyTokenV1", proxy.address);

  console.log("V1 implementation deployed to:", implementation.address);
  console.log("Proxy deployed to:", proxy.address);
  console.log("Proxy owner:", await token.owner());
  console.log("Initial owner balance:", (await token.balanceOf(deployer.address)).toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

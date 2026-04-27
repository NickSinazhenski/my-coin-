const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken upgrade flow", function () {
  async function expectCustomError(txPromise, errorName) {
    try {
      await txPromise;
      expect.fail(`Expected transaction to revert with ${errorName}`);
    } catch (error) {
      expect(error.message).to.include(errorName);
    }
  }

  async function deployProxyFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const initialSupply = ethers.utils.parseEther("1000000");

    const MyTokenV1 = await ethers.getContractFactory("MyTokenV1");
    const implementationV1 = await MyTokenV1.deploy();
    await implementationV1.deployed();

    const initData = implementationV1.interface.encodeFunctionData("initialize", [
      owner.address,
      initialSupply,
    ]);

    const MyTokenProxy = await ethers.getContractFactory("MyTokenProxy");
    const proxy = await MyTokenProxy.deploy(implementationV1.address, initData);
    await proxy.deployed();

    const tokenV1 = await ethers.getContractAt("MyTokenV1", proxy.address);

    return {
      owner,
      addr1,
      addr2,
      proxy,
      tokenV1,
      implementationV1,
      initialSupply,
    };
  }

  it("mints and transfers through the V1 proxy", async function () {
    const { owner, addr1, addr2, tokenV1, initialSupply } = await deployProxyFixture();
    const mintAmount = ethers.utils.parseEther("1000");
    const transferAmount = ethers.utils.parseEther("250");

    expect((await tokenV1.balanceOf(owner.address)).toString()).to.equal(
      initialSupply.toString()
    );

    await tokenV1.mint(addr1.address, mintAmount);
    await tokenV1.transfer(addr2.address, transferAmount);

    expect((await tokenV1.balanceOf(addr1.address)).toString()).to.equal(
      mintAmount.toString()
    );
    expect((await tokenV1.balanceOf(addr2.address)).toString()).to.equal(
      transferAmount.toString()
    );
  });

  it("keeps balances and exposes version() after upgrading to V2", async function () {
    const { owner, addr1, proxy, tokenV1 } = await deployProxyFixture();
    const mintAmount = ethers.utils.parseEther("1000");
    const transferAmount = ethers.utils.parseEther("125");

    await tokenV1.mint(addr1.address, mintAmount);
    await tokenV1.transfer(addr1.address, transferAmount);

    const ownerBalanceBefore = await tokenV1.balanceOf(owner.address);
    const addr1BalanceBefore = await tokenV1.balanceOf(addr1.address);
    const totalSupplyBefore = await tokenV1.totalSupply();

    const MyTokenV2 = await ethers.getContractFactory("MyTokenV2");
    const implementationV2 = await MyTokenV2.deploy();
    await implementationV2.deployed();

    await tokenV1.upgradeToAndCall(implementationV2.address, "0x");

    const tokenV2 = await ethers.getContractAt("MyTokenV2", proxy.address);

    expect(await tokenV2.version()).to.equal("V2");
    expect((await tokenV2.balanceOf(owner.address)).toString()).to.equal(
      ownerBalanceBefore.toString()
    );
    expect((await tokenV2.balanceOf(addr1.address)).toString()).to.equal(
      addr1BalanceBefore.toString()
    );
    expect((await tokenV2.totalSupply()).toString()).to.equal(
      totalSupplyBefore.toString()
    );
  });

  it("rejects upgrades from a non-owner account", async function () {
    const { addr1, tokenV1 } = await deployProxyFixture();

    const MyTokenV2 = await ethers.getContractFactory("MyTokenV2");
    const implementationV2 = await MyTokenV2.deploy();
    await implementationV2.deployed();

    await expectCustomError(
      tokenV1.connect(addr1).upgradeToAndCall(implementationV2.address, "0x"),
      "OwnableUnauthorizedAccount"
    );
  });
});

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  async function expectCustomError(txPromise, errorName) {
    try {
      await txPromise;
      expect.fail(`Expected transaction to revert with ${errorName}`);
    } catch (error) {
      expect(error.message).to.include(errorName);
    }
  }

  async function deployMyToken() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const initialSupply = ethers.utils.parseEther("1000000");
    const mintAmount = ethers.utils.parseEther("1000");

    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy(initialSupply);
    await myToken.deployed();

    return { myToken, owner, addr1, addr2, initialSupply, mintAmount };
  }

  it("deploys with the correct initial supply assigned to the owner", async function () {
    const { myToken, owner, initialSupply } = await deployMyToken();

    expect((await myToken.balanceOf(owner.address)).toString()).to.equal(
      initialSupply.toString()
    );
    expect((await myToken.totalSupply()).toString()).to.equal(
      initialSupply.toString()
    );
  });

  it("allows the owner to mint new tokens", async function () {
    const { myToken, addr1, mintAmount } = await deployMyToken();

    await myToken.mint(addr1.address, mintAmount);

    expect((await myToken.balanceOf(addr1.address)).toString()).to.equal(
      mintAmount.toString()
    );
  });

  it("rejects minting from a non-owner account", async function () {
    const { myToken, addr1, addr2, mintAmount } = await deployMyToken();

    await expectCustomError(
      myToken.connect(addr1).mint(addr2.address, mintAmount),
      "OwnableUnauthorizedAccount"
    );
  });

  it("transfers tokens between accounts", async function () {
    const { myToken, owner, addr1 } = await deployMyToken();
    const transferAmount = ethers.utils.parseEther("500");

    await myToken.transfer(addr1.address, transferAmount);

    expect((await myToken.balanceOf(owner.address)).toString()).to.equal(
      ethers.utils.parseEther("999500").toString()
    );
    expect((await myToken.balanceOf(addr1.address)).toString()).to.equal(
      transferAmount.toString()
    );
  });

  it("reverts when transferring more than the available balance", async function () {
    const { myToken, addr1, addr2 } = await deployMyToken();
    const excessiveAmount = ethers.utils.parseEther("1");

    await expectCustomError(
      myToken.connect(addr1).transfer(addr2.address, excessiveAmount),
      "ERC20InsufficientBalance"
    );
  });
});

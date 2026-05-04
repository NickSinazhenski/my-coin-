const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultiSigWallet", function () {
  function expectRevert(message, expectedText) {
    return message
      .then(() => expect.fail(`Expected revert containing ${expectedText}`))
      .catch((error) => {
        expect(error.message).to.include(expectedText);
      });
  }

  async function deployWalletFixture() {
    const [owner1, owner2, owner3, nonOwner, recipient] = await ethers.getSigners();
    const owners = [owner1.address, owner2.address, owner3.address];

    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const wallet = await MultiSigWallet.deploy(owners, 2);
    await wallet.deployed();

    return { wallet, owner1, owner2, owner3, nonOwner, recipient, owners };
  }

  it("deploys with the provided owners and confirmation threshold", async function () {
    const { wallet, owners } = await deployWalletFixture();

    expect((await wallet.requiredConfirmations()).toString()).to.equal("2");
    expect(await wallet.getOwners()).to.deep.equal(owners);
    expect(await wallet.isOwner(owners[0])).to.equal(true);
    expect(await wallet.isOwner(owners[1])).to.equal(true);
    expect(await wallet.isOwner(owners[2])).to.equal(true);
  });

  it("rejects invalid constructor parameters", async function () {
    const [owner1, owner2] = await ethers.getSigners();
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");

    await expectRevert(
      MultiSigWallet.deploy([], 1),
      "InvalidOwners"
    );
    await expectRevert(
      MultiSigWallet.deploy([owner1.address, owner2.address], 0),
      "InvalidRequirement"
    );
    await expectRevert(
      MultiSigWallet.deploy([owner1.address, owner2.address], 3),
      "InvalidRequirement"
    );
    await expectRevert(
      MultiSigWallet.deploy([owner1.address, owner1.address], 1),
      "DuplicateOwner"
    );
  });

  it("allows an owner to submit a transaction and emits an event", async function () {
    const { wallet, owner1, recipient } = await deployWalletFixture();
    const value = ethers.utils.parseEther("1");

    const tx = await wallet
      .connect(owner1)
      .submitTransaction(recipient.address, value, "0x");
    const receipt = await tx.wait();
    const event = receipt.events.find((entry) => entry.event === "SubmitTransaction");

    expect(event.args.owner).to.equal(owner1.address);
    expect(event.args.txIndex.toNumber()).to.equal(0);
    expect(event.args.to).to.equal(recipient.address);

    const storedTx = await wallet.getTransaction(0);
    expect(storedTx.to).to.equal(recipient.address);
    expect(storedTx.value.toString()).to.equal(value.toString());
    expect(storedTx.executed).to.equal(false);
    expect(storedTx.numConfirmations.toString()).to.equal("0");
  });

  it("supports confirmation and revocation by owners", async function () {
    const { wallet, owner1, owner2, recipient } = await deployWalletFixture();

    await wallet.connect(owner1).submitTransaction(recipient.address, 0, "0x");

    const confirmTx = await wallet.connect(owner1).confirmTransaction(0);
    const confirmReceipt = await confirmTx.wait();
    expect(confirmReceipt.events.some((entry) => entry.event === "ConfirmTransaction")).to.equal(
      true
    );
    expect(await wallet.isConfirmed(0, owner1.address)).to.equal(true);

    await wallet.connect(owner2).confirmTransaction(0);
    expect((await wallet.getTransaction(0)).numConfirmations.toString()).to.equal("2");

    const revokeTx = await wallet.connect(owner2).revokeConfirmation(0);
    const revokeReceipt = await revokeTx.wait();
    expect(revokeReceipt.events.some((entry) => entry.event === "RevokeConfirmation")).to.equal(
      true
    );
    expect(await wallet.isConfirmed(0, owner2.address)).to.equal(false);
    expect((await wallet.getTransaction(0)).numConfirmations.toString()).to.equal("1");
  });

  it("executes an ether transfer only after the required confirmations", async function () {
    const { wallet, owner1, owner2, recipient } = await deployWalletFixture();
    const fundingAmount = ethers.utils.parseEther("5");
    const transferAmount = ethers.utils.parseEther("1");

    await owner1.sendTransaction({
      to: wallet.address,
      value: fundingAmount,
    });

    await wallet.connect(owner1).submitTransaction(recipient.address, transferAmount, "0x");
    await wallet.connect(owner1).confirmTransaction(0);

    await expectRevert(
      wallet.connect(owner1).executeTransaction(0),
      "NotEnoughConfirmations"
    );

    const balanceBefore = await ethers.provider.getBalance(recipient.address);
    await wallet.connect(owner2).confirmTransaction(0);

    const executeTx = await wallet.connect(owner1).executeTransaction(0);
    const executeReceipt = await executeTx.wait();
    expect(executeReceipt.events.some((entry) => entry.event === "ExecuteTransaction")).to.equal(
      true
    );

    const balanceAfter = await ethers.provider.getBalance(recipient.address);
    expect(balanceAfter.sub(balanceBefore).toString()).to.equal(transferAmount.toString());
    expect((await wallet.getTransaction(0)).executed).to.equal(true);
  });

  it("rejects duplicate confirmations, invalid actions, and non-owner access", async function () {
    const { wallet, owner1, owner2, nonOwner, recipient } = await deployWalletFixture();

    await wallet.connect(owner1).submitTransaction(recipient.address, 0, "0x");
    await wallet.connect(owner1).confirmTransaction(0);

    await expectRevert(
      wallet.connect(owner1).confirmTransaction(0),
      "TxAlreadyConfirmed"
    );
    await expectRevert(
      wallet.connect(owner2).revokeConfirmation(0),
      "TxNotConfirmed"
    );
    await expectRevert(
      wallet.connect(nonOwner).submitTransaction(recipient.address, 0, "0x"),
      "NotOwner"
    );
    await expectRevert(
      wallet.connect(nonOwner).confirmTransaction(0),
      "NotOwner"
    );
    await expectRevert(
      wallet.connect(owner1).confirmTransaction(99),
      "TxDoesNotExist"
    );
  });
});

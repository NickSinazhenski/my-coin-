const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GameCharacterCollectionERC1155", function () {
  function expectRevert(txPromise, expectedText) {
    return txPromise
      .then(() => expect.fail(`Expected revert containing ${expectedText}`))
      .catch((error) => {
        expect(error.message).to.include(expectedText);
      });
  }

  async function deployFixture() {
    const [owner, student, other] = await ethers.getSigners();
    const GameCharacterCollectionERC1155 = await ethers.getContractFactory(
      "GameCharacterCollectionERC1155"
    );
    const contract = await GameCharacterCollectionERC1155.deploy(
      "ipfs://game-characters/{id}.json"
    );
    await contract.deployed();

    return { contract, owner, student, other };
  }

  it("deploys with a marketplace-compatible ERC-1155 metadata URI", async function () {
    const { contract } = await deployFixture();
    expect(await contract.uri(1)).to.equal("ipfs://game-characters/{id}.json");
    expect((await contract.MAX_CHARACTER_ID()).toString()).to.equal("10");
  });

  it("allows only the owner to mint valid character ids", async function () {
    const { contract, owner, student, other } = await deployFixture();

    await contract.connect(owner).mintCharacter(student.address, 1, 1, "0x");
    expect((await contract.balanceOf(student.address, 1)).toString()).to.equal("1");

    await expectRevert(
      contract.connect(other).mintCharacter(student.address, 2, 1, "0x"),
      "Ownable: caller is not the owner"
    );
    await expectRevert(
      contract.connect(owner).mintCharacter(student.address, 11, 1, "0x"),
      "InvalidCharacterId"
    );
  });

  it("supports batch minting of 10 character ids and batch transfers", async function () {
    const { contract, owner, student } = await deployFixture();
    const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const amounts = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

    await contract.connect(owner).mintBatchCharacters(owner.address, ids, amounts, "0x");

    const ownerBalances = await contract.balanceOfBatch(
      new Array(ids.length).fill(owner.address),
      ids
    );
    expect(ownerBalances.map((value) => value.toString())).to.deep.equal(
      amounts.map((value) => value.toString())
    );

    await contract
      .connect(owner)
      .safeBatchTransferFrom(owner.address, student.address, [1, 2], [1, 1], "0x");

    expect((await contract.balanceOf(student.address, 1)).toString()).to.equal("1");
    expect((await contract.balanceOf(student.address, 2)).toString()).to.equal("1");
  });

  it("rejects invalid batch input lengths and zero mint amounts", async function () {
    const { contract, owner, student } = await deployFixture();

    await expectRevert(
      contract.connect(owner).mintBatchCharacters(student.address, [1, 2], [1], "0x"),
      "InvalidArrayLength"
    );
    await expectRevert(
      contract.connect(owner).mintBatchCharacters(student.address, [1, 2], [1, 0], "0x"),
      "InvalidMintAmount"
    );
  });
});

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoulboundVisitCardERC721", function () {
  function expectRevert(txPromise, expectedText) {
    return txPromise
      .then(() => expect.fail(`Expected revert containing ${expectedText}`))
      .catch((error) => {
        expect(error.message).to.include(expectedText);
      });
  }

  async function deployFixture() {
    const [owner, student, other] = await ethers.getSigners();
    const SoulboundVisitCardERC721 = await ethers.getContractFactory(
      "SoulboundVisitCardERC721"
    );
    const contract = await SoulboundVisitCardERC721.deploy();
    await contract.deployed();

    return { contract, owner, student, other };
  }

  it("allows only the owner to mint exactly one visit card per student", async function () {
    const { contract, owner, student, other } = await deployFixture();
    const uri = "ipfs://student-card-metadata/1.json";

    await contract.connect(owner).mintVisitCard(student.address, uri);

    expect((await contract.balanceOf(student.address)).toString()).to.equal("1");
    expect((await contract.ownerOf(1)).toLowerCase()).to.equal(student.address.toLowerCase());
    expect(await contract.tokenURI(1)).to.equal(uri);
    expect(await contract.hasVisitCard(student.address)).to.equal(true);

    await expectRevert(
      contract.connect(owner).mintVisitCard(student.address, uri),
      "VisitCardAlreadyMinted"
    );
    await expectRevert(
      contract.connect(other).mintVisitCard(other.address, uri),
      "Ownable: caller is not the owner"
    );
  });

  it("blocks approvals and all transfer methods after minting", async function () {
    const { contract, owner, student, other } = await deployFixture();

    await contract.connect(owner).mintVisitCard(student.address, "ipfs://student-card/1.json");

    await expectRevert(contract.connect(student).approve(other.address, 1), "ApprovalsDisabled");
    await expectRevert(
      contract.connect(student).setApprovalForAll(other.address, true),
      "ApprovalsDisabled"
    );
    await expectRevert(
      contract.connect(student).transferFrom(student.address, other.address, 1),
      "SoulboundTransferBlocked"
    );
    await expectRevert(
      contract
        .connect(student)
        ["safeTransferFrom(address,address,uint256)"](student.address, other.address, 1),
      "SoulboundTransferBlocked"
    );
  });
});

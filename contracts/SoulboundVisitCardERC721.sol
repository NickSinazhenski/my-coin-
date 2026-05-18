// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract SoulboundVisitCardERC721 is ERC721URIStorage, Ownable {
    error InvalidStudentAddress();
    error VisitCardAlreadyMinted(address student);
    error SoulboundTransferBlocked();
    error ApprovalsDisabled();

    uint256 private s_nextTokenId = 1;
    mapping(address => bool) public hasVisitCard;

    event VisitCardMinted(address indexed student, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("Soulbound Student Visit Card", "SSVC") Ownable() {}

    function mintVisitCard(address student, string calldata tokenMetadataURI) external onlyOwner {
        if (student == address(0)) revert InvalidStudentAddress();
        if (hasVisitCard[student]) revert VisitCardAlreadyMinted(student);

        uint256 tokenId = s_nextTokenId;
        s_nextTokenId += 1;

        hasVisitCard[student] = true;
        _safeMint(student, tokenId);
        _setTokenURI(tokenId, tokenMetadataURI);

        emit VisitCardMinted(student, tokenId, tokenMetadataURI);
    }

    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert ApprovalsDisabled();
    }

    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert ApprovalsDisabled();
    }

    function transferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert SoulboundTransferBlocked();
    }

    function safeTransferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert SoulboundTransferBlocked();
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override(ERC721, IERC721) {
        revert SoulboundTransferBlocked();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        if (from != address(0) && to != address(0)) revert SoulboundTransferBlocked();
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract GameCharacterCollectionERC1155 is ERC1155, Ownable {
    error InvalidCharacterId(uint256 id);
    error InvalidRecipient();
    error InvalidArrayLength();
    error InvalidMintAmount(uint256 amount);

    uint256 public constant MAX_CHARACTER_ID = 10;

    event CharacterMinted(address indexed to, uint256 indexed id, uint256 amount);
    event CharacterBatchMinted(address indexed to, uint256[] ids, uint256[] amounts);
    event MetadataBaseURIUpdated(string newBaseURI);

    constructor(string memory metadataBaseURI) ERC1155(metadataBaseURI) Ownable() {}

    function mintCharacter(address to, uint256 id, uint256 amount, bytes calldata data) external onlyOwner {
        _validateRecipient(to);
        _validateCharacterId(id);
        if (amount == 0) revert InvalidMintAmount(amount);

        _mint(to, id, amount, data);
        emit CharacterMinted(to, id, amount);
    }

    function mintBatchCharacters(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external onlyOwner {
        _validateRecipient(to);
        _validateBatch(ids, amounts);

        _mintBatch(to, ids, amounts, data);
        emit CharacterBatchMinted(to, ids, amounts);
    }

    function setMetadataBaseURI(string calldata newBaseURI) external onlyOwner {
        _setURI(newBaseURI);
        emit MetadataBaseURIUpdated(newBaseURI);
    }

    function _validateRecipient(address to) private pure {
        if (to == address(0)) revert InvalidRecipient();
    }

    function _validateCharacterId(uint256 id) private pure {
        if (id == 0 || id > MAX_CHARACTER_ID) revert InvalidCharacterId(id);
    }

    function _validateBatch(uint256[] calldata ids, uint256[] calldata amounts) private pure {
        if (ids.length == 0 || ids.length != amounts.length) revert InvalidArrayLength();

        for (uint256 i = 0; i < ids.length; i++) {
            _validateCharacterId(ids[i]);
            if (amounts[i] == 0) revert InvalidMintAmount(amounts[i]);
        }
    }
}

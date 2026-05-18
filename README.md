# Assignment 9: ERC-721 Soulbound Visit Card and ERC-1155 Game Characters

## Contracts

- `contracts/SoulboundVisitCardERC721.sol`
- `contracts/GameCharacterCollectionERC1155.sol`

## Overview

This project contains two separate NFT contracts:

- `SoulboundVisitCardERC721`:
  a non-transferable ERC-721 token used as a unique student visit card.
- `GameCharacterCollectionERC1155`:
  an ERC-1155 collection with 10 distinct game character token IDs that supports batch minting and batch transfers.

## Solidity version

- `0.8.24`

## Setup

```bash
npm install
```

Compile:

```bash
npm run compile
```

Run tests:

```bash
npm test
```

## Deployment scripts

Visit card deployment:

```bash
npm run deploy:visitcard:local
npm run deploy:visitcard:sepolia
```

Game character deployment:

```bash
npm run deploy:gamechars:local
npm run deploy:gamechars:sepolia
```

## Interaction scripts

Mint one soulbound visit card to the student wallet:

```bash
npm run mint:visitcard:local
npm run mint:visitcard:sepolia
```

Mint 10 ERC-1155 character NFTs and batch transfer 2 of them to the student wallet:

```bash
npm run mint:gamechars:local
npm run mint:gamechars:sepolia
```

## Metadata structure and storage

### ERC-721 soulbound visit card metadata

Each visit card token should point to a unique JSON file stored off-chain, typically on IPFS.
The metadata must include:

- `name`
- `description`
- `image`
- at least two student-related attributes such as:
  - `studentName`
  - `studentID`
  - `course`
  - `year`

Example:

```json
{
  "name": "Student Visit Card #1",
  "description": "Soulbound student visit card NFT.",
  "image": "ipfs://<image-cid>/visit-card-1.png",
  "attributes": [
    { "trait_type": "studentName", "value": "Alice Doe" },
    { "trait_type": "studentID", "value": "S12345" },
    { "trait_type": "course", "value": "Blockchain" },
    { "trait_type": "year", "value": "2026" }
  ]
}
```

### ERC-1155 game character metadata

The ERC-1155 contract is designed for a base metadata URI such as:

```text
ipfs://<metadata-cid>/{id}.json
```

Each of the 10 token IDs should have its own metadata JSON file with:

- `name`
- `description`
- `image`
- at least two character attributes such as:
  - `color`
  - `speed`
  - `strength`
  - `rarity`

Example:

```json
{
  "name": "Flame Knight",
  "description": "Game character NFT #1",
  "image": "ipfs://<image-cid>/1.png",
  "attributes": [
    { "trait_type": "color", "value": "Red" },
    { "trait_type": "speed", "value": 7 },
    { "trait_type": "strength", "value": 9 },
    { "trait_type": "rarity", "value": "Epic" }
  ]
}
```

## Soulbound behavior

The ERC-721 contract enforces soulbound behavior by:

- disabling `approve`
- disabling `setApprovalForAll`
- disabling `transferFrom`
- disabling both `safeTransferFrom` overloads
- blocking internal token transfers after minting through `_update`

Only minting is allowed.

## Access control

Both contracts use `Ownable`.
Only the contract owner/admin can mint NFTs.

## Proof of functionality to collect

- ERC-721 visit card mint transaction hash or screenshot
- ERC-1155 batch mint transaction hash or screenshot
- ERC-1155 batch transfer transaction hash or screenshot
- Explorer links for deployed contracts

## Suggested local workflow

Terminal 1:

```bash
HARDHAT_DISABLE_TELEMETRY_PROMPT=true npx hardhat node
```

Terminal 2:

```bash
npm run deploy:visitcard:local
npm run deploy:gamechars:local
```

Then set the required environment variables and run:

```bash
npm run mint:visitcard:local
npm run mint:gamechars:local
```

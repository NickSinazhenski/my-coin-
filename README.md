# Multi-Signature Wallet Homework

## Overview

This project implements a simple Ethereum multi-signature wallet in Solidity.
The wallet is controlled by a fixed set of owners, and a transaction can only be executed after it receives the minimum number of required confirmations.

## Why multi-sig wallets matter

Multi-signature wallets reduce single-key risk.
They are widely used in DeFi treasuries, protocol governance, DAO operations, and shared custody because no single owner can unilaterally move funds or call privileged actions.

## Design choices

- Fixed owner set defined in the constructor
- Configurable confirmation threshold
- Generic transaction model: `to`, `value`, `data`
- Full transaction lifecycle:
  - submit
  - confirm
  - revoke
  - execute
- Ether deposits supported through `receive()`
- Event logging for all key actions

Dynamic owner management is intentionally omitted in this version to keep the contract smaller and easier to reason about.

## Contract files

- `contracts/MultiSigWallet.sol` - main multi-sig wallet contract
- `test/MultiSigWallet.test.js` - unit tests for deployment, lifecycle, execution, and edge cases
- `scripts/deploy-multisig.js` - deployment script for localhost or Sepolia

## Security considerations

- Only registered owners can submit, confirm, revoke, or execute transactions
- Duplicate confirmations are rejected
- Transactions cannot be executed twice
- Revocation is blocked after execution
- Execution requires the configured threshold
- Ether transfer uses checks-effects-interactions:
  - validation first
  - state updated before external call
  - external call executed last
- Custom errors are used for clearer failure modes and lower gas than long revert strings

## Development setup

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

## Local deployment

Terminal 1:

```bash
HARDHAT_DISABLE_TELEMETRY_PROMPT=true npx hardhat node
```

Terminal 2:

```bash
npm run deploy:multisig:local
```

By default, the script uses the first 3 local signers and requires 2 confirmations.

## Sepolia deployment

Create `.env` from `.env.example`, then load it:

```bash
set -a
source .env
set +a
```

Example values:

```bash
SEPOLIA_RPC_URL=https://your-sepolia-rpc-url
PRIVATE_KEY=your-private-key-without-0x
MULTISIG_OWNERS=0xOwner1,0xOwner2,0xOwner3
MULTISIG_REQUIRED=2
```

Deploy:

```bash
npm run deploy:multisig:sepolia
```

## How to interact with the wallet

1. Fund the wallet by sending ETH to the deployed contract address.
2. Submit a transaction:
   one owner proposes a transfer with a target address, ETH value, and optional calldata.
3. Confirm the transaction:
   other owners confirm the same `txIndex`.
4. Execute the transaction:
   any owner can execute it after the threshold is reached.
5. Revoke if needed:
   an owner can revoke their confirmation before execution.

## Required deliverables

- Solidity code for `MultiSigWallet.sol`
- Deployment script or steps
- Explorer links, screenshots, and logs showing:
  - wallet deployment
  - transaction submission and confirmations
  - successful execution
  - balances after execution

## Reflection

The purpose of a multi-sig wallet is to distribute control and reduce trust in any single participant.
This makes administrative actions and treasury transfers much safer in decentralized systems, especially where funds are managed collectively.

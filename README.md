# Upgradeable ERC20 Homework

## Contracts

- `contracts/MyTokenV1.sol` - upgradeable ERC20 V1 implementation
- `contracts/MyTokenProxy.sol` - ERC1967 proxy used for delegation
- `contracts/MyTokenV2.sol` - upgraded implementation with `version()`

## Setup

```bash
npm install
```

## Compile

```bash
npm run compile
```

## Test the full upgrade flow

```bash
npm test
```

## Local deployment and upgrade

Terminal 1:

```bash
HARDHAT_DISABLE_TELEMETRY_PROMPT=true npx hardhat node
```

Terminal 2:

```bash
npm run deploy:v1:local
```

Save the proxy address from the output, then export the values below:

```bash
export TOKEN_PROXY_ADDRESS=0xYourProxyAddress
export RECIPIENT_ADDRESS=0xRecipientAddress
export SECOND_RECIPIENT_ADDRESS=0xSecondRecipientAddress
```

Run V1 interactions:

```bash
npm run interact:v1:local
```

Run the upgrade to V2:

```bash
npm run upgrade:v2:local
```

## Sepolia deployment and upgrade

Create `.env` from `.env.example`, fill in your values, then load it:

```bash
set -a
source .env
set +a
```

Deploy V1 and proxy:

```bash
npm run deploy:v1:sepolia
```

Export the proxy and recipient addresses:

```bash
export TOKEN_PROXY_ADDRESS=0xYourProxyAddress
export RECIPIENT_ADDRESS=0xRecipientAddress
export SECOND_RECIPIENT_ADDRESS=0xSecondRecipientAddress
```

Execute mint and transfer through the proxy:

```bash
npm run interact:v1:sepolia
```

Upgrade the proxy to V2:

```bash
npm run upgrade:v2:sepolia
```

## What to capture for deliverables

- Explorer link for the proxy contract address
- Explorer screenshots for mint and transfer transactions on V1
- Explorer screenshot for the successful upgrade transaction
- Console logs showing balances before and after upgrade
- Console log showing `version(): V2`

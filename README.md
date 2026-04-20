## Setup

```bash
npm install
```

## Compile

```bash
npm run compile
```

## Run tests

```bash
npm test
```

## Deploy to local Hardhat node

Terminal 1:

```bash
HARDHAT_DISABLE_TELEMETRY_PROMPT=true npx hardhat node
```

Terminal 2:

```bash
npm run deploy:local
```

## Deploy to Sepolia

```bash
set -a
source .env
set +a
npm run deploy:sepolia
```

Deployed contract: https://sepolia.etherscan.io/address/0x56E3B08aA52c7FEf586ae51218E732a0880cA4FD



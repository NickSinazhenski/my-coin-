# Upgradeable ERC20 Homework

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

Current deployed values:

- Deployer / Proxy owner: `0xE3889c3910b77a8bCdD1BC00CaAA6Cbb20bb7dd9`
- V1 implementation: `0x5aE54DfC75c6aAf589008AFE52886eACDc32C81c`
- Proxy: `0xA99660b724fc5646CB0191e5253e05114F9f254b`

Explorer links:

- Proxy: [https://sepolia.etherscan.io/address/0xA99660b724fc5646CB0191e5253e05114F9f254b](https://sepolia.etherscan.io/address/0xA99660b724fc5646CB0191e5253e05114F9f254b)
- V1 implementation: [https://sepolia.etherscan.io/address/0x5aE54DfC75c6aAf589008AFE52886eACDc32C81c](https://sepolia.etherscan.io/address/0x5aE54DfC75c6aAf589008AFE52886eACDc32C81c)

Export the proxy and recipient addresses:

```bash
export TOKEN_PROXY_ADDRESS=0xA99660b724fc5646CB0191e5253e05114F9f254b
export RECIPIENT_ADDRESS=0x8a963C394BEc7974d32316784bc869f70fA25107
export SECOND_RECIPIENT_ADDRESS=0xE3889c3910b77a8bCdD1BC00CaAA6Cbb20bb7dd9
```

Execute mint and transfer through the proxy:

```bash
npm run interact:v1:sepolia
```

Current interaction logs:

- Mint tx hash: `0x287753678f067ec5e96ec1e6c8ff1b14b1ed84a4fb2ff701bf7989ae41f1d05c`
- Transfer tx hash: `0xcbc07f20849c2d654355d48ae64cfaf504ae67497820e0c2378f49c45dd34483`
- Owner balance: `1000000000000000000000000`
- Recipient balance: `1000000000000000000000`
- Second recipient balance: `1000000000000000000000000`

Explorer links:

- Mint tx: [https://sepolia.etherscan.io/tx/0x287753678f067ec5e96ec1e6c8ff1b14b1ed84a4fb2ff701bf7989ae41f1d05c](https://sepolia.etherscan.io/tx/0x287753678f067ec5e96ec1e6c8ff1b14b1ed84a4fb2ff701bf7989ae41f1d05c)
- Transfer tx: [https://sepolia.etherscan.io/tx/0xcbc07f20849c2d654355d48ae64cfaf504ae67497820e0c2378f49c45dd34483](https://sepolia.etherscan.io/tx/0xcbc07f20849c2d654355d48ae64cfaf504ae67497820e0c2378f49c45dd34483)

Upgrade the proxy to V2:

```bash
npm run upgrade:v2:sepolia
```



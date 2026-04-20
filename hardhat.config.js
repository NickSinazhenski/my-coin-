require("@nomiclabs/hardhat-ethers");

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL || "";
const privateKey = process.env.PRIVATE_KEY || "";

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: sepoliaRpcUrl,
      accounts: privateKey ? [privateKey] : [],
    },
  },
};

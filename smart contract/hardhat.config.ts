import "@nomiclabs/hardhat-ethers";        
import "@nomiclabs/hardhat-waffle";        
import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();
console.log("ALCHEMY_URL:", process.env.ALCHEMY_URL); // ADD THIS LINE


const config: HardhatUserConfig = {        
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  }
};

export default config;






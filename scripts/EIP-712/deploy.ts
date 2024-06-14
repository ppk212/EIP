import {ethers, Web3} from "hardhat";

async function main() {
    const accounts = await ethers.getSigners();
    const EIP712 = await ethers.getContractFactory("EIP712");
    const eip712 = await EIP712.deploy("PermitToken", "PTN");

    console.log(`eip721 contract address: ${eip712.target}`);
    console.log(`deployer address: ${accounts[0].address}`);
    
    return eip712;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
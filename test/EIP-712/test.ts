import { expect } from "chai";
import { ethers } from "hardhat";
import Web3 from "web3";

describe("EIP712", function(){
    let web3: Web3;
    let accounts: any[];
    let deployer: any;
    let userA: any;

    let eip712: any;
    
    // Hardhat Network
    // const deployer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    // const userA = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    async function deployEIP712(){
        const EIP712 = await ethers.getContractFactory("EIP712");
        const eip712 = await EIP712.deploy("PermitToken", "PTN");

        return eip712;
    }

    before(async () => {
        web3 = new Web3();
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        userA = accounts[1];
    })

    it("Get hashStruct", async ()=>{
        const eip712 = await deployEIP712();

        const hashedPotato = await eip712.hashStruct({
            from: deployer.address,
            to: userA.address,
            amount: 1000,
        });

        console.log(hashedPotato);
        expect(hashedPotato).exist;
    })

    it("Get Result", async ()=>{
        eip712 = await deployEIP712();
        console.log(`Deployd at ${eip712.target}`);

        // Hardhat Network 기준 서명 값
        const signature = "d6d88062f4e26c9b64814cd0000868e20b15791f5caff373fc89480d2f987e7b5ab2bdebb0506944946a0f8cbfacbd31dd094d87f7dcd196daa01fdb3ca877d01c"

        const r = "0x" + signature.substring(0, 64);
        const s = "0x" + signature.substring(64,128);
        const v = parseInt(signature.substring(128, 130), 16);
        
        console.log(`r: ${r}`);
        console.log(`s: ${s}`);
        console.log(`v: ${v}`);

        const result = await eip712.connect(accounts[4]).permit(
            deployer.address,
            userA.address,
            1000,
            v, r, s
        );

        const allowance = await eip712.allowance(
            deployer.address,
            userA.address
        )

        console.log(allowance);

        expect(allowance).to.equal(1000);
    })

    it("Mint", async () => {
        let balanceDeployer = await eip712.balanceOf(deployer.address);
        let balanceA = await eip712.balanceOf(userA.address);

        console.log(`Before deployer balance: ${balanceDeployer}`);
        console.log(`Before userA balance: ${balanceA}`);

        expect(balanceDeployer).to.equal(0);
        expect(balanceA).to.equal(0);
        
        const amount = web3.utils.toWei('1000', 'ether');

        await eip712.mint(deployer, amount);
        balanceDeployer = await eip712.balanceOf(deployer.address);
        balanceA = await eip712.balanceOf(userA.address);

        console.log(`After deployer balance: ${balanceDeployer}`);
        console.log(`After userA balance: ${balanceA}`);
        expect(balanceDeployer).to.equal(amount);
        expect(balanceA).to.equal(0);
    })

    it("Transfer by userA", async () => {
        await eip712.connect(userA).transferFrom(deployer.address, userA.address, 1000)
        
        let balanceDeployer = await eip712.balanceOf(deployer.address);
        let balanceA = await eip712.balanceOf(userA.address);

        console.log(`After deployer balance: ${balanceDeployer}`);
        console.log(`After userA balance: ${balanceA}`);
        expect(balanceA).to.equal(1000);
    })
})
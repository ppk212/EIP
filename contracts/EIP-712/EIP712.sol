// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract EIP712 is ERC20 {
    bytes32 constant PERMIT_TYPEHASH = keccak256(
        "Permit(address from,address to,uint256 amount)"
    );

    bytes32 public DOMAIN_SEPARATOR;

    struct Permit {
        address from;
        address to;
        uint256 amount;
    }

    constructor(string memory name_ , string memory symbol_) 
    ERC20(name_, symbol_){
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
                keccak256(bytes("PermitToken")),
                keccak256(bytes('1.0')),
                1337,
                address(this)
            )
        );
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function permit(
        address from, 
        address to, 
        uint256 amount,
        uint8 v, bytes32 r, bytes32 s
        ) public{
        bytes32 hashedPotato = hashStruct(Permit(from, to, amount));

        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19\x01',
                DOMAIN_SEPARATOR,
                hashedPotato
            )
        );

        address recoveredAddress = ecrecover(digest, v, r, s);

        require(recoveredAddress == from, "ERC20: Not Owner");
        _approve(from, to, amount);
    }

    function hashStruct(Permit memory _permit) pure public returns(bytes32 hash){
        return keccak256(abi.encode(
            PERMIT_TYPEHASH,
            _permit.from,
            _permit.to,
            _permit.amount
        ));
    }
}
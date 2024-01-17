// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract USDToken is ERC20 {
    address public USDTokenAddress = address(this); // address of this contract
    mapping(address => bool) faucetTaken; // checking whether address takes the token from faucet

    constructor(uint _totalSupply) ERC20("American Dollar", "USD") {
        _mint(msg.sender, _totalSupply * 1e18);
    }
    function faucet() public {
        require(!faucetTaken[msg.sender]);
        // gives msg sender 50 usd token from contract only once
        IERC20(USDTokenAddress).transfer(msg.sender, 50 * (1e18)); // transfers 50 USD Token
        faucetTaken[msg.sender] = true; // changes faucetTaken true for msg sender
    }
}


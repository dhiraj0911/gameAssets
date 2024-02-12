// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WETH is ERC20, Ownable { 
    constructor() ERC20("Wrapped ETH", "WETH"){
        _mint(msg.sender, 800000 * 10 ** decimals());
    }
}
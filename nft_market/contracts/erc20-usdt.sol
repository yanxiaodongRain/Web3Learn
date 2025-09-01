// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract cUSDT is ERC20{
    constructor() ERC20("fake usdt in cbi", "cUSDT")
    {
        _mint(msg.sender, 1 * 10 ** 8 * 10 ** 18);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Market {

    IERC20 public erc20;
    IERC721 public erc721;


    struct Order{
        address seller;
        uint256 tokenId;
        uint256 price;
    }

    mapping(uint256 => Order) public orderOfId;//根据token id 查找订单
    Order[] public orders;
    mapping(uint256 => uint256) public idToOrderIndex;//根据位置查找对于的token id

    event Deal(address seller, address buyer, uint256 tokenId, uint256 price);//交易
    event NewOrder(address seller, uint256 tokenId, uint256 price);//挂单
    event PriceChanged(address seller, uint256 tokenId, uint256 previousPrice, uint256 price);//改单
    event OrderCanceled(address seller, uint256 tokenId);//撤单

    constructor(address _erc20, address _erc721){
        require(_erc20 != address(0), "erc20 zero address");
        require(_erc721 != address(0), "erc721 zero address");
        erc20 = IERC20(_erc20);
        erc721 = IERC721(_erc721);
    }

    function buy(uint256 _tokenId) external{
        Order memory order = orderOfId[_tokenId];
        address seller = order.seller;
        address buyer = msg.sender;
        uint256 price = order.price;

        require(erc20.transferFrom(buyer, seller, price), "transer not successful");
        erc721.safeTransferFrom(address(this), buyer, _tokenId);

        emit Deal(seller, buyer, _tokenId, price);

    }

}
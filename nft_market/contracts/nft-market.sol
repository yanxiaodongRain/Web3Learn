// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Market {
    IERC20 public erc20;
    IERC721 public erc721;

    struct Order {
        address seller;
        uint256 tokenId;
        uint256 price;
    }

    mapping(uint256 => Order) public orderOfId; //根据token id 查找订单
    Order[] public orders;
    mapping(uint256 => uint256) public idToOrderIndex; //根据token id查找对于的位置

    event Deal(address seller, address buyer, uint256 tokenId, uint256 price); //交易
    event NewOrder(address seller, uint256 tokenId, uint256 price); //挂单
    event PriceChanged(
        address seller,
        uint256 tokenId,
        uint256 previousPrice,
        uint256 price
    ); //改单
    event OrderCanceled(address seller, uint256 tokenId); //撤单

    constructor(address _erc20, address _erc721) {
        require(_erc20 != address(0), "erc20 zero address");
        require(_erc721 != address(0), "erc721 zero address");
        erc20 = IERC20(_erc20);
        erc721 = IERC721(_erc721);
    }

    function buy(uint256 _tokenId) external {
        Order memory order = orderOfId[_tokenId];
        address seller = order.seller;
        address buyer = msg.sender;
        uint256 price = order.price;

        require(
            erc20.transferFrom(buyer, seller, price),
            "transer not successful"
        );
        erc721.safeTransferFrom(address(this), buyer, _tokenId);

        //todo 下架订单
        removeOrder(_tokenId);

        emit Deal(seller, buyer, _tokenId, price);
    }

    function cancelOrder(uint256 _tokenId) external {
        address seller = orderOfId[_tokenId].seller;
        require(msg.sender == seller, "not seller");

        erc721.safeTransferFrom(address(this), seller, _tokenId); //这样写的原因是这是一个买卖的合约，买者和卖者都是在这里交易的，所以撤单后需要把NFT还给卖家

        //todo 下架订单
        removeOrder(_tokenId);

        emit OrderCanceled(seller, _tokenId);
    }

    function changePrice(uint256 _tokenId, uint256 _price) external {
        address seller = orderOfId[_tokenId].seller;
        require(msg.sender == seller, "not seller");
        uint256 previousPrice = orderOfId[_tokenId].price;
        orderOfId[_tokenId].price = _price;
        Order storage order = orders[idToOrderIndex[_tokenId]];
        order.price = _price;
        emit PriceChanged(seller, _tokenId, previousPrice, _price);
    }

    //自动上架
    //当卖家调用 safeTransferFrom 把 NFT 转到合约时，这个函数会被调用，然后直接上架订单
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        uint256 price = abi.decode(data, (uint256));
        require(price > 0, "price must be greater than zero");
        //上架
        Order memory order = Order(from, tokenId, price);
        orderOfId[tokenId] = order;
        orders.push(order);
        idToOrderIndex[tokenId] = orders.length - 1;
        emit NewOrder(from, tokenId, price);
        return this.onERC721Received.selector;
    }

    //为什么要用 lastOrder？
    //  Solidity 的数组 不能直接删除中间元素，只能 pop() 删除最后一个元素。
    //  如果我们想删除中间的订单，就需要：
    //     1.取出数组最后一个订单 lastOrder。
    //     2.把最后一个订单覆盖到要删除的位置 index。
    //     3.更新映射 idToOrderIndex，把 lastOrder.tokenId 的索引改成 index。
    //这样删除后，数组仍然紧凑，没有空洞 */
    function removeOrder(uint256 _tokenId) internal {
        delete orderOfId[_tokenId];
        uint256 index = idToOrderIndex[_tokenId];
        uint256 lastIndex = orders.length - 1;
        if (index != lastIndex) {
            Order memory lastOrder = orders[lastIndex];
            orders[index] = lastOrder;
            idToOrderIndex[lastOrder.tokenId] = index;
        }
        orders.pop();
        delete idToOrderIndex[_tokenId];
    }

    function getOrdersLength() external view returns (uint256) {
        return orders.length;
    }

    function getOrders() external view returns (Order[] memory) {
        return orders;
    }

    function getMyNFTs() external view returns (Order[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].seller == msg.sender) {
                count++;
            }
        }

        Order[] memory myOrders = new Order[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].seller == msg.sender) {
                myOrders[index] = orders[i];
                index++;
            }
        }
        return myOrders;
    }
}

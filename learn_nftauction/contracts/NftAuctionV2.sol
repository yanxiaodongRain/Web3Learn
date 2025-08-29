// SPDX-License-Identifier: MIT
pragma solidity ^0.8;


import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract NftAuctionV2 is Initializable{


    struct Auction {
        address seller;//卖家
        uint256 duration;//拍卖持续时间
        uint256 startPrice;//起始价格
        uint256 startTime;//开始时间


        bool ended;//是否结束
        address highestBidder;//最高出价者
        uint256 highestBid; //最高价格

        address nftContract;//NFT合约地址
        uint256 tokenId;//NFT id

    }

    mapping(uint256 => Auction) public auctions;//状态变量
    uint256 public nextAuctionId;//下一个拍卖 id
    address public admin;//管理员地址

    function initialize() initializer public{
        admin = msg.sender;

    }

    function createAuction(uint256 _duration, uint256 _startPrice, address _nftAddress, uint256 _tokenId) public {
        //只有管理员可以创建拍卖
        require(msg.sender == admin, "Only admin can create auctions");

        require(_duration > 1000 * 60, "Duration must be greater than 0");
        require(_startPrice > 0, "Start price must be greater than 0");

        auctions[nextAuctionId] = Auction({
            seller: msg.sender,
            duration: _duration,
            startPrice: _startPrice,
            startTime: block.timestamp,
            ended: false,
            highestBidder: address(0),
            highestBid: 0,
            nftContract: _nftAddress,
            tokenId: _tokenId
        });

        nextAuctionId++;
    }

    //买家参与买单
    function placeBid(uint256 _auctionID) external payable {
        Auction storage auction = auctions[_auctionID];
        //判断当前拍卖是否结束
        require(!auction.ended && auction.startTime + auction.duration > block.timestamp, "Auction has ended");
        //判断出价是否大于当前最高出价
        require(msg.value > auction.highestBid && msg.value >= auction.startPrice, "Bid must be higher than the current highest bid");

        //把拍卖合约里「当前最高出价」原路退还给「当前最高出价人」
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;
    }


    function testHello() public pure returns(string memory)  {
        return "Hello Solidity";
    }
}
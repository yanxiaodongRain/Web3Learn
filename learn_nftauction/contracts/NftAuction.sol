// SPDX-License-Identifier: MIT
pragma solidity ^0.8;


import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract NftAuction is Initializable, UUPSUpgradeable {


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


        address tokenAddress;//参与竞价的资产类型  0x地址表示eth，其他地址表示erc20

    }

    mapping(uint256 => Auction) public auctions;//状态变量
    uint256 public nextAuctionId;//下一个拍卖 id
    address public admin;//管理员地址


    mapping(address => AggregatorV3Interface) public priceFeeds;

    function initialize() initializer public {
        admin = msg.sender;

    }

    function createAuction(uint256 _duration, uint256 _startPrice, address _nftAddress, uint256 _tokenId) public {
        //只有管理员可以创建拍卖
        require(msg.sender == admin, "Only admin can create auctions");

        require(_duration >= 1000 * 10, "Duration must be greater than 0");
        require(_startPrice > 0, "Start price must be greater than 0");

        //转移NFT到合约
        IERC721(_nftAddress).approve(address(this), _tokenId);

        auctions[nextAuctionId] = Auction({
            seller: msg.sender,
            duration: _duration,
            startPrice: _startPrice,
            startTime: block.timestamp,
            ended: false,
            highestBidder: address(0),
            highestBid: 0,
            nftContract: _nftAddress,
            tokenId: _tokenId,
            tokenAddress: address(0)
        });

        nextAuctionId++;
    }

    //买家参与买单
    //TODO ERC20 也能参加
    function placeBid(uint256 _auctionID, uint256 amount, address _tokenAddress) external payable {

        //统一的价值尺度
        //ETH 是 多少美金   1个USDC 是多少美金


        Auction storage auction = auctions[_auctionID];
        //判断当前拍卖是否结束
        require(!auction.ended && auction.startTime + auction.duration > block.timestamp, "Auction has ended");


        uint payValue;
        if (_tokenAddress != address(0)) {
            //处理ERC20资产
            payValue = amount * uint(getLatestPrice(_tokenAddress));
        } else {
            //处理ETH
            amount = msg.value;
            payValue = amount * uint(getLatestPrice(_tokenAddress));
        }

        uint startPriceValue = auction.startPrice * uint(getLatestPrice(_tokenAddress));

        uint hightestBidValue = auction.highestBid * uint(getLatestPrice(_tokenAddress));

        //判断出价是否大于当前最高出价
        require(payValue >= startPriceValue && payValue > hightestBidValue, "Bid must be higher than the current highest bid");

        //把拍卖合约里「当前最高出价」原路退还给「当前最高出价人」
        if (auction.highestBidder == address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        } else {
            //转移ERC20到合约
            IERC20(_tokenAddress).transferFrom(msg.sender, address(this), amount);
            //退回之前的ERC20给最高出价者
            IERC20(auction.tokenAddress).transfer(auction.highestBidder, auction.highestBid);
        }

        auction.tokenAddress = _tokenAddress;
        auction.highestBid = amount;
        auction.highestBidder = msg.sender;
    }

    //结束拍卖
    function endAuction(uint256 _auctionID) external payable {
        Auction storage auction = auctions[_auctionID];
        //判断当前拍卖是否结束
        require(!auction.ended && auction.startTime + auction.duration > block.timestamp, "Auction has ended");
        //转移NFT到最高出价者
        IERC721(auction.nftContract).safeTransferFrom(admin, auction.highestBidder, auction.tokenId);
        //转移剩余的资金到卖家
//        payable(address(this)).transfer(address(this).balance);
        auction.ended = true;

    }


    function setPriceETHFeed(address _tokenAddress, address _priceETHFeed) public {
        priceFeeds[_tokenAddress] = AggregatorV3Interface(_priceETHFeed);
    }

    // ETH => USD   1 => 438893980000 （4388.93980000）
    // USDC => USD  1 => 99988557 (0.9998857)
    function getLatestPrice(address _tokenAddress) public view returns (int256) {
        AggregatorV3Interface priceFeed = priceFeeds[_tokenAddress];
        (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return answer;
    }


    function _authorizeUpgrade(address newImplementation) internal override view {
        //只有管理员可以升级
        require(msg.sender == admin, "Only admin can upgrade");
    }
}
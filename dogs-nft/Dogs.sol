// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.4.0
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Dogs is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    string private uri = "";
    uint256 private MAX_AMOUNT = 3;
    mapping(address => bool) public whiteList;
    bool public preMinWindow = false;
    bool public mintWindow = false;

    // METADATA of NFT
    string constant METADATA_SHIBAINU =
        "ipfs://QmXw7TEAJWKjKifvLE25Z9yjvowWk2NWY3WgnZPUto9XoA";
    string constant METADATA_HUSKY =
        "ipfs://QmTFXZBmmnSANGRGhRVoahTTVPJyGaWum8D3YicJQmG97m";
    string constant METADATA_BULLDOG =
        "ipfs://QmSM5h4WseQWATNhFWeCbqCTAGJCZc11Sa1P5gaXk38ybT";
    string constant METADATA_SHEPHERD =
        "ipfs://QmRGryH7a1SLyTccZdnatjFpKeaydJcpvQKeQTzQgEp9eK";

    constructor() ERC721("Dogs", "DGS") Ownable(msg.sender) {}

    function preMint() public payable returns (uint256) {
        require(preMinWindow, "Premint is not open yet");
        require(
            msg.value == 0.001 ether,
            "The price of dog nft is 0.001 ether"
        );
        require(whiteList[msg.sender], "You are not in the whitelist");
        require(
            balanceOf(msg.sender) < 1,
            "Max amount of NFT minted by an address is 1"
        );
        require(totalSupply() < MAX_AMOUNT, "The NFT is sold out!");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    function mint() public payable returns (uint256) {
        require(mintWindow, "Mint is not open yet");
        require(
            msg.value == 0.005 ether,
            "The price of dog nft is 0.005 ether"
        );
        require(totalSupply() < MAX_AMOUNT, "The NFT is sold out!");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        request();
        return tokenId;
    }

    function request() public {}

    function fulfill() public {
        _setTokenURI(tokenId, uri);
    }

    function addToWhiteList(address[] calldata addr) public onlyOwner {
        for (uint256 i = 0; i < addr.length; i++) {
            whiteList[addr[i]] = true;
        }
    }

    function setWindow(bool _preMintOpen, bool _mintOpen) public onlyOwner {
        preMinWindow = _preMintOpen;
        mintWindow = _mintOpen;
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/access/Ownable.sol";

contract StampbookCoin is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 420_000_000 * 10**18;
    uint256 public publicSalePrice = 0.20 ether;
    uint256 public publicSaleStart;
    uint256 public publicSaleEnd;
    
    constructor(address initialOwner) ERC20("Stampbook Coin", "STP") Ownable(initialOwner) {
        _mint(initialOwner, (MAX_SUPPLY * 10) / 100);
        _mint(address(this), (MAX_SUPPLY * 5) / 100);
    }
    
    function buyTokens() external payable {
        require(block.timestamp >= publicSaleStart, "Sale not started");
        require(block.timestamp <= publicSaleEnd, "Sale ended");
        require(msg.value > 0, "Send ETH");
        
        uint256 tokens = msg.value * 10**18 / publicSalePrice;
        require(totalSupply() + tokens <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(msg.sender, tokens);
    }
    
    function activatePublicSale(uint256 _durationDays) external onlyOwner {
        require(publicSaleStart == 0, "Sale already activated");
        publicSaleStart = block.timestamp;
        publicSaleEnd = block.timestamp + (_durationDays * 1 days);
    }
    
    function withdrawSaleFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function isSaleActive() external view returns (bool) {
        return block.timestamp >= publicSaleStart && block.timestamp <= publicSaleEnd;
    }
    
    function getCurrentPrice() external view returns (uint256) {
        return publicSalePrice;
    }
}
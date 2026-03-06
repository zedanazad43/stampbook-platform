// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StampCoin (STP) – BEP-20 Token
 * @notice BEP-20 token for the Stampcoin platform on BNB Smart Chain.
 *         Blockchain: BNB Smart Chain (BSC)
 *         Consensus:  Proof of Staked Authority (PoSA)
 *         Standard:   BEP-20
 *         ChainID:    56
 *
 * Token distribution (421,000,000 STP total supply):
 *   20% – Public ICO Sale       (84,200,000 STP)
 *   20% – Ecosystem & Partners  (84,200,000 STP)
 *   20% – Community & Rewards   (84,200,000 STP)
 *   15% – Liquidity Pool        (63,150,000 STP)
 *   15% – Team & Founders       (63,150,000 STP)
 *   10% – Reserve               (42,100,000 STP)
 */

interface IBEP20 {
    function totalSupply() external view returns (uint256);
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
    function name() external view returns (string memory);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        _owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    modifier onlyOwner() {
        require(_msgSender() == _owner, "Ownable: caller is not the owner");
        _;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

contract StampCoin is IBEP20, Ownable {
    string private constant _name   = "StampCoin";
    string private constant _symbol = "STP";
    uint8  private constant _decimals = 18;

    uint256 private constant _maxSupply = 421_000_000 * (10 ** uint256(_decimals));
    uint256 private _totalSupply;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Mint(address indexed to, uint256 amount);

    /**
     * @param initialOwner Address that owns the contract and can mint tokens.
     */
    constructor(address initialOwner) Ownable(initialOwner) {}

    // -------------------------------------------------------------------------
    // BEP-20 view functions
    // -------------------------------------------------------------------------

    function name()        public pure override returns (string memory) { return _name; }
    function symbol()      public pure override returns (string memory) { return _symbol; }
    function decimals()    public pure override returns (uint8)         { return _decimals; }
    function totalSupply() public view override returns (uint256)       { return _totalSupply; }
    function maxSupply()   public pure         returns (uint256)        { return _maxSupply; }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function allowance(address owner_, address spender) public view override returns (uint256) {
        return _allowances[owner_][spender];
    }

    // -------------------------------------------------------------------------
    // BEP-20 state-changing functions
    // -------------------------------------------------------------------------

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount)
        public override returns (bool)
    {
        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(currentAllowance >= amount, "BEP20: transfer amount exceeds allowance");
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), currentAllowance - amount);
        return true;
    }

    // -------------------------------------------------------------------------
    // Minting (owner only)
    // -------------------------------------------------------------------------

    /**
     * @notice Mint new STP tokens to `to`. Cannot exceed the hard-cap of 421,000,000 STP.
     * @param to     Recipient address
     * @param amount Amount of tokens to mint (in smallest unit, i.e. with 18 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "BEP20: mint to the zero address");
        require(_totalSupply + amount <= _maxSupply, "BEP20: mint would exceed max supply");
        _totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount);
        emit Mint(to, amount);
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender    != address(0), "BEP20: transfer from the zero address");
        require(recipient != address(0), "BEP20: transfer to the zero address");
        require(_balances[sender] >= amount, "BEP20: transfer amount exceeds balance");
        _balances[sender]    -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function _approve(address owner_, address spender, uint256 amount) internal {
        require(owner_  != address(0), "BEP20: approve from the zero address");
        require(spender != address(0), "BEP20: approve to the zero address");
        _allowances[owner_][spender] = amount;
        emit Approval(owner_, spender, amount);
    }
}

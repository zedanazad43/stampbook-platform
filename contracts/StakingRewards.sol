// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingRewards is Ownable, ReentrancyGuard {
    IERC20 public stakingToken;   // العملة التي يودعها المستخدم (مثلاً STP)
    IERC20 public rewardsToken;    // عملة المكافآت (مثلاً STP أيضاً أو عملة أخرى)
    
    uint256 public rewardRate = 100;  // 100 STP يومياً (قابل للتعديل)
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) private _balances;
    
    uint256 private _totalSupply;
    
    // أحداث للتتبع
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    
    /**
     * @dev المُنشئ
     * @param _stakingToken عنوان عملة الإيداع (STP)
     * @param _rewardsToken عنوان عملة المكافآت (يمكن أن يكون نفس STP)
     */
    constructor(address _stakingToken, address _rewardsToken) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid staking token");
        require(_rewardsToken != address(0), "Invalid rewards token");
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
    }
    
    /**
     * @dev إيداع العملات للحصول على مكافآت
     * @param amount كمية العملات المراد إيداعها
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        _totalSupply += amount;
        _balances[msg.sender] += amount;
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev سحب العملات
     * @param amount كمية العملات المراد سحبها
     */
    function withdraw(uint256 amount) public nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _totalSupply -= amount;
        _balances[msg.sender] -= amount;
        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }
    
    /**
     * @dev الحصول على المكافآت المستحقة
     */
    function getReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            require(rewardsToken.transfer(msg.sender, reward), "Transfer failed");
            emit RewardPaid(msg.sender, reward);
        }
    }
    
    /**
     * @dev سحب المكافآت وإلغاء الإيداع في خطوة واحدة
     */
    function exit() external {
        withdraw(_balances[msg.sender]);
        getReward();
    }
    
    /**
     * @dev تحديث معدل المكافآت (للمالك فقط)
     * @param _newRate المعدل الجديد (بـ STP يومياً)
     */
    function updateRewardRate(uint256 _newRate) external onlyOwner {
        require(_newRate > 0, "Rate must be positive");
        
        // تحديث الحسابات قبل تغيير المعدل
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        
        rewardRate = _newRate;
        emit RewardRateUpdated(_newRate);
    }
    
    /**
     * @dev تمويل العقد بمكافآت (للمالك فقط)
     * @param amount كمية العملات المراد إضافتها للمكافآت
     */
    function fundRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be positive");
        require(rewardsToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }
    
    /**
     * @dev عرض رصيد العقد من عملة المكافآت
     */
    function rewardsBalance() external view returns (uint256) {
        return rewardsToken.balanceOf(address(this));
    }
    
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
    
    /**
     * @dev حساب قيمة المكافأة لكل عملة مُودعة
     */
    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) return rewardPerTokenStored;
        return rewardPerTokenStored + (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / _totalSupply);
    }
    
    /**
     * @dev حساب المكافآت المستحقة لحساب معين
     */
    function earned(address account) public view returns (uint256) {
        return ((_balances[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) + rewards[account];
    }
    
    /**
     * @dev عرض رصيد المستخدم المُودع
     */
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }
    
    /**
     * @dev عرض إجمالي العملات المُودعة
     */
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }
}
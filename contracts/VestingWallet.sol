// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VestingWallet is Ownable, ReentrancyGuard {
    IERC20 public token;
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 startTime;
        uint256 cliffDuration;
        uint256 vestingDuration;
        bool isRevoked;
    }
    mapping(address => VestingSchedule) public vestingSchedules;

    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount);

    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }

    function createVestingSchedule(address _beneficiary, uint256 _amount, uint256 _cliffDays, uint256 _vestingDays) external onlyOwner {
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_amount > 0, "Amount must be positive");
        require(vestingSchedules[_beneficiary].totalAmount == 0, "Schedule exists");
        require(token.balanceOf(address(this)) >= _amount, "Insufficient balance");
        
        vestingSchedules[_beneficiary] = VestingSchedule({
            totalAmount: _amount,
            releasedAmount: 0,
            startTime: block.timestamp,
            cliffDuration: _cliffDays * 1 days,
            vestingDuration: _vestingDays * 1 days,
            isRevoked: false
        });
        emit VestingScheduleCreated(_beneficiary, _amount);
    }

    function releaseTokens() external nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.totalAmount > 0, "No schedule");
        require(!schedule.isRevoked, "Revoked");
        
        uint256 releasable = _computeReleasableAmount(schedule);
        require(releasable > 0, "No tokens to release");
        
        schedule.releasedAmount += releasable;
        require(token.transfer(msg.sender, releasable), "Transfer failed");
        emit TokensReleased(msg.sender, releasable);
    }
    
    function _computeReleasableAmount(VestingSchedule storage schedule) internal view returns (uint256) {
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) return 0;
        uint256 elapsed = block.timestamp - schedule.startTime;
        if (elapsed >= schedule.vestingDuration) return schedule.totalAmount - schedule.releasedAmount;
        uint256 vestedAmount = (schedule.totalAmount * elapsed) / schedule.vestingDuration;
        return vestedAmount - schedule.releasedAmount;
    }
    
    function getReleasableAmount(address _beneficiary) external view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[_beneficiary];
        if (schedule.totalAmount == 0) return 0;
        return _computeReleasableAmount(schedule);
    }
}

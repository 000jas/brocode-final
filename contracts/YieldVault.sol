// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DepositVault.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract YieldVault {
    DepositVault public depositVault;
    IERC20 public rewardToken;

    mapping(uint256 => uint256) public rewards;
    mapping(uint256 => uint256) public totalDeposited;
    mapping(uint256 => mapping(address => uint256)) public claimed;

    event RewardsFunded(uint256 vaultId, uint256 amount);
    event YieldClaimed(uint256 vaultId, address indexed user, uint256 amount);

    constructor(address depositVaultAddress, address rewardTokenAddress) {
        depositVault = DepositVault(depositVaultAddress);
        rewardToken = IERC20(rewardTokenAddress);
    }

    function fundRewards(uint256 vaultId, uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        rewards[vaultId] += amount;
        totalDeposited[vaultId] = address(depositVault).balance; // track total vault liquidity
        emit RewardsFunded(vaultId, amount);
    }

    function claimYield(uint256 vaultId) external {
        uint256 userBalance = depositVault.balanceOf(vaultId, msg.sender);
        require(userBalance > 0, "No deposit");

        uint256 total = totalDeposited[vaultId];
        require(total > 0, "No deposits in vault");

        uint256 userShare = (rewards[vaultId] * userBalance) / total;
        uint256 claimable = userShare - claimed[vaultId][msg.sender];
        require(claimable > 0, "Nothing to claim");

        claimed[vaultId][msg.sender] += claimable;
        require(rewardToken.transfer(msg.sender, claimable), "Transfer failed");

        emit YieldClaimed(vaultId, msg.sender, claimable);
    }
}

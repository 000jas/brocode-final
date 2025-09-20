// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDepositVault {
    function withdrawTo(address to, uint256 vaultId, uint256 amount) external;
}

contract WithdrawHandler {
    IDepositVault public immutable depositVault;

    event WithdrawRequested(address indexed user, uint256 indexed vaultId, uint256 amount, uint256 timestamp);

    constructor(address depositVaultAddress) {
        depositVault = IDepositVault(depositVaultAddress);
    }

    function withdraw(uint256 vaultId, uint256 amount) external {
        depositVault.withdrawTo(msg.sender, vaultId, amount);
        emit WithdrawRequested(msg.sender, vaultId, amount, block.timestamp);
    }
}

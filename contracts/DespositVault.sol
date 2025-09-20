// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DepositVault {
    mapping(uint256 => mapping(address => uint256)) private _deposits;
    mapping(uint256 => bool) public vaultExists;
    mapping(address => bool) public authorizedWithdrawers;

    event Deposited(uint256 indexed vaultId, address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(uint256 indexed vaultId, address indexed user, uint256 amount, uint256 timestamp);
    event VaultCreated(uint256 indexed vaultId);
    event AuthorizedWithdrawerSet(address indexed withdrawer, bool allowed);

    function createVault(uint256 vaultId) external {
        require(!vaultExists[vaultId], "Vault exists");
        vaultExists[vaultId] = true;
        emit VaultCreated(vaultId);
    }

    /// Deposit native SHM
    function deposit(uint256 vaultId) external payable {
        require(vaultExists[vaultId], "Vault does not exist");
        require(msg.value > 0, "Amount zero");

        _deposits[vaultId][msg.sender] += msg.value;

        emit Deposited(vaultId, msg.sender, msg.value, block.timestamp);
    }

    /// Withdraw handler calls this
    function withdrawTo(address to, uint256 vaultId, uint256 amount) external {
        require(authorizedWithdrawers[msg.sender], "Not authorized");
        require(_deposits[vaultId][to] >= amount, "Insufficient balance");

        _deposits[vaultId][to] -= amount;
        payable(to).transfer(amount);

        emit Withdrawn(vaultId, to, amount, block.timestamp);
    }

    function setAuthorizedWithdrawer(address withdrawer, bool allowed) external {
        authorizedWithdrawers[withdrawer] = allowed;
        emit AuthorizedWithdrawerSet(withdrawer, allowed);
    }

    function balanceOf(uint256 vaultId, address user) external view returns (uint256) {
        return _deposits[vaultId][user];
    }
}

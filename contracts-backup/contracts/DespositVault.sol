// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20Minimal {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract DepositVault {
    IERC20Minimal public immutable token;

    mapping(uint256 => mapping(address => uint256)) private _deposits;
    mapping(uint256 => bool) public vaultExists;
    mapping(address => bool) public authorizedWithdrawers;

    event Deposited(uint256 indexed vaultId, address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(uint256 indexed vaultId, address indexed user, uint256 amount, uint256 timestamp);
    event VaultCreated(uint256 indexed vaultId);
    event AuthorizedWithdrawerSet(address indexed withdrawer, bool allowed);

    constructor(address tokenAddress) {
        token = IERC20Minimal(tokenAddress);
    }

    function createVault(uint256 vaultId) external {
        require(!vaultExists[vaultId], "Vault exists");
        vaultExists[vaultId] = true;
        emit VaultCreated(vaultId);
    }

    function deposit(uint256 vaultId, uint256 amount) external {
        require(vaultExists[vaultId], "Vault not exists");
        require(amount > 0, "Amount zero");

        token.transferFrom(msg.sender, address(this), amount);
        _deposits[vaultId][msg.sender] += amount;

        emit Deposited(vaultId, msg.sender, amount, block.timestamp);
    }

    function withdrawTo(address to, uint256 vaultId, uint256 amount) external {
        require(authorizedWithdrawers[msg.sender], "Not authorized");
        require(_deposits[vaultId][to] >= amount, "Insufficient balance");

        _deposits[vaultId][to] -= amount;
        token.transfer(to, amount);

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

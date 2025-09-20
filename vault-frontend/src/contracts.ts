export const CONTRACTS = {
  shmToken: "0xBE0b31986a23a03AD76fF91937893b9C453cEB7B",
  depositVault: "0x3f8f8F2a54fC09AC040cAA313D1615C40eFb8953",
  withdrawHandler: "0x841a8B5d5ad5e4b9858383c917FcfC2ab953dF8f",
};
export const SHMTokenABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
  "function decimals() view returns (uint8)",
];

export const DepositVaultABI = [
  "function deposit(uint256 vaultId, uint256 amount)",
  "function balanceOf(uint256 vaultId, address user) view returns (uint256)",
];

export const WithdrawHandlerABI = [
  "function withdraw(uint256 vaultId, uint256 amount)",
];

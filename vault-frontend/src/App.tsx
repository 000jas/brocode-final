// src/App.tsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

// ✅ Replace with your deployed contract addresses
const depositVaultAddress = "0x718f3c219b639Acb984673cfa9D33a8fA6E8E918";
const withdrawHandlerAddress = "0xF7E2A9666DABF1Ad1C4f830baB5051EDd7cacA0b";

// ✅ Minimal ABIs
const depositVaultABI = [
  "function createVault(uint256 vaultId) external",
  "function deposit(uint256 vaultId) external payable",
  "function balanceOf(uint256 vaultId, address user) external view returns (uint256)",
  "function setAuthorizedWithdrawer(address withdrawer, bool allowed) external",
];

const withdrawHandlerABI = [
  "function withdraw(uint256 vaultId, uint256 amount) external",
];

function App() {
  const [account, setAccount] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [vaultBalance, setVaultBalance] = useState<string>("0");

  // connect wallet
  async function connectWallet() {
    if (!(window as any).ethereum) {
      alert("MetaMask not detected!");
      return;
    }
    const prov = new ethers.BrowserProvider((window as any).ethereum);
    await prov.send("eth_requestAccounts", []);
    const signer = await prov.getSigner();
    const addr = await signer.getAddress();
    setAccount(addr);
    await loadBalances(prov, addr);
  }

  // load balances
  async function loadBalances(prov: ethers.BrowserProvider, addr: string) {
    const bal = await prov.getBalance(addr);
    setWalletBalance(ethers.formatEther(bal));

    const depositVault = new ethers.Contract(depositVaultAddress, depositVaultABI, prov);
    const vbal = await depositVault.balanceOf(1, addr);
    setVaultBalance(ethers.formatEther(vbal));
  }

  // deposit 1 SHM
  async function depositOne() {
    const prov = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await prov.getSigner();
    const depositVault = new ethers.Contract(depositVaultAddress, depositVaultABI, signer);
    const tx = await depositVault.deposit(1, { value: ethers.parseEther("1") });
    await tx.wait();
    await loadBalances(prov, await signer.getAddress());
  }

  // withdraw 1 SHM
  async function withdrawOne() {
    const prov = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await prov.getSigner();
    const withdrawHandler = new ethers.Contract(withdrawHandlerAddress, withdrawHandlerABI, signer);
    const tx = await withdrawHandler.withdraw(1, ethers.parseEther("1"));
    await tx.wait();
    await loadBalances(prov, await signer.getAddress());
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Shardeum Vault dApp</h1>

      {!account ? (
        <button
          onClick={connectWallet}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <p><b>Connected:</b> {account}</p>
          <p>Wallet Balance: {walletBalance} SHM</p>
          <p>Vault Balance: {vaultBalance} SHM</p>

          <div className="mt-4 flex gap-4">
            <button
              onClick={depositOne}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Deposit 1 SHM
            </button>
            <button
              onClick={withdrawOne}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Withdraw 1 SHM
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

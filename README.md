# MICROMINT - Micro Investment Pool Vaults with Yield Generation

A revolutionary DeFi platform that enables users to make micro-investments in high-yield vaults with automated yield generation. Built with Solidity smart contracts and a modern Next.js frontend.

## 🎯 Project Overview

MICROMINT is a decentralized finance (DeFi) platform that allows users to:

1. **Connect Wallet**: Users connect their MetaMask wallet to the platform
2. **Deposit Funds**: Users deposit funds into the Global Vault
3. **Lock Period**: Funds are locked for a predetermined period (e.g., 30 days)
4. **Yield Generation**: Vault automatically invests money into DeFi strategies (like AAVE)
5. **Withdraw Profits**: After lock period, users withdraw deposit + yield (minus 8% platform fee)

## 🏗️ Architecture

### Smart Contracts
- **DepositVault.sol**: Handles user deposits and vault management
- **SHMToken.sol**: Platform's native token for governance and rewards
- **WithdrawHandler.sol**: Manages withdrawal processes and fee calculations

### Frontend Application
- **Next.js 15**: Modern React framework with TypeScript
- **Supabase**: Database for transaction tracking and user data
- **MetaMask Integration**: Seamless wallet connection
- **Real-time Portfolio Tracking**: Live performance monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MetaMask wallet
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/000jas/brocode-final.git
   cd brocode-final
   ```

2. **Install root dependencies**:
   ```bash
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 💰 How It Works

### Investment Flow
1. **Connect**: User connects MetaMask wallet
2. **Deposit**: User deposits funds into the Global Vault
3. **Lock**: Funds are locked for 30 days (configurable)
4. **Invest**: Vault automatically invests in DeFi protocols (AAVE, Compound, etc.)
5. **Generate Yield**: Earn passive income from DeFi strategies
6. **Withdraw**: After lock period, withdraw principal + yield - 8% platform fee

### Fee Structure
- **Platform Fee**: 8% of total yield generated
- **Gas Fees**: Standard Ethereum network fees
- **No Hidden Costs**: Transparent fee structure

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity**: Smart contract development
- **Hardhat**: Development framework
- **OpenZeppelin**: Secure contract libraries
- **TypeChain**: TypeScript bindings

### Frontend
- **Next.js 15**: React framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Supabase**: Database and authentication
- **Ethers.js**: Blockchain interactions

## 📊 Features

### Core Features
- ✅ **Wallet Integration**: MetaMask connection
- ✅ **Vault Management**: Deposit/withdraw funds
- ✅ **Yield Generation**: Automated DeFi investments
- ✅ **Portfolio Tracking**: Real-time performance monitoring
- ✅ **Transaction History**: Complete audit trail
- ✅ **Responsive Design**: Mobile-first approach

### Advanced Features
- 🔄 **Auto-compounding**: Reinvest yields for maximum returns
- 📈 **Performance Analytics**: Detailed yield tracking
- 🛡️ **Security**: Audited smart contracts
- ⚡ **Gas Optimization**: Efficient transaction handling
- 🎨 **Modern UI**: Beautiful, intuitive interface

## 🔧 Development

### Smart Contract Development
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

### Frontend Development
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## 🚀 Deployment

### Smart Contracts
1. Deploy to testnet (Sepolia/Goerli)
2. Verify contracts on Etherscan
3. Deploy to mainnet
4. Update frontend with contract addresses

### Frontend
1. Set up Supabase project
2. Configure environment variables
3. Deploy to Vercel
4. Update contract addresses

Detailed deployment instructions are available in:
- `frontend/DEPLOYMENT.md`
- `frontend/DEPLOY_TO_VERCEL.md`

## 📈 Yield Strategies

The platform invests in various DeFi protocols:

- **AAVE**: Lending and borrowing protocol
- **Compound**: Money market protocol
- **Yearn Finance**: Automated yield farming
- **Curve**: Stablecoin yield optimization
- **Uniswap**: Liquidity provision rewards

## 🔒 Security

- **Audited Contracts**: Professional security audits
- **OpenZeppelin**: Battle-tested contract libraries
- **Multi-sig Wallets**: Secure fund management
- **Timelock Contracts**: Delayed execution for critical functions
- **Emergency Pause**: Circuit breakers for protection

## 📱 User Experience

### For Investors
- Simple deposit process
- Clear yield projections
- Real-time portfolio updates
- Easy withdrawal process
- Comprehensive transaction history

### For Developers
- Well-documented APIs
- TypeScript support
- Modular architecture
- Extensive testing
- Clear deployment guides

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/frontend` directory for detailed guides
- **Issues**: Open an issue on GitHub
- **Discord**: Join our community server
- **Email**: Contact the development team

## 🌟 Roadmap

### Phase 1 (Current)
- ✅ Basic vault functionality
- ✅ MetaMask integration
- ✅ Portfolio tracking
- ✅ Transaction history

### Phase 2 (Q2 2024)
- 🔄 Multi-vault support
- 🔄 Advanced yield strategies
- 🔄 Mobile app
- 🔄 Governance token

### Phase 3 (Q3 2024)
- 📋 Cross-chain support
- 📋 Institutional features
- 📋 Advanced analytics
- 📋 API marketplace

---

**Built with ❤️ for the DeFi community**
y
*Empowering everyone to participate in decentralized finance through micro-investments and automated yield generation.*


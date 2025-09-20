# Micro-Mint  - DeFi Vault Platform

A stunning, modern DeFi vault platform built with Next.js, TypeScript, and Tailwind CSS. Users can connect their MetaMask wallet, invest in high-yield vaults, and track their portfolio performance.

## 🚀 Features

- **Wallet Connection**: MetaMask integration with automatic user detection
- **Portfolio Tracking**: Real-time portfolio performance with interactive charts
- **Vault Management**: Deposit and withdraw from multiple DeFi vaults
- **Transaction History**: Complete transaction tracking with filtering
- **Responsive Design**: Beautiful UI that works on all devices
- **Animations**: Smooth Framer Motion animations throughout
- **Database Integration**: Supabase for data persistence

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Custom CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Database**: Supabase
- **Blockchain**: Ethers.js v6
- **UI Components**: Radix UI

## 📦 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Set up Supabase database**:
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql`
   - Get your project URL and anon key from the Supabase dashboard

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The application uses the following main tables:

- **users**: Stores wallet addresses and user data
- **vaults**: Contains vault information (name, APY, total deposits)
- **user_vaults**: Tracks user investments in each vault
- **transactions**: Records all deposit/withdrawal transactions

## 🔗 Smart Contract Integration

The platform integrates with deployed smart contracts:

- **DepositVault**: Handles deposits and vault creation
- **WithdrawHandler**: Manages withdrawals

Update contract addresses in `src/services/contractService.ts` with your deployed addresses.

## 🎨 UI Components

- **Navigation**: Responsive navigation with wallet connection
- **VaultCard**: Beautiful vault display with deposit/withdraw actions
- **PortfolioChart**: Interactive charts showing performance
- **TransactionList**: Transaction history with filtering
- **HomePage**: Landing page with features and stats

## 🚀 Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   ```bash
   npx vercel
   ```

3. **Update environment variables** in your deployment platform

## 📱 Features Overview

### Home Page
- Hero section with call-to-action
- Feature highlights
- Featured vault showcase
- Platform statistics

### Portfolio Page
- Portfolio performance charts
- Vault allocation pie chart
- User's active vaults
- Quick action buttons

### Transactions Page
- Complete transaction history
- Filter by type (deposits/withdrawals)
- Search functionality
- Export capabilities

## 🔧 Customization

### Colors
The app uses a purple/pink/blue gradient theme. Update colors in:
- `src/app/globals.css`
- Component files with gradient classes

### Animations
Framer Motion animations can be customized in each component's motion props.

### Charts
Chart data and styling can be modified in `src/components/PortfolioChart.tsx`.

## 🐛 Troubleshooting

### Common Issues

1. **MetaMask not detected**: Ensure MetaMask is installed and unlocked
2. **Contract errors**: Verify contract addresses are correct
3. **Database errors**: Check Supabase connection and RLS policies
4. **Build errors**: Ensure all dependencies are installed

### Development Tips

- Use browser dev tools to inspect network requests
- Check Supabase logs for database issues
- Verify contract interactions in MetaMask

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ for the DeFi community
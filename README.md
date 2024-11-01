# ODOSOR - ODOS Smart Order Router

A decentralized exchange aggregator interface powered by ODOS Protocol, offering optimal token swaps across multiple DEXs with the best possible rates.

![ODOS Interface](path-to-your-screenshot.png)

## Features

### Core Functionality

- **Smart Order Routing**: Automatically finds the best trading routes across multiple DEXs
- **Multi-Token Splits**: Split a single token into multiple tokens in one transaction
- **Gas Optimization**: Choose between speed and cost savings for transactions
- **Auto-Refresh Quotes**: Real-time price updates every 10 seconds
- **Price Impact Warnings**: Alerts for high price impact trades

### User Experience

- **Token Search**: Easy-to-use token search and selection interface
- **Real-time Price Updates**: Dynamic price and rate calculations
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Transaction Progress**: Clear feedback on transaction status
- **Wallet Integration**: Seamless connection with Web3 wallets

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: TailwindCSS, Framer Motion
- **Blockchain Integration**: wagmi, ethers.js
- **API Integration**: ODOS Protocol API
- **Price Data**: QuickNode API

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Web3 wallet (MetaMask recommended)

## Usage

### Single Token Swap

1. Connect your Web3 wallet
2. Select input token and amount
3. Select output token
4. Review the quote and gas settings
5. Click "Swap Tokens" to execute the trade

### Multi-Token Split

1. Enable Multi-Token Split mode
2. Select input token and amount
3. Add output tokens (up to 4)
4. Adjust split percentages
5. Review the quotes for each token
6. Execute the split swap

## Supported Networks

- Polygon (MATIC)
- Ethereum (ETH)
- [Add other supported networks]

## API Integration

### ODOS Protocol

The application integrates with ODOS Protocol for:

- Token lists
- Price quotes
- Smart order routing
- Transaction assembly

### QuickNode

Used for:

- Real-time price data
- Blockchain interactions
- Transaction broadcasting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

- [ODOS Protocol](https://odos.xyz)
- [QuickNode](https://quicknode.com)
- [wagmi](https://wagmi.sh)
- [Framer Motion](https://www.framer.com/motion/)

## Support

For support, please reach out to [your contact information] or open an issue in the repository.

## Disclaimer

This project is not officially affiliated with ODOS Protocol. Please use at your own risk and always verify transactions before confirming them.

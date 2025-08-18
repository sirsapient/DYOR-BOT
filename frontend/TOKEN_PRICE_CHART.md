# Token Price Chart Feature

## Overview
A new token price chart component has been added to the DYOR BOT research analysis page. The chart is positioned at the top of the left-hand column, below the project logo and header, showing real-time price data from CoinGecko.

## Features

### 1. Real-Time Price Data
- **CoinGecko Integration**: Fetches live price data from CoinGecko API
- **1-Year Historical Data**: Shows 365 days of price history
- **Current Price Display**: Real-time current price with 24h change
- **All-Time Statistics**: ATH, ATL, and current position relative to ATH

### 2. Interactive Price Chart
- **Area Chart**: Smooth area chart with gradient fill
- **Responsive Design**: Adapts to different screen sizes
- **Interactive Tooltips**: Hover for detailed price information
- **Cyberpunk Styling**: Matches DYOR BOT aesthetic with green matrix theme

### 3. Price Metrics Panel
- **Current Price**: Large display with 24h percentage change
- **All-Time High**: Highest price reached
- **All-Time Low**: Lowest price reached
- **Current Position**: Percentage of current price vs ATH

### 4. Error Handling
- **Loading States**: Shows loading indicator while fetching data
- **Error States**: Displays error messages if API fails
- **No Data States**: Handles cases where no price data is available

## Technical Implementation

### Dependencies
- `recharts`: React charting library for financial data visualization

### API Integration
- **CoinGecko API**: `https://api.coingecko.com/api/v3/coins/{tokenId}/market_chart`
- **Data Format**: Fetches prices, market caps, and volumes
- **Time Range**: 365 days with daily intervals

### Component Structure
```
TokenPriceChart/
├── Current price display with 24h change
├── Price metrics (ATH, ATL, current position)
├── Interactive area chart
└── Chart info and data source
```

### Data Flow
1. **Token ID Detection**: Automatically detects token from research data
2. **API Call**: Fetches price data from CoinGecko
3. **Data Transformation**: Converts timestamps to readable dates
4. **Chart Rendering**: Displays interactive area chart
5. **Metrics Calculation**: Computes ATH, ATL, and position stats

## Token Detection Logic

The chart automatically detects the token to display based on:

1. **Ronin Token**: `research.financialData.roninTokenInfo.symbol`
2. **Avalanche Token**: `research.financialData.avalancheTokenInfo.tokenInfo.tokenSymbol`
3. **Project Name Fallback**: Converts project name to kebab-case for CoinGecko ID

## Styling
- **Cyberpunk Theme**: Matches existing DYOR BOT aesthetic
- **Green Color Scheme**: Uses #00ff41 (matrix green) for consistency
- **Gradient Effects**: Smooth gradient fill for area chart
- **Responsive Grid**: Adapts layout for different screen sizes

## Usage
The chart automatically appears when research data is loaded and contains token information. It provides immediate visual feedback about token price performance and historical trends.

## API Rate Limits
- CoinGecko API has rate limits (10-50 calls per minute)
- Chart includes error handling for rate limit exceeded
- Fallback states for API failures

## Future Enhancements
- **Multiple Timeframes**: 1D, 1W, 1M, 1Y options
- **Volume Chart**: Add volume data visualization
- **Price Alerts**: Set price alert notifications
- **Comparison Mode**: Compare multiple tokens
- **Export Functionality**: Save chart as image
- **Real-time Updates**: Live price updates every few minutes

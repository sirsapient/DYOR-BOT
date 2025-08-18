import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface TokenPriceChartProps {
  tokenId?: string;
  tokenSymbol?: string;
  projectName?: string;
}

interface PriceData {
  date: string;
  price: number;
  volume: number;
}

interface CoinGeckoResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export const TokenPriceChart: React.FC<TokenPriceChartProps> = ({
  tokenId,
  tokenSymbol,
  projectName
}) => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [allTimeHigh, setAllTimeHigh] = useState<number | null>(null);
  const [allTimeLow, setAllTimeLow] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);

  useEffect(() => {
    if (!tokenId) return;
    
    const fetchPriceData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch 1 year of daily data from CoinGecko
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=365&interval=daily`
        );
        
        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.status}`);
        }
        
        const data: CoinGeckoResponse = await response.json();
        
        // Transform the data for the chart
        const transformedData: PriceData[] = data.prices.map(([timestamp, price]) => ({
          date: new Date(timestamp).toLocaleDateString(),
          price: price,
          volume: data.total_volumes.find(([t]) => t === timestamp)?.[1] || 0
        }));
        
        setPriceData(transformedData);
        
        // Calculate current price and all-time stats
        if (transformedData.length > 0) {
          const current = transformedData[transformedData.length - 1].price;
          const high = Math.max(...transformedData.map(d => d.price));
          const low = Math.min(...transformedData.map(d => d.price));
          const yesterday = transformedData[transformedData.length - 2]?.price || current;
          const change24h = ((current - yesterday) / yesterday) * 100;
          
          setCurrentPrice(current);
          setAllTimeHigh(high);
          setAllTimeLow(low);
          setPriceChange24h(change24h);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch price data');
        console.error('Error fetching price data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPriceData();
  }, [tokenId]);

  if (loading) {
    return (
      <div className="token-price-chart">
        <div className="chart-title">TOKEN PRICE CHART</div>
        <div className="loading-state">
          <div className="loading-text">Loading price data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="token-price-chart">
        <div className="chart-title">TOKEN PRICE CHART</div>
        <div className="error-state">
          <div className="error-text">Unable to load price data</div>
          <div className="error-details">{error}</div>
        </div>
      </div>
    );
  }

  if (!priceData.length) {
    return (
      <div className="token-price-chart">
        <div className="chart-title">TOKEN PRICE CHART</div>
        <div className="no-data-state">
          <div className="no-data-text">No price data available</div>
          <div className="no-data-details">
            {tokenSymbol ? `Token: ${tokenSymbol}` : 'Token ID required'}
          </div>
        </div>
      </div>
    );
  }

  // Calculate current position relative to all-time high
  const currentPosition = allTimeHigh && currentPrice 
    ? ((currentPrice / allTimeHigh) * 100).toFixed(1)
    : null;

  return (
    <div className="token-price-chart">
      <div className="chart-title">TOKEN PRICE CHART</div>
      
      {/* Current Price and Stats */}
      <div className="price-stats">
        <div className="current-price">
          <div className="price-label">CURRENT PRICE</div>
          <div className="price-value">
            ${currentPrice?.toFixed(4) || 'N/A'}
            {priceChange24h && (
              <span className={`price-change ${priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        
        <div className="price-metrics">
          <div className="metric-item">
            <div className="metric-label">ALL-TIME HIGH</div>
            <div className="metric-value">${allTimeHigh?.toFixed(4) || 'N/A'}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">ALL-TIME LOW</div>
            <div className="metric-value">${allTimeLow?.toFixed(4) || 'N/A'}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">CURRENT POSITION</div>
            <div className="metric-value">{currentPosition}% of ATH</div>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={priceData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00ff41" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 65, 0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(0, 255, 65, 0.7)"
              fontSize={10}
              tick={{ fill: 'rgba(0, 255, 65, 0.7)' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="rgba(0, 255, 65, 0.7)"
              fontSize={10}
              tick={{ fill: 'rgba(0, 255, 65, 0.7)' }}
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => `$${value.toFixed(4)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid #00ff41',
                borderRadius: '4px',
                color: '#00ff41'
              }}
              labelStyle={{ color: '#00ff41' }}
              formatter={(value: any) => [`$${Number(value).toFixed(4)}`, 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#00ff41"
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      <div className="chart-info">
        <div className="info-text">
          {tokenSymbol ? `${tokenSymbol} Price (1 Year)` : 'Token Price History'}
        </div>
        <div className="info-source">Data: CoinGecko</div>
      </div>
    </div>
  );
};

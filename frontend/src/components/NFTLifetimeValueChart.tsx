import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Bar,
  BarChart,
  ComposedChart,
  Line,
  LineChart
} from 'recharts';
import { NFTData, NFTLifetimeValue } from '../types';

interface NFTLifetimeValueChartProps {
  nftData?: NFTData;
  projectName?: string;
}

interface ChartData {
  date: string;
  price: number;
  volume: number;
  sales: number;
}

export const NFTLifetimeValueChart: React.FC<NFTLifetimeValueChartProps> = ({
  nftData,
  projectName
}) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFloor, setCurrentFloor] = useState<number | null>(null);
  const [totalVolume, setTotalVolume] = useState<number | null>(null);
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [averagePrice, setAveragePrice] = useState<number | null>(null);
  const [highestSale, setHighestSale] = useState<number | null>(null);
  const [lowestSale, setLowestSale] = useState<number | null>(null);

  useEffect(() => {
    if (!nftData?.lifetimeValue) {
      setChartData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const lifetimeValue = nftData.lifetimeValue;
      
      // Combine price and volume history into chart data
      const combinedData: ChartData[] = [];
      const priceMap = new Map<string, number>();
      const volumeMap = new Map<string, number>();
      const salesMap = new Map<string, number>();

      // Process price history
      lifetimeValue.priceHistory.forEach(point => {
        priceMap.set(point.date, point.price);
      });

      // Process volume history
      lifetimeValue.volumeHistory.forEach(point => {
        volumeMap.set(point.date, point.volume);
        salesMap.set(point.date, point.sales);
      });

      // Combine all unique dates
      const allDates = new Set([
        ...lifetimeValue.priceHistory.map(p => p.date),
        ...lifetimeValue.volumeHistory.map(v => v.date)
      ]);

      // Create combined data points
      Array.from(allDates).sort().forEach(date => {
        combinedData.push({
          date,
          price: priceMap.get(date) || 0,
          volume: volumeMap.get(date) || 0,
          sales: salesMap.get(date) || 0
        });
      });

      setChartData(combinedData);
      
      // Set metrics
      setCurrentFloor(nftData.floorPrice || null);
      setTotalVolume(lifetimeValue.totalVolume);
      setTotalSales(lifetimeValue.totalSales);
      setAveragePrice(lifetimeValue.averagePrice);
      setHighestSale(lifetimeValue.highestSale);
      setLowestSale(lifetimeValue.lowestSale);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process NFT data');
      console.error('Error processing NFT data:', err);
    } finally {
      setLoading(false);
    }
  }, [nftData]);

  if (loading) {
    return (
      <div className="nft-lifetime-value-chart">
        <div className="chart-title">NFT LIFETIME VALUE CHART</div>
        <div className="loading-state">
          <div className="loading-text">Loading NFT data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nft-lifetime-value-chart">
        <div className="chart-title">NFT LIFETIME VALUE CHART</div>
        <div className="error-state">
          <div className="error-text">Unable to load NFT data</div>
          <div className="error-details">{error}</div>
        </div>
      </div>
    );
  }

  if (!chartData.length || !nftData) {
    return (
      <div className="nft-lifetime-value-chart">
        <div className="chart-title">NFT LIFETIME VALUE CHART</div>
        <div className="no-data-state">
          <div className="no-data-text">No NFT data available</div>
          <div className="no-data-details">
            {projectName ? `Project: ${projectName}` : 'NFT data required'}
          </div>
        </div>
      </div>
    );
  }

  const currency = nftData.floorPriceCurrency || 'ETH';
  const marketplace = nftData.marketplace?.toUpperCase() || 'NFT';

  return (
    <div className="nft-lifetime-value-chart">
      <div className="chart-title">NFT LIFETIME VALUE CHART</div>
      
      {/* NFT Stats */}
      <div className="nft-stats">
        <div className="current-floor">
          <div className="floor-label">CURRENT FLOOR</div>
          <div className="floor-value">
            {currentFloor ? `${currentFloor} ${currency}` : 'N/A'}
          </div>
        </div>
        
        <div className="nft-metrics">
          <div className="metric-item">
            <div className="metric-label">TOTAL VOLUME</div>
            <div className="metric-value">{totalVolume ? `${totalVolume.toFixed(2)} ${currency}` : 'N/A'}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">TOTAL SALES</div>
            <div className="metric-value">{totalSales?.toLocaleString() || 'N/A'}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">AVG PRICE</div>
            <div className="metric-value">{averagePrice ? `${averagePrice.toFixed(4)} ${currency}` : 'N/A'}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">HIGHEST SALE</div>
            <div className="metric-value">{highestSale ? `${highestSale.toFixed(4)} ${currency}` : 'N/A'}</div>
          </div>
          <div className="metric-item">
            <div className="metric-label">LOWEST SALE</div>
            <div className="metric-value">{lowestSale ? `${lowestSale.toFixed(4)} ${currency}` : 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* NFT Collection Info */}
      <div className="nft-info">
        <div className="collection-info">
          <div className="collection-name">{nftData.collectionName}</div>
          <div className="marketplace-info">{marketplace} • {nftData.network?.toUpperCase()}</div>
          {nftData.totalSupply && (
            <div className="supply-info">Supply: {nftData.totalSupply.toLocaleString()}</div>
          )}
        </div>
        {nftData.imageUrl && (
          <div className="collection-image">
            <img src={nftData.imageUrl} alt={nftData.collectionName} />
          </div>
        )}
      </div>

      {/* Price and Volume Charts */}
      <div className="charts-container">
        {/* Price Chart */}
        <div className="chart-section">
          <div className="chart-subtitle">Price History</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="nftPriceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff6b35" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 107, 53, 0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255, 107, 53, 0.7)"
                  fontSize={10}
                  tick={{ fill: 'rgba(255, 107, 53, 0.7)' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="rgba(255, 107, 53, 0.7)"
                  fontSize={10}
                  tick={{ fill: 'rgba(255, 107, 53, 0.7)' }}
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(value) => `${value.toFixed(4)} ${currency}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid #ff6b35',
                    borderRadius: '4px',
                    color: '#ff6b35'
                  }}
                  labelStyle={{ color: '#ff6b35' }}
                  formatter={(value: any) => [`${Number(value).toFixed(4)} ${currency}`, 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#ff6b35"
                  strokeWidth={2}
                  fill="url(#nftPriceGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Chart */}
        <div className="chart-section">
          <div className="chart-subtitle">Volume History</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 107, 53, 0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255, 107, 53, 0.7)"
                  fontSize={10}
                  tick={{ fill: 'rgba(255, 107, 53, 0.7)' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="rgba(255, 107, 53, 0.7)"
                  fontSize={10}
                  tick={{ fill: 'rgba(255, 107, 53, 0.7)' }}
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(value) => `${value.toFixed(2)} ${currency}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid #ff6b35',
                    borderRadius: '4px',
                    color: '#ff6b35'
                  }}
                  labelStyle={{ color: '#ff6b35' }}
                  formatter={(value: any) => [`${Number(value).toFixed(2)} ${currency}`, 'Volume']}
                />
                <Bar
                  dataKey="volume"
                  fill="#ff6b35"
                  opacity={0.7}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Info */}
      <div className="chart-info">
        <div className="info-text">
          {nftData.collectionName} Lifetime Value ({marketplace})
        </div>
        <div className="info-source">Data: {marketplace} API</div>
      </div>
    </div>
  );
};


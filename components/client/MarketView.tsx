import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { Asset } from '../../types';
import Card from '../common/Card';
import { generateInitialAssets } from '../../data/mockData';

// PERFORMANCE: Moved MarketCard outside of MarketView to prevent re-declaration on every render.
const MarketCard: React.FC<{ asset: Asset }> = ({ asset }) => (
  <Card className="flex flex-col justify-between hover:ring-2 hover:ring-amber-500 transition-all duration-200">
    <div>
      <div className="flex justify-between items-start">
        <div>
          <span className="font-bold text-lg text-white">{asset.symbol}</span>
          <p className="text-xs text-gray-400">{asset.name}</p>
        </div>
        <span className={`font-semibold text-md ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {asset.change.toFixed(2)}%
        </span>
      </div>
      <div className="text-2xl font-mono mt-2 text-gray-200">{asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5})}</div>
    </div>
    <div className="h-20 mt-4 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={asset.history}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Line type="monotone" dataKey="price" stroke={asset.change >= 0 ? '#4ade80' : '#f87171'} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const MarketView: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(generateInitialAssets());

  const updatePrices = useCallback(() => {
    setAssets(prevAssets =>
      prevAssets.map(p => {
        const changeFactor = (Math.random() - 0.49) * 0.01;
        const newPrice = p.price * (1 + changeFactor);
        const newChange = ((newPrice - p.history[0].price) / p.history[0].price) * 100;
        const newHistory = [...p.history.slice(1), { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}), price: newPrice }];
        
        return {
            ...p,
            price: newPrice,
            change: newChange,
            history: newHistory
        };
      })
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(updatePrices, 2000);
    return () => clearInterval(interval);
  }, [updatePrices]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">نظرة عامة على السوق</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {assets.map(p => <MarketCard key={p.symbol} asset={p} />)}
      </div>
    </div>
  );
};

export default MarketView;
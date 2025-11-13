import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../../context/AppContext';
import { Asset, TransactionType, Alert, TransactionStatus } from '../../types';
import Card from '../common/Card';
import { generateInitialAssets } from '../../data/mockData';

// PERFORMANCE: Moved PriceTicker outside of TradingView to prevent re-declaration on every render.
const PriceTicker: React.FC<{
  asset: Asset;
  isSelected: boolean;
  onClick: () => void;
}> = ({ asset, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
      isSelected
        ? 'bg-amber-500/20 ring-2 ring-amber-500'
        : 'bg-gray-700 hover:bg-gray-600'
    }`}
  >
    <div className="flex justify-between items-center">
      <span className="font-bold text-lg">{asset.symbol}</span>
      <span
        className={`font-semibold ${
          asset.change >= 0 ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {asset.change.toFixed(2)}%
      </span>
    </div>
    <div className="text-xl font-mono mt-1">
      {asset.price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 5,
      })}
    </div>
  </div>
);


// FIX: This component was not returning a valid ReactNode because the file was incomplete.
const TradingView: React.FC = () => {
  const { user, addTransaction, updateUserBalance } = useApp();
  const [assets, setAssets] = useState<Asset[]>(generateInitialAssets());
  const [selectedAsset, setSelectedAsset] = useState<Asset>(assets[0]);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  // Price Alert State
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  
  const updatePrices = useCallback(() => {
    setAssets(prevAssets =>
      prevAssets.map(p => {
        const changeFactor = (Math.random() - 0.49) * 0.01; // smaller, more frequent changes
        const newPrice = p.price * (1 + changeFactor);
        const newChange = ((newPrice - p.history[0].price) / p.history[0].price) * 100;
        const newHistory = [...p.history.slice(1), { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}), price: newPrice }];
        
        const updatedAsset = {
            ...p,
            price: newPrice,
            change: newChange,
            history: newHistory
        };

        if(selectedAsset.symbol === p.symbol) {
            setSelectedAsset(updatedAsset);
        }

        return updatedAsset;
      })
    );
  }, [selectedAsset.symbol]);

  useEffect(() => {
    const interval = setInterval(updatePrices, 2000);
    return () => clearInterval(interval);
  }, [updatePrices]);

  // Effect to check for triggered alerts when prices change
  useEffect(() => {
    let alertsTriggered = false;
    const updatedAlerts = alerts.map(alert => {
        if (alert.status === 'active') {
            const relevantAsset = assets.find(p => p.symbol === alert.pairSymbol);
            if (relevantAsset) {
                const targetMet = 
                    (alert.condition === 'above' && relevantAsset.price >= alert.targetPrice) ||
                    (alert.condition === 'below' && relevantAsset.price <= alert.targetPrice);

                if (targetMet) {
                    alertsTriggered = true;
                    setTimeout(() => window.alert(`🔔 تنبيه السعر: ${relevantAsset.symbol} وصل إلى ${alert.targetPrice}$`), 0);
                    return { ...alert, status: 'triggered' as const };
                }
            }
        }
        return alert;
    });

    if (alertsTriggered) {
        setAlerts(updatedAlerts);
    }
  }, [assets, alerts]);


  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const numericAmount = parseFloat(amount);
    if (!user || isNaN(numericAmount) || numericAmount <= 0) {
        setError("الرجاء إدخال مبلغ صحيح.");
        return;
    }

    const cost = numericAmount * selectedAsset.price;
    if (orderType === 'buy' && user.balance < cost) {
        setError('رصيدك غير كافٍ لإتمام هذه العملية.');
        return;
    }
    
    const transactionAmount = orderType === 'buy' ? -cost : cost;
    updateUserBalance(user.id, transactionAmount);

    // FIX: The 'details' property was used as a shorthand without a variable in scope.
    // A details string has been constructed and passed.
    const details = `${numericAmount} ${selectedAsset.symbol.split('/')[0]} @ ${selectedAsset.price.toFixed(2)}`;
    addTransaction({
        userId: user.id,
        type: orderType === 'buy' ? TransactionType.BUY : TransactionType.SELL,
        status: TransactionStatus.APPROVED,
        amount: cost,
        details: details,
    });
    setAmount('');
  };

  const handleSetAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(alertPrice);
    if (isNaN(price) || price <= 0) return;
    const newAlert: Alert = {
        id: `alert-${Date.now()}`,
        pairSymbol: selectedAsset.symbol,
        targetPrice: price,
        condition: alertCondition,
        status: 'active',
    };
    setAlerts(prev => [...prev, newAlert]);
    setAlertPrice('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Left side: Tickers */}
      <div className="lg:col-span-1 h-full overflow-y-auto pr-2 space-y-2">
        {assets.map(p => (
          <PriceTicker
            key={p.symbol}
            asset={p}
            isSelected={p.symbol === selectedAsset.symbol}
            onClick={() => setSelectedAsset(p)}
          />
        ))}
      </div>

      {/* Right side: Chart and Order form */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        {/* Chart */}
        <Card className="flex-grow flex flex-col min-h-[300px]">
          <h2 className="text-2xl font-bold text-white mb-4">{selectedAsset.name} ({selectedAsset.symbol})</h2>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedAsset.history} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="time" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" domain={['dataMin', 'dataMax']} tickFormatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }} />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="#FBBF24" strokeWidth={2} dot={false} name="Price" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Order and Alert Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-xl font-semibold mb-4 text-gray-300">تنفيذ صفقة</h3>
            <form onSubmit={handleOrder} className="space-y-4">
              <div className="flex border border-gray-600 rounded-lg">
                <button type="button" onClick={() => setOrderType('buy')} className={`w-1/2 py-2 font-semibold transition-colors rounded-l-md ${orderType === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-green-600/20'}`}>شراء</button>
                <button type="button" onClick={() => setOrderType('sell')} className={`w-1/2 py-2 font-semibold transition-colors rounded-r-md ${orderType === 'sell' ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-red-600/20'}`}>بيع</button>
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-400">الكمية ({selectedAsset.symbol.split('/')[0]})</label>
                <input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500" required />
              </div>
              <div className="text-gray-400 text-sm">
                <p>التكلفة التقديرية: <span className="font-mono text-white">${(parseFloat(amount) * selectedAsset.price || 0).toFixed(2)}</span></p>
                <p>الرصيد المتاح: <span className="font-mono text-white">${user?.balance.toFixed(2)}</span></p>
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button type="submit" className={`w-full font-bold py-2 px-4 rounded-md transition duration-300 ${orderType === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {orderType === 'buy' ? 'شراء' : 'بيع'} {selectedAsset.symbol.split('/')[0]}
              </button>
            </form>
          </Card>
          <Card>
            <h3 className="text-xl font-semibold mb-4 text-gray-300">إضافة تنبيه سعر</h3>
            <form onSubmit={handleSetAlert} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">تنبيهي عندما يصل السعر</label>
                    <div className="flex items-center space-x-2 mt-1">
                        <select value={alertCondition} onChange={e => setAlertCondition(e.target.value as 'above' | 'below')} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                            <option value="above">فوق</option>
                            <option value="below">تحت</option>
                        </select>
                         <input type="number" value={alertPrice} onChange={e => setAlertPrice(e.target.value)} placeholder="السعر المستهدف" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500" required />
                    </div>
                </div>
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded-md">
                    تعيين التنبيه
                </button>
            </form>
            <div className="mt-4 space-y-2 max-h-24 overflow-y-auto">
                {alerts.filter(a => a.pairSymbol === selectedAsset.symbol).map(alert => (
                    <div key={alert.id} className={`p-2 rounded-md text-sm ${alert.status === 'active' ? 'bg-gray-600' : 'bg-green-800/50 line-through'}`}>
                        <span>تنبيه {alert.condition === 'above' ? 'فوق' : 'تحت'} ${alert.targetPrice} </span>
                        <span className={`font-semibold ${alert.status === 'active' ? 'text-yellow-400' : 'text-green-400'}`}>({alert.status === 'active' ? 'نشط' : 'تم تفعيله'})</span>
                    </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TradingView;

import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../../context/AppContext';
// FIX: Imported `TransactionStatus` to use the enum value instead of a string literal.
import { Asset, TransactionType, Alert, TransactionStatus } from '../../types';
import Card from '../common/Card';
import { generateInitialAssets } from '../../data/mockData';

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

    addTransaction({
        userId: user.id,
        type: orderType === 'buy' ? TransactionType.BUY : TransactionType.SELL,
        // FIX: Used `TransactionStatus.APPROVED` enum instead of the string "APPROVED".
        status: TransactionStatus.APPROVED,
        amount: cost,
        details: `${numericAmount.toFixed(4)} ${selectedAsset.symbol} @ ${selectedAsset.price.toFixed(2)}`
    });

    setAmount('');
    alert(`تم تنفيذ طلب ${orderType === 'buy' ? 'الشراء' : 'البيع'} بنجاح!`);
  };

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPrice = parseFloat(alertPrice);
    if (isNaN(targetPrice) || targetPrice <= 0) {
        alert("الرجاء إدخال سعر صحيح للتنبيه.");
        return;
    }
    const newAlert: Alert = {
        id: `alert-${Date.now()}`,
        pairSymbol: selectedAsset.symbol,
        targetPrice,
        condition: alertCondition,
        status: 'active'
    };
    setAlerts(prev => [...prev, newAlert]);
    setAlertPrice('');
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };


  const PriceTicker: React.FC<{ asset: Asset }> = ({ asset }) => (
    <div 
        onClick={() => setSelectedAsset(asset)}
        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedAsset.symbol === asset.symbol ? 'bg-amber-500/20 ring-2 ring-amber-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg">{asset.symbol}</span>
        <span className={`font-semibold ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {asset.change.toFixed(2)}%
        </span>
      </div>
      <div className="text-xl font-mono mt-1">{asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5})}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {assets.map(p => <PriceTicker key={p.symbol} asset={p} />)}
          </div>
          <Card className="flex-grow">
            <h3 className="text-xl font-bold mb-4 text-white">مؤشر {selectedAsset.symbol}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedAsset.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={['dataMin', 'dataMax']} tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : ''}/>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#d1d5db' }}
                />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={2} dot={false} name="السعر" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="xl:col-span-1 flex flex-col gap-6">
          <Card>
            <h3 className="text-xl font-bold mb-4 text-white">تنفيذ أمر</h3>
            <div className="flex border border-gray-600 rounded-lg mb-4">
              <button onClick={() => setOrderType('buy')} className={`w-1/2 py-2 font-semibold transition-colors rounded-l-md ${orderType === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-green-700/50'}`}>شراء</button>
              <button onClick={() => setOrderType('sell')} className={`w-1/2 py-2 font-semibold transition-colors rounded-r-md ${orderType === 'sell' ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-red-700/50'}`}>بيع</button>
            </div>
            <form onSubmit={handleOrder} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">السعر الحالي</label>
                <div className="p-2 bg-gray-700 rounded-md font-mono">{selectedAsset.price.toFixed(5)}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1" htmlFor="amount">الكمية ({selectedAsset.symbol.split('/')[0]})</label>
                <input id="amount" type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="pt-2 text-center text-gray-300">
                <p>الإجمالي التقريبي:</p>
                <p className="font-bold text-lg text-white">${(parseFloat(amount) * selectedAsset.price || 0).toFixed(2)}</p>
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button type="submit" className={`w-full font-bold py-3 px-4 rounded-md transition duration-300 ${orderType === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}>
                {orderType === 'buy' ? `شراء ${selectedAsset.symbol.split('/')[0]}` : `بيع ${selectedAsset.symbol.split('/')[0]}`}
              </button>
            </form>
          </Card>
          <Card>
            <h3 className="text-xl font-bold mb-4 text-white">ضبط تنبيه السعر</h3>
            <form onSubmit={handleAddAlert} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">تنبيهي عندما يكون {selectedAsset.symbol}</label>
                    <select value={alertCondition} onChange={(e) => setAlertCondition(e.target.value as 'above' | 'below')} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                        <option value="above">أعلى من</option>
                        <option value="below">أقل من</option>
                    </select>
                </div>
                <div>
                     <label className="block text-sm text-gray-400 mb-1" htmlFor="alert-price">هذا السعر</label>
                    <input id="alert-price" type="number" step="any" value={alertPrice} onChange={(e) => setAlertPrice(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <button type="submit" className="w-full font-bold py-3 px-4 rounded-md transition duration-300 bg-amber-500 hover:bg-amber-600 text-black">
                    ضبط التنبيه
                </button>
            </form>
          </Card>
        </div>
      </div>
      <Card>
        <h3 className="text-xl font-bold mb-4 text-white">قائمة التنبيهات</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-700/50 text-gray-400 uppercase text-sm">
                    <tr>
                        <th className="p-3">الأصل</th>
                        <th className="p-3">الشرط</th>
                        <th className="p-3">السعر المستهدف</th>
                        <th className="p-3">الحالة</th>
                        <th className="p-3">إجراء</th>
                    </tr>
                </thead>
                <tbody>
                    {alerts.length > 0 ? alerts.map(alert => (
                        <tr key={alert.id} className={`border-b border-gray-700 ${alert.status === 'triggered' ? 'bg-amber-500/10' : ''}`}>
                            <td className="p-3 font-semibold">{alert.pairSymbol}</td>
                            <td className="p-3">{alert.condition === 'above' ? 'أعلى من' : 'أقل من'}</td>
                            <td className="p-3 font-mono">${alert.targetPrice.toFixed(2)}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${alert.status === 'active' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                    {alert.status === 'active' ? 'نشط' : 'تم التفعيل'}
                                </span>
                            </td>
                            <td className="p-3">
                                <button onClick={() => handleRemoveAlert(alert.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md transition">
                                    حذف
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={5} className="text-center p-6 text-gray-500">لا توجد تنبيهات مضبوطة.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
};

export default TradingView;
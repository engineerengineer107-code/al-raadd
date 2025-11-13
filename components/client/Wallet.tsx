import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction, TransactionStatus, TransactionType } from '../../types';
import Card from '../common/Card';

// PERFORMANCE: Moved helper function outside of Wallet to prevent re-declaration on every render.
const getStatusClass = (status: TransactionStatus) => {
  switch(status) {
      case TransactionStatus.APPROVED: return 'bg-green-500/20 text-green-400';
      case TransactionStatus.PENDING: return 'bg-yellow-500/20 text-yellow-400';
      case TransactionStatus.REJECTED: return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
  }
}

// PERFORMANCE: Moved TransactionRow outside of Wallet to prevent re-declaration on every render.
const TransactionRow: React.FC<{ tx: Transaction }> = ({ tx }) => (
  <tr className="border-b border-gray-700 hover:bg-gray-700/50">
      <td className="p-3">{new Date(tx.date).toLocaleDateString()}</td>
      <td className="p-3">{tx.type}</td>
      <td className="p-3 font-mono">${tx.amount.toFixed(2)}</td>
      <td className="p-3 hidden sm:table-cell">
          {tx.type === TransactionType.WITHDRAWAL && tx.withdrawalDetails ? (
              <>
                  <span className="font-semibold">{tx.details}</span>
                  <p className="text-xs text-gray-400 mt-1">إلى: {tx.withdrawalDetails}</p>
              </>
          ) : (
              tx.details
          )}
      </td>
      <td className="p-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(tx.status)}`}>
              {tx.status}
          </span>
      </td>
  </tr>
);

const Wallet: React.FC = () => {
  const { user, transactions, paymentMethods, addTransaction } = useApp();
  const [requestType, setRequestType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]?.id || '');
  const [withdrawalMethodType, setWithdrawalMethodType] = useState<'ewallet' | 'bank'>('ewallet');
  const [withdrawalDetails, setWithdrawalDetails] = useState('');
  const [proofOfPayment, setProofOfPayment] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const userTransactions = useMemo(() => {
    return transactions.filter(tx => tx.userId === user?.id);
  }, [transactions, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setProofOfPayment(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        setProofOfPayment(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const numericAmount = parseFloat(amount);
    if (!user || isNaN(numericAmount) || numericAmount <= 0) {
        setMessage('الرجاء إدخال مبلغ صحيح.');
        return;
    }

    if (requestType === 'withdrawal' && user.balance < numericAmount) {
        setMessage('رصيدك غير كافٍ لطلب السحب.');
        return;
    }

    if (requestType === 'withdrawal' && !withdrawalDetails.trim()) {
        const errorMsg = withdrawalMethodType === 'ewallet' ? 'الرجاء إدخال رقم المحفظة' : 'الرجاء إدخال رقم الحساب البنكي';
        setMessage(errorMsg);
        return;
    }

    if (requestType === 'deposit' && !proofOfPayment) {
        setMessage('الرجاء إرفاق صورة إثبات التحويل.');
        return;
    }

    const transactionDetails = requestType === 'deposit'
      ? paymentMethods.find(pm => pm.id === selectedMethod)?.name || ''
      : withdrawalMethodType === 'ewallet' ? 'محفظة إلكترونية' : 'حساب بنكي';

    addTransaction({
        userId: user.id,
        type: requestType === 'deposit' ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING,
        amount: numericAmount,
        details: transactionDetails,
        ...(requestType === 'withdrawal' && { withdrawalDetails: withdrawalDetails.trim() }),
        ...(requestType === 'deposit' && { proofOfPaymentUrl: proofOfPayment! }),
    });

    setMessage(`تم إرسال طلب ${requestType === 'deposit' ? 'الإيداع' : 'السحب'} بنجاح وسوف تتم مراجعته.`);
    setAmount('');
    setWithdrawalDetails('');
    setProofOfPayment(null);
    // Reset file input
    const fileInput = document.getElementById('proofOfPayment') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">المعاملات والمحفظة</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <h2 className="text-xl font-semibold mb-2 text-gray-300">الرصيد الحالي</h2>
            <p className="text-4xl font-bold text-amber-400 font-mono">
              ${user?.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold mb-2 text-gray-300">طلب إيداع / سحب</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="flex border border-gray-600 rounded-lg">
                <button type="button" onClick={() => setRequestType('deposit')} className={`w-1/2 py-2 font-semibold transition-colors rounded-l-md ${requestType === 'deposit' ? 'bg-amber-500 text-black' : 'bg-gray-700 hover:bg-amber-500/20'}`}>إيداع</button>
                <button type="button" onClick={() => setRequestType('withdrawal')} className={`w-1/2 py-2 font-semibold transition-colors rounded-r-md ${requestType === 'withdrawal' ? 'bg-amber-500 text-black' : 'bg-gray-700 hover:bg-amber-500/20'}`}>سحب</button>
             </div>
             <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-400">المبلغ</label>
                <input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500" required />
             </div>
             
             {requestType === 'deposit' && (
                <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-400">طريقة الدفع</label>
                    <select id="paymentMethod" value={selectedMethod} onChange={e => setSelectedMethod(e.target.value)} className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500" required>
                        {paymentMethods.map(method => <option key={method.id} value={method.id}>{method.name} - {method.details}</option>)}
                    </select>
                </div>
             )}

             {requestType === 'withdrawal' && (
                <>
                    <div>
                        <label htmlFor="withdrawalMethodType" className="block text-sm font-medium text-gray-400">طريقة السحب</label>
                        <select id="withdrawalMethodType" value={withdrawalMethodType} onChange={e => setWithdrawalMethodType(e.target.value as 'ewallet' | 'bank')} className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500" required>
                            <option value="ewallet">محفظة إلكترونية</option>
                            <option value="bank">حساب بنكي</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="withdrawalDetails" className="block text-sm font-medium text-gray-400">
                            {withdrawalMethodType === 'ewallet' ? 'رقم المحفظة' : 'رقم الحساب البنكي'}
                        </label>
                        <input id="withdrawalDetails" type="text" value={withdrawalDetails} onChange={e => setWithdrawalDetails(e.target.value)} 
                               placeholder={withdrawalMethodType === 'ewallet' ? 'e.g. 01012345678' : 'e.g. SA03...'}
                               className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500" required />
                    </div>
                </>
             )}

             {requestType === 'deposit' && (
                <div>
                    <label htmlFor="proofOfPayment" className="block text-sm font-medium text-gray-400">إرفاق صورة التحويل</label>
                    <input id="proofOfPayment" type="file" accept="image/*" onChange={handleFileChange} className="mt-1 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-600" required />
                    {proofOfPayment && (
                        <div className="mt-2 p-2 bg-gray-700 rounded-lg">
                            <p className="text-xs text-gray-400 mb-1">معاينة الصورة:</p>
                            <img src={proofOfPayment} alt="Proof preview" className="max-h-32 rounded-md" />
                        </div>
                    )}
                </div>
             )}

             {message && <p className="text-center text-green-400 text-sm py-2">{message}</p>}
             <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded-md transition duration-300">إرسال الطلب</button>
          </form>
        </Card>
      </div>

      <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-300">سجل المعاملات</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-700/50 text-gray-400 uppercase text-sm">
                    <tr>
                        <th className="p-3">التاريخ</th>
                        <th className="p-3">النوع</th>
                        <th className="p-3">المبلغ</th>
                        <th className="p-3 hidden sm:table-cell">التفاصيل</th>
                        <th className="p-3">الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    {userTransactions.length > 0 ? userTransactions.map(tx => <TransactionRow key={tx.id} tx={tx} />) : (
                        <tr><td colSpan={5} className="text-center p-6 text-gray-500">لا يوجد معاملات لعرضها.</td></tr>
                    )}
                </tbody>
            </table>
          </div>
      </Card>
    </div>
  );
};

export default Wallet;
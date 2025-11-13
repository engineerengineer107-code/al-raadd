import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction, TransactionStatus, TransactionType } from '../../types';
import Card from '../common/Card';

const TransactionReview: React.FC = () => {
  const { transactions, users, updateTransactionStatus } = useApp();
  const [filterType, setFilterType] = useState<'all' | TransactionType.DEPOSIT | TransactionType.WITHDRAWAL>('all');
  const [showProofModal, setShowProofModal] = useState(false);
  const [viewingProofUrl, setViewingProofUrl] = useState('');

  const pendingTransactions = transactions
    .filter(tx => tx.status === TransactionStatus.PENDING && (tx.type === TransactionType.DEPOSIT || tx.type === TransactionType.WITHDRAWAL))
    .filter(tx => {
        if (filterType === 'all') return true;
        return tx.type === filterType;
    });

  const getUserEmail = (userId: string) => {
    return users.find(u => u.id === userId)?.email || 'مستخدم غير معروف';
  };
  
  const getFilterButtonClass = (type: typeof filterType) => {
    return `px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
      filterType === type
        ? 'bg-amber-500 text-black'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`;
  }

  const viewProof = (url: string) => {
    setViewingProofUrl(url);
    setShowProofModal(true);
  };

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-white">مراجعة المعاملات</h1>
          <div className="flex space-x-2">
              <button onClick={() => setFilterType('all')} className={getFilterButtonClass('all')}>
                  الكل
              </button>
              <button onClick={() => setFilterType(TransactionType.DEPOSIT)} className={getFilterButtonClass(TransactionType.DEPOSIT)}>
                  {TransactionType.DEPOSIT}
              </button>
              <button onClick={() => setFilterType(TransactionType.WITHDRAWAL)} className={getFilterButtonClass(TransactionType.WITHDRAWAL)}>
                  {TransactionType.WITHDRAWAL}
              </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-700/50 text-gray-400 uppercase text-sm">
              <tr>
                <th className="p-3">تاريخ الطلب</th>
                <th className="p-3">المستخدم</th>
                <th className="p-3">النوع</th>
                <th className="p-3">المبلغ</th>
                <th className="p-3">التفاصيل</th>
                <th className="p-3">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {pendingTransactions.length > 0 ? pendingTransactions.map((tx: Transaction) => (
                <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-3">{new Date(tx.date).toLocaleString()}</td>
                  <td className="p-3">{getUserEmail(tx.userId)}</td>
                  <td className="p-3">{tx.type}</td>
                  <td className="p-3 font-mono">${tx.amount.toFixed(2)}</td>
                  <td className="p-3">
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
                    <div className="flex items-center space-x-2">
                      {tx.type === TransactionType.DEPOSIT && tx.proofOfPaymentUrl && (
                        <button
                          onClick={() => viewProof(tx.proofOfPaymentUrl!)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-md"
                        >
                          عرض الإثبات
                        </button>
                      )}
                      <button
                        onClick={() => updateTransactionStatus(tx.id, TransactionStatus.APPROVED)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-md"
                      >
                        قبول
                      </button>
                      <button
                        onClick={() => updateTransactionStatus(tx.id, TransactionStatus.REJECTED)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md"
                      >
                        رفض
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                  <tr><td colSpan={6} className="text-center p-6 text-gray-500">لا توجد معاملات قيد الانتظار.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {showProofModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={() => setShowProofModal(false)}>
            <div className="bg-gray-800 p-4 rounded-lg max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-4">إثبات التحويل</h3>
                <div className="max-h-[75vh] overflow-y-auto">
                  <img src={viewingProofUrl} alt="Proof of Payment" className="w-full h-auto mx-auto rounded-md" />
                </div>
                <button
                    onClick={() => setShowProofModal(false)}
                    className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded-md transition duration-300"
                >
                    إغلاق
                </button>
            </div>
        </div>
      )}
    </>
  );
};

export default TransactionReview;
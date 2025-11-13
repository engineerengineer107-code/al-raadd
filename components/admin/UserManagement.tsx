import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import Card from '../common/Card';

const UserManagement: React.FC = () => {
  const { users, updateUserBalance } = useApp();
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({});

  const handleBalanceChange = (userId: string, amountStr: string) => {
    setAmounts(prev => ({ ...prev, [userId]: amountStr }));
  };

  const applyBalanceChange = (userId: string) => {
    const amount = parseFloat(amounts[userId] || '0');
    if (!isNaN(amount)) {
      updateUserBalance(userId, amount);
      setAmounts(prev => ({ ...prev, [userId]: '' }));
    }
  };

  const clientUsers = users.filter(u => u.role === 'client');

  return (
    <Card>
      <h1 className="text-2xl font-bold text-white mb-6">إدارة المستخدمين</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700/50 text-gray-400 uppercase text-sm">
            <tr>
              <th className="p-3">البريد الإلكتروني</th>
              <th className="p-3">الرصيد الحالي</th>
              <th className="p-3">تعديل الرصيد</th>
            </tr>
          </thead>
          <tbody>
            {clientUsers.map((user: User) => (
              <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="p-3">{user.email}</td>
                <td className="p-3 font-mono">${user.balance.toFixed(2)}</td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="e.g. 500 or -100"
                      value={amounts[user.id] || ''}
                      onChange={(e) => handleBalanceChange(user.id, e.target.value)}
                      className="w-40 px-2 py-1 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      onClick={() => applyBalanceChange(user.id)}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-1 px-3 rounded-md transition duration-300"
                    >
                      تطبيق
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default UserManagement;
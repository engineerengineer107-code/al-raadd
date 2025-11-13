import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import Card from '../common/Card';

const PaymentMethodManagement: React.FC = () => {
  const { paymentMethods, setPaymentMethods } = useApp();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [currentMethod, setCurrentMethod] = useState<Partial<PaymentMethod>>({ name: '', details: '' });

  const handleEdit = (method: PaymentMethod) => {
    setIsEditing(method.id);
    setCurrentMethod(method);
  };

  const handleSave = () => {
    if (!currentMethod.name || !currentMethod.details) return;

    if (isEditing && isEditing !== 'new') {
      setPaymentMethods(prev => prev.map(m => m.id === isEditing ? { ...m, ...currentMethod } as PaymentMethod : m));
    } else {
      const newMethod: PaymentMethod = {
        id: `pm-${Date.now()}`,
        name: currentMethod.name!,
        details: currentMethod.details!,
      };
      setPaymentMethods(prev => [...prev, newMethod]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف طريقة الدفع هذه؟')) {
        setPaymentMethods(prev => prev.filter(m => m.id !== id));
    }
  };

  const resetForm = () => {
    setIsEditing(null);
    setCurrentMethod({ name: '', details: '' });
  };
  
  const startAddNew = () => {
    setIsEditing('new');
    setCurrentMethod({ name: '', details: '' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">إدارة طرق التحويل</h1>
      
      {(isEditing) && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">{isEditing === 'new' ? 'إضافة طريقة جديدة' : 'تعديل طريقة الدفع'}</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="اسم الطريقة (مثل: فودافون كاش)"
              value={currentMethod.name}
              onChange={e => setCurrentMethod({ ...currentMethod, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="text"
              placeholder="التفاصيل (مثل: رقم الهاتف أو الحساب)"
              value={currentMethod.details}
              onChange={e => setCurrentMethod({ ...currentMethod, details: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex space-x-2">
              <button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded-md">حفظ</button>
              <button onClick={resetForm} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md">إلغاء</button>
            </div>
          </div>
        </Card>
      )}

      <Card>
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">طرق الدفع الحالية</h2>
            <button onClick={startAddNew} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md">إضافة جديد</button>
         </div>
        <div className="space-y-3">
          {paymentMethods.map(method => (
            <div key={method.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold text-white">{method.name}</p>
                <p className="text-gray-400">{method.details}</p>
              </div>
              <div className="space-x-2">
                <button onClick={() => handleEdit(method)} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold py-1 px-3 rounded">تعديل</button>
                <button onClick={() => handleDelete(method.id)} className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded">حذف</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PaymentMethodManagement;
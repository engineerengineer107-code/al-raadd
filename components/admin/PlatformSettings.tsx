import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import Card from '../common/Card';

const PlatformSettings: React.FC = () => {
  const { contactInfo, setContactInfo } = useApp();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (contactInfo) {
      setEmail(contactInfo.email);
      setPhone(contactInfo.phone);
    }
  }, [contactInfo]);

  const handleSave = () => {
    setContactInfo({ email, phone });
    setMessage('تم حفظ التغييرات بنجاح!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <Card>
      <h1 className="text-2xl font-bold text-white mb-6">إعدادات المنصة</h1>
      <div className="max-w-md space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            البريد الإلكتروني للدعم
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
            أرقام هواتف التواصل
          </label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        {message && <p className="text-green-400 text-sm">{message}</p>}
        <div>
          <button
            onClick={handleSave}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded-md transition duration-300"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PlatformSettings;
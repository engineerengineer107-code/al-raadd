import { User, PaymentMethod, Transaction, TransactionType, TransactionStatus, Asset, ContactInfo } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'user-1', email: 'admin@example.com', password: 'admin', role: 'admin', balance: 0 },
  { id: 'user-2', email: 'client@example.com', password: 'client', role: 'client', balance: 50000.75 },
  { id: 'user-3', email: 'ahmed@example.com', password: 'password', role: 'client', balance: 12345.67 },
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm-1', name: 'فودافون كاش', details: '01012345678' },
  { id: 'pm-2', name: 'تحويل بنكي (CIB)', details: 'SA03 8000 0000 6080 1016 7519' },
  { id: 'pm-3', name: 'اتصالات كاش', details: '01112345678' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', userId: 'user-2', type: TransactionType.DEPOSIT, status: TransactionStatus.APPROVED, amount: 10000, date: new Date(Date.now() - 86400000 * 5).toISOString(), details: 'فودافون كاش' },
  { id: 'tx-2', userId: 'user-2', type: TransactionType.BUY, status: TransactionStatus.APPROVED, amount: 2500, date: new Date(Date.now() - 86400000 * 4).toISOString(), details: '0.05 BTC/USD @ 50000' },
  { id: 'tx-3', userId: 'user-3', type: TransactionType.DEPOSIT, status: TransactionStatus.PENDING, amount: 5000, date: new Date(Date.now() - 86400000 * 2).toISOString(), details: 'تحويل بنكي (CIB)' },
  { id: 'tx-4', userId: 'user-2', type: TransactionType.WITHDRAWAL, status: TransactionStatus.REJECTED, amount: 1000, date: new Date(Date.now() - 86400000 * 1).toISOString(), details: 'فودافون كاش' },
  { id: 'tx-5', userId: 'user-3', type: TransactionType.DEPOSIT, status: TransactionStatus.APPROVED, amount: 2000, date: new Date(Date.now() - 86400000 * 6).toISOString(), details: 'اتصالات كاش' },
  { id: 'tx-6', userId: 'user-2', type: TransactionType.WITHDRAWAL, status: TransactionStatus.PENDING, amount: 2000, date: new Date().toISOString(), details: 'فودافون كاش' },
];

export const MOCK_CONTACT_INFO: ContactInfo = {
  email: 'support@alraed-trading.com',
  phone: '+966 11 123 4567 | +20 2 123 4567'
};

const generatePriceHistory = (basePrice: number) => {
  const history: { time: string; price: number }[] = [];
  let price = basePrice;
  for (let i = 29; i >= 0; i--) {
    price += (Math.random() - 0.5) * (basePrice * 0.02);
    price = Math.max(price, basePrice * 0.8); // Ensure price doesn't drop too low
    history.push({ time: new Date(Date.now() - i * 60000 * 30).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}), price: parseFloat(price.toFixed(2)) });
  }
  return history;
};

export const generateInitialAssets = (): Asset[] => {
    const assets: Asset[] = [
        { name: 'Bitcoin', symbol: 'BTC/USD', type: 'crypto', price: 68543.21, change: 1.5, history: generatePriceHistory(68543.21) },
        { name: 'Ethereum', symbol: 'ETH/USD', type: 'crypto', price: 3567.89, change: -0.8, history: generatePriceHistory(3567.89) },
        { name: 'Gold', symbol: 'XAU/USD', type: 'commodity', price: 2330.55, change: 0.25, history: generatePriceHistory(2330.55) },
        { name: 'Crude Oil', symbol: 'WTI/USD', type: 'commodity', price: 78.50, change: -1.2, history: generatePriceHistory(78.50) },
        { name: 'Solana', symbol: 'SOL/USD', type: 'crypto', price: 165.43, change: 3.2, history: generatePriceHistory(165.43) },
        { name: 'Euro', symbol: 'EUR/USD', type: 'forex', price: 1.08, change: 0.1, history: generatePriceHistory(1.08) },
        { name: 'DogeCoin', symbol: 'DOGE/USD', type: 'crypto', price: 0.158, change: 0.5, history: generatePriceHistory(0.158) },
        { name: 'Real Estate', symbol: 'REIT/USD', type: 'real_estate', price: 85.12, change: 0.7, history: generatePriceHistory(85.12) },
    ];
    return assets;
}
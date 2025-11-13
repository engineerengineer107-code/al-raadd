export interface User {
  id: string;
  email: string;
  password?: string; // Should not be stored long term, just for simulation
  role: 'client' | 'admin';
  balance: number;
}

export enum TransactionType {
  DEPOSIT = 'إيداع',
  WITHDRAWAL = 'سحب',
  BUY = 'شراء',
  SELL = 'بيع',
}

export enum TransactionStatus {
  PENDING = 'قيد الانتظار',
  APPROVED = 'مقبول',
  REJECTED = 'مرفوض',
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  date: string;
  details: string; // For Buy/Sell or payment method name
  withdrawalDetails?: string; // For withdrawal: phone number or bank account
  proofOfPaymentUrl?: string; // For deposit: base64 image url
}

export interface PaymentMethod {
  id: string;
  name: string;
  details: string; // e.g., phone number or bank account
}

export type AssetType = 'crypto' | 'commodity' | 'forex' | 'real_estate';

export interface Asset {
  symbol: string;
  name: string;
  type: AssetType;
  price: number;
  change: number;
  history: { time: string; price: number }[];
}

export interface Order {
    type: 'buy' | 'sell';
    pair: Asset;
    amount: number; // amount of base currency to buy/sell
}

export interface Alert {
  id: string;
  pairSymbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  status: 'active' | 'triggered';
}

export interface ContactInfo {
  email: string;
  phone: string;
}
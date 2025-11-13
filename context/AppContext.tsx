import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Transaction, PaymentMethod, TransactionStatus, TransactionType, ContactInfo } from '../types';
import { MOCK_USERS, MOCK_PAYMENT_METHODS, MOCK_TRANSACTIONS, MOCK_CONTACT_INFO } from '../data/mockData';

interface AppContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  register: (email: string, pass: string) => boolean;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  updateTransactionStatus: (txId: string, status: TransactionStatus) => void;
  paymentMethods: PaymentMethod[];
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
  updateUserBalance: (userId: string, amount: number) => void;
  contactInfo: ContactInfo;
  setContactInfo: React.Dispatch<React.SetStateAction<ContactInfo>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'tradingAppData';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(MOCK_CONTACT_INFO);


  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const { users, user, transactions, paymentMethods, contactInfo } = JSON.parse(savedData);
        setUsers(users || MOCK_USERS);
        setUser(user || null);
        setTransactions(transactions || MOCK_TRANSACTIONS);
        setPaymentMethods(paymentMethods || MOCK_PAYMENT_METHODS);
        setContactInfo(contactInfo || MOCK_CONTACT_INFO);
      } else {
        // Initialize with mock data if nothing in localStorage
        setUsers(MOCK_USERS);
        setTransactions(MOCK_TRANSACTIONS);
        setPaymentMethods(MOCK_PAYMENT_METHODS);
        setContactInfo(MOCK_CONTACT_INFO);
      }
    } catch (error) {
        console.error("Failed to parse from localStorage", error)
        setUsers(MOCK_USERS);
        setTransactions(MOCK_TRANSACTIONS);
        setPaymentMethods(MOCK_PAYMENT_METHODS);
        setContactInfo(MOCK_CONTACT_INFO);
    }
  }, []);

  useEffect(() => {
    const dataToSave = JSON.stringify({ users, user, transactions, paymentMethods, contactInfo });
    localStorage.setItem(LOCAL_STORAGE_KEY, dataToSave);
  }, [users, user, transactions, paymentMethods, contactInfo]);

  /**
   * Logs a user in by verifying their email and password.
   * @param email The user's email.
   * @param pass The user's password.
   * @returns `true` if login is successful, `false` otherwise.
   */
  const login = (email: string, pass: string): boolean => {
    const foundUser = users.find(u => u.email === email && u.password === pass);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  /**
   * Registers a new user with the provided email and password.
   * @param email The new user's email.
   * @param pass The new user's password.
   * @returns `true` if registration is successful, `false` if the user already exists.
   */
  const register = (email: string, pass: string): boolean => {
    if (users.some(u => u.email === email)) {
      return false; // User already exists
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password: pass,
      role: 'client',
      balance: 10000, // Starting balance for new users
    };
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    return true;
  };

  /**
   * Logs the current user out.
   */
  const logout = () => {
    setUser(null);
  };

  /**
   * Adds a new transaction to the system.
   * @param tx The transaction object to add, without 'id' and 'date'.
   */
  const addTransaction = (tx: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  /**
   * Updates the status of a transaction (e.g., from PENDING to APPROVED).
   * If a transaction is approved, the user's balance is updated accordingly.
   * @param txId The ID of the transaction to update.
   * @param status The new status for the transaction.
   */
  const updateTransactionStatus = (txId: string, status: TransactionStatus) => {
    setTransactions(prev =>
      prev.map(tx => {
        if (tx.id === txId) {
          if (status === TransactionStatus.APPROVED && tx.status === TransactionStatus.PENDING) {
            updateUserBalance(tx.userId, tx.type === TransactionType.DEPOSIT ? tx.amount : -tx.amount);
          }
          return { ...tx, status };
        }
        return tx;
      })
    );
  };
  
  /**
   * Updates a user's balance by a given amount. Can be positive or negative.
   * @param userId The ID of the user whose balance will be updated.
   * @param amount The amount to add to (or subtract from) the user's balance.
   */
  const updateUserBalance = (userId: string, amount: number) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, balance: u.balance + amount } : u))
    );
    // Also update current user if it's them
    if(user && user.id === userId) {
        setUser(prev => prev ? {...prev, balance: prev.balance + amount} : null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        users,
        setUsers,
        user,
        login,
        logout,
        register,
        transactions,
        addTransaction,
        updateTransactionStatus,
        paymentMethods,
        setPaymentMethods,
        updateUserBalance,
        contactInfo,
        setContactInfo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export type BullionMetal = 'Gold' | 'Silver' | 'Platinum' | 'XAU' | 'XAG' | 'XPT' | string;
export type BullionForm = 'Bar' | 'Coin' | 'Round' | 'Goldback' | 'bar' | 'coin' | 'round' | 'fractional' | string;

export interface BullionItem {
  id: string;
  name: string;
  metal: BullionMetal;
  form: BullionForm;
  weightOzt: number;
  pricePaidAud: number;
  date: string;
  purity?: number;
  quantity?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  notes?: string;
  imageUrl?: string;
}

export interface MarketMetals {
  XAU: number;
  XAG: number;
  XPT: number;
}

export interface MarketData {
  goldAud: number;
  silverAud: number;
  platinumAud: number;
  goldChange: number;
  silverChange: number;
  platinumChange: number;
  gsr: number;
  metals?: MarketMetals;
  rateLimitExceeded?: boolean;
  currency?: string;
  timestamp?: string;
  isFallback?: boolean;
}

export interface EtfHolding {
  id?: string;
  ticker: string;
  name: string;
  units: number;
  avgPrice: number;
  currentPrice: number;
  targetWeight: number;
}

export type TransactionType = 'BUY' | 'SELL' | 'DCA_DEPOSIT' | 'deposit' | 'invest' | string;

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  ticker?: string;
  units?: number;
  amount: number;
  description?: string;
  notes?: string;
}

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}
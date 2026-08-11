export type BullionMetal = 'Gold' | 'Silver' | 'Platinum' | 'XAU' | 'XAG' | 'XPT' | string;
export type BullionForm = 'Bar' | 'Coin' | 'Round' | 'Goldback' | 'bar' | 'coin' | 'round' | 'fractional' | string;

export interface BullionItem {
  id: string;
  name: string;
  metal: BullionMetal;
  form: BullionForm;
  weightOzt: number;
  purity?: number;
  quantity?: number;
  pricePaidAud?: number;
  purchasePrice?: number;
  date?: string;
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
  metals?: MarketMetals;
  goldAud?: number;
  silverAud?: number;
  platinumAud?: number;
  goldChange?: number;
  silverChange?: number;
  platinumChange?: number;
  gsr?: number;
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
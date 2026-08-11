export type BullionMetal = 'Gold' | 'Silver' | 'Platinum';

export type BullionForm = 'Bar' | 'Coin' | 'Round' | 'Goldback';

export interface BullionItem {
  id: string;
  date: string;
  name: string;
  metal: BullionMetal;
  form: BullionForm;
  weightOzt: number;
  pricePaidAud: number;
  imageUrl?: string;
}

export interface EtfHolding {
  ticker: string;
  name: string;
  units: number;
  avgPrice: number;
  currentPrice: number;
  targetWeight: number;
}

export type TransactionType = 'deposit' | 'invest';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
}

export interface MarketData {
  goldAud: number;
  goldChange: number;
  silverAud: number;
  silverChange: number;
  gsr: number;
  rateLimitExceeded?: boolean;
}

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  country?: string;
  currency?: string;
  role?: UserRole;
}

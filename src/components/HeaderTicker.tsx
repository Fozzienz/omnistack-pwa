'use client';

import React from 'react';
import { useMarketData } from '@/hooks/useMarketData';

export default function HeaderTicker() {
  const { marketData, isLoading } = useMarketData();

  if (isLoading && !marketData) {
    return <div className="p-2 text-xs text-slate-400">Loading spot prices...</div>;
  }

  if (!marketData) return null;

  return (
    <div className="flex items-center space-x-6 text-xs bg-slate-900 text-slate-200 px-4 py-2 rounded-lg border border-slate-800">
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-amber-400">Gold:</span>
        <span>${marketData.goldAud.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
        <span className={marketData.goldChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
          {marketData.goldChange >= 0 ? '+' : ''}{marketData.goldChange}%
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <span className="font-semibold text-slate-300">Silver:</span>
        <span>${marketData.silverAud.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
        <span className={marketData.silverChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
          {marketData.silverChange >= 0 ? '+' : ''}{marketData.silverChange}%
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <span className="font-semibold text-cyan-300">Platinum:</span>
        <span>${marketData.platinumAud.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
        <span className={marketData.platinumChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
          {marketData.platinumChange >= 0 ? '+' : ''}{marketData.platinumChange}%
        </span>
      </div>

      <div className="flex items-center space-x-2 border-l border-slate-700 pl-4">
        <span className="font-semibold text-slate-400">GSR:</span>
        <span className="font-bold text-amber-300">{marketData.gsr.toFixed(2)}</span>
      </div>
    </div>
  );
}
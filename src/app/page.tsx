'use client';

import React, { useState, useEffect } from 'react';
import HeaderTicker from '@/components/HeaderTicker';
import PearlerTracker from '@/components/PearlerTracker';
import BullionManager from '@/components/BullionManager';
import HamburgerMenu from '@/components/HamburgerMenu';
import { 
  Eye, 
  EyeOff, 
  Coins, 
  PieChart, 
  Wallet, 
  TrendingUp, 
  Layers, 
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import type { BullionItem, EtfHolding, MarketData, BullionMetal } from '@/types';

export default function Home() {
  const [showOverview, setShowOverview] = useState<boolean>(true);
  const [showPearler, setShowPearler] = useState<boolean>(true);
  const [showBullion, setShowBullion] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Dynamic Portfolio Aggregation State
  const [spotPrices, setSpotPrices] = useState<MarketData | null>(null);
  const [bullionItems, setBullionItems] = useState<BullionItem[]>([]);
  const [pearlerHoldings, setPearlerHoldings] = useState<EtfHolding[]>([]);
  const [cashBalance, setCashBalance] = useState<number>(549.32);

  const loadBullionFromStorage = () => {
    const savedBullion = localStorage.getItem('omnistack_bullion_ledger');
    if (savedBullion) {
      try {
        setBullionItems(JSON.parse(savedBullion));
      } catch (e) {
        console.error('Failed to parse bullion ledger', e);
      }
    } else {
      setBullionItems([]);
    }
  };

  // Sync state on mount and listen for ledger updates
  useEffect(() => {
    // 1. Fetch Spot Prices
    fetch('/api/metals')
      .then((res) => res.json())
      .then((data) => setSpotPrices(data))
      .catch(console.error);

    // 2. Initial Load
    loadBullionFromStorage();

    // 3. Real-time update listener
    const handleLedgerUpdate = () => loadBullionFromStorage();
    window.addEventListener('omnistack_ledger_updated', handleLedgerUpdate);

    // 4. Load Pearler Holdings or Defaults
    const savedHoldings = localStorage.getItem('omnistack_pearler_holdings');
    if (savedHoldings) {
      try {
        setPearlerHoldings(JSON.parse(savedHoldings));
      } catch (e) {
        console.error('Failed to parse pearler holdings', e);
      }
    } else {
      setPearlerHoldings([
        { ticker: 'VGS', name: 'Vanguard MSCI Index Intl', units: 17, avgPrice: 163.59, currentPrice: 163.59, targetWeight: 60 },
        { ticker: 'A200', name: 'Betashares Australia 200', units: 8, avgPrice: 153.93, currentPrice: 153.88, targetWeight: 35 },
        { ticker: 'WES', name: 'Wesfarmers Limited', units: 6, avgPrice: 89.54, currentPrice: 89.50, targetWeight: 5 },
      ]);
    }

    // 5. Load Cash Balance
    const savedCash = localStorage.getItem('omnistack_pearler_cash');
    if (savedCash) {
      const parsed = parseFloat(savedCash);
      if (!isNaN(parsed)) setCashBalance(parsed);
    }

    return () => {
      window.removeEventListener('omnistack_ledger_updated', handleLedgerUpdate);
    };
  }, []);

  const getSpotPrice = (m: BullionMetal): number => {
    if (!spotPrices) return 0;
    switch (m) {
      case 'Gold': return spotPrices.goldAud || 0;
      case 'Silver': return spotPrices.silverAud || 0;
      case 'Platinum': return spotPrices.platinumAud || 0;
      default: return 0;
    }
  };

  // Net Worth Calculations ($ AUD)
  const bullionSpotValue = bullionItems.reduce((sum, item) => sum + item.weightOzt * getSpotPrice(item.metal), 0);
  const bullionCostBase = bullionItems.reduce((sum, item) => sum + item.pricePaidAud, 0);

  const equitiesMarketValue = pearlerHoldings.reduce((sum, h) => sum + h.units * h.currentPrice, 0);
  const equitiesCostBase = pearlerHoldings.reduce((sum, h) => sum + h.units * h.avgPrice, 0);

  const totalNetWorth = bullionSpotValue + equitiesMarketValue + cashBalance;
  const totalCostBase = bullionCostBase + equitiesCostBase + cashBalance;
  const totalGainLoss = totalNetWorth - totalCostBase;
  const totalGainLossPercent = totalCostBase > 0 ? (totalGainLoss / totalCostBase) * 100 : 0;

  // Percentage Allocations
  const bullionPct = totalNetWorth > 0 ? (bullionSpotValue / totalNetWorth) * 100 : 0;
  const equitiesPct = totalNetWorth > 0 ? (equitiesMarketValue / totalNetWorth) * 100 : 0;
  const cashPct = totalNetWorth > 0 ? (cashBalance / totalNetWorth) * 100 : 0;

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-12 transition-colors duration-200">
      <HeaderTicker />
        
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* OmniStack Branded Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-lg transition-colors">
          
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm shrink-0">
              <svg className="w-9 h-9" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L28 11L18 16L8 11L18 6Z" fill="#94A3B8" fillOpacity="0.3" stroke="#94A3B8" strokeWidth="0.75" strokeLinejoin="round"/>
                <path d="M18 14L28 19L18 24L8 19L18 14Z" fill="#64748B" fillOpacity="0.7"/>
                <path d="M8 19L18 24V26L8 21V19Z" fill="#475569"/>
                <path d="M28 19L18 24V26L28 21V19Z" fill="#334155"/>
                <path d="M18 22L28 27L18 32L8 27L18 22Z" fill="#334155"/>
                <path d="M8 27L18 32V34L8 29V27Z" fill="#1E293B"/>
                <path d="M28 27L18 32V34L28 29V27Z" fill="#0F172A"/>
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Omni<span className="text-sky-600 dark:text-sky-400">Stack</span><span className="text-xs text-slate-400 font-normal align-super ml-0.5">™</span>
                </h1>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5 font-mono">
                Universal Asset Ledger
              </p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 font-mono hidden sm:inline">Views:</span>
              
              <button 
                onClick={() => setShowOverview(!showOverview)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showOverview ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-200'}`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Net Worth
                {showOverview ? <Eye className="w-3.5 h-3.5 ml-1" /> : <EyeOff className="w-3.5 h-3.5 ml-1" />}
              </button>

              <button 
                onClick={() => setShowPearler(!showPearler)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showPearler ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-200'}`}
              >
                <PieChart className="w-3.5 h-3.5" />
                Pearler DCA
                {showPearler ? <Eye className="w-3.5 h-3.5 ml-1" /> : <EyeOff className="w-3.5 h-3.5 ml-1" />}
              </button>

              <button 
                onClick={() => setShowBullion(!showBullion)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showBullion ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-200'}`}
              >
                <Coins className="w-3.5 h-3.5" />
                Bullion Ledger
                {showBullion ? <Eye className="w-3.5 h-3.5 ml-1" /> : <EyeOff className="w-3.5 h-3.5 ml-1" />}
              </button>
            </div>

            <HamburgerMenu darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>

        </div>

        {/* Phase 0.5: Net Worth Hero Overview Card */}
        {showOverview && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-6 h-6 text-sky-400" />
                  <h2 className="text-xl font-bold text-white">Consolidated Net Worth Overview</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">Aggregated Asset Allocation across Physical Metals, Equities, and Cash Reserves</p>
              </div>

              {/* Grand Total Net Worth Box */}
              <div className="bg-slate-950/80 px-6 py-3 rounded-xl border border-slate-800 text-right shadow-inner">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">TOTAL NET WORTH ($ AUD)</span>
                <span className="text-2xl font-black text-white font-mono">
                  ${totalNetWorth.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-xs font-bold flex items-center justify-end mt-0.5 ${totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  {totalGainLoss >= 0 ? `+$${totalGainLoss.toFixed(2)} (+${totalGainLossPercent.toFixed(2)}%)` : `-$${Math.abs(totalGainLoss).toFixed(2)} (${totalGainLossPercent.toFixed(2)}%)`}
                </span>
              </div>
            </div>

            {/* 3-Column Asset Class Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Bullion Stack Card */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Coins className="w-4 h-4" /> Physical Bullion
                  </span>
                  <span className="text-amber-300 font-mono font-bold text-xs">{bullionPct.toFixed(1)}%</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  ${bullionSpotValue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-slate-400">Valued at live spot rates across {bullionItems.length} logged items.</p>
              </div>

              {/* Equities Portfolio Card */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <PieChart className="w-4 h-4" /> Pearler Equities
                  </span>
                  <span className="text-emerald-300 font-mono font-bold text-xs">{equitiesPct.toFixed(1)}%</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  ${equitiesMarketValue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-slate-400">Live ASX portfolio market valuation.</p>
              </div>

              {/* Cash Reserves Card */}
              <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sky-400 font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Wallet className="w-4 h-4" /> Uninvested Cash
                  </span>
                  <span className="text-sky-300 font-mono font-bold text-xs">{cashPct.toFixed(1)}%</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  ${cashBalance.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-slate-400">Liquid balance awaiting DCA auto-invest threshold.</p>
              </div>

            </div>

            {/* Asset Allocation Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1 text-slate-300 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Multi-Asset Class Allocation
                </span>
                <span className="text-[11px]">Metals: {bullionPct.toFixed(0)}% | Equities: {equitiesPct.toFixed(0)}% | Cash: {cashPct.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex border border-slate-800">
                <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${bullionPct}%` }} title={`Bullion: ${bullionPct.toFixed(1)}%`} />
                <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${equitiesPct}%` }} title={`Equities: ${equitiesPct.toFixed(1)}%`} />
                <div className="bg-sky-400 h-full transition-all duration-500" style={{ width: `${cashPct}%` }} title={`Cash: ${cashPct.toFixed(1)}%`} />
              </div>
            </div>
          </div>
        )}

        {/* Component Rendering */}
        {showPearler && <PearlerTracker />}
        {showBullion && <BullionManager />}

      </div>
    </main>
  );
}
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Calendar, PlusCircle, PieChart, Trash2, Plus, RefreshCw, Zap, History } from 'lucide-react';
import type { EtfHolding, Transaction } from '@/types';

export default function PearlerTracker() {
  // Configurable Automation Rules
  const [dcaAmount, setDcaAmount] = useState<number>(250);
  const [dcaFrequency, setDcaFrequency] = useState<string>('Fortnightly');
  const [scheduleDate, setScheduleDate] = useState<string>('2026-08-24');
  const [autoInvestThreshold, setAutoInvestThreshold] = useState<number>(1000.00);

  // Cash & One-off deposit state
  const [cashBalance, setCashBalance] = useState<number>(549.32); 
  const [oneOffAmount, setOneOffAmount] = useState<number>(150.00);
  const [oneOffDate, setOneOffDate] = useState<string>('2026-08-12');

  const [loadingPrices, setLoadingPrices] = useState<boolean>(false);
  const [simulationLog, setSimulationLog] = useState<string>('Automation active. Schedule rules saved. Cash balance is locked until arrival dates.');

  const scheduleDateRef = useRef<HTMLInputElement>(null);
  const oneOffDateRef = useRef<HTMLInputElement>(null);

  // Transaction history log
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', date: '10/08/2026', description: 'Fortnightly Auto Deposit', amount: 250.00, type: 'deposit' }
  ]);

  // Portfolio holdings
  const [holdings, setHoldings] = useState<EtfHolding[]>([
    { ticker: 'VGS', name: 'Vanguard MSCI Index International Shares ETF', units: 17, avgPrice: 163.59, currentPrice: 163.59, targetWeight: 60 },
    { ticker: 'A200', name: 'Betashares Australia 200 ETF', units: 8, avgPrice: 153.93, currentPrice: 153.88, targetWeight: 35 },
    { ticker: 'WES', name: 'Wesfarmers Limited', units: 6, avgPrice: 89.54, currentPrice: 89.50, targetWeight: 5 },
  ]);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTicker, setNewTicker] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newUnits, setNewUnits] = useState<string>('');
  const [newAvgPrice, setNewAvgPrice] = useState<string>('');
  const [newTargetWeight, setNewTargetWeight] = useState<string>('');
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);

  useEffect(() => {
    fetchLivePrices();
  }, []);

  const fetchLivePrices = async () => {
    setLoadingPrices(true);
    try {
      const updated = await Promise.all(
        holdings.map(async (item) => {
          const res = await fetch(`/api/stocks?symbol=${item.ticker}.AX`);
          const data = await res.json();
          if (data && data.price > 0) {
            return { ...item, currentPrice: data.price };
          }
          return item;
        })
      );
      setHoldings(updated);
    } catch (e) {
      console.error('Failed to update live prices', e);
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleTickerBlur = async () => {
    if (!newTicker) return;
    setIsLookingUp(true);
    try {
      const cleanTicker = newTicker.trim().toUpperCase();
      const res = await fetch(`/api/stocks?symbol=${cleanTicker}.AX`);
      const data = await res.json();
      if (data && data.price > 0) {
        if (!newAvgPrice) setNewAvgPrice(data.price.toString());
        if (!newName) setNewName(`${cleanTicker} Australian Share / ETF`);
      }
    } catch (e) {
      console.error('Lookup failed', e);
    } finally {
      setIsLookingUp(false);
    }
  };

  // Save Schedule Rules & Simulate Date Evaluation
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const displayDate = scheduleDate.split('-').reverse().join('/');
    const today = new Date('2026-08-10');
    const targetDate = new Date(scheduleDate);

    if (targetDate <= today) {
      // If the selected date has arrived or passed, process it automatically
      const newBalance = cashBalance + dcaAmount;
      const newTx: Transaction = {
        id: Date.now().toString(),
        date: displayDate,
        description: `Scheduled Deposit (${dcaFrequency} - $${dcaAmount})`,
        amount: dcaAmount,
        type: 'deposit'
      };

      setTransactions([newTx, ...transactions]);
      setCashBalance(newBalance);
      setSimulationLog(`Schedule saved! Date ${displayDate} has arrived. Payment processed and added to history log. Cash balance: $${newBalance.toFixed(2)}.`);

      if (newBalance >= autoInvestThreshold) {
        executeAutoRebalance(newBalance, displayDate);
      }

      // Roll forward
      const nextDt = new Date(scheduleDate);
      if (dcaFrequency === 'Daily') nextDt.setDate(nextDt.getDate() + 1);
      else if (dcaFrequency === 'Weekly') nextDt.setDate(nextDt.getDate() + 7);
      else if (dcaFrequency === 'Fortnightly') nextDt.setDate(nextDt.getDate() + 14);
      else if (dcaFrequency === 'Monthly') nextDt.setMonth(nextDt.getMonth() + 1);
      setScheduleDate(nextDt.toISOString().split('T')[0]);
    } else {
      setSimulationLog(`Schedule saved! Next payment is scheduled for ${displayDate}. Cash balance remains locked until the date arrives.`);
    }
  };

  // Process Random One-Off Deposit
  const handleOneOffDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDisplayDate = oneOffDate.split('-').reverse().join('/');
    const today = new Date('2026-08-10');
    const targetDate = new Date(oneOffDate);

    if (targetDate > today) {
      setSimulationLog(`⏳ Cannot log one-off deposit for ${formattedDisplayDate}: Date is in the future.`);
      return;
    }

    const newBalance = cashBalance + oneOffAmount;

    const newTx: Transaction = {
      id: Date.now().toString(),
      date: formattedDisplayDate,
      description: `Manual One-Off Deposit`,
      amount: oneOffAmount,
      type: 'deposit'
    };

    setTransactions([newTx, ...transactions]);
    setCashBalance(newBalance);
    setSimulationLog(`Logged manual deposit of $${oneOffAmount} for ${formattedDisplayDate}. Cash balance: $${newBalance.toFixed(2)}.`);

    if (newBalance >= autoInvestThreshold) {
      executeAutoRebalance(newBalance, formattedDisplayDate);
    }
  };

  // Auto-Invest Execution
  const executeAutoRebalance = (currentCash: number, txDate: string) => {
    const totalVal = holdings.reduce((sum, h) => sum + (h.units * h.currentPrice), 0);

    let mostUnderweightIndex = 0;
    let maxDeficit = -99999;

    holdings.forEach((h, idx) => {
      const marketVal = h.units * h.currentPrice;
      const currentWeight = totalVal > 0 ? (marketVal / totalVal) * 100 : 0;
      const deficit = h.targetWeight - currentWeight;
      
      if (deficit > maxDeficit) {
        maxDeficit = deficit;
        mostUnderweightIndex = idx;
      }
    });

    const targetAsset = holdings[mostUnderweightIndex];
    const tranche = autoInvestThreshold;
    const unitsToAdd = tranche / targetAsset.currentPrice;

    const updatedHoldings = holdings.map((h, idx) => {
      if (idx === mostUnderweightIndex) {
        const totalCostBefore = h.units * h.avgPrice;
        const newUnits = h.units + unitsToAdd;
        const newAvgPrice = (totalCostBefore + tranche) / newUnits;
        return { ...h, units: newUnits, avgPrice: newAvgPrice };
      }
      return h;
    });

    setHoldings(updatedHoldings);
    const remainingCash = currentCash - tranche;
    setCashBalance(remainingCash);

    const investTx: Transaction = {
      id: (Date.now() + 1).toString(),
      date: txDate,
      description: `Auto-Invest $${tranche} into ${targetAsset.ticker} (Most Underweight)`,
      amount: tranche,
      type: 'invest'
    };

    setTransactions([investTx, ...transactions]);
    setSimulationLog(prev => prev + ` 🚀 Threshold ($${tranche}) reached on ${txDate}! Automatically deployed funds into ${targetAsset.ticker} (${targetAsset.name}) as it was the most underweight relative to target.`);
  };

  const handleAddHolding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker || !newUnits || !newAvgPrice) return;

    const newItem: EtfHolding = {
      ticker: newTicker.toUpperCase(),
      name: newName || newTicker.toUpperCase(),
      units: parseFloat(newUnits),
      avgPrice: parseFloat(newAvgPrice),
      currentPrice: parseFloat(newAvgPrice),
      targetWeight: newTargetWeight ? parseFloat(newTargetWeight) : 0,
    };

    setHoldings([...holdings, newItem]);
    setNewTicker('');
    setNewName('');
    setNewUnits('');
    setNewAvgPrice('');
    setNewTargetWeight('');
    setShowAddModal(false);
  };

  const handleDelete = (ticker: string) => {
    setHoldings(holdings.filter(h => h.ticker !== ticker));
  };

  const totalPortfolioValue = holdings.reduce((sum, item) => sum + (item.units * item.currentPrice), 0);
  const totalCostBase = holdings.reduce((sum, item) => sum + (item.units * item.avgPrice), 0);
  const totalGainLoss = totalPortfolioValue - totalCostBase;
  const totalGainLossPercent = totalCostBase > 0 ? (totalGainLoss / totalCostBase) * 100 : 0;

  const displayScheduleDate = scheduleDate.split('-').reverse().join('/');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
      
      {/* Header & Total Value */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Pearler Investments & Automation</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Live ASX Data & Dynamic Target-Weight Rebalancing Automation</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLivePrices}
            disabled={loadingPrices}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingPrices ? 'animate-spin text-emerald-400' : ''}`} />
            {loadingPrices ? 'Syncing...' : 'Live Prices'}
          </button>

          <div className="flex items-center gap-4 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Investments Value ($ AUD)</span>
              <span className="text-xl font-bold text-white">${totalPortfolioValue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Return</span>
              <span className={`text-sm font-bold flex items-center ${totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                {totalGainLoss >= 0 ? `+${totalGainLossPercent.toFixed(2)}%` : `${totalGainLossPercent.toFixed(2)}%`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Automation Controls & Schedule Configurator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Configurable Auto Investment Card */}
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Auto Investment (${autoInvestThreshold.toLocaleString()} Threshold)
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Active</span>
          </div>

          <p className="text-xs text-slate-200 bg-slate-950/40 p-3 rounded-lg border border-slate-800 font-mono leading-relaxed">
            Deposit <span className="text-amber-400 font-bold">${dcaAmount}.00</span> <span className="text-emerald-400 font-bold">{dcaFrequency.toLowerCase()}</span>. Next scheduled payment: <span className="text-white font-bold">{displayScheduleDate}</span>. Auto-invests into most underweight asset when cash hits <span className="text-amber-300 font-bold">${autoInvestThreshold.toLocaleString()}</span>.
          </p>

          {/* Schedule Rules Inputs & Save Button */}
          <form onSubmit={handleSaveSchedule} className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Amount ($)</label>
                <input 
                  type="number" 
                  value={dcaAmount} 
                  onChange={(e) => setDcaAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 text-white font-bold px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Frequency</label>
                <select 
                  value={dcaFrequency} 
                  onChange={(e) => setDcaFrequency(e.target.value)}
                  className="w-full bg-slate-900 text-white font-bold px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-amber-500"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Fortnightly">Fortnightly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Threshold ($)</label>
                <input 
                  type="number" 
                  value={autoInvestThreshold} 
                  onChange={(e) => setAutoInvestThreshold(Number(e.target.value))}
                  className="w-full bg-slate-900 text-white font-bold px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Start Date</label>
                <div 
                  className="flex items-center gap-1 bg-slate-900 px-2 py-1.5 rounded border border-slate-700 cursor-pointer"
                  onClick={() => scheduleDateRef.current?.showPicker()}
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <input 
                    ref={scheduleDateRef}
                    type="date" 
                    value={scheduleDate} 
                    onChange={(e) => setScheduleDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="bg-transparent text-white text-[11px] focus:outline-none font-mono w-full cursor-pointer"
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
            >
              <Calendar className="w-4 h-4" /> Save Schedule & Apply Rules
            </button>
          </form>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Cash Balance: ${cashBalance.toFixed(2)} / ${autoInvestThreshold.toFixed(2)}</span>
              <span>{Math.min(((cashBalance / autoInvestThreshold) * 100), 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((cashBalance / autoInvestThreshold) * 100, 100)}%` }}></div>
            </div>
          </div>

          {/* Manual One-Off Deposit Section */}
          <div className="pt-2 border-t border-amber-500/20 space-y-2">
            <span className="text-[11px] font-bold text-slate-300 block">Manual One-Off Deposit</span>
            <form onSubmit={handleOneOffDeposit} className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                <span className="text-emerald-400 font-bold text-xs">$</span>
                <input 
                  type="number" 
                  value={oneOffAmount} 
                  onChange={(e) => setOneOffAmount(Number(e.target.value))}
                  className="bg-transparent text-white font-bold text-xs w-16 focus:outline-none font-mono"
                  required
                />
              </div>
              <div 
                className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-700 cursor-pointer"
                onClick={() => oneOffDateRef.current?.showPicker()}
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <input 
                  ref={oneOffDateRef}
                  type="date" 
                  value={oneOffDate} 
                  onChange={(e) => setOneOffDate(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="bg-transparent text-white text-[11px] focus:outline-none font-mono w-[100px] cursor-pointer"
                  required
                />
              </div>
              <button 
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-1.5 px-3 rounded transition-colors shadow"
              >
                Deposit Random
              </button>
            </form>
          </div>

          <div className="text-[10px] text-slate-400 font-mono bg-slate-950/50 p-2 rounded border border-slate-800">
            {simulationLog}
          </div>
        </div>

        {/* Target Allocations Preview */}
        <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-sm">Portfolio Target Allocations</span>
            <button 
              onClick={() => setShowAddModal(true)}
              className="text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Holding
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            When your cash threshold ($<span className="text-white font-bold">{autoInvestThreshold.toLocaleString()}</span>) is met, funds deploy automatically into the asset with the largest negative gap (most underweight).
          </p>
          <div className="space-y-2 text-xs font-mono">
            {holdings.map((h) => {
              const marketVal = h.units * h.currentPrice;
              const currentWeight = totalPortfolioValue > 0 ? (marketVal / totalPortfolioValue) * 100 : 0;
              const deficit = h.targetWeight - currentWeight;
              const isMostUnderweight = deficit > 0;

              return (
                <div key={h.ticker} className="space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-bold text-emerald-400">{h.ticker} (Target: {h.targetWeight}%)</span>
                    <span className={isMostUnderweight ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                      Current: {currentWeight.toFixed(2)}% {isMostUnderweight ? `(Deficit: +${deficit.toFixed(1)}%)` : ''}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(currentWeight, 100)}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Holding Form Modal */}
      {showAddModal && (
        <form onSubmit={handleAddHolding} className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-emerald-400" /> Add Australian ETF or Share (Live web price lookup enabled)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">ASX Ticker</label>
              <input 
                type="text" placeholder="DHHF"
                value={newTicker} 
                onChange={(e) => setNewTicker(e.target.value)} 
                onBlur={handleTickerBlur}
                required
                className="w-full bg-slate-900 text-white px-3 py-1.5 rounded border border-slate-700 text-xs uppercase font-mono"
              />
              {isLookingUp && <span className="text-[9px] text-amber-400">Fetching live price...</span>}
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-slate-400 block mb-1">Name</label>
              <input 
                type="text" placeholder="BetaShares All Growth"
                value={newName} onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-900 text-white px-3 py-1.5 rounded border border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Units</label>
              <input 
                type="number" step="any" placeholder="10"
                value={newUnits} onChange={(e) => setNewUnits(e.target.value)} required
                className="w-full bg-slate-900 text-white px-3 py-1.5 rounded border border-slate-700 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Avg Price ($)</label>
              <input 
                type="number" step="any" placeholder="30.00"
                value={newAvgPrice} onChange={(e) => setNewAvgPrice(e.target.value)} required
                className="w-full bg-slate-900 text-white px-3 py-1.5 rounded border border-slate-700 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Target %</label>
              <input 
                type="number" placeholder="10"
                value={newTargetWeight} onChange={(e) => setNewTargetWeight(e.target.value)} required
                className="w-full bg-slate-900 text-white px-3 py-1.5 rounded border border-slate-700 text-xs font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded">Cancel</button>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded shadow">Save Holding</button>
          </div>
        </form>
      )}

      {/* Holdings Table */}
      <div className="overflow-x-auto space-y-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-400" /> Current Holdings & Targets
        </h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-400 font-mono">
              <th className="py-3 px-3">Ticker</th>
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3 text-right">Target %</th>
              <th className="py-3 px-3 text-right">Units</th>
              <th className="py-3 px-3 text-right">Avg Price</th>
              <th className="py-3 px-3 text-right">Live ASX Price</th>
              <th className="py-3 px-3 text-right">Market Value ($ AUD)</th>
              <th className="py-3 px-3 text-right">Gain / Loss</th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
            {holdings.map((item) => {
              const marketValue = item.units * item.currentPrice;
              const costBase = item.units * item.avgPrice;
              const gain = marketValue - costBase;
              const gainPct = costBase > 0 ? (gain / costBase) * 100 : 0;

              return (
                <tr key={item.ticker} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-bold text-emerald-400">{item.ticker}</td>
                  <td className="py-3 px-3 text-slate-300 font-sans">{item.name}</td>
                  <td className="py-3 px-3 text-right text-amber-300 font-bold">{item.targetWeight}%</td>
                  <td className="py-3 px-3 text-right text-slate-300">{item.units.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right text-slate-300">${item.avgPrice.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right text-white font-bold">${item.currentPrice.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right text-white font-bold">${marketValue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                  <td className={`py-3 px-3 text-right font-bold ${gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {gain >= 0 ? `+${gainPct.toFixed(2)}%` : `${gainPct.toFixed(2)}%`}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button onClick={() => handleDelete(item.ticker)} className="text-slate-500 hover:text-rose-400 p-1" title="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Transaction & Deposit History Log */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" /> Deposit & Auto-Invest History Log
        </h3>
        <div className="bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4 text-right">Amount ($ AUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/30">
                  <td className="py-2.5 px-4 text-slate-300">{tx.date}</td>
                  <td className="py-2.5 px-4 text-slate-200">{tx.description}</td>
                  <td className={`py-2.5 px-4 text-right font-bold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {tx.type === 'deposit' ? `+$${tx.amount.toFixed(2)}` : `-$${tx.amount.toFixed(2)} (Invested)`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
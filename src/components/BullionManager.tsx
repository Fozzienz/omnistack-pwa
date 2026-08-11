'use client';

import React, { useState } from 'react';
import { Coins, Upload, Download, PlusCircle, Trash2, FileSpreadsheet, Edit3, Image as ImageIcon, Check, Filter } from 'lucide-react';

interface BullionItem {
  id: string;
  date: string;
  name: string;
  metal: 'Gold' | 'Silver' | 'Platinum';
  form: 'Bar' | 'Coin' | 'Round' | 'Goldback';
  weightOzt: number;
  pricePaidAud: number;
  imageUrl?: string;
}

export default function BullionManager() {
  const [bullion, setBullion] = useState<BullionItem[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Gold' | 'Silver' | 'Platinum'>('All');

  // Live Spot Prices (AUD per ozt)
  const spotPrices = {
    Gold: 6129.59,
    Silver: 89.82,
    Platinum: 2468.28
  };

  // Manual entry form state
  const [manualDate, setManualDate] = useState<string>('2026-08-10');
  const [manualName, setManualName] = useState<string>('');
  const [manualMetal, setManualMetal] = useState<'Gold' | 'Silver' | 'Platinum'>('Gold');
  const [manualForm, setManualForm] = useState<'Bar' | 'Coin' | 'Round' | 'Goldback'>('Coin');
  const [manualWeightOzt, setManualWeightOzt] = useState<string>('');
  const [manualPrice, setManualPrice] = useState<string>('');
  const [manualImage, setManualImage] = useState<string>('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editMetal, setEditMetal] = useState<'Gold' | 'Silver' | 'Platinum'>('Gold');
  const [editDate, setEditDate] = useState<string>('');
  const [editWeight, setEditWeight] = useState<string>('');
  const [editPrice, setEditPrice] = useState<string>('');

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [dragOver, setDragOver] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setManualImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualWeightOzt || !manualPrice) return;

    const newItem: BullionItem = {
      id: Date.now().toString(),
      date: manualDate,
      name: manualName || `${manualMetal} ${manualForm} (${manualWeightOzt} ozt)`,
      metal: manualMetal,
      form: manualForm,
      weightOzt: parseFloat(manualWeightOzt),
      pricePaidAud: parseFloat(manualPrice),
      imageUrl: manualImage || undefined,
    };

    setBullion([newItem, ...bullion]);
    setManualName('');
    setManualWeightOzt('');
    setManualPrice('');
    setManualImage('');
  };

  const confirmDelete = (id: string) => {
    setBullion(bullion.filter(item => item.id !== id));
    setDeletingId(null);
  };

  const startEditing = (item: BullionItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditMetal(item.metal);
    setEditDate(item.date);
    setEditWeight(item.weightOzt.toString());
    setEditPrice(item.pricePaidAud.toString());
  };

  const saveEditing = (id: string) => {
    setBullion(bullion.map(item => {
      if (item.id === id) {
        return {
          ...item,
          name: editName,
          metal: editMetal,
          date: editDate,
          weightOzt: parseFloat(editWeight) || item.weightOzt,
          pricePaidAud: parseFloat(editPrice) || item.pricePaidAud,
        };
      }
      return item;
    }));
    setEditingId(null);
  };

  const handleItemImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBullion(bullion.map(item => item.id === id ? { ...item, imageUrl: reader.result as string } : item));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Date,Name,Metal,Form,WeightOzt,PricePaidAUD\n2024-12-21,\"ABC Gold Bullion - 1/2 oz\",Gold,Bar,0.50,2160.00\n2024-12-24,\"3 x Koala, 2 x Emu, 1 x Brumby\",Silver,Coin,6.00,324.00";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "master_bullion_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust Excel-Safe CSV Line Parser
  const parseCSVLine = (textLine: string) => {
    let clean = textLine.trim();
    if (clean.startsWith('""') && clean.endsWith('""')) {
      clean = clean.substring(2, clean.length - 2);
    } else if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.substring(1, clean.length - 1);
    }
    clean = clean.replace(/""/g, '"');

    const result: string[] = [];
    let inQuotes = false;
    let currentVal = '';
    for (let i = 0; i < clean.length; i++) {
      const char = clean[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(currentVal.trim().replace(/^["']|["']$/g, ''));
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    result.push(currentVal.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  const handleFileUpload = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        alert('Error: File is empty.');
        return;
      }

      const lines = text.split(/\r\n|\n/);
      const parsedItems: BullionItem[] = [];
      let errorLog = '';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const row = parseCSVLine(line);
        
        if (row.length < 6) {
          errorLog += `Row ${i}: Expected at least 6 columns, got ${row.length} -> "${line}"\n`;
          continue;
        }

        const date = row[0] || '2026-01-01';
        const name = row[1] || 'Imported Bullion Item';
        const metal = (['Gold', 'Silver', 'Platinum'].includes(row[2]) ? row[2] : 'Silver') as any;
        const form = (['Bar', 'Coin', 'Round', 'Goldback'].includes(row[3]) ? row[3] : 'Coin') as any;
        const weightOzt = parseFloat(row[4]);
        const pricePaidAud = parseFloat(row[5]);

        if (isNaN(weightOzt) || isNaN(pricePaidAud)) {
          errorLog += `Row ${i}: Invalid numeric weight ("${row[4]}") or price ("${row[5]}") -> "${line}"\n`;
          continue;
        }

        parsedItems.push({
          id: `${Date.now()}-${i}`,
          date,
          name,
          metal,
          form,
          weightOzt,
          pricePaidAud
        });
      }

      if (errorLog) {
        alert(`❌ Import Aborted! Found formatting errors. Nothing was loaded.\n\nError Details:\n${errorLog}`);
        return;
      }

      if (parsedItems.length > 0) {
        setBullion(prev => [...parsedItems, ...prev]);
        alert(`Successfully imported all ${parsedItems.length} items from ${file.name}!`);
      } else {
        alert('No valid rows found in the CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const getMetalStats = (metalName: 'Gold' | 'Silver' | 'Platinum') => {
    const items = bullion.filter(b => b.metal === metalName);
    const weight = items.reduce((sum, item) => sum + item.weightOzt, 0);
    const cost = items.reduce((sum, item) => sum + item.pricePaidAud, 0);
    const spotVal = weight * spotPrices[metalName];
    const returnVal = spotVal - cost;
    return { weight, cost, spotVal, returnVal, count: items.length };
  };

  const goldStats = getMetalStats('Gold');
  const silverStats = getMetalStats('Silver');
  const platinumStats = getMetalStats('Platinum');

  const totalSpent = bullion.reduce((sum, item) => sum + item.pricePaidAud, 0);
  const totalCurrentSpotValue = bullion.reduce((sum, item) => sum + (item.weightOzt * spotPrices[item.metal]), 0);
  const totalGainLoss = totalCurrentSpotValue - totalSpent;

  const displayedBullion = activeTab === 'All' ? bullion : bullion.filter(b => b.metal === activeTab);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm dark:shadow-lg space-y-6 transition-colors">
      
      {/* Header & Dynamic Metal Breakdown Summary Cards */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Physical Bullion Holdings & Ledger</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Valued purely at spot price. Track gold and silver holdings separately or together.</p>
        </div>

        {/* Breakdown Metric Cards */}
        <div className="flex flex-wrap items-center gap-3">
          
          {goldStats.weight > 0 && (
            <div className="bg-slate-100 dark:bg-slate-950/60 px-4 py-2.5 rounded-xl border border-amber-500/30 font-mono text-xs space-y-0.5">
              <span className="text-[10px] text-amber-500 uppercase tracking-wider font-bold block">Gold ({goldStats.weight.toFixed(2)} ozt)</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                ${goldStats.spotVal.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-[11px] font-bold ${goldStats.returnVal >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {goldStats.returnVal >= 0 ? '+' : ''}${goldStats.returnVal.toFixed(2)}
              </div>
            </div>
          )}

          {silverStats.weight > 0 && (
            <div className="bg-slate-100 dark:bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-400/30 font-mono text-xs space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Silver ({silverStats.weight.toFixed(2)} ozt)</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                ${silverStats.spotVal.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-[11px] font-bold ${silverStats.returnVal >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {silverStats.returnVal >= 0 ? '+' : ''}${silverStats.returnVal.toFixed(2)}
              </div>
            </div>
          )}

          {platinumStats.weight > 0 && (
            <div className="bg-slate-100 dark:bg-slate-950/60 px-4 py-2.5 rounded-xl border border-sky-400/30 font-mono text-xs space-y-0.5">
              <span className="text-[10px] text-sky-400 uppercase tracking-wider font-bold block">Platinum ({platinumStats.weight.toFixed(2)} ozt)</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                ${platinumStats.spotVal.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-[11px] font-bold ${platinumStats.returnVal >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {platinumStats.returnVal >= 0 ? '+' : ''}${platinumStats.returnVal.toFixed(2)}
              </div>
            </div>
          )}

          <div className="bg-slate-900 dark:bg-slate-950 px-4 py-2.5 rounded-xl border border-emerald-500/40 font-mono text-xs space-y-0.5 shadow-md">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block">Total Portfolio Spot Value</span>
            <div className="text-sm font-bold text-white">
              ${totalCurrentSpotValue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-[11px] font-bold ${totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              Total Return: {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toFixed(2)}
            </div>
          </div>

        </div>
      </div>

      {/* Control Grid: Manual Add vs Bulk CSV Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Manual Add Form */}
        <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-amber-500" /> Manual Bullion Entry & Photo Upload
          </h3>
          <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Date Purchased</label>
                <input 
                  type="date" 
                  value={manualDate} 
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Item Name / Description</label>
                <input 
                  type="text" 
                  placeholder="Perth Mint Lunar 1oz" 
                  value={manualName} 
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Metal</label>
                <select 
                  value={manualMetal} 
                  onChange={(e) => setManualMetal(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700"
                >
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Form</label>
                <select 
                  value={manualForm} 
                  onChange={(e) => setManualForm(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700"
                >
                  <option value="Bar">Bar</option>
                  <option value="Coin">Coin</option>
                  <option value="Round">Round</option>
                  <option value="Goldback">Goldback</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Weight (ozt)</label>
                <input 
                  type="number" step="any" placeholder="0.16"
                  value={manualWeightOzt} onChange={(e) => setManualWeightOzt(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Price Paid ($)</label>
                <input 
                  type="number" step="any" placeholder="700"
                  value={manualPrice} onChange={(e) => setManualPrice(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="cursor-pointer bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                {manualImage ? 'Photo Attached ✓' : 'Upload Item Photo'}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>

              <button 
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-1.5 rounded-lg transition-colors shadow"
              >
                Add to Ledger
              </button>
            </div>
          </form>
        </div>

        {/* Bulk CSV Upload & Template Download */}
        <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-sky-500" /> Master CSV Bulk Upload (Gold & Silver)
            </h3>
            <button 
              onClick={downloadTemplate}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium"
            >
              <Download className="w-3.5 h-3.5" /> Download Template (.csv)
            </button>
          </div>

          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files); }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors flex flex-col items-center justify-center ${dragOver ? 'border-sky-500 bg-sky-500/10' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'}`}
          >
            <FileSpreadsheet className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">Drag and drop your Master CSV file here, or</p>
            <label className="cursor-pointer bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded transition-colors">
              Browse Files
              <input type="file" accept=".csv" onChange={(e) => handleFileUpload(e.target.files)} className="hidden" />
            </label>
            {fileName && <span className="text-[11px] text-emerald-500 mt-2 font-mono">Loaded: {fileName}</span>}
          </div>
        </div>

      </div>

      {/* Holdings Ledger Table with Metal Filter Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" /> Bullion Transaction Ledger ({displayedBullion.length} Items shown)
          </h3>

          {/* Metal Section Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 px-2 flex items-center gap-1"><Filter className="w-3 h-3"/> Section:</span>
            {(['All', 'Gold', 'Silver', 'Platinum'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded transition-colors font-bold ${activeTab === tab ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
              >
                {tab} {tab === 'Gold' && `(${goldStats.count})`} {tab === 'Silver' && `(${silverStats.count})`} {tab === 'Platinum' && `(${platinumStats.count})`} {tab === 'All' && `(${bullion.length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-mono">
                <th className="py-3 px-3">Photo / Coin</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Item / Description</th>
                <th className="py-3 px-3">Metal</th>
                <th className="py-3 px-3 text-right">Weight (ozt)</th>
                <th className="py-3 px-3 text-right">Price Paid</th>
                <th className="py-3 px-3 text-right">Current Spot Value</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs font-mono align-middle">
              {displayedBullion.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No bullion items found for <span className="text-amber-400 font-bold">{activeTab}</span>. Upload a Master CSV or add an item manually above.
                  </td>
                </tr>
              ) : (
                displayedBullion.map((item) => {
                  const currentSpotValue = item.weightOzt * spotPrices[item.metal];
                  const isEditing = editingId === item.id;
                  const isDeleting = deletingId === item.id;

                  const isGold = item.metal === 'Gold';
                  const isPlatinum = item.metal === 'Platinum';
                  const outerColor = isGold ? '#F59E0B' : isPlatinum ? '#94A3B8' : '#64748B';
                  const innerColor = isGold ? '#FBBF24' : isPlatinum ? '#CBD5E1' : '#94A3B8';
                  const starColor = isGold ? '#D97706' : isPlatinum ? '#64748B' : '#475569';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Photo or Realistic Coin SVG Icon */}
                      <td className="py-2.5 px-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group shadow-sm">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="18" cy="18" r="16" fill={outerColor} stroke={starColor} strokeWidth="1" />
                              <circle cx="18" cy="18" r="12" fill={innerColor} fillOpacity="0.8" stroke={outerColor} strokeWidth="0.5" />
                              <path 
                                d="M18 10L19.8 14.6H24.8L20.8 17.5L22.3 22.2L18 19.3L13.7 22.2L15.2 17.5L11.2 14.6H16.2L18 10Z" 
                                fill={starColor} 
                                fillOpacity="0.5"
                              />
                            </svg>
                          )}
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity" title="Upload Photo">
                            <ImageIcon className="w-3.5 h-3.5 text-white" />
                            <input type="file" accept="image/*" onChange={(e) => handleItemImageUpload(item.id, e)} className="hidden" />
                          </label>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                        {isEditing ? (
                          <input 
                            type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                            className="bg-slate-900 text-white px-2 py-1 rounded border border-slate-700 text-xs w-28"
                          />
                        ) : (
                          formatDateDisplay(item.date)
                        )}
                      </td>

                      {/* Name */}
                      <td className="py-2.5 px-3 text-slate-900 dark:text-white font-medium">
                        {isEditing ? (
                          <input 
                            type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                            className="bg-slate-900 text-white px-2 py-1 rounded border border-slate-700 text-xs w-full"
                          />
                        ) : (
                          item.name
                        )}
                      </td>

                      {/* Metal Type */}
                      <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">
                        {isEditing ? (
                          <select 
                            value={editMetal} onChange={(e) => setEditMetal(e.target.value as any)}
                            className="bg-slate-900 text-white px-2 py-1 rounded border border-slate-700 text-xs"
                          >
                            <option value="Gold">Gold</option>
                            <option value="Silver">Silver</option>
                            <option value="Platinum">Platinum</option>
                          </select>
                        ) : (
                          item.metal
                        )}
                      </td>

                      {/* Weight */}
                      <td className="py-2.5 px-3 text-right text-slate-800 dark:text-slate-200">
                        {isEditing ? (
                          <input 
                            type="number" step="any" value={editWeight} onChange={(e) => setEditWeight(e.target.value)}
                            className="bg-slate-900 text-white px-2 py-1 rounded border border-slate-700 text-xs w-16 text-right"
                          />
                        ) : (
                          `${item.weightOzt.toFixed(2)} ozt`
                        )}
                      </td>

                      {/* Price Paid */}
                      <td className="py-2.5 px-3 text-right text-slate-800 dark:text-slate-200 font-bold">
                        {isEditing ? (
                          <input 
                            type="number" step="any" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                            className="bg-slate-900 text-white px-2 py-1 rounded border border-slate-700 text-xs w-20 text-right"
                          />
                        ) : (
                          `$${item.pricePaidAud.toFixed(2)}`
                        )}
                      </td>

                      {/* Current Spot Value */}
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ${currentSpotValue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Actions / Delete Warning Confirmation */}
                      <td className="py-2.5 px-3 text-center">
                        {isDeleting ? (
                          <div className="flex items-center justify-center gap-1 bg-rose-500/10 p-1 rounded border border-rose-500/30">
                            <span className="text-[10px] text-rose-400 font-bold px-1">Delete?</span>
                            <button onClick={() => confirmDelete(item.id)} className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">Yes</button>
                            <button onClick={() => setDeletingId(null)} className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded">No</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            {isEditing ? (
                              <button onClick={() => saveEditing(item.id)} className="text-emerald-400 hover:text-emerald-300 p-1" title="Save">
                                <Check className="w-4 h-4" />
                              </button>
                            ) : (
                              <button onClick={() => startEditing(item)} className="text-slate-400 hover:text-sky-400 p-1" title="Edit Item">
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => setDeletingId(item.id)} className="text-slate-400 hover:text-rose-400 p-1" title="Delete Item">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

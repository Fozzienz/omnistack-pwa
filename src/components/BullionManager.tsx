'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Coins, 
  PlusCircle, 
  Trash2, 
  Upload, 
  Download, 
  FileText, 
  Image as ImageIcon,
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Pencil,
  Star,
  CheckCircle2,
  X,
  AlertTriangle,
  ZoomIn
} from 'lucide-react';
import type { BullionItem, BullionMetal, BullionForm, MarketData } from '@/types';

type SortField = 'date' | 'metal' | 'pricePaidAud' | 'currentSpot';
type SortDirection = 'asc' | 'desc';
type MetalFilter = 'All' | 'Gold' | 'Silver' | 'Platinum';

interface FeedbackStatus {
  type: 'success' | 'error';
  message: string;
  details?: string[];
}

export default function BullionManager() {
  const [items, setItems] = useState<BullionItem[]>([]);
  const [spotPrices, setSpotPrices] = useState<MarketData | null>(null);
  const [selectedSection, setSelectedSection] = useState<MetalFilter>('All');
  const [feedback, setFeedback] = useState<FeedbackStatus | null>(null);

  // Sorting state (defaulted to Date Descending)
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Manual Form state
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState<string>('Perth Mint Kangaroo');
  const [metal, setMetal] = useState<BullionMetal | ''>('');
  const [form, setForm] = useState<BullionForm | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitWeight, setUnitWeight] = useState<string>('');
  const [pricePaidAud, setPricePaidAud] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  // Modals state
  const [editingItem, setEditingItem] = useState<BullionItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<BullionItem | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Mount ref guard to prevent overwriting LocalStorage on initial render
  const isInitialMount = useRef(true);

  // Drag and drop / refs
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);

  const cleanString = (val: string) => {
    if (!val) return '';
    return val.replace(/^["']+|["']+$|^"|"$/g, '').replace(/""/g, '"').trim();
  };

  const parseDateString = (dateStr: string): Date => {
    if (!dateStr) return new Date(0);
    const clean = cleanString(dateStr);
    
    if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts.length === 3) {
        if (parts[2].length === 4) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        if (parts[0].length === 4) return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    } else if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (parts[2].length === 4) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
    const d = new Date(clean);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  const formatDateForInput = (dateStr: string): string => {
    const d = parseDateString(dateStr);
    if (isNaN(d.getTime()) || d.getTime() === 0) return new Date().toISOString().split('T')[0];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (dateStr: string): string => {
    const d = parseDateString(dateStr);
    if (isNaN(d.getTime()) || d.getTime() === 0) return cleanString(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Safe LocalStorage lifecycle using ref guard
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const saved = localStorage.getItem('omnistack_bullion_ledger');
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved bullion ledger', e);
        }
      }
    } else {
      localStorage.setItem('omnistack_bullion_ledger', JSON.stringify(items));
      window.dispatchEvent(new Event('omnistack_ledger_updated'));
    }
  }, [items]);

  // Fetch live market rates
  useEffect(() => {
    fetch('/api/metals')
      .then((res) => res.json())
      .then((data) => setSpotPrices(data))
      .catch(console.error);
  }, []);

  const getSpotPriceForMetal = (m: BullionMetal): number => {
    if (!spotPrices) return 0;
    switch (m) {
      case 'Gold': return spotPrices.goldAud || 0;
      case 'Silver': return spotPrices.silverAud || 0;
      case 'Platinum': return spotPrices.platinumAud || 0;
      default: return 0;
    }
  };

  const normalizeForm = (input: string): BullionForm => {
    const lower = input.toLowerCase().trim();
    if (lower.includes('bar') || lower.includes('ingot') || lower.includes('cast')) return 'Bar';
    if (lower.includes('coin')) return 'Coin';
    if (lower.includes('round')) return 'Round';
    if (lower.includes('goldback')) return 'Goldback';
    return 'Bar';
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !unitWeight || !pricePaidAud || !metal || !form) return;

    const unitW = parseFloat(unitWeight);
    const qty = quantity > 0 ? quantity : 1;
    const totalW = unitW * qty;

    const newItem: BullionItem = {
      id: Date.now().toString(),
      date,
      name: cleanString(name),
      metal: metal as BullionMetal,
      form: form as BullionForm,
      weightOzt: totalW,
      pricePaidAud: parseFloat(pricePaidAud),
      imageUrl: imageUrl || undefined,
    };

    setItems([newItem, ...items]);
    setName('Perth Mint Kangaroo');
    setMetal('');
    setForm('');
    setQuantity(1);
    setUnitWeight('');
    setPricePaidAud('');
    setImageUrl('');
    setFeedback({ type: 'success', message: 'Successfully added new item to your ledger.' });
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updatedItem = {
      ...editingItem,
      name: cleanString(editingItem.name),
    };

    setItems(items.map((i) => (i.id === editingItem.id ? updatedItem : i)));
    setEditingItem(null);
    setFeedback({ type: 'success', message: 'Item updated successfully.' });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isEdit && editingItem) {
          setEditingItem({ ...editingItem, imageUrl: result });
        } else {
          setImageUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Robust CSV Parser with Default Purchase Date Sorting
  const processCsvText = (text: string) => {
    if (!text || !text.trim()) {
      setFeedback({ type: 'error', message: 'Upload Failed: The selected CSV file is empty.' });
      return;
    }

    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) {
      setFeedback({ type: 'error', message: 'Upload Failed: No readable data lines found in CSV.' });
      return;
    }

    const parsedItems: BullionItem[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const rowNum = index + 1;
      if (index === 0 && line.toLowerCase().includes('date')) return; // Skip header

      const cols = line.split(',').map((col) => cleanString(col));
      if (cols.length < 6) {
        errors.push(`Row ${rowNum}: Expected at least 6 columns, found ${cols.length}`);
        return;
      }

      const parsedDate = cols[0];
      const parsedName = cols[1];
      const rawMetal = cols[2];
      
      let parsedMetal: BullionMetal = 'Gold';
      if (rawMetal.toLowerCase().includes('silver')) parsedMetal = 'Silver';
      else if (rawMetal.toLowerCase().includes('plat')) parsedMetal = 'Platinum';
      else if (rawMetal.toLowerCase().includes('gold')) parsedMetal = 'Gold';

      let parsedForm: BullionForm = 'Bar';
      let parsedWeight = 0;
      let parsedPrice = 0;

      if (cols.length >= 7) {
        parsedForm = normalizeForm(cols[3]);
        const qty = parseFloat(cols[4]) || 1;
        const unitW = parseFloat(cols[5]) || 0;
        parsedWeight = unitW * qty;
        parsedPrice = parseFloat(cols[6]) || 0;
      } else {
        parsedForm = normalizeForm(cols[3]);
        parsedWeight = parseFloat(cols[4]) || 0;
        parsedPrice = parseFloat(cols[5]) || 0;
      }

      if (isNaN(parsedWeight) || parsedWeight <= 0) {
        errors.push(`Row ${rowNum} ("${parsedName || 'Unknown'}"): Invalid weight value.`);
        return;
      }

      parsedItems.push({
        id: `${Date.now()}-${index}`,
        date: parsedDate,
        name: parsedName || 'Unnamed Item',
        metal: parsedMetal,
        form: parsedForm,
        weightOzt: parsedWeight,
        pricePaidAud: isNaN(parsedPrice) ? 0 : parsedPrice,
      });
    });

    if (parsedItems.length > 0) {
      // Sort newly imported CSV items by Purchase Date (Newest First) by default
      parsedItems.sort((a, b) => parseDateString(b.date).getTime() - parseDateString(a.date).getTime());

      setItems((prev) => {
        const combined = [...parsedItems, ...prev];
        // Ensure combined list remains ordered by Purchase Date (Newest First)
        return combined.sort((a, b) => parseDateString(b.date).getTime() - parseDateString(a.date).getTime());
      });

      // Reset UI sorting controls to Date Descending
      setSortField('date');
      setSortDirection('desc');

      if (errors.length > 0) {
        setFeedback({
          type: 'success',
          message: `Successfully imported ${parsedItems.length} items ordered by purchase date (${errors.length} rows skipped).`,
          details: errors
        });
      } else {
        setFeedback({
          type: 'success',
          message: `Successfully imported ${parsedItems.length} bullion items ordered by purchase date!`
        });
      }
    } else {
      setFeedback({
        type: 'error',
        message: 'CSV Upload Failed: No valid bullion items could be extracted.',
        details: errors
      });
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      const reader = new FileReader();
      reader.onload = (event) => processCsvText(event.target?.result as string);
      reader.readAsText(file);
    } else {
      setFeedback({ type: 'error', message: 'Invalid file format. Please upload a .csv file.' });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => processCsvText(event.target?.result as string);
      reader.readAsText(file);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Date,Name,Metal,Form,Quantity,WeightOzt,PricePaid\n2026-08-11,Perth Mint Kangaroo 1oz,Gold,Coin,1,1.0,3200.00";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'master_bullion_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sort Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Section Filtering
  const filteredBySection = items.filter((item) => {
    if (selectedSection === 'All') return true;
    return item.metal === selectedSection;
  });

  // Sorting Filtered Items
  const sortedItems = [...filteredBySection].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (sortField) {
      case 'date':
        aVal = parseDateString(a.date).getTime();
        bVal = parseDateString(b.date).getTime();
        break;
      case 'metal':
        aVal = a.metal.toLowerCase();
        bVal = b.metal.toLowerCase();
        break;
      case 'pricePaidAud':
        aVal = a.pricePaidAud;
        bVal = b.pricePaidAud;
        break;
      case 'currentSpot':
        aVal = a.weightOzt * getSpotPriceForMetal(a.metal);
        bVal = b.weightOzt * getSpotPriceForMetal(b.metal);
        break;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Metrics
  const totalCostBase = items.reduce((sum, item) => sum + item.pricePaidAud, 0);
  const totalCurrentValue = items.reduce((sum, item) => {
    const spot = getSpotPriceForMetal(item.metal);
    return sum + item.weightOzt * spot;
  }, 0);
  const totalGainLoss = totalCurrentValue - totalCostBase;

  const countForMetal = (m: MetalFilter) => {
    if (m === 'All') return items.length;
    return items.filter((i) => i.metal === m).length;
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-300 ml-1 inline" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-amber-400 ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-amber-400 ml-1 inline" />
    );
  };

  const renderItemAvatar = (item: BullionItem) => {
    if (item.imageUrl) {
      return (
        <button
          type="button"
          onClick={() => setPreviewImage({ url: item.imageUrl!, title: cleanString(item.name) })}
          className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-700 hover:border-amber-400 transition-colors focus:outline-none"
          title="Click to view full size photo"
        >
          <img 
            src={item.imageUrl} 
            alt={cleanString(item.name)} 
            className="w-8 h-8 object-cover transition-transform duration-200 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ZoomIn className="w-3.5 h-3.5 text-white" />
          </div>
        </button>
      );
    }

    if (item.metal === 'Gold') {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center shadow-inner">
            <Star className="w-3 h-3 text-slate-950 fill-slate-950" />
          </div>
        </div>
      );
    } else if (item.metal === 'Silver') {
      return (
        <div className="w-8 h-8 rounded-lg bg-slate-400/10 border border-slate-400/30 flex items-center justify-center shrink-0">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 flex items-center justify-center shadow-inner">
            <Star className="w-3 h-3 text-slate-950 fill-slate-950" />
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center shrink-0">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-200 via-cyan-400 to-cyan-600 flex items-center justify-center shadow-inner">
            <Star className="w-3 h-3 text-slate-950 fill-slate-950" />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex flex-col gap-1 text-xs font-mono transition-colors ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          {feedback.details && feedback.details.length > 0 && (
            <div className="mt-2 pl-6 space-y-1 text-[11px] opacity-90 max-h-32 overflow-y-auto border-t border-slate-800/60 pt-2">
              <span className="font-bold block">Validation Details:</span>
              {feedback.details.map((err, idx) => (
                <div key={idx}>• {err}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top Header & Spot Value Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Physical Bullion Holdings & Ledger</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Valued purely at spot price. Track gold and silver holdings separately or together.</p>
        </div>

        <div className="bg-slate-950/60 px-5 py-2.5 rounded-xl border border-slate-800 text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">TOTAL PORTFOLIO SPOT VALUE</span>
          <span className="text-xl font-bold text-white font-mono">
            ${totalCurrentValue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-xs font-bold block mt-0.5 ${totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            Total Return: {totalGainLoss >= 0 ? `+$${totalGainLoss.toFixed(2)}` : `-$${Math.abs(totalGainLoss).toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Manual Entry */}
        <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <PlusCircle className="w-4 h-4" />
              <span>Manual Bullion Entry & Photo Upload</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Date Purchased</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900 text-white px-2.5 py-1.5 rounded border border-slate-700 font-mono"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-400 block mb-1">Item Name / Description</label>
                <input
                  type="text"
                  placeholder="Perth Mint Kangaroo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 text-white px-2.5 py-1.5 rounded border border-slate-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Metal</label>
                <select
                  value={metal}
                  onChange={(e) => setMetal(e.target.value as BullionMetal)}
                  className="w-full bg-slate-900 text-white px-2 py-1.5 rounded border border-slate-700"
                  required
                >
                  <option value="" disabled>Select...</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Form</label>
                <select
                  value={form}
                  onChange={(e) => setForm(e.target.value as BullionForm)}
                  className="w-full bg-slate-900 text-white px-2 py-1.5 rounded border border-slate-700"
                  required
                >
                  <option value="" disabled>Select...</option>
                  <option value="Bar">Bar</option>
                  <option value="Coin">Coin</option>
                  <option value="Round">Round</option>
                  <option value="Goldback">Goldback</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 text-white px-2.5 py-1.5 rounded border border-slate-700 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Unit Wt (ozt)</label>
                <input
                  type="number"
                  step="any"
                  value={unitWeight}
                  onChange={(e) => setUnitWeight(e.target.value)}
                  className="w-full bg-slate-900 text-white px-2.5 py-1.5 rounded border border-slate-700 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Price Paid ($)</label>
                <input
                  type="number"
                  step="any"
                  value={pricePaidAud}
                  onChange={(e) => setPricePaidAud(e.target.value)}
                  className="w-full bg-slate-900 text-white px-2.5 py-1.5 rounded border border-slate-700 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <input
              type="file"
              accept="image/*"
              ref={photoInputRef}
              onChange={(e) => handlePhotoUpload(e, false)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              {imageUrl ? 'Photo Attached' : 'Upload Item Photo'}
            </button>

            <button
              type="button"
              onClick={handleAddItem}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow transition-colors"
            >
              Add to Ledger
            </button>
          </div>
        </div>

        {/* Right Card: Master CSV Upload */}
        <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Master CSV Bullion Bulk Upload</span>
            </div>
            <button
              onClick={downloadTemplate}
              className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 font-medium"
            >
              <Download className="w-3.5 h-3.5" /> Download Template (.csv)
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed ${isDragging ? 'border-amber-400 bg-amber-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'} rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3 transition-colors min-h-[160px]`}
          >
            <FileText className="w-8 h-8 text-slate-500" />
            <p className="text-xs text-slate-300 font-medium">
              Drag and drop your Master CSV file here, or
            </p>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            >
              Browse Files
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Filter Header Bar */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>Bullion Transaction Ledger ({sortedItems.length} Items shown)</span>
        </div>

        {/* Section Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-500 px-2">Section:</span>
          {(['All', 'Gold', 'Silver', 'Platinum'] as MetalFilter[]).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedSection(m)}
              className={`px-3 py-1 rounded font-bold transition-colors ${
                selectedSection === m
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {m} ({countForMetal(m)})
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-400 font-mono">
              <th className="py-3 px-3">Photo / Coin</th>
              <th
                onClick={() => handleSort('date')}
                className="py-3 px-3 cursor-pointer hover:text-white group select-none"
              >
                Date {renderSortIcon('date')}
              </th>
              <th className="py-3 px-3">Item / Description</th>
              <th
                onClick={() => handleSort('metal')}
                className="py-3 px-3 cursor-pointer hover:text-white group select-none"
              >
                Metal {renderSortIcon('metal')}
              </th>
              <th className="py-3 px-3">Form</th>
              <th className="py-3 px-3 text-right">Qty</th>
              <th className="py-3 px-3 text-right">Unit Wt</th>
              <th className="py-3 px-3 text-right">Total Wt</th>
              <th
                onClick={() => handleSort('pricePaidAud')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white group select-none"
              >
                Price Paid {renderSortIcon('pricePaidAud')}
              </th>
              <th
                onClick={() => handleSort('currentSpot')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white group select-none"
              >
                Current Spot Value {renderSortIcon('currentSpot')}
              </th>
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-500 italic">
                  No bullion items found for <span className="font-bold">{selectedSection}</span>. Upload a Master CSV or add an item manually above.
                </td>
              </tr>
            ) : (
              sortedItems.map((item) => {
                const currentSpotRate = getSpotPriceForMetal(item.metal);
                const currentVal = item.weightOzt * currentSpotRate;
                const pnl = currentVal - item.pricePaidAud;
                const pnlPct = item.pricePaidAud > 0 ? (pnl / item.pricePaidAud) * 100 : 0;
                const isProfitable = pnl >= 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      {renderItemAvatar(item)}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{formatDateForDisplay(item.date)}</td>
                    <td className="py-3 px-3 text-white font-sans font-medium">{cleanString(item.name)}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.metal === 'Gold'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : item.metal === 'Silver'
                            ? 'bg-slate-300/20 text-slate-200 border border-slate-400/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {item.metal}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{item.form}</td>
                    <td className="py-3 px-3 text-right text-slate-300">1</td>
                    <td className="py-3 px-3 text-right text-slate-300">{item.weightOzt.toFixed(2)} ozt</td>
                    <td className="py-3 px-3 text-right text-slate-200 font-bold">{item.weightOzt.toFixed(2)} ozt</td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      ${item.pricePaidAud.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-white font-bold block">
                        ${currentVal.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className={`text-[10px] font-bold block ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfitable ? '+' : '-'}${Math.abs(pnl).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isProfitable ? '+' : ''}${pnlPct.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditingItem({
                            ...item,
                            name: cleanString(item.name)
                          })}
                          className="text-slate-400 hover:text-amber-400 p-1 transition-colors"
                          title="Edit item"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Lightbox Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col items-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-3 px-1">
              <span className="text-sm font-bold text-white truncate font-sans">{previewImage.title}</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-hidden rounded-xl bg-slate-950 border border-slate-800 w-full flex items-center justify-center max-h-[75vh] p-2">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveEdit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-amber-400" /> Edit Bullion Ledger Item
              </h3>
              <button type="button" onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Date Purchased</label>
                <input
                  type="date"
                  value={formatDateForInput(editingItem.date)}
                  onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                  className="w-full bg-slate-950 text-white px-2.5 py-1.5 rounded border border-slate-700 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Price Paid ($)</label>
                <input
                  type="number"
                  step="any"
                  value={editingItem.pricePaidAud}
                  onChange={(e) => setEditingItem({ ...editingItem, pricePaidAud: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 text-white px-2.5 py-1.5 rounded border border-slate-700 font-mono"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 block mb-1">Item Description</label>
                <input
                  type="text"
                  value={cleanString(editingItem.name)}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full bg-slate-950 text-white px-2.5 py-1.5 rounded border border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Metal</label>
                <select
                  value={editingItem.metal}
                  onChange={(e) => setEditingItem({ ...editingItem, metal: e.target.value as BullionMetal })}
                  className="w-full bg-slate-950 text-white px-2 py-1.5 rounded border border-slate-700"
                >
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Form</label>
                <select
                  value={editingItem.form}
                  onChange={(e) => setEditingItem({ ...editingItem, form: e.target.value as BullionForm })}
                  className="w-full bg-slate-950 text-white px-2 py-1.5 rounded border border-slate-700"
                >
                  <option value="Bar">Bar</option>
                  <option value="Coin">Coin</option>
                  <option value="Round">Round</option>
                  <option value="Goldback">Goldback</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 block mb-1">Total Weight (ozt)</label>
                <input
                  type="number"
                  step="any"
                  value={editingItem.weightOzt}
                  onChange={(e) => setEditingItem({ ...editingItem, weightOzt: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 text-white px-2.5 py-1.5 rounded border border-slate-700 font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <input
                type="file"
                accept="image/*"
                ref={editPhotoInputRef}
                onChange={(e) => handlePhotoUpload(e, true)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => editPhotoInputRef.current?.click()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 border border-slate-700"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                {editingItem.imageUrl ? 'Change Photo' : 'Upload Photo'}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="bg-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Confirm Deletion</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-white">"{cleanString(itemToDelete.name)}"</span> from your bullion ledger?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3.5 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDelete(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow transition-colors"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
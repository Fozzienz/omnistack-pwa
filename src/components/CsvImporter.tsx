'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabaseClient';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function CsvImporter() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const { data: userData } = await supabase.auth.getUser();
          const userId = userData?.user?.id;

          if (!userId) {
            // If user is not logged in, import items as guest/demo or trigger alert
            setMessage({ type: 'error', text: 'Please log in to import items to your database.' });
            setUploading(false);
            return;
          }

          // Map CSV rows to bullion_items table structure
          const itemsToInsert = results.data.map((row: any) => ({
            user_id: userId,
            item_name: row['Item Name'] || row['Item'] || row['Name'] || 'Bullion Item',
            category: row['Category'] || row['Metal'] || 'Silver',
            dealer: row['Dealer'] || row['Vendor'] || 'Private',
            format: row['Format'] || row['Type'] || 'Coin',
            qty: parseFloat(row['Qty'] || row['Quantity'] || '1'),
            weight_oz_per_unit: parseFloat(row['Weight Oz'] || row['Weight'] || '1'),
            purchase_price_aud: parseFloat(row['Price Paid'] || row['Price'] || row['Cost'] || '0'),
            date_purchased: row['Date'] || new Date().toISOString().split('T')[0],
          }));

          const { error } = await supabase.from('bullion_items').insert(itemsToInsert);

          if (error) throw error;

          setMessage({ type: 'success', text: `Successfully imported ${itemsToInsert.length} items to Supabase!` });
        } catch (err: any) {
          setMessage({ type: 'error', text: err.message || 'Error processing CSV file.' });
        } finally {
          setUploading(false);
        }
      },
      error: () => {
        setMessage({ type: 'error', text: 'Failed to read CSV file format.' });
        setUploading(false);
      },
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <FileSpreadsheet className="w-6 h-6 text-amber-400" />
        <div>
          <h2 className="text-lg font-bold text-white">Bulk CSV Importer</h2>
          <p className="text-xs text-slate-400">Upload your master spreadsheet to bulk import holdings into Supabase</p>
        </div>
      </div>

      <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-950/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors">
        {uploading ? (
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-2" />
        ) : (
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
        )}
        <span className="text-sm font-medium text-slate-200">
          {uploading ? 'Processing & Importing Data...' : 'Click to select or drag & drop CSV file'}
        </span>
        <span className="text-xs text-slate-500 mt-1">Supports .csv exports from Excel or Google Sheets</span>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {message && (
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {message.text}
        </div>
      )}
    </div>
  );
}
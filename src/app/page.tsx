'use client';

import React, { useState } from 'react';
import HeaderTicker from '@/components/HeaderTicker';
import PearlerTracker from '@/components/PearlerTracker';
import BullionManager from '@/components/BullionManager';
import HamburgerMenu from '@/components/HamburgerMenu';
import { Eye, EyeOff, Coins, PieChart } from 'lucide-react';

export default function Home() {
  const [showPearler, setShowPearler] = useState<boolean>(true);
  const [showBullion, setShowBullion] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-12 transition-colors duration-200">
      <HeaderTicker />
       
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* OmniStack Branded Header Block with Hamburger Menu */}
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

          {/* Controls Bar: View Toggles & Hamburger Menu */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 font-mono hidden sm:inline">Views:</span>
              
              <button 
                onClick={() => setShowPearler(!showPearler)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showPearler ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-200'}`}
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

            {/* Hamburger Menu Component */}
            <HamburgerMenu darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>

        </div>

        {/* Conditional Component Rendering */}
        {showPearler && <PearlerTracker />}
        {showBullion && <BullionManager />}

      </div>
    </main>
  );
}

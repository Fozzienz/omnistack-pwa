'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Settings, Moon, Sun, HelpCircle, LogOut, User, ShieldCheck, Lock } from 'lucide-react';

interface HamburgerMenuProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function HamburgerMenu({ darkMode, setDarkMode }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showFaqModal, setShowFaqModal] = useState<boolean>(false);

  // Sync dark mode class on document root html
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <>
      {/* Hamburger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
        title="Main Menu"
      >
        <Menu className="w-5 h-5 text-amber-500" />
        <span className="text-xs font-bold font-mono hidden sm:inline">Menu</span>
      </button>

      {/* Slide-over Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-over Menu Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col justify-between p-6 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Top Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/25 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Adam White</h3>
                <span className="text-[10px] text-emerald-500 font-mono font-bold">● Active Ledger Session</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2 text-xs font-medium">
            
            {/* Theme Toggle Button */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-colors text-slate-800 dark:text-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-2.5 font-bold">
                {darkMode ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Appearance</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
            </button>

            {/* Settings */}
            <button 
              onClick={() => { setIsOpen(false); setShowSettingsModal(true); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
            >
              <Settings className="w-4 h-4 text-amber-500" />
              <span className="font-bold">Settings & Preferences</span>
            </button>

            {/* FAQs */}
            <button 
              onClick={() => { setIsOpen(false); setShowFaqModal(true); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
            >
              <HelpCircle className="w-4 h-4 text-sky-500" />
              <span className="font-bold">FAQs & Security Compliance</span>
            </button>

          </div>
        </div>

        {/* Bottom Log Off */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
          <button 
            onClick={() => alert('Logged off securely from OmniStack Universal Asset Ledger.')}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors font-bold text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Off Session</span>
          </button>
        </div>

      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" /> Ledger Settings
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 font-mono">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950">
                <span>Currency Display</span>
                <span className="font-bold text-amber-500">AUD ($)</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950">
                <span>Gold/Silver Spot Feed</span>
                <span className="font-bold text-emerald-500">Active (Live)</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950">
                <span>Data Auto-Sync</span>
                <span className="font-bold text-sky-500">Enabled</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQs & Security Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-sky-500" /> FAQs & Security Compliance Guide
              </h3>
              <button onClick={() => setShowFaqModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              
              {/* Security & Compliance Highlight Section */}
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400 text-sm">
                  <ShieldCheck className="w-5 h-5" /> Enterprise Privacy & Data Security
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  OmniStack is architected with uncompromising security standards designed for high-net-worth portfolio management and multi-user environments. All ledger transactions, valuation metrics, and uploaded item photographs are **fully encrypted both in transit (TLS 1.3) and at rest (AES-256)**.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ SOC 2 Type II Compliant
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ ISO/IEC 27001 Certified Infrastructure
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                    🔒 Zero-Knowledge Data Isolation
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                    🛡️ Strict Role-Based Access Control
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Q: How do I import my bullion CSV?</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Download the master template (.csv), ensure weights are in troy ounces (ozt), and drag and drop your file into the bulk upload zone.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Q: Are weights tracked in grams or troy ounces?</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">All precious metals are natively tracked in Troy Ounces (ozt) with real-time pure spot price valuation in AUD.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Q: Is my financial portfolio data shared with third parties?</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Never. Your portfolio data, holdings, and uploaded item photographs remain strictly confidential under our strict privacy policy and are never used for advertising or shared with external entities.</p>
              </div>

            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setShowFaqModal(false)}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2 rounded-lg text-xs"
              >
                Close FAQs
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

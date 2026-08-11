'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2, AlertTriangle } from 'lucide-react';

interface MarketData {
  goldAud: number;
  goldChange: number;
  silverAud: number;
  silverChange: number;
  gsr: number;
  rateLimitExceeded?: boolean;
}

export default function HeaderTicker() {
  const [data, setData] = useState<MarketData | null>(null);

  useEffect(() => {
    fetch('/api/metals')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-50 h-[44px] flex items-center px-4">
        <Loader2 className="w-4 h-4 animate-spin text-amber-400 mr-2" />
        <span className="text-xs text-slate-400 font-mono">Syncing market data...</span>
      </header>
    );
  }

  const TickerItems = () => (
    <>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-amber-400 font-bold">Gold:</span>
        <span>${data.goldAud.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
        <span className={`flex items-center text-xs ${data.goldChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {data.goldChange >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
          {data.goldChange >= 0 ? `+${data.goldChange}%` : `${data.goldChange}%`}
        </span>
      </div>

      <span className="text-slate-700 hidden xl:inline">|</span>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-slate-300 font-bold">Silver:</span>
        <span>${data.silverAud.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
        <span className={`flex items-center text-xs ${data.silverChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {data.silverChange >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
          {data.silverChange >= 0 ? `+${data.silverChange}%` : `${data.silverChange}%`}
        </span>
      </div>

      <span className="text-slate-700 hidden xl:inline">|</span>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-slate-400 font-bold">GSR:</span>
        <span className="font-bold text-amber-300">{data.gsr.toFixed(2)}</span>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .mobile-marquee {
          display: flex;
          width: max-content;
          animation: marquee 20s linear infinite;
        }
        .mobile-marquee:active, .mobile-marquee:hover {
          animation-play-state: paused;
        }
        @media (min-width: 1280px) {
          .mobile-marquee {
            animation: none;
            width: 100%;
            justify-content: flex-start;
            gap: 2rem;
          }
          .duplicate-set {
            display: none;
          }
        }
      `}</style>

      <header className="w-full bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-50 shadow-md flex flex-col">
        {data.rateLimitExceeded && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>GoldAPI limit reached (100/mo). Showing fallback spot prices.</span>
          </div>
        )}
        <div className="overflow-hidden flex items-center min-h-[44px]">
          <div className="mobile-marquee gap-6 px-4 text-xs font-mono py-2">
            <TickerItems />
            <div className="duplicate-set flex items-center gap-6">
              <span className="text-slate-700">|</span>
              <TickerItems />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { MarketData } from '@/types';
import { FALLBACK_SPOT_PRICES } from '@/lib/constants';

interface UseMarketDataReturn {
  marketData: MarketData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMarketData(pollIntervalMs = 300000): UseMarketDataReturn {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/metals', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const rawData = await res.json();
      
      const xau = rawData.metals?.XAU ?? rawData.goldAud ?? FALLBACK_SPOT_PRICES.XAU;
      const xag = rawData.metals?.XAG ?? rawData.silverAud ?? FALLBACK_SPOT_PRICES.XAG;
      const xpt = rawData.metals?.XPT ?? rawData.platinumAud ?? FALLBACK_SPOT_PRICES.XPT;
      const gsr = rawData.gsr ?? (xag > 0 ? xau / xag : 0);

      setMarketData({
        metals: { XAU: xau, XAG: xag, XPT: xpt },
        goldAud: xau,
        silverAud: xag,
        platinumAud: xpt,
        goldChange: rawData.goldChange ?? 0,
        silverChange: rawData.silverChange ?? 0,
        platinumChange: rawData.platinumChange ?? 0,
        gsr,
        rateLimitExceeded: rawData.rateLimitExceeded ?? false,
        currency: rawData.currency || 'AUD',
        timestamp: rawData.timestamp || new Date().toISOString(),
        isFallback: rawData.isFallback || false,
      });
    } catch (err) {
      console.warn('Failed to fetch live metals data, using fallback spot rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch live rates');
      
      const xau = FALLBACK_SPOT_PRICES.XAU;
      const xag = FALLBACK_SPOT_PRICES.XAG;
      const xpt = FALLBACK_SPOT_PRICES.XPT;

      setMarketData({
        metals: { XAU: xau, XAG: xag, XPT: xpt },
        goldAud: xau,
        silverAud: xag,
        platinumAud: xpt,
        goldChange: 0,
        silverChange: 0,
        platinumChange: 0,
        gsr: xag > 0 ? xau / xag : 0,
        rateLimitExceeded: false,
        currency: 'AUD',
        timestamp: new Date().toISOString(),
        isFallback: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetals();
    if (pollIntervalMs > 0) {
      const interval = setInterval(fetchMetals, pollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchMetals, pollIntervalMs]);

  return { marketData, isLoading, error, refetch: fetchMetals };
}
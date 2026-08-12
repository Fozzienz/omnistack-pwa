'use client';

import { useState, useEffect, useCallback } from 'react';
import { MarketData } from '@/types';

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
      const data: MarketData = await res.json();
      setMarketData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch live rates');
      setMarketData({
        goldAud: 6048.63,
        goldChange: 0.71,
        silverAud: 88.52,
        silverChange: -0.51,
        platinumAud: 1480.20,
        platinumChange: 0.15,
        gsr: 68.33,
        rateLimitExceeded: true,
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
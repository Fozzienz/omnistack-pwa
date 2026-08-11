import { NextResponse } from 'next/server';

export const revalidate = 86400; // 24 hours (86,400 seconds)

// In-memory fallback cache guard
let cachedData: any = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  const apiKey = process.env.GOLDAPI_KEY;
  const now = Date.now();

  // Return in-memory cached data if fetched less than 24 hours ago
  if (cachedData && now - lastFetchTime < CACHE_DURATION_MS) {
    return NextResponse.json(cachedData);
  }

  const fallbackData = {
    goldAud: 6048.63,
    goldChange: 0.71,
    silverAud: 88.52,
    silverChange: -0.51,
    platinumAud: 1480.20,
    platinumChange: 0.15,
    gsr: 68.33,
    rateLimitExceeded: true,
  };

  if (!apiKey) {
    return NextResponse.json(fallbackData);
  }

  try {
    const fetchMetal = async (symbol: string) => {
      const res = await fetch(`https://www.goldapi.io/api/${symbol}/AUD`, {
        headers: { 'x-access-token': apiKey },
        next: { revalidate: 86400 },
      });
      if (!res.ok) return null;
      return await res.json();
    };

    const [gold, silver, platinum] = await Promise.all([
      fetchMetal('XAU'),
      fetchMetal('XAG'),
      fetchMetal('XPT'),
    ]);

    if (!gold?.price || !silver?.price || !platinum?.price) {
      if (cachedData) {
        return NextResponse.json({ ...cachedData, rateLimitExceeded: true });
      }
      return NextResponse.json(fallbackData);
    }

    const freshData = {
      goldAud: gold.price,
      goldChange: gold?.chp || 0.0,
      silverAud: silver.price,
      silverChange: silver?.chp || 0.0,
      platinumAud: platinum.price,
      platinumChange: platinum?.chp || 0.0,
      gsr: gold.price / silver.price,
      rateLimitExceeded: false,
    };

    cachedData = freshData;
    lastFetchTime = now;

    return NextResponse.json(freshData);
  } catch (error) {
    if (cachedData) {
      return NextResponse.json({ ...cachedData, rateLimitExceeded: true });
    }
    return NextResponse.json(fallbackData);
  }
}